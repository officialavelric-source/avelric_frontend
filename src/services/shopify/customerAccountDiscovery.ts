import { shopifyConfig } from "../../config/env";

/**
 * Shopify OpenID Connect Discovery Document.
 * Source: https://{shop-domain}/.well-known/openid-configuration
 */
export interface OIDCConfig {
  issuer: string;
  authorization_endpoint: string;
  token_endpoint: string;
  end_session_endpoint: string;
  jwks_uri: string;
  code_challenge_methods_supported: string[];
  scopes_supported: string[];
  grant_types_supported: string[];
  claims_supported: string[];
  response_types_supported: string[];
}

/**
 * Shopify Customer Account API Discovery Document.
 * Source: https://{shop-domain}/.well-known/customer-account-api
 */
export interface CustomerAccountAPIDiscovery {
  graphql_api: string;
  mcp_api?: string;
}

/* ——— Module-level cache — reset on page load, acceptable for SPA ——— */
let _oidcConfig: OIDCConfig | null = null;
let _apiConfig: CustomerAccountAPIDiscovery | null = null;

/* Deduplicates concurrent fetches */
let _oidcFetchPromise: Promise<OIDCConfig> | null = null;
let _apiFetchPromise: Promise<CustomerAccountAPIDiscovery> | null = null;

/**
 * Fetch and cache Shopify OIDC configuration.
 * Provides authorization_endpoint, token_endpoint, end_session_endpoint, jwks_uri.
 *
 * Uses the store domain from env — does NOT depend on hardcoded shop IDs.
 */
export async function getOIDCConfig(): Promise<OIDCConfig> {
  if (_oidcConfig) return _oidcConfig;

  if (!_oidcFetchPromise) {
    _oidcFetchPromise = fetch(
      `https://${shopifyConfig.domain}/.well-known/openid-configuration`
    )
      .then(async (res) => {
        if (!res.ok) {
          throw new Error(`OIDC discovery HTTP ${res.status}: ${res.statusText}`);
        }
        const data = (await res.json()) as OIDCConfig;
        if (!data.authorization_endpoint || !data.token_endpoint) {
          throw new Error("OIDC discovery response is missing required fields");
        }
        _oidcConfig = data;
        _oidcFetchPromise = null;
        return data;
      })
      .catch((err: unknown) => {
        _oidcFetchPromise = null;
        throw err;
      });
  }

  return _oidcFetchPromise;
}

/**
 * Fetch and cache the Shopify Customer Account API graphql_api endpoint.
 * Source: https://{shop-domain}/.well-known/customer-account-api
 */
export async function getCustomerAccountAPIConfig(): Promise<CustomerAccountAPIDiscovery> {
  if (_apiConfig) return _apiConfig;

  if (!_apiFetchPromise) {
    _apiFetchPromise = fetch(
      `https://${shopifyConfig.domain}/.well-known/customer-account-api`
    )
      .then(async (res) => {
        if (!res.ok) {
          throw new Error(`Customer Account API discovery HTTP ${res.status}: ${res.statusText}`);
        }
        const data = (await res.json()) as CustomerAccountAPIDiscovery;
        if (!data.graphql_api) {
          throw new Error("Customer Account API discovery response missing graphql_api");
        }
        _apiConfig = data;
        _apiFetchPromise = null;
        return data;
      })
      .catch((err: unknown) => {
        _apiFetchPromise = null;
        throw err;
      });
  }

  return _apiFetchPromise;
}

/** Invalidate all cached discovery configs (call after persistent auth errors). */
export function invalidateDiscoveryCache(): void {
  _oidcConfig = null;
  _apiConfig = null;
}
