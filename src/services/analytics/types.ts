/**
 * GA4 Analytics Type Definitions for AVELRIC
 * Enforces strict canonical schemas, numeric prices, and INR currency.
 */

export interface GA4Item {
  item_id: string; // Canonical Shopify Product GID
  item_name: string;
  item_brand?: string; // Default: 'AVELRIC'
  item_category?: string;
  item_variant?: string;
  price: number; // Strictly numeric in INR
  quantity?: number;
  currency?: string; // Always 'INR'
  index?: number;
  item_list_id?: string;
  item_list_name?: string;
}

export interface PageViewParams {
  page_title: string;
  page_location: string;
  page_path: string;
}

export interface ViewItemListParams {
  item_list_id?: string;
  item_list_name?: string;
  items: GA4Item[];
}

export interface SelectItemParams {
  item_list_id?: string;
  item_list_name?: string;
  items: GA4Item[];
}

export interface ViewItemParams {
  currency?: string;
  value?: number;
  items: GA4Item[];
}

export interface SelectSizeParams {
  item_id: string;
  item_name: string;
  size: string;
  is_available: boolean;
}

export interface SearchParams {
  search_term: string;
  results_count?: number;
}

export interface FilterProductsParams {
  filter_category?: string;
  filter_price_range?: string;
  filter_sort?: string;
  results_count?: number;
}

export interface AddToCartParams {
  currency?: string;
  value: number;
  items: GA4Item[];
}

export interface RemoveFromCartParams {
  currency?: string;
  value?: number;
  items: GA4Item[];
}

export interface ViewCartParams {
  currency?: string;
  value: number;
  items: GA4Item[];
  free_shipping_gap?: number;
}

export interface BeginCheckoutParams {
  currency?: string;
  value: number;
  items: GA4Item[];
  coupon?: string;
}

export interface PurchaseParams {
  transaction_id: string;
  value: number;
  currency?: string;
  tax?: number;
  shipping?: number;
  coupon?: string;
  items: GA4Item[];
}

export interface GenerateLeadParams {
  lead_type: 'whatsapp' | 'email';
  placement: string;
  product_id?: string;
  product_name?: string;
}

export interface ContactEmailParams {
  placement: string;
  product_context?: string;
}

export interface SignUpParams {
  method: string;
  placement?: string;
}

export interface SubmitReviewParams {
  product_id: string;
  rating: number;
  has_photo: boolean;
}

export interface LoginParams {
  method: string;
}

export interface ErrorPageViewParams {
  error_type: string;
  attempted_path: string;
}
