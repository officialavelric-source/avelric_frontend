/**
 * Central Analytics Service for AVELRIC
 * High-level facade for dispatching sanitized e-commerce and engagement events to GA4.
 */

import { sendGA4Event } from './ga4Client';
import { sanitizeNumericPrice, sanitizeSearchTerm, sanitizeUrl } from './piiSanitizer';
import type {
  AddToCartParams,
  BeginCheckoutParams,
  ContactEmailParams,
  ErrorPageViewParams,
  FilterProductsParams,
  GA4Item,
  GenerateLeadParams,
  LoginParams,
  PageViewParams,
  PurchaseParams,
  RemoveFromCartParams,
  SearchParams,
  SelectItemParams,
  SelectSizeParams,
  SignUpParams,
  SubmitReviewParams,
  ViewCartParams,
  ViewItemListParams,
  ViewItemParams,
} from './types';

class AnalyticsService {
  /**
   * Helper to clean item objects before sending to GA4.
   */
  private sanitizeItem(item: GA4Item): GA4Item {
    return {
      item_id: item.item_id || '',
      item_name: item.item_name || '',
      item_brand: item.item_brand || 'AVELRIC',
      item_category: item.item_category || 'Clothing',
      item_variant: item.item_variant || undefined,
      price: sanitizeNumericPrice(item.price),
      quantity: item.quantity ? Math.max(1, Math.floor(item.quantity)) : 1,
      currency: 'INR',
      index: typeof item.index === 'number' ? item.index : undefined,
      item_list_id: item.item_list_id || undefined,
      item_list_name: item.item_list_name || undefined,
    };
  }

  /**
   * Virtual Pageview for SPA navigation.
   */
  trackPageView(params: PageViewParams): void {
    const cleanLocation = sanitizeUrl(params.page_location);
    sendGA4Event('page_view', {
      page_title: params.page_title,
      page_location: cleanLocation,
      page_path: params.page_path,
    });
  }

  /**
   * Error / 404 Page View.
   */
  trackErrorPageView(params: ErrorPageViewParams): void {
    sendGA4Event('error_page_view', {
      error_type: params.error_type,
      attempted_path: params.attempted_path,
    });
  }

  /**
   * Product Catalog / Collection Impresisons.
   */
  trackViewItemList(params: ViewItemListParams): void {
    if (!params.items || params.items.length === 0) return;

    sendGA4Event('view_item_list', {
      item_list_id: params.item_list_id || 'collection_grid',
      item_list_name: params.item_list_name || 'Catalog Grid',
      items: params.items.map((item, idx) =>
        this.sanitizeItem({ ...item, index: item.index ?? idx + 1 })
      ),
    });
  }

  /**
   * Product Card Click.
   */
  trackSelectItem(params: SelectItemParams): void {
    if (!params.items || params.items.length === 0) return;

    sendGA4Event('select_item', {
      item_list_id: params.item_list_id,
      item_list_name: params.item_list_name,
      items: params.items.map((item) => this.sanitizeItem(item)),
    });
  }

  /**
   * Product Detail Page View.
   */
  trackViewItem(params: ViewItemParams): void {
    if (!params.items || params.items.length === 0) return;

    const cleanItems = params.items.map((item) => this.sanitizeItem(item));
    const totalValue =
      typeof params.value === 'number'
        ? sanitizeNumericPrice(params.value)
        : cleanItems.reduce((acc, curr) => acc + (curr.price || 0) * (curr.quantity || 1), 0);

    sendGA4Event('view_item', {
      currency: 'INR',
      value: totalValue,
      items: cleanItems,
    });
  }

  /**
   * Garment Size Selection.
   */
  trackSelectSize(params: SelectSizeParams): void {
    sendGA4Event('select_size', {
      item_id: params.item_id,
      item_name: params.item_name,
      size: params.size,
      is_available: Boolean(params.is_available),
    });
  }

  /**
   * Site Search submission.
   */
  trackSearch(params: SearchParams): void {
    const cleanTerm = sanitizeSearchTerm(params.search_term);
    if (!cleanTerm) return;

    sendGA4Event('search', {
      search_term: cleanTerm,
      results_count: typeof params.results_count === 'number' ? params.results_count : undefined,
    });
  }

  /**
   * Filter / Sort Application.
   */
  trackFilterProducts(params: FilterProductsParams): void {
    sendGA4Event('filter_products', {
      filter_category: params.filter_category,
      filter_price_range: params.filter_price_range,
      filter_sort: params.filter_sort,
      results_count: params.results_count,
    });
  }

  /**
   * Add Item to Shopping Bag.
   */
  trackAddToCart(params: AddToCartParams): void {
    if (!params.items || params.items.length === 0) return;

    const cleanItems = params.items.map((item) => this.sanitizeItem(item));
    const totalValue = sanitizeNumericPrice(params.value);

    sendGA4Event('add_to_cart', {
      currency: 'INR',
      value: totalValue,
      items: cleanItems,
    });
  }

  /**
   * Remove Item from Shopping Bag.
   */
  trackRemoveFromCart(params: RemoveFromCartParams): void {
    if (!params.items || params.items.length === 0) return;

    const cleanItems = params.items.map((item) => this.sanitizeItem(item));
    const totalValue = params.value ? sanitizeNumericPrice(params.value) : undefined;

    sendGA4Event('remove_from_cart', {
      currency: 'INR',
      value: totalValue,
      items: cleanItems,
    });
  }

  /**
   * Inspect Shopping Bag (/cart).
   */
  trackViewCart(params: ViewCartParams): void {
    const cleanItems = (params.items || []).map((item) => this.sanitizeItem(item));
    const totalValue = sanitizeNumericPrice(params.value);

    sendGA4Event('view_cart', {
      currency: 'INR',
      value: totalValue,
      items: cleanItems,
      free_shipping_gap:
        typeof params.free_shipping_gap === 'number'
          ? Math.max(0, params.free_shipping_gap)
          : undefined,
    });
  }

  /**
   * Initiate Checkout handoff.
   */
  trackBeginCheckout(params: BeginCheckoutParams): void {
    if (!params.items || params.items.length === 0) return;

    const cleanItems = params.items.map((item) => this.sanitizeItem(item));
    const totalValue = sanitizeNumericPrice(params.value);

    sendGA4Event('begin_checkout', {
      currency: 'INR',
      value: totalValue,
      coupon: params.coupon || undefined,
      items: cleanItems,
    });
  }

  /**
   * Order Purchase Conversion.
   */
  trackPurchase(params: PurchaseParams): void {
    if (!params.transaction_id || !params.items || params.items.length === 0) return;

    const cleanItems = params.items.map((item) => this.sanitizeItem(item));
    const totalValue = sanitizeNumericPrice(params.value);

    sendGA4Event('purchase', {
      transaction_id: params.transaction_id,
      value: totalValue,
      currency: 'INR',
      tax: typeof params.tax === 'number' ? sanitizeNumericPrice(params.tax) : 0,
      shipping: typeof params.shipping === 'number' ? sanitizeNumericPrice(params.shipping) : 0,
      coupon: params.coupon || undefined,
      items: cleanItems,
    });
  }

  /**
   * Lead Generation (e.g. WhatsApp Concierge Click).
   */
  trackLead(params: GenerateLeadParams): void {
    sendGA4Event('generate_lead', {
      lead_type: params.lead_type,
      placement: params.placement,
      product_id: params.product_id || undefined,
      product_name: params.product_name || undefined,
    });
  }

  /**
   * Email Contact Click.
   */
  trackContactEmail(params: ContactEmailParams): void {
    sendGA4Event('contact_email', {
      placement: params.placement,
      product_context: params.product_context || undefined,
    });
  }

  /**
   * Newsletter Subscription.
   */
  trackNewsletterSignup(params: SignUpParams): void {
    sendGA4Event('sign_up', {
      method: params.method,
      placement: params.placement || 'unknown',
    });
  }

  /**
   * Product Review Submission.
   */
  trackSubmitReview(params: SubmitReviewParams): void {
    sendGA4Event('submit_review', {
      product_id: params.product_id,
      rating: params.rating,
      has_photo: Boolean(params.has_photo),
    });
  }

  /**
   * Customer Account Login.
   */
  trackLogin(params: LoginParams): void {
    sendGA4Event('login', {
      method: params.method || 'shopify_customer_account',
    });
  }
}

export const analyticsService = new AnalyticsService();

/**
 * Maps an AppProduct to a standard GA4Item.
 */
export function mapAppProductToGA4Item(
  product: { shopifyId?: string; id: string; name: string; category?: any; price: number },
  index?: number,
  listName?: string
): GA4Item {
  return {
    item_id: product.shopifyId || product.id,
    item_name: product.name,
    item_brand: 'AVELRIC',
    item_category:
      typeof product.category === 'string'
        ? product.category
        : product.category?.name || 'Clothing',
    price: product.price,
    quantity: 1,
    currency: 'INR',
    index,
    item_list_name: listName,
  };
}

/**
 * Maps an AppCartLine to a standard GA4Item.
 */
export function mapCartLineToGA4Item(
  line: {
    variantId?: string;
    id: string;
    productTitle: string;
    variantTitle?: string;
    price: number;
    quantity: number;
  },
  index?: number
): GA4Item {
  return {
    item_id: line.variantId || line.id,
    item_name: line.productTitle,
    item_brand: 'AVELRIC',
    item_variant: line.variantTitle,
    price: line.price,
    quantity: line.quantity,
    currency: 'INR',
    index,
  };
}

export default analyticsService;
