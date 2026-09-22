/**
 * Safe Google Analytics 4 Client Wrapper for AVELRIC
 * Ensures ad-blockers and missing credentials fail gracefully without affecting UI/business operations.
 */

declare global {
  interface Window {
    dataLayer?: any[];
    gtag?: (...args: any[]) => void;
  }
}

const MEASUREMENT_ID = import.meta.env.VITE_GA4_MEASUREMENT_ID;
const IS_DEV = import.meta.env.DEV;

/**
 * Validates if a usable GA4 Measurement ID is configured.
 */
export function isGA4Configured(): boolean {
  return (
    typeof MEASUREMENT_ID === 'string' &&
    MEASUREMENT_ID.startsWith('G-') &&
    MEASUREMENT_ID !== 'G-XXXXXXXXXX'
  );
}

/**
 * Safely sends an event to GA4 via window.gtag.
 * Fails silently in production if gtag is blocked or unavailable.
 */
export function sendGA4Event(eventName: string, params: Record<string, any> = {}): void {
  try {
    if (IS_DEV) {
      console.log(`%c[GA4 Event] ${eventName}`, 'color: #B8860B; font-weight: bold;', params);
    }

    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
      window.gtag('event', eventName, params);
    } else if (IS_DEV) {
      console.warn('[GA4] window.gtag is not defined. (Ad-blocker or script not loaded)');
    }
  } catch (error) {
    if (IS_DEV) {
      console.error(`[GA4 Error] Failed to send event ${eventName}:`, error);
    }
  }
}

/**
 * Safely sets user properties or configurations.
 */
export function setGA4Config(key: string, value: any): void {
  try {
    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
      window.gtag('set', key, value);
    }
  } catch (error) {
    if (IS_DEV) {
      console.error(`[GA4 Error] Failed to set config ${key}:`, error);
    }
  }
}
