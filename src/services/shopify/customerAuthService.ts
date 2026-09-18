import { shopifyConfig } from "../../config/env";
import { getOIDCConfig, getCustomerAccountAPIConfig, invalidateDiscoveryCache } from "./customerAccountDiscovery";
import { generateCodeVerifier, generateCodeChallenge, generateState, generateNonce } from "../../utils/pkce";
import type {
  CustomerProfile,
  CustomerOrder,
  CustomerOrderDetail,
  CustomerOrdersResult,
  CustomerSession,
  TokenResponse,
} from "../../types/customer";

/* ——— Storage keys ——— */
const SESSION_KEY             = "avelric_customer_session_v1";
const VERIFIER_KEY            = "avelric_oauth_verifier";
const STATE_KEY               = "avelric_oauth_state";
const NONCE_KEY               = "avelric_oauth_nonce";
const RETURN_TO_KEY           = "avelric_oauth_return_to";
const REDIRECT_URI_KEY        = "avelric_oauth_redirect_uri";
const LAST_EXCHANGED_CODE_KEY = "avelric_oauth_last_code";

/* ——— Module-level exchange registry for strict code exchange idempotency ——— */
interface CodeExchangeRecord {
  promise: Promise<CustomerSession>;
  result?: CustomerSession;
  error?: Error;
}

const exchangeRegistry = new Map<string, CodeExchangeRecord>();

/* ——— JWT payload decoder (no signature verification — payload only) ——— */
function decodeJWTPayload(jwt: string): Record<string, unknown> {
  const parts = jwt.split(".");
  if (parts.length !== 3) throw new Error("Malformed JWT: expected 3 parts");
  const base64url = parts[1];
  const base64 = base64url.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(base64.length + (4 - (base64.length % 4)) % 4, "=");
  try {
    return JSON.parse(atob(padded)) as Record<string, unknown>;
  } catch {
    throw new Error("Failed to decode JWT payload");
  }
}

/**
 * CustomerAuthService — Shopify Customer Account API OAuth 2.0 + PKCE.
 *
 * All OAuth endpoints are dynamically discovered via OIDC discovery.
 * No Shop IDs are hardcoded. No endpoints are constructed manually.
 *
 * Security properties:
 * - PKCE: code_verifier stored in sessionStorage, cleared after exchange
 * - State: fail-closed validation (throws if missing or mismatched)
 * - Nonce: stored in sessionStorage, verified against ID token claim
 * - Session: stored in localStorage (acknowledged XSS tradeoff for SPA-without-BFF)
 */
export class CustomerAuthService {
  /* ——— Session management ——— */

  static getStoredSession(): CustomerSession | null {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      if (!raw) return null;
      const session = JSON.parse(raw) as CustomerSession;
      if (!session.accessToken || !session.expiresAt) return null;
      return session;
    } catch {
      return null;
    }
  }

  static saveSession(session: CustomerSession): void {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  }

  static clearSession(): void {
    localStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(VERIFIER_KEY);
    sessionStorage.removeItem(STATE_KEY);
    sessionStorage.removeItem(NONCE_KEY);
    sessionStorage.removeItem(RETURN_TO_KEY);
    sessionStorage.removeItem(REDIRECT_URI_KEY);
    sessionStorage.removeItem(LAST_EXCHANGED_CODE_KEY);
    exchangeRegistry.clear();
  }

  /**
   * Retrieve and clear the intended return-to URL after successful login.
   * Defaults to "/account" if not set or invalid.
   */
  static getReturnToDestination(): string {
    const target = sessionStorage.getItem(RETURN_TO_KEY);
    sessionStorage.removeItem(RETURN_TO_KEY);
    return target && target.startsWith("/") ? target : "/account";
  }

  /* ——— OAuth 2.0 + PKCE login ——— */

  /**
   * Begin login: discover authorization_endpoint, generate PKCE params,
   * store verifier/state/nonce in sessionStorage, redirect to Shopify login UI.
   * @param returnTo Optional URL to navigate to after authentication completes
   */
  static async login(returnTo?: string): Promise<void> {
    if (typeof returnTo === "string" && returnTo.startsWith("/")) {
      sessionStorage.setItem(RETURN_TO_KEY, returnTo);
    }

    const oidc = await getOIDCConfig();

    const verifier = await generateCodeVerifier();
    const challenge = await generateCodeChallenge(verifier);
    const state = generateState();
    const nonce = generateNonce();

    const redirectUri = `${window.location.origin}/account/callback`;

    sessionStorage.setItem(VERIFIER_KEY, verifier);
    sessionStorage.setItem(STATE_KEY, state);
    sessionStorage.setItem(NONCE_KEY, nonce);
    sessionStorage.setItem(REDIRECT_URI_KEY, redirectUri);

    const params = new URLSearchParams({
      client_id:             shopifyConfig.customerAccountClientId,
      response_type:         "code",
      redirect_uri:          redirectUri,
      scope:                 "openid email customer-account-api:full",
      state:                 state,
      nonce:                 nonce,
      code_challenge:        challenge,
      code_challenge_method: "S256",
    });

    window.location.href = `${oidc.authorization_endpoint}?${params.toString()}`;
  }

  /* ——— OAuth callback / code exchange ——— */

  /**
   * Handle the OAuth callback with strict idempotency:
   * 1. If this code is already in flight or was already exchanged in this memory session,
   *    reuse the existing Promise / result to prevent ANY duplicate network requests to Shopify.
   * 2. If this code was already processed in this browser session (e.g. page refresh),
   *    return the stored session if valid.
   * 3. Validate state (fail-closed against CSRF).
   * 4. Exchange authorization code using exact stored redirect_uri and PKCE code_verifier.
   * 5. Verify nonce in ID token.
   * 6. Persist session to localStorage and mark code as exchanged.
   */
  static async handleCallback(code: string, returnedState: string): Promise<CustomerSession> {
    // 1. Module-level registry check: handles StrictMode remounts & concurrent calls
    const existing = exchangeRegistry.get(code);
    if (existing) {
      return existing.promise;
    }

    // 2. Browser session check: handles page refresh / back navigation
    const lastCode = sessionStorage.getItem(LAST_EXCHANGED_CODE_KEY);
    if (lastCode === code) {
      const stored = this.getStoredSession();
      if (stored && Date.now() < stored.expiresAt) {
        return stored;
      }
    }

    // 3. Register the single execution promise BEFORE any async operations
    const exchangePromise = (async (): Promise<CustomerSession> => {
      try {
        const savedState    = sessionStorage.getItem(STATE_KEY);
        const verifier      = sessionStorage.getItem(VERIFIER_KEY);
        const savedNonce    = sessionStorage.getItem(NONCE_KEY);
        const savedRedirect = sessionStorage.getItem(REDIRECT_URI_KEY);

        /* ——— State: fail-closed ——— */
        if (!savedState) {
          throw new Error("Missing OAuth state. Session may have expired or been tampered with.");
        }
        if (returnedState !== savedState) {
          throw new Error("OAuth state mismatch. Potential CSRF attack — authentication aborted.");
        }

        if (!verifier) {
          throw new Error("Missing PKCE code verifier. Cannot complete token exchange.");
        }

        const oidc = await getOIDCConfig();
        const redirectUri = savedRedirect || `${window.location.origin}/account/callback`;

        const body = new URLSearchParams({
          grant_type:    "authorization_code",
          client_id:     shopifyConfig.customerAccountClientId,
          redirect_uri:  redirectUri,
          code:          code,
          code_verifier: verifier,
        });

        const res = await fetch(oidc.token_endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: body.toString(),
        });

        if (!res.ok) {
          const errText = await res.text().catch(() => "(no body)");
          throw new Error(`Token exchange failed: HTTP ${res.status} — ${errText}`);
        }

        const data = (await res.json()) as TokenResponse;

        /* ——— Nonce verification ——— */
        if (data.id_token && savedNonce) {
          try {
            const payload = decodeJWTPayload(data.id_token);
            if (payload.nonce !== savedNonce) {
              throw new Error("ID token nonce mismatch. Token replay or substitution attack detected.");
            }
          } catch (err) {
            this.clearSession();
            throw err;
          }
        }

        const session: CustomerSession = {
          accessToken:  data.access_token,
          refreshToken: data.refresh_token,
          idToken:      data.id_token,
          expiresAt:    Date.now() + data.expires_in * 1000 - 60_000, // 60 s buffer
        };

        this.saveSession(session);

        // Mark code as successfully exchanged in this session
        sessionStorage.setItem(LAST_EXCHANGED_CODE_KEY, code);

        /* Clear one-time PKCE, state, and nonce params */
        sessionStorage.removeItem(VERIFIER_KEY);
        sessionStorage.removeItem(STATE_KEY);
        sessionStorage.removeItem(NONCE_KEY);
        sessionStorage.removeItem(REDIRECT_URI_KEY);

        const record = exchangeRegistry.get(code);
        if (record) {
          record.result = session;
        }

        return session;
      } catch (err) {
        const errorObj = err instanceof Error ? err : new Error(String(err));
        const record = exchangeRegistry.get(code);
        if (record) {
          record.error = errorObj;
        }
        throw errorObj;
      }
    })();

    exchangeRegistry.set(code, { promise: exchangePromise });
    return exchangePromise;
  }

  /* ——— Token lifecycle ——— */

  /**
   * Return a valid access token. Automatically refreshes if within expiry window.
   * Returns null if no session exists or refresh fails.
   */
  static async getValidAccessToken(): Promise<string | null> {
    const session = this.getStoredSession();
    if (!session) return null;

    if (Date.now() < session.expiresAt) {
      return session.accessToken;
    }

    // Expired — attempt refresh
    try {
      return await this.doRefreshToken(session.refreshToken);
    } catch (err) {
      console.warn("[CustomerAuth] Token refresh failed — clearing session:", err);
      this.clearSession();
      invalidateDiscoveryCache();
      return null;
    }
  }

  /** Exchange a refresh token for a new access token using the discovered token_endpoint. */
  private static async doRefreshToken(refreshToken: string): Promise<string> {
    const oidc = await getOIDCConfig();

    const body = new URLSearchParams({
      grant_type:    "refresh_token",
      client_id:     shopifyConfig.customerAccountClientId,
      refresh_token: refreshToken,
    });

    const res = await fetch(oidc.token_endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
    });

    if (!res.ok) {
      throw new Error(`Refresh token request failed: HTTP ${res.status}`);
    }

    const data = (await res.json()) as TokenResponse;

    const newSession: CustomerSession = {
      accessToken:  data.access_token,
      refreshToken: data.refresh_token || refreshToken,
      idToken:      data.id_token || "",
      expiresAt:    Date.now() + data.expires_in * 1000 - 60_000,
    };

    this.saveSession(newSession);
    return newSession.accessToken;
  }

  /* ——— Customer Account API GraphQL ——— */

  /**
   * Execute a GraphQL query against the Customer Account API.
   * - Endpoint is dynamically discovered (not hardcoded).
   * - Token is auto-refreshed if needed.
   * - Authorization header uses raw token (no "Bearer" prefix — Shopify spec).
   */
  static async customerFetch<T>(
    query: string,
    variables: Record<string, unknown> = {}
  ): Promise<T> {
    const token = await this.getValidAccessToken();
    if (!token) throw new Error("Customer is not authenticated");

    const apiConfig = await getCustomerAccountAPIConfig();

    const res = await fetch(apiConfig.graphql_api, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization:  token, // Raw token — no "Bearer" prefix (Shopify Customer Account API spec)
      },
      body: JSON.stringify({ query, variables }),
    });

    if (!res.ok) {
      throw new Error(`Customer Account API HTTP ${res.status}: ${res.statusText}`);
    }

    const result = await res.json();

    if (result.errors && result.errors.length > 0) {
      const messages = (result.errors as Array<{ message: string }>)
        .map((e) => e.message)
        .join(", ");
      throw new Error(`Customer Account API GraphQL error: ${messages}`);
    }

    if (!result.data) {
      throw new Error("Customer Account API returned no data");
    }

    return result.data as T;
  }

  /* ——— Customer Profile ——— */

  static async getCustomerProfile(): Promise<CustomerProfile> {
    const query = /* GraphQL */ `
      query GetCustomerProfile {
        customer {
          id
          firstName
          lastName
          displayName
          emailAddress {
            emailAddress
          }
          phoneNumber {
            phoneNumber
          }
          defaultAddress {
            id
            firstName
            lastName
            address1
            address2
            city
            zoneCode
            zip
            territoryCode
            phoneNumber
          }
        }
      }
    `;

    interface QueryResponse {
      customer: {
        id: string;
        firstName?: string;
        lastName?: string;
        displayName: string;
        emailAddress?: { emailAddress: string };
        phoneNumber?: { phoneNumber: string };
        defaultAddress?: {
          id: string;
          firstName?: string;
          lastName?: string;
          address1?: string;
          address2?: string;
          city?: string;
          zoneCode?: string;
          zip?: string;
          territoryCode?: string;
          phoneNumber?: string;
        };
      };
    }

    const data = await this.customerFetch<QueryResponse>(query);
    const c = data.customer;

    return {
      id:          c.id,
      firstName:   c.firstName ?? null,
      lastName:    c.lastName ?? null,
      displayName:
        c.displayName ||
        [c.firstName, c.lastName].filter(Boolean).join(" ") ||
        c.emailAddress?.emailAddress ||
        "Valued Customer",
      email: c.emailAddress?.emailAddress ?? null,
      phone: c.phoneNumber?.phoneNumber ?? null,
      defaultAddress: c.defaultAddress
        ? {
            id:        c.defaultAddress.id,
            firstName: c.defaultAddress.firstName ?? null,
            lastName:  c.defaultAddress.lastName  ?? null,
            address1:  c.defaultAddress.address1  ?? null,
            address2:  c.defaultAddress.address2  ?? null,
            city:      c.defaultAddress.city      ?? null,
            province:  c.defaultAddress.zoneCode  ?? null,
            zip:       c.defaultAddress.zip       ?? null,
            country:   c.defaultAddress.territoryCode ?? null,
            phone:     c.defaultAddress.phoneNumber   ?? null,
            isDefault: true,
          }
        : null,
    };
  }

  /* ——— Customer Orders ——— */

  static async getCustomerOrders(first = 20, after?: string | null): Promise<CustomerOrdersResult> {
    const query = /* GraphQL */ `
      query GetCustomerOrders($first: Int!, $after: String) {
        customer {
          orders(first: $first, after: $after) {
            pageInfo {
              hasNextPage
              endCursor
            }
            nodes {
              id
              name
              processedAt
              financialStatus
              fulfillmentStatus
              totalPrice {
                amount
                currencyCode
              }
              lineItems(first: 20) {
                nodes {
                  title
                  variantTitle
                  quantity
                  price {
                    amount
                    currencyCode
                  }
                  image {
                    url
                    altText
                  }
                }
              }
            }
          }
        }
      }
    `;

    interface OrdersResponse {
      customer: {
        orders: {
          pageInfo: {
            hasNextPage: boolean;
            endCursor: string | null;
          };
          nodes: Array<{
            id: string;
            name: string;
            processedAt: string;
            financialStatus: string;
            fulfillmentStatus: string;
            totalPrice: { amount: string; currencyCode: string };
            lineItems: {
              nodes: Array<{
                title: string;
                variantTitle?: string;
                quantity: number;
                price: { amount: string; currencyCode: string };
                image?: { url: string; altText?: string };
              }>;
            };
          }>;
        };
      };
    }

    try {
      const data = await this.customerFetch<OrdersResponse>(query, { first, after: after || null });
      const orders = data.customer.orders.nodes.map((o) => ({
        id:                o.id,
        name:              o.name,
        processedAt:       o.processedAt,
        financialStatus:   o.financialStatus,
        fulfillmentStatus: o.fulfillmentStatus,
        totalAmount:       o.totalPrice.amount,
        currencyCode:      o.totalPrice.currencyCode,
        lineItems:         o.lineItems.nodes.map((item) => ({
          title:        item.title,
          variantTitle: item.variantTitle ?? null,
          quantity:     item.quantity,
          priceAmount:  item.price.amount,
          currencyCode: item.price.currencyCode,
          imageUrl:     item.image?.url ?? null,
          imageAlt:     item.image?.altText ?? null,
        })),
      }));

      return {
        orders,
        pagination: {
          hasNextPage: data.customer.orders.pageInfo.hasNextPage,
          endCursor:   data.customer.orders.pageInfo.endCursor,
        },
      };
    } catch (err) {
      console.error("[CustomerAuth] getCustomerOrders failed:", err);
      return {
        orders: [],
        pagination: { hasNextPage: false, endCursor: null },
      };
    }
  }

  /* ——— Single Order Detail ——— */

  static async getOrderById(orderIdOrName: string): Promise<CustomerOrderDetail | null> {
    if (!orderIdOrName) return null;

    let clean = orderIdOrName.trim();
    try {
      clean = decodeURIComponent(clean);
    } catch {
      // keep as-is
    }

    // Check if base64 encoded GID
    if (clean.startsWith("Z2lkOi8v")) {
      try {
        const decoded = atob(clean);
        if (decoded.startsWith("gid://shopify/Order/")) {
          clean = decoded;
        }
      } catch {
        // ignore
      }
    }

    let numericId: string | null = null;
    let canonicalGid: string | null = null;

    if (clean.startsWith("gid://shopify/Order/")) {
      canonicalGid = clean;
      numericId = clean.split("/").pop() || null;
    } else if (/^\d{6,}$/.test(clean)) {
      // Numeric Shopify order ID (e.g. 7540138967318)
      numericId = clean;
      canonicalGid = `gid://shopify/Order/${clean}`;
    }

    const orderFields = /* GraphQL */ `
      id
      name
      processedAt
      financialStatus
      fulfillmentStatus
      statusPageUrl
      subtotal {
        amount
        currencyCode
      }
      totalTax {
        amount
        currencyCode
      }
      totalShipping {
        amount
        currencyCode
      }
      totalPrice {
        amount
        currencyCode
      }
      shippingAddress {
        id
        firstName
        lastName
        address1
        address2
        city
        zoneCode
        zip
        territoryCode
        phoneNumber
      }
      fulfillments(first: 10) {
        nodes {
          status
          trackingInformation {
            company
            number
            url
          }
        }
      }
      lineItems(first: 50) {
        nodes {
          name
          title
          variantTitle
          quantity
          price {
            amount
            currencyCode
          }
          image {
            url
            altText
          }
        }
      }
    `;

    interface RawOrderPayload {
      id: string;
      name: string;
      processedAt: string;
      financialStatus: string;
      fulfillmentStatus: string;
      statusPageUrl?: string | null;
      subtotal?: { amount: string; currencyCode: string } | null;
      totalTax?: { amount: string; currencyCode: string } | null;
      totalShipping?: { amount: string; currencyCode: string } | null;
      totalPrice: { amount: string; currencyCode: string };
      shippingAddress?: {
        id?: string;
        firstName?: string | null;
        lastName?: string | null;
        address1?: string | null;
        address2?: string | null;
        city?: string | null;
        zoneCode?: string | null;
        zip?: string | null;
        territoryCode?: string | null;
        phoneNumber?: string | null;
      } | null;
      fulfillments?: {
        nodes: Array<{
          status: string;
          trackingInformation?: Array<{
            company?: string | null;
            number?: string | null;
            url?: string | null;
          }> | null;
        }>;
      } | null;
      lineItems: {
        nodes: Array<{
          name?: string | null;
          title?: string | null;
          variantTitle?: string | null;
          quantity: number;
          price: { amount: string; currencyCode: string };
          image?: { url: string; altText?: string | null } | null;
        }>;
      };
    }

    const mapPayloadToDetail = (o: RawOrderPayload): CustomerOrderDetail => ({
      id:                o.id,
      name:              o.name,
      processedAt:       o.processedAt,
      financialStatus:   o.financialStatus,
      fulfillmentStatus: o.fulfillmentStatus,
      totalAmount:       o.totalPrice?.amount ?? "0.00",
      currencyCode:      o.totalPrice?.currencyCode ?? "INR",
      subtotalAmount:    o.subtotal?.amount ?? null,
      totalTaxAmount:    o.totalTax?.amount ?? null,
      totalShippingAmount: o.totalShipping?.amount ?? null,
      statusPageUrl:     o.statusPageUrl ?? null,
      shippingAddress:   o.shippingAddress
        ? {
            id:        o.shippingAddress.id ?? "",
            firstName: o.shippingAddress.firstName ?? null,
            lastName:  o.shippingAddress.lastName ?? null,
            address1:  o.shippingAddress.address1 ?? null,
            address2:  o.shippingAddress.address2 ?? null,
            city:      o.shippingAddress.city ?? null,
            province:  o.shippingAddress.zoneCode ?? null,
            zip:       o.shippingAddress.zip ?? null,
            country:   o.shippingAddress.territoryCode ?? null,
            phone:     o.shippingAddress.phoneNumber ?? null,
            isDefault: false,
          }
        : null,
      fulfillments: (o.fulfillments?.nodes ?? []).map((f) => ({
        status: f.status,
        tracking: (f.trackingInformation ?? []).map((t) => ({
          company: t.company ?? null,
          number:  t.number ?? null,
          url:     t.url ?? null,
        })),
      })),
      lineItems: o.lineItems.nodes.map((item) => ({
        title:        item.title || item.name || "Purchased Piece",
        variantTitle: item.variantTitle ?? null,
        quantity:     item.quantity,
        priceAmount:  item.price.amount,
        currencyCode: item.price.currencyCode,
        imageUrl:     item.image?.url ?? null,
        imageAlt:     item.image?.altText ?? null,
      })),
    });

    // 1. Primary path: query order(id: $orderId) using Customer Account API
    if (canonicalGid) {
      try {
        const query = /* GraphQL */ `
          query GetCustomerOrder($orderId: ID!) {
            order(id: $orderId) {
              ${orderFields}
            }
          }
        `;
        const data = await this.customerFetch<{ order: RawOrderPayload | null }>(query, { orderId: canonicalGid });
        if (data?.order) {
          return mapPayloadToDetail(data.order);
        }
      } catch (err) {
        console.warn("[CustomerAuth] Customer Account API order(id:) lookup failed, falling back to customer.orders list:", err);
      }
    }

    // 2. Secondary path: search customer.orders connection (strictly customer-scoped)
    try {
      const query = /* GraphQL */ `
        query GetCustomerOrdersForLookup {
          customer {
            orders(first: 50) {
              nodes {
                ${orderFields}
              }
            }
          }
        }
      `;
      const data = await this.customerFetch<{
        customer: { orders: { nodes: RawOrderPayload[] } };
      }>(query);

      const nodes = data?.customer?.orders?.nodes || [];
      const matched = nodes.find((o) => {
        if (canonicalGid && o.id === canonicalGid) return true;
        if (numericId && (o.id === `gid://shopify/Order/${numericId}` || o.id.endsWith(`/${numericId}`))) return true;
        const oCleanName = o.name.replace(/^#/, "").toLowerCase();
        const inputCleanName = clean.replace(/^#/, "").toLowerCase();
        return oCleanName === inputCleanName || o.name.toLowerCase() === clean.toLowerCase();
      });

      if (matched) {
        return mapPayloadToDetail(matched);
      }
    } catch (err) {
      console.warn("[CustomerAuth] getOrderById full customer.orders lookup failed, falling back to basic orders:", err);
    }

    // 3. Bulletproof fallback: use the 100% verified getCustomerOrders query
    try {
      const ordersResult = await this.getCustomerOrders(50);
      const basicMatch = ordersResult.orders.find((o) => {
        if (canonicalGid && o.id === canonicalGid) return true;
        if (numericId && (o.id === `gid://shopify/Order/${numericId}` || o.id.endsWith(`/${numericId}`))) return true;
        const oCleanName = o.name.replace(/^#/, "").toLowerCase();
        const inputCleanName = clean.replace(/^#/, "").toLowerCase();
        return oCleanName === inputCleanName || o.name.toLowerCase() === clean.toLowerCase();
      });

      if (basicMatch) {
        return {
          ...basicMatch,
          subtotalAmount: null,
          totalTaxAmount: null,
          totalShippingAmount: null,
          statusPageUrl: null,
          shippingAddress: null,
          fulfillments: [],
        };
      }
    } catch (err) {
      console.error("[CustomerAuth] getOrderById basic orders fallback failed:", err);
    }

    return null;
  }

  /* ——— Logout ——— */

  /**
   * Logout:
   * 1. Read id_token for id_token_hint
   * 2. Clear all local session data
   * 3. Redirect to Shopify end_session_endpoint (discovered, not hardcoded)
   */
  static async logout(): Promise<void> {
    const session = this.getStoredSession();
    const idToken = session?.idToken;

    this.clearSession();

    try {
      const oidc = await getOIDCConfig();
      const postLogoutUri = `${window.location.origin}/account`;

      const params = new URLSearchParams({
        post_logout_redirect_uri: postLogoutUri,
      });

      if (idToken) {
        params.set("id_token_hint", idToken);
      }

      window.location.href = `${oidc.end_session_endpoint}?${params.toString()}`;
    } catch {
      // Discovery failed — fall back to local redirect
      window.location.href = `${window.location.origin}/account`;
    }
  }
}
