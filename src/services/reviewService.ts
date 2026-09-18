/**
 * Client Review & Customer Photo Service
 * Connects directly to Vercel Serverless API (/api/reviews) backed by MongoDB Atlas
 * and Vercel Blob storage.
 * Maintains client-side in-memory caching and events for instant UI reactivity.
 */

export interface ClientReview {
  id: string;
  productId: string; // Product id or handle
  shopifyProductId?: string;
  productHandle?: string;
  productTitle?: string;
  authorName: string;
  location?: string;
  rating: number; // 1 to 5
  headline: string;
  comment: string;
  verifiedPurchase: boolean;
  helpfulCount?: number;
  createdAt: string; // ISO 8601 string
  photos?: string[];
}

export interface ReviewSubmission {
  productId: string;
  shopifyProductId?: string;
  productHandle?: string;
  productTitle?: string;
  authorName: string;
  customerEmail: string;
  location?: string;
  rating: number;
  headline: string;
  comment: string;
  verifiedPurchase?: boolean;
  photos?: string[];
}

export interface StarDistribution {
  star: number;
  count: number;
  percentage: number;
}

export interface ProductRatingSummary {
  averageRating: number;
  totalReviews: number;
  distribution: StarDistribution[];
}

export interface CustomerPhoto {
  id: string;
  productId: string;
  productTitle?: string;
  authorName: string;
  location?: string;
  photoUrl: string;
  caption?: string;
  createdAt: string;
}

export interface CustomerPhotoSubmission {
  productId: string;
  shopifyProductId?: string;
  productTitle?: string;
  authorName: string;
  customerEmail?: string;
  location?: string;
  photoUrl: string;
  caption?: string;
}

const REVIEWS_UPDATED_EVENT = "avelric_reviews_updated";
const PHOTOS_UPDATED_EVENT = "avelric_photos_updated";
const CACHE_STORAGE_KEY = "avelric_reviews_cache_v2";

/* ——— In-memory Cache ——— */
interface CacheEntry {
  reviews: ClientReview[];
  summary: ProductRatingSummary;
  timestamp: number;
}

const cache: Map<string, CacheEntry> = new Map();
const inFlightRequests: Map<string, Promise<any>> = new Map();

function getEmptySummary(): ProductRatingSummary {
  return {
    averageRating: 0,
    totalReviews: 0,
    distribution: [5, 4, 3, 2, 1].map((star) => ({ star, count: 0, percentage: 0 })),
  };
}

// Load cached reviews from localStorage if available (fast initial page load)
if (typeof window !== "undefined") {
  try {
    const raw = localStorage.getItem(CACHE_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object") {
        for (const [key, entry] of Object.entries(parsed)) {
          cache.set(key, entry as CacheEntry);
        }
      }
    }
  } catch {
    // ignore
  }
}

function persistCacheToStorage() {
  if (typeof window === "undefined") return;
  try {
    const obj: Record<string, CacheEntry> = {};
    cache.forEach((val, key) => {
      obj[key] = val;
    });
    localStorage.setItem(CACHE_STORAGE_KEY, JSON.stringify(obj));
  } catch {
    // ignore quota errors
  }
}

export function subscribeToReviews(listener: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(REVIEWS_UPDATED_EVENT, listener);
  return () => {
    window.removeEventListener(REVIEWS_UPDATED_EVENT, listener);
  };
}

export function subscribeToCustomerPhotos(listener: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(PHOTOS_UPDATED_EVENT, listener);
  return () => {
    window.removeEventListener(PHOTOS_UPDATED_EVENT, listener);
  };
}

function notifySubscribers() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(REVIEWS_UPDATED_EVENT));
    window.dispatchEvent(new CustomEvent(PHOTOS_UPDATED_EVENT));
  }
}

/* ——— Fetch API functions ——— */

export async function fetchProductReviews(
  productId: string,
  shopifyProductId?: string,
  forceRefresh = false
): Promise<{ reviews: ClientReview[]; summary: ProductRatingSummary }> {
  const normKey = (productId || shopifyProductId || "").trim().toLowerCase();
  const shopifyKey = (shopifyProductId || "").trim().toLowerCase();
  const cached = cache.get(normKey) || (shopifyKey ? cache.get(shopifyKey) : undefined);

  // Return fresh cache if less than 60 seconds old
  if (!forceRefresh && cached && Date.now() - cached.timestamp < 60000) {
    return { reviews: cached.reviews, summary: cached.summary };
  }

  // Deduplicate simultaneous requests
  if (inFlightRequests.has(normKey)) {
    return inFlightRequests.get(normKey)!;
  }

  const fetchPromise = (async () => {
    try {
      const params = new URLSearchParams();
      if (productId) params.set("productId", productId.trim());
      if (shopifyProductId) params.set("shopifyProductId", shopifyProductId.trim());

      const queryStr = params.toString();
      const url = queryStr ? `/api/reviews?${queryStr}` : `/api/reviews`;
      const res = await fetch(url, { headers: { Accept: "application/json" } });

      if (!res.ok) {
        throw new Error(`Failed to fetch reviews: HTTP ${res.status}`);
      }

      const data = await res.json();
      const reviews: ClientReview[] = (data.reviews || []).map((r: any) => ({
        id: r.id,
        productId: r.productHandle || r.shopifyProductId || normKey,
        shopifyProductId: r.shopifyProductId,
        productHandle: r.productHandle,
        productTitle: r.productTitle,
        authorName: r.authorName,
        location: r.location,
        rating: r.rating,
        headline: r.headline,
        comment: r.comment,
        verifiedPurchase: Boolean(r.verifiedPurchase),
        helpfulCount: r.helpfulCount || 0,
        createdAt: r.createdAt,
        photos: r.photos || r.images || [],
      }));

      const summary: ProductRatingSummary = data.summary || getEmptySummary();

      const entry = { reviews, summary, timestamp: Date.now() };
      if (normKey) cache.set(normKey, entry);
      if (shopifyKey) cache.set(shopifyKey, entry);
      if (productId) cache.set(productId.trim().toLowerCase(), entry);

      persistCacheToStorage();
      notifySubscribers();

      return { reviews, summary };
    } catch (err) {
      console.warn("[reviewService] Fetch failed, using cached state if available:", err);
      if (cached) return { reviews: cached.reviews, summary: cached.summary };
      return { reviews: [], summary: getEmptySummary() };
    } finally {
      inFlightRequests.delete(normKey);
    }
  })();

  inFlightRequests.set(normKey, fetchPromise);
  return fetchPromise;
}

export async function fetchGlobalReviews(): Promise<{
  reviews: ClientReview[];
  summary: ProductRatingSummary;
}> {
  return fetchProductReviews("");
}

/* ——— Synchronous Cache Getters for Component Initial State ——— */

export function getProductReviews(productId: string, shopifyProductId?: string): ClientReview[] {
  if (!productId && !shopifyProductId) return [];
  const normKey = (productId || "").trim().toLowerCase();
  const shopifyKey = (shopifyProductId || "").trim().toLowerCase();
  const cached = cache.get(normKey) || (shopifyKey ? cache.get(shopifyKey) : undefined);
  if (cached) return cached.reviews;

  // Trigger background fetch if not present in cache
  fetchProductReviews(productId, shopifyProductId).catch(() => {});
  return [];
}

export function getProductRatingSummary(productId: string, shopifyProductId?: string): ProductRatingSummary {
  if (!productId && !shopifyProductId) return getEmptySummary();
  const normKey = (productId || "").trim().toLowerCase();
  const shopifyKey = (shopifyProductId || "").trim().toLowerCase();
  const cached = cache.get(normKey) || (shopifyKey ? cache.get(shopifyKey) : undefined);
  if (cached) return cached.summary;

  // Trigger background fetch
  fetchProductReviews(productId, shopifyProductId).catch(() => {});
  return getEmptySummary();
}

export function getAllReviews(): ClientReview[] {
  const cached = cache.get("");
  if (cached) return cached.reviews;

  // Fallback: concatenate all reviews from known product caches
  const allMap = new Map<string, ClientReview>();
  cache.forEach((entry) => {
    entry.reviews.forEach((r) => allMap.set(r.id, r));
  });

  fetchGlobalReviews().catch(() => {});
  return Array.from(allMap.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function getGlobalRatingSummary(): ProductRatingSummary {
  const cached = cache.get("");
  if (cached) return cached.summary;

  fetchGlobalReviews().catch(() => {});
  return getEmptySummary();
}

/* ——— Customer Photos Helpers ——— */

export function getProductCustomerPhotos(productId: string): CustomerPhoto[] {
  const reviews = getProductReviews(productId);
  const photos: CustomerPhoto[] = [];

  for (const r of reviews) {
    if (r.photos && r.photos.length > 0) {
      for (const pUrl of r.photos) {
        photos.push({
          id: `photo_${r.id}_${photos.length}`,
          productId: r.productId,
          productTitle: r.productTitle,
          authorName: r.authorName,
          location: r.location,
          photoUrl: pUrl,
          caption: r.headline,
          createdAt: r.createdAt,
        });
      }
    }
  }

  return photos;
}

export function getAllCustomerPhotos(): CustomerPhoto[] {
  const allReviews = getAllReviews();
  const photos: CustomerPhoto[] = [];

  for (const r of allReviews) {
    if (r.photos && r.photos.length > 0) {
      for (const pUrl of r.photos) {
        photos.push({
          id: `photo_${r.id}_${photos.length}`,
          productId: r.productId,
          productTitle: r.productTitle,
          authorName: r.authorName,
          location: r.location,
          photoUrl: pUrl,
          caption: r.headline,
          createdAt: r.createdAt,
        });
      }
    }
  }

  return photos;
}

/* ——— Image Upload Helper ——— */

export async function uploadReviewImage(base64OrDataUrl: string): Promise<string> {
  const res = await fetch("/api/reviews/upload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ base64: base64OrDataUrl }),
  });

  if (!res.ok) {
    let errMessage = "Failed to upload image.";
    try {
      const errData = await res.json();
      if (errData.error) errMessage = errData.error;
    } catch {
      // ignore
    }
    throw new Error(errMessage);
  }

  const data = await res.json();
  if (!data.url) throw new Error("Image upload succeeded but no URL was returned.");
  return data.url;
}

/* ——— Submit Review Function ——— */

export async function submitReview(input: ReviewSubmission): Promise<ClientReview> {
  const trimmedName = (input.authorName || "").trim();
  const trimmedEmail = (input.customerEmail || "").trim();
  const trimmedComment = (input.comment || "").trim();
  const trimmedHeadline = (input.headline || "").trim();

  if (!input.productId) throw new Error("Product identifier is required.");
  if (!trimmedName) throw new Error("Please enter your name.");
  if (!trimmedEmail) throw new Error("Please enter your email.");
  if (!trimmedHeadline) throw new Error("Please enter a review headline.");
  if (!trimmedComment) throw new Error("Please enter your review comments.");
  if (input.rating < 1 || input.rating > 5) throw new Error("Rating must be between 1 and 5.");

  const payload = {
    shopifyProductId: input.shopifyProductId || input.productId,
    productHandle: input.productHandle || input.productId,
    productTitle: input.productTitle,
    customerName: trimmedName,
    customerEmail: trimmedEmail,
    rating: input.rating,
    title: trimmedHeadline,
    review: trimmedComment,
    location: input.location?.trim() || undefined,
    images: input.photos || [],
  };

  const res = await fetch("/api/reviews", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    let errMsg = "Failed to submit review.";
    try {
      const errData = await res.json();
      if (errData.error) errMsg = errData.error;
    } catch {
      // ignore
    }
    throw new Error(errMsg);
  }

  const resData = await res.json();
  const created = resData.review;

  const newReview: ClientReview = {
    id: created.id,
    productId: input.productHandle || input.productId,
    shopifyProductId: created.shopifyProductId,
    productHandle: created.productHandle,
    productTitle: created.productTitle,
    authorName: created.authorName,
    location: created.location,
    rating: created.rating,
    headline: created.headline,
    comment: created.comment,
    verifiedPurchase: Boolean(created.verifiedPurchase), // Defaults to false in Phase 1
    helpfulCount: 0,
    createdAt: created.createdAt,
    photos: created.images || [],
  };

  // Update in-memory cache immediately
  const normKey = (input.productHandle || input.productId).trim().toLowerCase();
  const shopifyKey = (input.shopifyProductId || "").trim().toLowerCase();

  const prevReviews = (cache.get(normKey) || (shopifyKey ? cache.get(shopifyKey) : undefined))?.reviews || [];
  const updatedReviews = [newReview, ...prevReviews.filter((r) => r.id !== newReview.id)];
  const total = updatedReviews.length;
  const sum = updatedReviews.reduce((a, r) => a + r.rating, 0);
  const avg = Math.round((sum / total) * 10) / 10;
  const distribution = [5, 4, 3, 2, 1].map((star) => {
    const count = updatedReviews.filter((r) => Math.round(r.rating) === star).length;
    return { star, count, percentage: Math.round((count / total) * 100) };
  });

  const newEntry = {
    reviews: updatedReviews,
    summary: { averageRating: avg, totalReviews: total, distribution },
    timestamp: Date.now(),
  };

  cache.set(normKey, newEntry);
  if (shopifyKey) cache.set(shopifyKey, newEntry);
  if (input.productId) cache.set(input.productId.trim().toLowerCase(), newEntry);
  if (input.productHandle) cache.set(input.productHandle.trim().toLowerCase(), newEntry);

  persistCacheToStorage();
  notifySubscribers();

  // Trigger background re-fetch for fresh server synchronization
  fetchProductReviews(input.productId, input.shopifyProductId, true).catch(() => {});

  return newReview;
}

export async function submitCustomerPhoto(input: CustomerPhotoSubmission): Promise<CustomerPhoto> {
  const trimmedName = input.authorName.trim();
  if (!input.productId) throw new Error("Product identifier is required.");
  if (!trimmedName) throw new Error("Please enter your name.");
  if (!input.photoUrl) throw new Error("Please select or upload a photo.");

  // Submit as review with rating 5
  await submitReview({
    productId: input.productId,
    shopifyProductId: input.shopifyProductId,
    productTitle: input.productTitle,
    authorName: trimmedName,
    customerEmail: input.customerEmail || "customer@avelric.in",
    location: input.location,
    rating: 5,
    headline: input.caption || "Customer Fit Picture",
    comment: input.caption || "Customer fit photo submission.",
    photos: [input.photoUrl],
  });

  return {
    id: `photo_${Date.now()}`,
    productId: input.productId,
    productTitle: input.productTitle,
    authorName: trimmedName,
    location: input.location,
    photoUrl: input.photoUrl,
    caption: input.caption,
    createdAt: new Date().toISOString(),
  };
}

export async function voteReviewHelpful(reviewId: string): Promise<number> {
  if (!reviewId) return 0;
  try {
    const res = await fetch("/api/reviews/helpful", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reviewId }),
    });
    if (res.ok) {
      const data = await res.json();
      return data.helpfulCount || 1;
    }
  } catch (err) {
    console.warn("[reviewService] Helpful vote error:", err);
  }
  return 1;
}
