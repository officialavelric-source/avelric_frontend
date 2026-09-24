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

// --- Cache config -----------------------------------------------------------
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes
let memoryCache: CacheStore | null = null;

// --- Static brand fallback --------------------------------------------------
// Real brand images from /public/images/. Permalinks point to the IG profile
// (not fake post URLs). Response always includes fallback:true so the frontend
// can distinguish this from live Instagram content.
const STATIC_FALLBACK: InstagramMediaItem[] = [
  {
    id: "fallback-1",
    caption: "Fit check. New arrivals dropping soon â€” @avelricindia",
    mediaType: "IMAGE",
    mediaProductType: "FEED",
    mediaUrl: "/images/instagram-1.jpg",
    thumbnailUrl: "/images/instagram-1.jpg",
    permalink: "https://www.instagram.com/avelricindia/",
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "fallback-2",
    caption: "Drop preview. The new collection is almost here.",
    mediaType: "IMAGE",
    mediaProductType: "FEED",
    mediaUrl: "/images/instagram-2.jpg",
    thumbnailUrl: "/images/instagram-2.jpg",
    permalink: "https://www.instagram.com/avelricindia/",
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "fallback-3",
    caption: "Behind the scenes. The looks that did not make the cut â€” almost.",
    mediaType: "IMAGE",
    mediaProductType: "FEED",
    mediaUrl: "/images/instagram-3.jpg",
    thumbnailUrl: "/images/instagram-3.jpg",
    permalink: "https://www.instagram.com/avelricindia/",
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "fallback-4",
    caption: "Editorial. Monochrome season.",
    mediaType: "IMAGE",
    mediaProductType: "FEED",
    mediaUrl: "/images/instagram-4.jpg",
    thumbnailUrl: "/images/instagram-4.jpg",
    permalink: "https://www.instagram.com/avelricindia/",
    timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "fallback-5",
    caption: "Clean cuts. Premium fabrics. Built to last.",
    mediaType: "IMAGE",
    mediaProductType: "FEED",
    mediaUrl: "/images/instagram-5.jpg",
    thumbnailUrl: "/images/instagram-5.jpg",
    permalink: "https://www.instagram.com/avelricindia/",
    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "fallback-6",
    caption: "Follow @avelricindia for the latest drops.",
    mediaType: "IMAGE",
    mediaProductType: "FEED",
    mediaUrl: "/images/instagram-6.jpg",
    thumbnailUrl: "/images/instagram-6.jpg",
    permalink: "https://www.instagram.com/avelricindia/",
    timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// --- Helpers ----------------------------------------------------------------
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

// --- Strategy 1: graph.instagram.com/me/media ------------------------------
// Correct strategy for IGAA tokens (Instagram Graph API).
// IGAA tokens are Instagram-scoped â€” do NOT use with graph.facebook.com.
// Required permission: instagram_basic
async function fetchViaInstagramGraph(
  token: string,
  version: string
): Promise<{ data: InstagramMediaItem[]; username?: string } | null> {
  const fields =
    "id,caption,media_type,media_product_type,media_url,thumbnail_url,permalink,timestamp";
  const endpoint = `https://graph.instagram.com/${version}/me/media?fields=${encodeURIComponent(fields)}&limit=12&access_token=${encodeURIComponent(token)}`;

  try {
    const res = await fetch(endpoint);
    const json = await res.json();

    if (!res.ok || json.error || !Array.isArray(json.data)) {
      console.warn("[Instagram] Strategy 1 (graph.instagram.com/me/media) failed:", {
        status: res.status,
        errorCode: json?.error?.code,
        errorType: json?.error?.type,
        errorMessage: json?.error?.message,
        hint:
          json?.error?.code === 200
            ? "API access blocked. Check Meta App mode (Dev/Live), App Review, and permission grants."
            : json?.error?.code === 190
            ? "Token expired or revoked. Generate a new long-lived token via Graph API Explorer."
            : "Check token scopes: instagram_basic is required.",
      });
      return null;
    }

    console.info(
      "[Instagram] Strategy 1 succeeded â€”",
      json.data.length,
      "items fetched via graph.instagram.com"
    );
    return { data: mapRawItems(json.data), username: "avelricindia" };
  } catch (err: any) {
    console.warn("[Instagram] Strategy 1 network error:", err?.message);
    return null;
  }
}

// --- Strategy 2: /me resolution then /{user_id}/media ---------------------
// Fallback if /me/media fails but the token is otherwise valid.
async function fetchViaUserIdResolution(
  token: string,
  version: string
): Promise<{ data: InstagramMediaItem[]; username?: string } | null> {
  const fields =
    "id,caption,media_type,media_product_type,media_url,thumbnail_url,permalink,timestamp";

  try {
    const meRes = await fetch(
      `https://graph.instagram.com/${version}/me?fields=id,username&access_token=${encodeURIComponent(token)}`
    );
    const meJson = await meRes.json();

    if (!meRes.ok || meJson.error || !meJson.id) {
      console.warn("[Instagram] Strategy 2: /me resolution failed:", {
        status: meRes.status,
        errorCode: meJson?.error?.code,
        errorMessage: meJson?.error?.message,
      });
      return null;
    }

    const igUserId = String(meJson.id);
    console.info("[Instagram] Strategy 2: Resolved IG User ID:", igUserId);

    const mediaRes = await fetch(
      `https://graph.instagram.com/${version}/${igUserId}/media?fields=${encodeURIComponent(fields)}&limit=12&access_token=${encodeURIComponent(token)}`
    );
    const mediaJson = await mediaRes.json();

    if (!mediaRes.ok || mediaJson.error || !Array.isArray(mediaJson.data)) {
      console.warn("[Instagram] Strategy 2: /{id}/media failed:", {
        status: mediaRes.status,
        errorCode: mediaJson?.error?.code,
        errorMessage: mediaJson?.error?.message,
      });
      return null;
    }

    console.info(
      "[Instagram] Strategy 2 succeeded â€”",
      mediaJson.data.length,
      "items via /{id}/media"
    );
    return { data: mapRawItems(mediaJson.data), username: meJson.username || "avelricindia" };
  } catch (err: any) {
    console.warn("[Instagram] Strategy 2 network error:", err?.message);
    return null;
  }
}

// --- Main handler -----------------------------------------------------------
export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCors(res);

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "GET") {
    res.status(405).json({ success: false, error: "Method not allowed." });
    return;
  }

  // HTTP/CDN caching â€” 10 min fresh at edge, 5 min stale-while-revalidate.
  // Vercel Edge Network caches this. In-memory cache below is best-effort for
  // warm serverless instances (instances can restart so memory is not reliable).
  res.setHeader("Cache-Control", "public, s-maxage=600, stale-while-revalidate=300");

  // Serve in-memory cache if fresh
  const now = Date.now();
  if (memoryCache && now - memoryCache.timestamp < CACHE_TTL_MS) {
    console.info("[Instagram] Serving from in-memory cache");
    res.status(200).json({
      success: true,
      data: memoryCache.data,
      username: memoryCache.username || "avelricindia",
      fallback: false,
      cached: true,
    });
    return;
  }

  const token = (process.env.INSTAGRAM_ACCESS_TOKEN || "").trim();
  const apiVersion = normalizeApiVersion(process.env.META_GRAPH_API_VERSION);

  // No token â€” serve static fallback immediately
  if (!token) {
    console.warn("[Instagram] INSTAGRAM_ACCESS_TOKEN not configured. Serving static brand fallback.");
    res.status(200).json({
      success: true,
      data: STATIC_FALLBACK,
      username: "avelricindia",
      fallback: true,
      cached: false,
    });
    return;
  }

  // Warn about sunset Basic Display API tokens (diagnostic log only)
  if (token.startsWith("IGQV")) {
    console.warn(
      "[Instagram] IGQV token detected. The Basic Display API is sunset. " +
        "Regenerate via Meta for Developers > Instagram API with Facebook Login."
    );
  }

  console.info("[Instagram] Starting live Meta API fetch.");

  // Attempt live Meta API strategies in order
  let result: { data: InstagramMediaItem[]; username?: string } | null = null;

  // Strategy 1 â€” /me/media (primary, fastest, correct for IGAA tokens)
  result = await fetchViaInstagramGraph(token, apiVersion);

  // Strategy 2 â€” resolve /me then /{id}/media (secondary fallback)
  if (!result) {
    result = await fetchViaUserIdResolution(token, apiVersion);
  }

  // All strategies failed
  if (!result || !result.data || result.data.length === 0) {
    // Serve stale in-memory cache before falling back to static brand images
    if (memoryCache && memoryCache.data.length > 0) {
      console.warn("[Instagram] All live strategies failed â€” serving stale in-memory cache.");
      res.status(200).json({
        success: true,
        data: memoryCache.data,
        username: memoryCache.username || "avelricindia",
        fallback: false,
        cached: true,
        stale: true,
      });
      return;
    }

    // Static brand fallback â€” website is never blank
    console.warn("[Instagram] All strategies failed and no cache. Serving static brand fallback.");
    res.status(200).json({
      success: true,
      data: STATIC_FALLBACK,
      username: "avelricindia",
      fallback: true,
      cached: false,
    });
    return;
  }

  // Success: sort latest-first, take top 6, cache, and serve
  const sorted = result.data.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
  const latest6 = sorted.slice(0, 6);

  memoryCache = {
    timestamp: now,
    data: latest6,
    username: result.username || "avelricindia",
  };

  console.info("[Instagram] Serving", latest6.length, "live items from Meta API.");
  res.status(200).json({
    success: true,
    data: latest6,
    username: memoryCache.username,
    fallback: false,
    cached: false,
  });
}