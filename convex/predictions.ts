import type { Id } from './_generated/dataModel';
import { mutation, query } from './_generated/server';
import { v } from 'convex/values';
import { getOrCreateViewer, getViewer, requireViewer } from './lib/auth';

export const myPredictionHistory = query({
  args: {},
  handler: async (ctx) => {
    const viewer = await getViewer(ctx);
    if (!viewer) return [];

    const predictions = await ctx.db
      .query('predictions')
      .withIndex('by_user', (q) => q.eq('userId', viewer._id))
      .collect();

    // Enrich with race info and scores
    const enriched = await Promise.all(
      predictions.map(async (pred) => {
        const race = await ctx.db.get(pred.raceId);
        const score = await ctx.db
          .query('scores')
          .withIndex('by_user_race', (q) =>
            q.eq('userId', viewer._id).eq('raceId', pred.raceId),
          )
          .unique();

        // Get driver names for picks
        const pickDetails = await Promise.all(
          pred.picks.map(async (driverId: Id<'drivers'>) => {
            const driver = await ctx.db.get(driverId);
            return {
              driverId,
              code: driver?.code ?? '???',
              displayName: driver?.displayName ?? 'Unknown',
            };
          }),
        );

        return {
          _id: pred._id,
          raceId: pred.raceId,
          raceName: race?.name ?? 'Unknown Race',
          raceRound: race?.round ?? 0,
          raceStatus: race?.status ?? 'unknown',
          raceDate: race?.raceStartAt ?? 0,
          picks: pickDetails,
          points: score?.points ?? null,
          submittedAt: pred.submittedAt,
        };
      }),
    );

    // Sort by race date descending
    return enriched.sort((a, b) => b.raceDate - a.raceDate);
  },
});

function assertFiveUnique(ids: string[]) {
  if (ids.length !== 5) throw new Error('Pick exactly 5 drivers');
  const set = new Set(ids);
  if (set.size !== 5) throw new Error('Picks must be unique (no duplicates)');
}

export const myPredictionForRace = query({
  args: { raceId: v.id('races') },
  handler: async (ctx, args) => {
    // Don't throw if user doesn't exist yet - they may be newly signed in
    // and won't have a Convex user record until their first mutation
    const viewer = await getViewer(ctx);
    if (!viewer) return null;

    return await ctx.db
      .query('predictions')
      .withIndex('by_user_race', (q) =>
        q.eq('userId', viewer._id).eq('raceId', args.raceId),
      )
      .unique();
  },
});

export const submitPrediction = mutation({
  args: {
    raceId: v.id('races'),
    picks: v.array(v.id('drivers')),
  },
  handler: async (ctx, args) => {
    const viewer = requireViewer(await getOrCreateViewer(ctx));
    const race = await ctx.db.get(args.raceId);

    if (!race) throw new Error('Race not found');

    const now = Date.now();
    if (now >= race.predictionLockAt) {
      throw new Error('Predictions are locked for this race');
    }

    assertFiveUnique(args.picks.map((id) => id));

    const existing = await ctx.db
      .query('predictions')
      .withIndex('by_user_race', (q) =>
        q.eq('userId', viewer._id).eq('raceId', args.raceId),
      )
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        picks: args.picks,
        updatedAt: now,
      });
      return existing._id;
    }

    return await ctx.db.insert('predictions', {
      userId: viewer._id,
      raceId: args.raceId,
      picks: args.picks,
      submittedAt: now,
      updatedAt: now,
    });
  },
});
