import { mutation, query } from './_generated/server';
import { getOrCreateViewer, getViewer, isAdmin } from './lib/auth';

export const me = query({
  args: {},
  handler: async (ctx) => {
    const viewer = await getViewer(ctx);
    if (!viewer) return null;

    return {
      _id: viewer._id,
      username: viewer.username,
      displayName: viewer.displayName,
      email: viewer.email,
      isAdmin: viewer.isAdmin ?? false,
    };
  },
});

/** Sync the current user's profile from Clerk identity claims. */
export const syncProfile = mutation({
  args: {},
  handler: async (ctx) => {
    await getOrCreateViewer(ctx);
  },
});

export const amIAdmin = query({
  args: {},
  handler: async (ctx) => {
    const viewer = await getViewer(ctx);
    return isAdmin(viewer);
  },
});
