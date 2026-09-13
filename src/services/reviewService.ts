/**
 * Client Review & Customer Photo Service
 * Handles fetching, submission, persistence, and dynamic rating calculations
 * for genuine client product reviews and customer photos.
 * Zero mock data — real customer submissions only.
 */

export interface ClientReview {
  id: string;
  productId: string; // Product id or handle
  productTitle?: string;
  authorName: string;
  location?: string;
  rating: number; // 1 to 5
  headline: string;
  comment: string;
  verifiedPurchase: boolean;
  createdAt: string; // ISO 8601 string
  photos?: string[];
}

export interface ReviewSubmission {
  productId: string;
  productTitle?: string;
  authorName: string;
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
  productTitle?: string;
  authorName: string;
  location?: string;
  photoUrl: string;
  caption?: string;
}

const STORAGE_KEY = "avelric_client_reviews_clean_v1";
const REVIEWS_UPDATED_EVENT = "avelric_reviews_updated";

const PHOTOS_STORAGE_KEY = "avelric_customer_photos_clean_v1";
const PHOTOS_UPDATED_EVENT = "avelric_photos_updated";

// Clean up any old mock review caches on initialization
if (typeof window !== "undefined") {
  try {
    localStorage.removeItem("avelric_client_reviews_v1");
    localStorage.removeItem("avelric_client_reviews_v2");
    localStorage.removeItem("avelric_customer_photos_v1");
    localStorage.removeItem("avelric_customer_photos_v2");
  } catch {
    // ignore
  }
}

/* ——— Review Functions (Real User Reviews Only) ——— */

export function getAllReviews(): ClientReview[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    // Ensure all legacy mock reviews are purged
    return parsed.filter(
      (r: ClientReview) => !r.id.startsWith("seed_") && !r.id.startsWith("fb_")
    );
  } catch (err) {
    console.warn("[reviewService] Failed to read reviews from storage:", err);
    return [];
  }
}

function saveReviews(reviews: ClientReview[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reviews));
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent(REVIEWS_UPDATED_EVENT));
    }
  } catch (err) {
    console.error("[reviewService] Failed to save reviews:", err);
  }
}

export function subscribeToReviews(listener: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(REVIEWS_UPDATED_EVENT, listener);
  return () => {
    window.removeEventListener(REVIEWS_UPDATED_EVENT, listener);
  };
}

export function getProductReviews(productId: string): ClientReview[] {
  if (!productId) return [];
  const normalizedId = productId.trim().toLowerCase();
  const all = getAllReviews();
  return all
    .filter((r) => r.productId.trim().toLowerCase() === normalizedId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function getProductRatingSummary(productId: string): ProductRatingSummary {
  const reviews = getProductReviews(productId);
  return computeSummary(reviews);
}

export function getGlobalRatingSummary(): ProductRatingSummary {
  const reviews = getAllReviews();
  return computeSummary(reviews);
}

function computeSummary(reviews: ClientReview[]): ProductRatingSummary {
  const total = reviews.length;
  if (total === 0) {
    return {
      averageRating: 0,
      totalReviews: 0,
      distribution: [5, 4, 3, 2, 1].map((star) => ({ star, count: 0, percentage: 0 })),
    };
  }

  const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
  const avg = Math.round((sum / total) * 10) / 10;

  const distribution: StarDistribution[] = [5, 4, 3, 2, 1].map((star) => {
    const count = reviews.filter((r) => Math.round(r.rating) === star).length;
    return {
      star,
      count,
      percentage: Math.round((count / total) * 100),
    };
  });

  return {
    averageRating: avg,
    totalReviews: total,
    distribution,
  };
}

export async function submitReview(input: ReviewSubmission): Promise<ClientReview> {
  const trimmedName = input.authorName.trim();
  const trimmedComment = input.comment.trim();
  const trimmedHeadline = input.headline.trim();

  if (!input.productId) throw new Error("Product ID is required.");
  if (!trimmedName) throw new Error("Please enter your name.");
  if (!trimmedHeadline) throw new Error("Please enter a review headline.");
  if (!trimmedComment) throw new Error("Please enter your review comments.");
  if (input.rating < 1 || input.rating > 5) throw new Error("Rating must be between 1 and 5.");

  const newReview: ClientReview = {
    id: `rev_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    productId: input.productId,
    productTitle: input.productTitle?.trim() || undefined,
    authorName: trimmedName,
    location: input.location?.trim() || undefined,
    rating: input.rating,
    headline: trimmedHeadline,
    comment: trimmedComment,
    verifiedPurchase: input.verifiedPurchase ?? true,
    createdAt: new Date().toISOString(),
    photos: input.photos && input.photos.length > 0 ? input.photos : undefined,
  };

  const existing = getAllReviews();
  saveReviews([newReview, ...existing]);

  // If review contains photos, also save them to the customer photo gallery
  if (input.photos && input.photos.length > 0) {
    for (const photoUrl of input.photos) {
      await submitCustomerPhoto({
        productId: input.productId,
        productTitle: input.productTitle,
        authorName: trimmedName,
        location: input.location,
        photoUrl,
        caption: trimmedHeadline,
      });
    }
  }

  return newReview;
}

/* ——— Customer Photos Functions (Real User Photos Only) ——— */

export function getAllCustomerPhotos(): CustomerPhoto[] {
  try {
    const raw = localStorage.getItem(PHOTOS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (p: CustomerPhoto) => !p.id.startsWith("seed_") && !p.id.startsWith("fb_")
    );
  } catch (err) {
    console.warn("[reviewService] Failed to read customer photos:", err);
    return [];
  }
}

function saveCustomerPhotos(photos: CustomerPhoto[]) {
  try {
    localStorage.setItem(PHOTOS_STORAGE_KEY, JSON.stringify(photos));
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent(PHOTOS_UPDATED_EVENT));
    }
  } catch (err) {
    console.error("[reviewService] Failed to save customer photos:", err);
  }
}

export function subscribeToCustomerPhotos(listener: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(PHOTOS_UPDATED_EVENT, listener);
  return () => {
    window.removeEventListener(PHOTOS_UPDATED_EVENT, listener);
  };
}

export function getProductCustomerPhotos(productId: string): CustomerPhoto[] {
  if (!productId) return [];
  const normalizedId = productId.trim().toLowerCase();
  const all = getAllCustomerPhotos();
  return all
    .filter((p) => p.productId.trim().toLowerCase() === normalizedId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function submitCustomerPhoto(input: CustomerPhotoSubmission): Promise<CustomerPhoto> {
  const trimmedName = input.authorName.trim();
  if (!input.productId) throw new Error("Product ID is required.");
  if (!trimmedName) throw new Error("Please enter your name.");
  if (!input.photoUrl) throw new Error("Please select or upload a photo.");

  const newPhoto: CustomerPhoto = {
    id: `photo_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    productId: input.productId,
    productTitle: input.productTitle?.trim() || undefined,
    authorName: trimmedName,
    location: input.location?.trim() || undefined,
    photoUrl: input.photoUrl,
    caption: input.caption?.trim() || undefined,
    createdAt: new Date().toISOString(),
  };

  const existing = getAllCustomerPhotos();
  saveCustomerPhotos([newPhoto, ...existing]);

  return newPhoto;
}
