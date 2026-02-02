import { query } from './_generated/server';
import { getViewer, isAdmin } from './lib/auth';

export const me = query({
  args: {},
  handler: async (ctx) => {
    const viewer = await getViewer(ctx);
    if (!viewer) return null;

    return {
      _id: viewer._id,
      displayName: viewer.displayName,
      email: viewer.email,
      isAdmin: viewer.isAdmin ?? false,
    };
  },
});

export const amIAdmin = query({
  args: {},
  handler: async (ctx) => {
    const viewer = await getViewer(ctx);
    return isAdmin(viewer);
  },
});
