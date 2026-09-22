import type { IncomingMessage, ServerResponse } from "http";

interface VercelRequest extends IncomingMessage {
  query: Record<string, string | string[]>;
  body: any;
}

interface VercelResponse extends ServerResponse {
  status: (statusCode: number) => VercelResponse;
  json: (data: any) => void;
  send: (data: any) => void;
}

export type InstagramMediaType = "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM";

export interface InstagramMediaItem {
  id: string;
  caption?: string;
  mediaType: InstagramMediaType;
  mediaProductType?: string;
  mediaUrl: string;
  thumbnailUrl?: string;
  permalink: string;
  timestamp: string;
}

interface CacheStore {
  timestamp: number;
  data: InstagramMediaItem[];
  username?: string;
}

// 10-minute in-memory cache
const CACHE_TTL_MS = 10 * 60 * 1000;
let memoryCache: CacheStore | null = null;

function setCors(res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

function normalizeApiVersion(rawVersion?: string): string {
  if (!rawVersion) return "v22.0";
  const trimmed = rawVersion.trim();
  if (!trimmed) return "v22.0";
  return trimmed.startsWith("v") ? trimmed : `v${trimmed}`;
}

/**
 * Primary flow: Directly fetch from Instagram Graph API (graph.instagram.com)
 * Verified for Instagram Business/User access tokens (e.g. IGAA...)
 */
async function fetchDirectInstagramGraph(token: string, version: string): Promise<{ data: InstagramMediaItem[]; username?: string } | null> {
  const prefix = version ? `${version}/` : "";
  const fields = "id,caption,media_type,media_product_type,media_url,thumbnail_url,permalink,timestamp";
  const endpoint = `https://graph.instagram.com/${prefix}me/media?fields=${encodeURIComponent(fields)}&limit=12&access_token=${encodeURIComponent(token)}`;

  const res = await fetch(endpoint);
  const json = await res.json();

  if (!res.ok || json.error || !Array.isArray(json.data)) {
    // Log sanitized error without exposing token
    console.warn("[Instagram API] Direct graph.instagram.com fetch failed:", {
      status: res.status,
      code: json?.error?.code,
      type: json?.error?.type,
      message: json?.error?.message,
    });
    return null;
  }

  const items: InstagramMediaItem[] = json.data.map((item: any) => ({
    id: String(item.id),
    caption: item.caption || "",
    mediaType: item.media_type as InstagramMediaType,
    mediaProductType: item.media_product_type || "",
    mediaUrl: item.media_url || item.thumbnail_url || "",
    thumbnailUrl: item.thumbnail_url || item.media_url || "",
    permalink: item.permalink || "https://instagram.com/avelricindia",
    timestamp: item.timestamp || new Date().toISOString(),
  }));

  return { data: items, username: "avelricindia" };
}

/**
 * Fallback flow: Facebook Graph API (/me/accounts -> instagram_business_account.id -> /{id}/media)
 * Used if a Facebook Page / System User access token is configured.
 */
async function fetchFacebookGraphFallback(token: string, version: string): Promise<{ data: InstagramMediaItem[]; username?: string } | null> {
  const prefix = version ? `${version}/` : "";

  // 1. Resolve connected Instagram Business Account
  const accountsUrl = `https://graph.facebook.com/${prefix}me/accounts?fields=id,name,instagram_business_account&access_token=${encodeURIComponent(token)}`;
  const accRes = await fetch(accountsUrl);
  const accJson = await accRes.json();

  if (!accRes.ok || accJson.error || !Array.isArray(accJson.data)) {
    console.warn("[Instagram API] Facebook Graph /me/accounts fallback failed:", {
      status: accRes.status,
      code: accJson?.error?.code,
      type: accJson?.error?.type,
      message: accJson?.error?.message,
    });
    return null;
  }

  let igUserId: string | null = null;
  for (const page of accJson.data) {
    if (page.instagram_business_account?.id) {
      igUserId = page.instagram_business_account.id;
      break;
    }
  }

  if (!igUserId) {
    console.warn("[Instagram API] No instagram_business_account found under connected Facebook Pages.");
    return null;
  }

  // 2. Fetch media from IG Business Account ID
  const fields = "id,caption,media_type,media_product_type,media_url,thumbnail_url,permalink,timestamp";
  const mediaUrl = `https://graph.facebook.com/${prefix}${igUserId}/media?fields=${encodeURIComponent(fields)}&limit=12&access_token=${encodeURIComponent(token)}`;
  const mediaRes = await fetch(mediaUrl);
  const mediaJson = await mediaRes.json();

  if (!mediaRes.ok || mediaJson.error || !Array.isArray(mediaJson.data)) {
    console.warn("[Instagram API] Facebook Graph /{igUserId}/media fetch failed:", {
      status: mediaRes.status,
      code: mediaJson?.error?.code,
      type: mediaJson?.error?.type,
      message: mediaJson?.error?.message,
    });
    return null;
  }

  const items: InstagramMediaItem[] = mediaJson.data.map((item: any) => ({
    id: String(item.id),
    caption: item.caption || "",
    mediaType: item.media_type as InstagramMediaType,
    mediaProductType: item.media_product_type || "",
    mediaUrl: item.media_url || item.thumbnail_url || "",
    thumbnailUrl: item.thumbnail_url || item.media_url || "",
    permalink: item.permalink || "https://instagram.com/avelricindia",
    timestamp: item.timestamp || new Date().toISOString(),
  }));

  return { data: items, username: "avelricindia" };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCors(res);

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "GET") {
    res.status(405).json({
      success: false,
      error: "Method not allowed. Only GET is supported.",
    });
    return;
  }

  // Set HTTP caching headers (10 minutes fresh, 5 minutes stale-while-revalidate)
  res.setHeader("Cache-Control", "public, s-maxage=600, stale-while-revalidate=300");

  // Check in-memory cache first
  const now = Date.now();
  if (memoryCache && now - memoryCache.timestamp < CACHE_TTL_MS) {
    res.status(200).json({
      success: true,
      data: memoryCache.data,
      username: memoryCache.username || "avelricindia",
      cached: true,
    });
    return;
  }

  const token = (process.env.INSTAGRAM_ACCESS_TOKEN || "").trim();
  const apiVersion = normalizeApiVersion(process.env.META_GRAPH_API_VERSION);

  if (!token) {
    console.warn("[Instagram API] INSTAGRAM_ACCESS_TOKEN is not configured in server environment.");
    res.status(200).json({
      success: false,
      data: [],
      error: "Instagram integration is not configured on the server.",
    });
    return;
  }

  try {
    // 1. Prioritize direct Instagram Graph API flow (native for IG tokens)
    let result = await fetchDirectInstagramGraph(token, apiVersion);

    // 2. Fallback to Facebook Graph flow if direct Instagram Graph didn't succeed
    if (!result) {
      result = await fetchFacebookGraphFallback(token, apiVersion);
    }

    if (!result || !result.data) {
      // If cached data is available (even if expired), serve it during upstream downtime
      if (memoryCache && memoryCache.data.length > 0) {
        res.status(200).json({
          success: true,
          data: memoryCache.data,
          username: memoryCache.username || "avelricindia",
          cached: true,
          stale: true,
        });
        return;
      }

      res.status(200).json({
        success: false,
        data: [],
        error: "Unable to retrieve Instagram media from Meta API at this time.",
      });
      return;
    }

    // Sort latest first by timestamp
    const sorted = result.data.sort((a, b) => {
      const timeA = new Date(a.timestamp).getTime();
      const timeB = new Date(b.timestamp).getTime();
      return timeB - timeA;
    });

    // Select latest 6 items
    const latest6 = sorted.slice(0, 6);

    // Save to memory cache
    memoryCache = {
      timestamp: now,
      data: latest6,
      username: result.username || "avelricindia",
    };

    res.status(200).json({
      success: true,
      data: latest6,
      username: memoryCache.username,
      cached: false,
    });
  } catch (err: any) {
    // Ensure no sensitive data is leaked
    console.error("[Instagram API] Internal handler exception:", err?.message || "Unknown error");

    if (memoryCache && memoryCache.data.length > 0) {
      res.status(200).json({
        success: true,
        data: memoryCache.data,
        username: memoryCache.username || "avelricindia",
        cached: true,
        stale: true,
      });
      return;
    }

    res.status(500).json({
      success: false,
      data: [],
      error: "An unexpected error occurred while fetching Instagram media.",
    });
  }
}
