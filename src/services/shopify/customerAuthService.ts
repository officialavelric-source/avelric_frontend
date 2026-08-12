import { shopifyConfig } from "../../config/env";
import { getOIDCConfig, getCustomerAccountAPIConfig, invalidateDiscoveryCache } from "./customerAccountDiscovery";
import { generateCodeVerifier, generateCodeChallenge, generateState, generateNonce } from "../../utils/pkce";
import type { CustomerProfile, CustomerOrder, CustomerSession, TokenResponse } from "../../types/customer";

/* ——— Storage keys ——— */
const SESSION_KEY = "avelric_customer_session_v1";
const VERIFIER_KEY = "avelric_oauth_verifier";
const STATE_KEY   = "avelric_oauth_state";
const NONCE_KEY   = "avelric_oauth_nonce";

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
  }

  /* ——— OAuth 2.0 + PKCE login ——— */

  /**
   * Begin login: discover authorization_endpoint, generate PKCE params,
   * store verifier/state/nonce in sessionStorage, redirect to Shopify login UI.
   */
  static async login(): Promise<void> {
    const oidc = await getOIDCConfig();

    const verifier = await generateCodeVerifier();
    const challenge = await generateCodeChallenge(verifier);
    const state = generateState();
    const nonce = generateNonce();

    sessionStorage.setItem(VERIFIER_KEY, verifier);
    sessionStorage.setItem(STATE_KEY, state);
    sessionStorage.setItem(NONCE_KEY, nonce);

    const redirectUri = `${window.location.origin}/account/callback`;

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
   * Handle the OAuth callback:
   * 1. Validate state — FAIL CLOSED (throws if state missing or mismatched)
   * 2. Exchange authorization code for tokens using discovered token_endpoint
   * 3. Verify nonce in the received ID token
   * 4. Persist session to localStorage
   */
  static async handleCallback(code: string, returnedState: string): Promise<CustomerSession> {
    const savedState   = sessionStorage.getItem(STATE_KEY);
    const verifier     = sessionStorage.getItem(VERIFIER_KEY);
    const savedNonce   = sessionStorage.getItem(NONCE_KEY);

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
    const redirectUri = `${window.location.origin}/account/callback`;

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
        // If nonce check itself throws for any reason, treat as auth failure
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

    /* Clear PKCE and state params — they must not be reusable */
    sessionStorage.removeItem(VERIFIER_KEY);
    sessionStorage.removeItem(STATE_KEY);
    sessionStorage.removeItem(NONCE_KEY);

    return session;
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

  static async getCustomerOrders(first = 20): Promise<CustomerOrder[]> {
    const query = /* GraphQL */ `
      query GetCustomerOrders($first: Int!) {
        customer {
          orders(first: $first) {
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
      const data = await this.customerFetch<OrdersResponse>(query, { first });
      return data.customer.orders.nodes.map((o) => ({
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
    } catch (err) {
      console.error("[CustomerAuth] getCustomerOrders failed:", err);
      return [];
    }
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
