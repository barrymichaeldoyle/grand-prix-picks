import { defineNitroConfig } from 'nitropack/config';

export default defineNitroConfig({
  // Use Cloudflare Pages preset for deployment
  // Comment this out for local development (uses node-server by default)
  preset: process.env.CF_PAGES ? 'cloudflare-pages' : 'node-server',

  // Cloudflare Pages specific settings
  cloudflare: {
    pages: {
      routes: {
        exclude: ['/favicon.svg', '/favicon.ico', '/robots.txt', '/sitemap.xml', '/manifest.json', '/*.png'],
      },
    },
  },
});
