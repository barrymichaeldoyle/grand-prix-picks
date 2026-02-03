import { useState, useEffect, useRef } from 'react';
import {
  HeadContent,
  Scripts,
  createRootRouteWithContext,
} from '@tanstack/react-router';
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools';
import { TanStackDevtools } from '@tanstack/react-devtools';

import Header from '../components/Header';
import ScrollToTop from '../components/ScrollToTop';

import ClerkProvider from '../integrations/clerk/provider';

import ConvexProvider from '../integrations/convex/provider';

import TanStackQueryDevtools from '../integrations/tanstack-query/devtools';

import appCss from '../styles.css?url';

import type { QueryClient } from '@tanstack/react-query';

interface MyRouterContext {
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'Grand Prix Picks',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
    ],
  }),

  shellComponent: RootDocument,
});

const THEME_KEY = 'grand-prix-picks-theme';

function RootDocument({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const mainRef = useRef<HTMLDivElement>(null);

  // Apply saved theme (light/dark) on mount
  useEffect(() => {
    const saved = localStorage.getItem(THEME_KEY);
    const isDark = saved === 'dark';
    document.documentElement.classList.toggle('dark', isDark);
    document.documentElement.setAttribute(
      'data-theme',
      isDark ? 'dark' : 'light',
    );
  }, []);

  // Inert main content when mobile menu is open so focus stays in header + menu
  useEffect(() => {
    const el = mainRef.current;
    if (!el) return;
    const mq = window.matchMedia('(max-width: 640px)');
    const applyInert = () => {
      if (mobileMenuOpen && mq.matches) {
        el.setAttribute('inert', '');
      } else {
        el.removeAttribute('inert');
      }
    };
    applyInert();
    mq.addEventListener('change', applyInert);
    return () => mq.removeEventListener('change', applyInert);
  }, [mobileMenuOpen]);

  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <ClerkProvider>
          <ConvexProvider>
            <Header
              mobileMenuOpen={mobileMenuOpen}
              onMobileMenuOpenChange={setMobileMenuOpen}
              themeKey={THEME_KEY}
            />
            <div ref={mainRef}>
              <ScrollToTop />
              {children}
              <TanStackDevtools
                config={{
                  position: 'bottom-right',
                }}
                plugins={[
                  {
                    name: 'Tanstack Router',
                    render: <TanStackRouterDevtoolsPanel />,
                  },
                  TanStackQueryDevtools,
                ]}
              />
            </div>
          </ConvexProvider>
        </ClerkProvider>
        <Scripts />
      </body>
    </html>
  );
}
