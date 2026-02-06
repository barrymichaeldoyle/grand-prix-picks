import { v } from 'convex/values';

import type { Id } from './_generated/dataModel';
import { query } from './_generated/server';
import { getViewer } from './lib/auth';

export const getSeasonLeaderboard = query({
  args: {
    season: v.optional(v.number()),
    limit: v.optional(v.number()), // Max entries to return (default: 50)
    offset: v.optional(v.number()), // Offset for pagination (default: 0)
  },
  handler: async (ctx, args) => {
    const viewer = await getViewer(ctx);
    const MAX_LIMIT = 100;
    const limit = Math.min(MAX_LIMIT, Math.max(1, args.limit ?? 50));
    const offset = Math.max(0, args.offset ?? 0);

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

    // Find viewer's entry (before pagination)
    let viewerEntry: {
      rank: number;
      userId: Id<'users'>;
      username: string;
      points: number;
      raceCount: number;
      isViewer: boolean;
    } | null = null;

    if (viewer) {
      const viewerIndex = rows.findIndex((r) => r.userId === viewer._id);
      if (viewerIndex !== -1) {
        const viewerRow = rows[viewerIndex];
        viewerEntry = {
          rank: viewerIndex + 1,
          userId: viewer._id,
          username: viewer.username ?? 'Anonymous',
          points: viewerRow.points,
          raceCount: viewerRow.raceCount,
          isViewer: true,
        };
      }
    }

    // Paginate results
    const paginatedRows = rows.slice(offset, offset + limit);
    const hasMore = offset + limit < rows.length;

    // Fetch usernames only (no emails or real names for privacy)
    const enrichedRows = await Promise.all(
      paginatedRows.map(async (row, index) => {
        const user = await ctx.db.get(row.userId);
        const isViewer = viewer ? row.userId === viewer._id : false;
        return {
          rank: offset + index + 1,
          userId: row.userId,
          username: user?.username ?? 'Anonymous',
          points: row.points,
          raceCount: row.raceCount,
          isViewer,
        };
      }),
    );

    return {
      entries: enrichedRows,
      totalCount: rows.length,
      hasMore,
      viewerEntry, // Always include viewer's entry for the header
    };
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

      // Check if user has any prediction for this race
      const submitted = await ctx.db
        .query('predictions')
        .withIndex('by_user_race_session', (q) =>
          q.eq('userId', viewer._id).eq('raceId', args.raceId),
        )
        .first();

      if (!submitted) {
        return { status: 'locked', reason: 'no_prediction', entries: [] };
      }
    }

    const scores = await ctx.db
      .query('scores')
      .withIndex('by_race_session', (q) => q.eq('raceId', args.raceId))
      .collect();

    const sortedScores = scores.sort((a, b) => b.points - a.points);

    // Fetch usernames only (no emails or real names for privacy)
    const entries = await Promise.all(
      sortedScores.map(async (s, index) => {
        const user = await ctx.db.get(s.userId);
        return {
          rank: index + 1,
          userId: s.userId,
          username: user?.username ?? 'Anonymous',
          points: s.points,
          breakdown: s.breakdown,
        };
      }),
    );

    return { status: 'visible', reason: null, entries };
  },
});
