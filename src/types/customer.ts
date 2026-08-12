/**
 * Application-level types for Shopify Customer Account API.
 * Normalized from Shopify's raw GraphQL responses into clean app types.
 */

/* ——— Address ——— */
export interface CustomerAddress {
  id: string;
  firstName: string | null;
  lastName: string | null;
  address1: string | null;
  address2: string | null;
  city: string | null;
  province: string | null;
  zip: string | null;
  country: string | null;
  phone: string | null;
  isDefault: boolean;
}

/* ——— Order line item ——— */
export interface OrderLineItem {
  title: string;
  variantTitle: string | null;
  quantity: number;
  priceAmount: string;
  currencyCode: string;
  imageUrl: string | null;
  imageAlt: string | null;
}

/* ——— Order ——— */
export interface CustomerOrder {
  id: string;
  name: string; // e.g. "#1001"
  processedAt: string; // ISO date string
  financialStatus: string;
  fulfillmentStatus: string;
  totalAmount: string;
  currencyCode: string;
  lineItems: OrderLineItem[];
}

/* ——— Customer profile ——— */
export interface CustomerProfile {
  id: string;
  firstName: string | null;
  lastName: string | null;
  displayName: string;
  email: string | null;
  phone: string | null;
  defaultAddress: CustomerAddress | null;
}

/* ——— Raw token response from Shopify OAuth token endpoint ——— */
export interface TokenResponse {
  access_token: string;
  expires_in: number; // seconds
  id_token: string;
  refresh_token: string;
  token_type: "Bearer";
}

/* ——— Stored session (persisted to localStorage) ——— */
export interface CustomerSession {
  accessToken: string;
  refreshToken: string;
  idToken: string;
  expiresAt: number; // Unix timestamp in milliseconds
}

/* ——— Auth context value ——— */
export type AuthStatus = "loading" | "authenticated" | "unauthenticated";

export interface CustomerAuthContextValue {
  status: AuthStatus;
  isLoading: boolean;
  isAuthenticated: boolean;
  customer: CustomerProfile | null;
  error: string | null;
  /** Redirect to Shopify-hosted login UI */
  login: () => Promise<void>;
  /** Terminate session on Shopify and clear local state */
  logout: () => void;
  /**
   * Make an authenticated GraphQL request to the Customer Account API.
   * Automatically attaches the Bearer token and refreshes if expired.
   */
  customerFetch: <T>(query: string, variables?: Record<string, unknown>) => Promise<T>;
}
