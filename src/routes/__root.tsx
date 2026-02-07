import { useAuth } from '@clerk/clerk-react';
import { TanStackDevtools } from '@tanstack/react-devtools';
import type { QueryClient } from '@tanstack/react-query';
import {
  createRootRouteWithContext,
  HeadContent,
  Link,
  Scripts,
} from '@tanstack/react-router';
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools';
import { useMutation } from 'convex/react';
import { Flag, Home, Trophy } from 'lucide-react';
import type { PropsWithChildren } from 'react';
import { useEffect, useRef, useState } from 'react';

import { api } from '../../convex/_generated/api';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { Footer } from '../components/Footer';
import { Header, MEDIA_MATCH_BREAKPOINT } from '../components/Header';
import { ScrollToTop } from '../components/ScrollToTop';
import { AppClerkProvider } from '../integrations/clerk/provider';
import { AppConvexProvider } from '../integrations/convex/provider';
import TanStackQueryDevtools from '../integrations/tanstack-query/devtools';
import appCss from '../styles.css?url';

interface MyRouterContext {
  queryClient: QueryClient;
}

const siteConfig = {
  title: 'Grand Prix Picks',
  description:
    'Predict the top 5 finishers for each Formula 1 race and compete with friends throughout the 2026 season.',
  url: 'https://grandprixpicks.com', // Update with your actual domain
  themeColor: '#0d9488',
  author: {
    name: 'Barry Michael Doyle',
    url: 'https://barrymichaeldoyle.com',
    twitter: '@barrymdoyle',
  },
};

// Structured data for SEO (JSON-LD)
const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: siteConfig.title,
  description: siteConfig.description,
  url: siteConfig.url,
  applicationCategory: 'GameApplication',
  operatingSystem: 'Any',
  author: {
    '@type': 'Person',
    name: siteConfig.author.name,
    url: siteConfig.author.url,
  },
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
  },
};

export const Route = createRootRouteWithContext<MyRouterContext>()({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1, viewport-fit=cover',
      },
      { title: siteConfig.title },
      { name: 'description', content: siteConfig.description },
      { name: 'theme-color', content: siteConfig.themeColor },

      // Open Graph (Facebook, LinkedIn, etc.)
      { property: 'og:type', content: 'website' },
      { property: 'og:title', content: siteConfig.title },
      { property: 'og:description', content: siteConfig.description },
      { property: 'og:url', content: siteConfig.url },
      { property: 'og:image', content: `${siteConfig.url}/og-image.png` },
      { property: 'og:site_name', content: siteConfig.title },

      // Twitter Card
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: siteConfig.title },
      { name: 'twitter:description', content: siteConfig.description },
      { name: 'twitter:image', content: `${siteConfig.url}/og-image.png` },
      { name: 'twitter:creator', content: '@barrymdoyle' },
    ],
    links: [
      { rel: 'stylesheet', href: appCss },
      { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
      { rel: 'apple-touch-icon', href: '/favicon.svg' },
      { rel: 'manifest', href: '/manifest.json' },
      { rel: 'canonical', href: siteConfig.url },
    ],
    scripts: [
      {
        type: 'application/ld+json',
        children: JSON.stringify(structuredData),
      },
    ],
  }),

  notFoundComponent: NotFoundPage,
  shellComponent: RootDocument,
});

function NotFoundPage() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-warning-muted">
          <Flag className="h-8 w-8 text-warning" />
        </div>

        <h1 className="mb-2 text-2xl font-bold text-text">Page not found</h1>

        <p className="mb-8 text-text-muted">
          Looks like you've taken a wrong turn. This page doesn't exist or has
          been moved.
        </p>

        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-lg bg-button-accent px-6 py-2.5 font-semibold text-white transition-colors hover:bg-button-accent-hover"
          >
            <Home className="h-4 w-4" />
            Go home
          </Link>
          <Link
            to="/leaderboard"
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-6 py-2.5 font-semibold text-text transition-colors hover:bg-surface-muted"
          >
            <Trophy className="h-4 w-4" />
            Leaderboard
          </Link>
        </div>
      </div>
    </div>
  );
}

/** Syncs the user's Clerk profile to Convex once per app load. */
function ProfileSync() {
  const { isSignedIn } = useAuth();
  const syncProfile = useMutation(api.users.syncProfile);
  const hasSynced = useRef(false);

  useEffect(() => {
    if (isSignedIn && !hasSynced.current) {
      hasSynced.current = true;
      void syncProfile();
    }
  }, [isSignedIn, syncProfile]);

  return null;
}

const THEME_KEY = 'grand-prix-picks-theme';

function RootDocument({ children }: PropsWithChildren) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const mainRef = useRef<HTMLDivElement>(null);
  // Theme: SSR/first paint match (no localStorage), then synced on mount.
  const [isDark, setIsDark] = useState(false);

  // Sync theme from storage/system on mount and when system preference changes
  useEffect(() => {
    const resolveTheme = () => {
      const saved = localStorage.getItem(THEME_KEY);
      return saved === 'dark'
        ? true
        : saved === 'light'
          ? false
          : window.matchMedia('(prefers-color-scheme: dark)').matches;
    };
    const sync = () => setIsDark(resolveTheme());
    sync();
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  // Apply theme to document whenever isDark changes
  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
    document.documentElement.setAttribute(
      'data-theme',
      isDark ? 'dark' : 'light',
    );
  }, [isDark]);

  const setTheme = (dark: boolean) => {
    localStorage.setItem(THEME_KEY, dark ? 'dark' : 'light');
    setIsDark(dark);
  };

  // Inert main content when mobile menu is open so focus stays in header + menu
  useEffect(() => {
    const el = mainRef.current;
    if (!el) return;
    const mq = window.matchMedia(MEDIA_MATCH_BREAKPOINT);
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
        <AppClerkProvider darkMode={isDark}>
          <AppConvexProvider>
            <ProfileSync />
            <div className="flex h-[100dvh] h-screen flex-col overflow-hidden">
              <Header
                mobileMenuOpen={mobileMenuOpen}
                onMobileMenuOpenChange={setMobileMenuOpen}
                themeKey={THEME_KEY}
                isDark={isDark}
                onThemeChange={setTheme}
              />
              <div
                ref={mainRef}
                className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto"
              >
                <ScrollToTop scrollContainerRef={mainRef} />
                <div className="flex min-h-full flex-col">
                  <main className="min-h-0 flex-1">
                    <ErrorBoundary>{children}</ErrorBoundary>
                  </main>
                  <Footer />
                </div>
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
            </div>
          </AppConvexProvider>
        </AppClerkProvider>
        <Scripts />
      </body>
    </html>
  );
}
