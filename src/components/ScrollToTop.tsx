import { useLocation } from '@tanstack/react-router';
import { useEffect } from 'react';

/**
 * Scrolls the main content area to the top when the route location changes.
 * Uses the given scroll container ref so the scrollbar stays below the sticky header.
 * Renders nothing.
 */
export default function ScrollToTop({
  scrollContainerRef,
}: {
  scrollContainerRef: React.RefObject<HTMLElement | null>;
}) {
  const location = useLocation();

  useEffect(() => {
    scrollContainerRef.current?.scrollTo(0, 0);
  }, [location.pathname, scrollContainerRef]);

  return null;
}
