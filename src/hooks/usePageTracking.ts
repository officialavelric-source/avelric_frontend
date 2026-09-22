import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { analyticsService } from '../services/analytics';

/**
 * Hook to automatically track virtual pageviews on React Router route transitions.
 * Guarantees zero duplicate tracking and excludes sensitive OAuth callback routes.
 */
export function usePageTracking(): void {
  const location = useLocation();
  const lastTrackedPath = useRef<string>('');

  useEffect(() => {
    // Exclude Shopify Customer Account OAuth callback to prevent logging auth codes/state
    if (location.pathname.startsWith('/account/callback')) {
      return;
    }

    const currentFullPath = location.pathname + location.search;

    // Prevent immediate duplicate fires on re-renders
    if (lastTrackedPath.current === currentFullPath) {
      return;
    }

    lastTrackedPath.current = currentFullPath;

    // Delay slightly to ensure document.title is updated if dynamic
    const timer = setTimeout(() => {
      analyticsService.trackPageView({
        page_title: document.title || 'AVELRIC',
        page_location: window.location.href,
        page_path: location.pathname,
      });
    }, 50);

    return () => clearTimeout(timer);
  }, [location.pathname, location.search]);
}

export default usePageTracking;
