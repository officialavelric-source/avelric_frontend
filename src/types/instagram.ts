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
  error?: string;
}
