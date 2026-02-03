import { clerkMiddleware } from '@clerk/tanstack-react-start/server';
import { createStart } from '@tanstack/react-start';

// On Cloudflare Pages, clerkMiddleware() verifies sessions via an outbound HTTP
// call to Clerk's API by default. If that fails (missing env, timeout, etc.),
// it throws an unhandled HTTPError → 500. Passing jwtKey enables networkless
// JWT verification so no request is made. Set CLERK_JWT_KEY in your
// Cloudflare Pages env (Dashboard → project → Settings → Environment variables).
// Get the value from Clerk Dashboard → API Keys → JWT public key (JWKS).
const clerkJwtKey =
  typeof process !== 'undefined' ? process.env.CLERK_JWT_KEY : undefined;

export const startInstance = createStart(() => {
  return {
    requestMiddleware: [
      clerkMiddleware(clerkJwtKey ? { jwtKey: clerkJwtKey } : {}),
    ],
  };
});
