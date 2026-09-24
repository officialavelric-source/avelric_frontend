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

// ─── Cache config ──────────────────────────────────────────────────────────
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes
let memoryCache: CacheStore | null = null;

// ─── Static brand fallback (served when Meta API is unavailable) ───────────
// Uses real brand images from /public/images/ and permalinks to @avelricindia
const STATIC_FALLBACK: InstagramMediaItem[] = [
  {
    id: "fallback-1",
    caption: "Fit check. 🖤 New arrivals dropping soon — @avelricindia",
    mediaType: "IMAGE",
    mediaProductType: "",
    mediaUrl: "/images/instagram-1.jpg",
    thumbnailUrl: "/images/instagram-1.jpg",
    permalink: "https://www.instagram.com/avelricindia/",
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "fallback-2",
    caption: "Drop preview. The new collection is almost here. 🕶️",
    mediaType: "IMAGE",
    mediaProductType: "",
    mediaUrl: "/images/instagram-2.jpg",
    thumbnailUrl: "/images/instagram-2.jpg",
    permalink: "https://www.instagram.com/avelricindia/",
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "fallback-3",
    caption: "Behind the scenes. The looks that didn't make the cut — almost.",
    mediaType: "IMAGE",
    mediaProductType: "",
    mediaUrl: "/images/instagram-3.jpg",
    thumbnailUrl: "/images/instagram-3.jpg",
    permalink: "https://www.instagram.com/avelricindia/",
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "fallback-4",
    caption: "Editorial. Monochrome season. 🌑",
    mediaType: "IMAGE",
    mediaProductType: "",
    mediaUrl: "/images/instagram-4.jpg",
    thumbnailUrl: "/images/instagram-4.jpg",
    permalink: "https://www.instagram.com/avelricindia/",
    timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "fallback-5",
    caption: "Clean cuts. Premium fabrics. Built to last.",
    mediaType: "IMAGE",
    mediaProductType: "",
    mediaUrl: "/images/instagram-5.jpg",
    thumbnailUrl: "/images/instagram-5.jpg",
    permalink: "https://www.instagram.com/avelricindia/",
    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "fallback-6",
    caption: "Follow @avelricindia for the latest drops. 🖤",
    mediaType: "IMAGE",
    mediaProductType: "",
    mediaUrl: "/images/instagram-6.jpg",
    thumbnailUrl: "/images/instagram-6.jpg",
    permalink: "https://www.instagram.com/avelricindia/",
    timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// ─── Helpers ───────────────────────────────────────────────────────────────
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

function mapRawItems(rawData: any[]): InstagramMediaItem[] {
  return rawData.map((item: any) => ({
    id: String(item.id),
    caption: item.caption || "",
    mediaType: item.media_type as InstagramMediaType,
    mediaProductType: item.media_product_type || "",
    mediaUrl: item.media_url || item.thumbnail_url || "",
    thumbnailUrl: item.thumbnail_url || item.media_url || "",
    permalink: item.permalink || "https://www.instagram.com/avelricindia/",
    timestamp: item.timestamp || new Date().toISOString(),
  }));
}

// ─── Strategy 1: Direct Instagram Graph API ────────────────────────────────
// Works for long-lived tokens generated via Meta for Developers → Instagram Graph API
async function fetchDirectInstagramGraph(
  token: string,
  version: string
): Promise<{ data: InstagramMediaItem[]; username?: string } | null> {
  const fields = "id,caption,media_type,media_product_type,media_url,thumbnail_url,permalink,timestamp";
  const endpoint = `https://graph.instagram.com/${version}/me/media?fields=${encodeURIComponent(fields)}&limit=12&access_token=${encodeURIComponent(token)}`;

  try {
    const res = await fetch(endpoint);
    const json = await res.json();

    if (!res.ok || json.error || !Array.isArray(json.data)) {
      console.warn("[Instagram] ❌ Strategy 1 (direct graph.instagram.com) failed:", {
        status: res.status,
        errorCode: json?.error?.code,
        errorType: json?.error?.type,
        errorMessage: json?.error?.message,
        hint: json?.error?.code === 200
          ? "Token may be from the sunset Basic Display API. Regenerate via Meta for Developers → Instagram Graph API."
          : "Check token scopes: instagram_basic, pages_show_list, business_management.",
      });
      return null;
    }

    console.info("[Instagram] ✅ Strategy 1 succeeded — fetched", json.data.length, "items via graph.instagram.com");
    return { data: mapRawItems(json.data), username: "avelricindia" };
  } catch (err: any) {
    console.warn("[Instagram] ❌ Strategy 1 network error:", err?.message);
    return null;
  }
}

// ─── Strategy 2: Facebook Graph API via /me/accounts ──────────────────────
// Works for Facebook User / Page tokens connected to an IG Business account
async function fetchViaFacebookPageAccounts(
  token: string,
  version: string
): Promise<{ data: InstagramMediaItem[]; username?: string } | null> {
  try {
    const accountsUrl = `https://graph.facebook.com/${version}/me/accounts?fields=id,name,instagram_business_account&access_token=${encodeURIComponent(token)}`;
    const accRes = await fetch(accountsUrl);
    const accJson = await accRes.json();

    if (!accRes.ok || accJson.error || !Array.isArray(accJson.data)) {
      console.warn("[Instagram] ❌ Strategy 2 (FB /me/accounts) failed:", {
        status: accRes.status,
        errorCode: accJson?.error?.code,
        errorMessage: accJson?.error?.message,
        hint: "This strategy requires a Facebook Page access token or System User token connected to a Facebook Page.",
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
      console.warn("[Instagram] ❌ Strategy 2: No instagram_business_account found under connected Pages.");
      return null;
    }

    console.info("[Instagram] ↪️ Strategy 2: Found IG Business Account ID:", igUserId);

    const fields = "id,caption,media_type,media_product_type,media_url,thumbnail_url,permalink,timestamp";
    const mediaUrl = `https://graph.facebook.com/${version}/${igUserId}/media?fields=${encodeURIComponent(fields)}&limit=12&access_token=${encodeURIComponent(token)}`;
    const mediaRes = await fetch(mediaUrl);
    const mediaJson = await mediaRes.json();

    if (!mediaRes.ok || mediaJson.error || !Array.isArray(mediaJson.data)) {
      console.warn("[Instagram] ❌ Strategy 2: IG Business media fetch failed:", {
        status: mediaRes.status,
        errorCode: mediaJson?.error?.code,
        errorMessage: mediaJson?.error?.message,
      });
      return null;
    }

    console.info("[Instagram] ✅ Strategy 2 succeeded — fetched", mediaJson.data.length, "items via graph.facebook.com");
    return { data: mapRawItems(mediaJson.data), username: "avelricindia" };
  } catch (err: any) {
    console.warn("[Instagram] ❌ Strategy 2 network error:", err?.message);
    return null;
  }
}

// ─── Strategy 3: Direct IG Business Account ID from env ───────────────────
// Works when INSTAGRAM_BUSINESS_ACCOUNT_ID is set in .env (fastest path)
async function fetchViaDirectBusinessAccountId(
  token: string,
  version: string,
  igAccountId: string
): Promise<{ data: InstagramMediaItem[]; username?: string } | null> {
  try {
    const fields = "id,caption,media_type,media_product_type,media_url,thumbnail_url,permalink,timestamp";
    const url = `https://graph.facebook.com/${version}/${igAccountId}/media?fields=${encodeURIComponent(fields)}&limit=12&access_token=${encodeURIComponent(token)}`;
    const res = await fetch(url);
    const json = await res.json();

    if (!res.ok || json.error || !Array.isArray(json.data)) {
      console.warn("[Instagram] ❌ Strategy 3 (direct IG account ID) failed:", {
        status: res.status,
        errorCode: json?.error?.code,
        errorMessage: json?.error?.message,
        igAccountId,
        hint: "Ensure INSTAGRAM_BUSINESS_ACCOUNT_ID is the numeric ID of the IG Professional account.",
      });
      return null;
    }

    console.info("[Instagram] ✅ Strategy 3 succeeded — fetched", json.data.length, "items via direct IG Account ID");
    return { data: mapRawItems(json.data), username: "avelricindia" };
  } catch (err: any) {
    console.warn("[Instagram] ❌ Strategy 3 network error:", err?.message);
    return null;
  }
}

// ─── Main handler ──────────────────────────────────────────────────────────
export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCors(res);

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "GET") {
    res.status(405).json({ success: false, error: "Method not allowed. Only GET is supported." });
    return;
  }

  // HTTP caching headers (10 min fresh, 5 min SWR)
  res.setHeader("Cache-Control", "public, s-maxage=600, stale-while-revalidate=300");

  // ── Serve memory cache if fresh ──────────────────────────────────────────
  const now = Date.now();
  if (memoryCache && now - memoryCache.timestamp < CACHE_TTL_MS) {
    console.info("[Instagram] ⚡ Serving from in-memory cache");
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
  const igAccountId = (process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID || "").trim();

  // ── No token → serve static fallback immediately ─────────────────────────
  if (!token) {
    console.warn("[Instagram] ⚠️  INSTAGRAM_ACCESS_TOKEN not configured. Serving static brand fallback.");
    res.status(200).json({
      success: true,
      data: STATIC_FALLBACK,
      username: "avelricindia",
      cached: false,
      fallback: true,
    });
    return;
  }

  // ── Attempt live Meta API strategies in order ────────────────────────────
  let result: { data: InstagramMediaItem[]; username?: string } | null = null;

  // Strategy 3 (fastest) — direct IG account ID, if configured in env
  if (igAccountId) {
    result = await fetchViaDirectBusinessAccountId(token, apiVersion, igAccountId);
  }

  // Strategy 1 — direct Instagram Graph API token
  if (!result) {
    result = await fetchDirectInstagramGraph(token, apiVersion);
  }

  // Strategy 2 — Facebook Page token → IG Business Account
  if (!result) {
    result = await fetchViaFacebookPageAccounts(token, apiVersion);
  }

  // ── All strategies failed ────────────────────────────────────────────────
  if (!result || !result.data || result.data.length === 0) {
    // Serve stale cache if available
    if (memoryCache && memoryCache.data.length > 0) {
      console.warn("[Instagram] ⚠️  All strategies failed — serving stale in-memory cache.");
      res.status(200).json({
        success: true,
        data: memoryCache.data,
        username: memoryCache.username || "avelricindia",
        cached: true,
        stale: true,
      });
      return;
    }

    // Serve static brand fallback — website is NEVER blank
    console.warn("[Instagram] ⚠️  All strategies failed and no cache. Serving static brand fallback.");
    res.status(200).json({
      success: true,
      data: STATIC_FALLBACK,
      username: "avelricindia",
      cached: false,
      fallback: true,
    });
    return;
  }

  // ── Success: sort latest-first, take top 6, cache and serve ─────────────
  const sorted = result.data.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
  const latest6 = sorted.slice(0, 6);

  memoryCache = {
    timestamp: now,
    data: latest6,
    username: result.username || "avelricindia",
  };

  console.info("[Instagram] ✅ Serving", latest6.length, "live items from Meta API.");
  res.status(200).json({
    success: true,
    data: latest6,
    username: memoryCache.username,
    cached: false,
  });
}
