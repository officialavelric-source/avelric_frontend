/**
 * Review definitions and backwards-compatible adapters.
 * All reviews are now managed dynamically via reviewService.
 */

export type {
  ClientReview,
  ReviewSubmission,
  ProductRatingSummary,
  StarDistribution,
} from "../services/reviewService";

export {
  getAllReviews,
  getProductReviews,
  getProductRatingSummary,
  getGlobalRatingSummary,
  submitReview,
  subscribeToReviews,
} from "../services/reviewService";

// Legacy interface alias for components transitioning over
export interface Review {
  n: string;
  c: string;
  avatar?: string;
  rating: number;
  productId: string;
  date: string;
  q: string;
  headline?: string;
}
