import { query } from './_generated/server';
import { v } from 'convex/values';
import { getViewer } from './lib/auth';
import type { Id } from './_generated/dataModel';

export const getSeasonLeaderboard = query({
  args: { season: v.optional(v.number()) },
  handler: async (ctx) => {
    const scores = await ctx.db.query('scores').collect();

    const byUser = new Map<
      string,
      { userId: Id<'users'>; points: number; raceCount: number }
    >();

    for (const s of scores) {
      const key = s.userId;
      const existing = byUser.get(key) ?? {
        userId: key,
        points: 0,
        raceCount: 0,
      };
      existing.points += s.points;
      existing.raceCount += 1;
      byUser.set(key, existing);
    }

    const rows = Array.from(byUser.values()).sort(
      (a, b) => b.points - a.points,
    );

    // Fetch user display names
    const enrichedRows = await Promise.all(
      rows.map(async (row, index) => {
        const user = await ctx.db.get(row.userId);
        return {
          rank: index + 1,
          userId: row.userId,
          displayName: user?.displayName ?? user?.email ?? 'Anonymous',
          points: row.points,
          raceCount: row.raceCount,
        };
      }),
    );

    return enrichedRows;
  },
});

export const getRaceLeaderboard = query({
  args: { raceId: v.id('races') },
  handler: async (ctx, args) => {
    const viewer = await getViewer(ctx);
    const race = await ctx.db.get(args.raceId);
    if (!race) throw new Error('Race not found');

    // Blind rule:
    // If race isn't finished yet, only allow per-race leaderboard
    // if the viewer has already submitted a prediction for this race.
    if (race.status !== 'finished') {
      if (!viewer) {
        return { status: 'locked', reason: 'sign_in', entries: [] };
      }

      const submitted = await ctx.db
        .query('predictions')
        .withIndex('by_user_race', (q) =>
          q.eq('userId', viewer._id).eq('raceId', args.raceId),
        )
        .unique();

      if (!submitted) {
        return { status: 'locked', reason: 'no_prediction', entries: [] };
      }
    }

    const scores = await ctx.db
      .query('scores')
      .withIndex('by_race', (q) => q.eq('raceId', args.raceId))
      .collect();

    const sortedScores = scores.sort((a, b) => b.points - a.points);

    // Fetch user display names
    const entries = await Promise.all(
      sortedScores.map(async (s, index) => {
        const user = await ctx.db.get(s.userId);
        return {
          rank: index + 1,
          userId: s.userId,
          displayName: user?.displayName ?? user?.email ?? 'Anonymous',
          points: s.points,
          breakdown: s.breakdown,
        };
      }),
    );

    return { status: 'visible', reason: null, entries };
  },
});
