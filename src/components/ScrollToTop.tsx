import { useLocation } from '@tanstack/react-router';
import { useEffect } from 'react';

/**
 * Scrolls the window to the top when the route location changes.
 * Renders nothing.
 */
export default function ScrollToTop() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return null;
}
