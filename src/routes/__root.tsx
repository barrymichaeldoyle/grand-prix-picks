import { useState, useEffect, useRef } from 'react';
import {
  HeadContent,
  Scripts,
  createRootRouteWithContext,
} from '@tanstack/react-router';
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools';
import { TanStackDevtools } from '@tanstack/react-devtools';

import Footer from '../components/Footer';
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
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
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
      { rel: 'apple-touch-icon', href: '/logo192.png' },
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
            <div className="min-h-screen flex flex-col">
              <Header
                mobileMenuOpen={mobileMenuOpen}
                onMobileMenuOpenChange={setMobileMenuOpen}
                themeKey={THEME_KEY}
              />
              <div ref={mainRef} className="flex-1">
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
              <Footer />
            </div>
          </ConvexProvider>
        </ClerkProvider>
        <Scripts />
      </body>
    </html>
  );
}
