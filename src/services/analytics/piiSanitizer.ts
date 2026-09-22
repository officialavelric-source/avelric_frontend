/**
 * PII Sanitization Utilities for AVELRIC Analytics
 * Guarantees zero sensitive customer information reaches Google Analytics 4.
 */

// Email regex pattern
const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

// Phone number regex patterns (standard 10-digit Indian mobile numbers and international patterns)
const PHONE_REGEX = /\b(?:(?:\+?91[\s-]?)?[6-9]\d{9}|\d{3}[-.\s]?\d{3}[-.\s]?\d{4})\b/g;

// Sensitive URL query parameters to strip
const SENSITIVE_QUERY_PARAMS = [
  'code',
  'state',
  'token',
  'access_token',
  'id_token',
  'verifier',
  'nonce',
  'code_challenge',
  'email',
  'phone',
];

/**
 * Sanitizes search queries to remove accidental emails or phone numbers.
 */
export function sanitizeSearchTerm(term: string): string {
  if (!term || typeof term !== 'string') return '';
  
  let sanitized = term
    .replace(EMAIL_REGEX, '[REDACTED_EMAIL]')
    .replace(PHONE_REGEX, '[REDACTED_PHONE]')
    .trim();

  // Truncate to a reasonable query limit (max 100 characters)
  if (sanitized.length > 100) {
    sanitized = sanitized.substring(0, 100);
  }

  return sanitized;
}

/**
 * Strips authentication and personal query parameters from URLs.
 */
export function sanitizeUrl(rawUrl: string): string {
  if (!rawUrl || typeof rawUrl !== 'string') return '';

  try {
    const url = new URL(rawUrl, window.location.origin);
    SENSITIVE_QUERY_PARAMS.forEach((param) => {
      if (url.searchParams.has(param)) {
        url.searchParams.delete(param);
      }
    });
    return url.toString();
  } catch {
    // Fallback: simple string sanitization if URL parsing fails
    let clean = rawUrl;
    SENSITIVE_QUERY_PARAMS.forEach((param) => {
      const reg = new RegExp(`([?&])${param}=[^&]*(&|$)`, 'gi');
      clean = clean.replace(reg, '$1');
    });
    return clean.replace(/[?&]$/, '');
  }
}

/**
 * Converts price inputs (numbers, strings like "₹2,499.00") to numeric values.
 */
export function sanitizeNumericPrice(price: string | number | undefined | null): number {
  if (typeof price === 'number') {
    return isNaN(price) ? 0 : Math.max(0, price);
  }

  if (typeof price === 'string') {
    const cleaned = price.replace(/[^0-9.]/g, '');
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : Math.max(0, parsed);
  }

  return 0;
}
