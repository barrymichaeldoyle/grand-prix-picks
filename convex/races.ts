import { mutation, query } from './_generated/server';
import { v } from 'convex/values';
import { getOrCreateViewer, requireAdmin, requireViewer } from './lib/auth';

export const listRaces = query({
  args: { season: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const races = await ctx.db.query('races').collect();
    const filtered =
      args.season === undefined
        ? races
        : races.filter((r) => r.season === args.season);

    return filtered.sort((a, b) => a.round - b.round);
  },
});

export const getNextRace = query({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const races = await ctx.db.query('races').collect();
    const upcoming = races
      .filter((r) => r.raceStartAt > now)
      .sort((a, b) => a.raceStartAt - b.raceStartAt);

    return upcoming[0] ?? null;
  },
});

export const getRace = query({
  args: { raceId: v.id('races') },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.raceId);
  },
});

export const adminUpsertRace = mutation({
  args: {
    raceId: v.optional(v.id('races')),
    season: v.number(),
    round: v.number(),
    name: v.string(),
    slug: v.string(),
    raceStartAt: v.number(),
    predictionLockAt: v.number(),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    const viewer = requireViewer(await getOrCreateViewer(ctx));
    requireAdmin(viewer);

    const now = Date.now();

    if (args.raceId) {
      await ctx.db.patch(args.raceId, {
        season: args.season,
        round: args.round,
        name: args.name,
        slug: args.slug,
        raceStartAt: args.raceStartAt,
        predictionLockAt: args.predictionLockAt,
        status: args.status,
        updatedAt: now,
      });
      return args.raceId;
    }

    return await ctx.db.insert('races', {
      season: args.season,
      round: args.round,
      name: args.name,
      slug: args.slug,
      raceStartAt: args.raceStartAt,
      predictionLockAt: args.predictionLockAt,
      status: args.status,
      createdAt: now,
      updatedAt: now,
    });
  },
});
