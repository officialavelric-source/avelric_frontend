export type InstagramMediaType = "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM";

export interface InstagramMediaItem {
  id: string;
  caption?: string;
  mediaType: InstagramMediaType;
  mediaProductType?: "REELS" | "FEED" | "STORY" | string;
  mediaUrl: string;
  thumbnailUrl?: string;
  permalink: string;
  timestamp: string;
}

export interface InstagramApiResponse {
  success: boolean;
  data: InstagramMediaItem[];
  username?: string;
  /** true when local static brand images are served instead of live Instagram content */
  fallback?: boolean;
  /** true when served from in-memory cache */
  cached?: boolean;
  /** true when in-memory cache is stale (all live strategies failed) */
  stale?: boolean;
  error?: string;
}
