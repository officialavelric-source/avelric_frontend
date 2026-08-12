/**
 * PKCE (Proof Key for Code Exchange) utilities for Shopify Customer Account API OAuth 2.0.
 *
 * Uses Web Crypto API exclusively.
 * No Math.random(). No predictable entropy. No static values.
 *
 * RFC 7636: https://datatracker.ietf.org/doc/html/rfc7636
 */

/** Base64URL-encode an ArrayBuffer without padding. */
function base64URLEncode(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

/**
 * Generate a cryptographically secure PKCE code verifier.
 * 96 random bytes → 128-character base64url string.
 * Exceeds RFC 7636 minimum of 43 characters.
 */
export async function generateCodeVerifier(): Promise<string> {
  const buffer = new Uint8Array(96);
  crypto.getRandomValues(buffer);
  return base64URLEncode(buffer.buffer);
}

/**
 * Derive a PKCE S256 code challenge from a code verifier.
 * SHA-256 hash → base64url encoded.
 */
export async function generateCodeChallenge(verifier: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return base64URLEncode(hash);
}

/**
 * Generate a cryptographically secure OAuth state parameter.
 * 32 random bytes → ~43-character base64url string.
 * Used for CSRF protection.
 */
export function generateState(): string {
  const buffer = new Uint8Array(32);
  crypto.getRandomValues(buffer);
  return base64URLEncode(buffer.buffer);
}

/**
 * Generate a cryptographically secure nonce for the ID token.
 * 16 random bytes → ~22-character base64url string.
 */
export function generateNonce(): string {
  const buffer = new Uint8Array(16);
  crypto.getRandomValues(buffer);
  return base64URLEncode(buffer.buffer);
}
