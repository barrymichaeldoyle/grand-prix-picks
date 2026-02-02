import type { Doc, Id } from './_generated/dataModel';
import { mutation, query } from './_generated/server';
import { v } from 'convex/values';
import {
  getOrCreateViewer,
  getViewer,
  requireAdmin,
  requireViewer,
} from './lib/auth';

type ScoreBreakdownItem = NonNullable<Doc<'scores'>['breakdown']>[number];
import { scoreTopFive } from './lib/scoring';

export const getMyScoreForRace = query({
  args: { raceId: v.id('races') },
  handler: async (ctx, args) => {
    const viewer = await getViewer(ctx);
    if (!viewer) return null;

    const score = await ctx.db
      .query('scores')
      .withIndex('by_user_race', (q) =>
        q.eq('userId', viewer._id).eq('raceId', args.raceId),
      )
      .unique();

    if (!score) return null;

    // Enrich breakdown with driver names
    const enrichedBreakdown = score.breakdown
      ? await Promise.all(
          score.breakdown.map(async (item: ScoreBreakdownItem) => {
            const driver = await ctx.db.get(item.driverId);
            return {
              ...item,
              code: driver?.code ?? '???',
              displayName: driver?.displayName ?? 'Unknown',
            };
          }),
        )
      : null;

    return {
      ...score,
      enrichedBreakdown,
    };
  },
});

export const getResultForRace = query({
  args: { raceId: v.id('races') },
  handler: async (ctx, args) => {
    const result = await ctx.db
      .query('results')
      .withIndex('by_race', (q) => q.eq('raceId', args.raceId))
      .unique();

    if (!result) return null;

    // Enrich classification with driver names
    const enrichedClassification = await Promise.all(
      result.classification.map(
        async (driverId: Id<'drivers'>, index: number) => {
          const driver = await ctx.db.get(driverId);
          return {
            position: index + 1,
            driverId,
            code: driver?.code ?? '???',
            displayName: driver?.displayName ?? 'Unknown',
          };
        },
      ),
    );

    return {
      ...result,
      enrichedClassification,
    };
  },
});

export const adminPublishResults = mutation({
  args: {
    raceId: v.id('races'),
    classification: v.array(v.id('drivers')),
  },
  handler: async (ctx, args) => {
    const viewer = requireViewer(await getOrCreateViewer(ctx));
    requireAdmin(viewer);

    if (args.classification.length < 5) {
      throw new Error('Classification must include at least top 5');
    }

    const now = Date.now();

    const existing = await ctx.db
      .query('results')
      .withIndex('by_race', (q) => q.eq('raceId', args.raceId))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        classification: args.classification,
        updatedAt: now,
      });
    } else {
      await ctx.db.insert('results', {
        raceId: args.raceId,
        classification: args.classification,
        publishedAt: now,
        updatedAt: now,
      });
    }

    // Compute scores for everyone who predicted this race
    const predictions = await ctx.db
      .query('predictions')
      .withIndex('by_race', (q) => q.eq('raceId', args.raceId))
      .collect();

    for (const pred of predictions) {
      const { total, breakdown } = scoreTopFive({
        picks: pred.picks,
        classification: args.classification,
      });

      const existingScore = await ctx.db
        .query('scores')
        .withIndex('by_user_race', (q) =>
          q.eq('userId', pred.userId).eq('raceId', pred.raceId),
        )
        .unique();

      if (existingScore) {
        await ctx.db.patch(existingScore._id, {
          points: total,
          breakdown,
          updatedAt: now,
        });
      } else {
        await ctx.db.insert('scores', {
          userId: pred.userId,
          raceId: pred.raceId,
          points: total,
          breakdown,
          createdAt: now,
          updatedAt: now,
        });
      }
    }

    // Optional: mark race finished
    const race = await ctx.db.get(args.raceId);
    if (race && race.status !== 'finished') {
      await ctx.db.patch(args.raceId, { status: 'finished', updatedAt: now });
    }

    return { ok: true, scoredCount: predictions.length };
  },
});
