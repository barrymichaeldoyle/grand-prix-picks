import { v } from 'convex/values';

import type { Id } from './_generated/dataModel';
import { mutation, query } from './_generated/server';
import { getOrCreateViewer, getViewer, requireViewer } from './lib/auth';

const sessionTypeValidator = v.union(
  v.literal('quali'),
  v.literal('sprint_quali'),
  v.literal('sprint'),
  v.literal('race'),
);

type SessionType = 'quali' | 'sprint_quali' | 'sprint' | 'race';

// ───────────────────────── Queries ─────────────────────────

export const getMatchupsForSeason = query({
  args: { season: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const season = args.season ?? 2026;

    const matchups = await ctx.db
      .query('h2hMatchups')
      .withIndex('by_season', (q) => q.eq('season', season))
      .collect();

    const enriched = await Promise.all(
      matchups.map(async (m) => {
        const driver1 = await ctx.db.get(m.driver1Id);
        const driver2 = await ctx.db.get(m.driver2Id);
        return {
          _id: m._id,
          team: m.team,
          driver1: {
            _id: m.driver1Id,
            code: driver1?.code ?? '???',
            displayName: driver1?.displayName ?? 'Unknown',
            number: driver1?.number ?? null,
            team: driver1?.team ?? null,
            nationality: driver1?.nationality ?? null,
          },
          driver2: {
            _id: m.driver2Id,
            code: driver2?.code ?? '???',
            displayName: driver2?.displayName ?? 'Unknown',
            number: driver2?.number ?? null,
            team: driver2?.team ?? null,
            nationality: driver2?.nationality ?? null,
          },
        };
      }),
    );

    return enriched;
  },
});

export const myH2HPredictionsForRace = query({
  args: { raceId: v.id('races') },
  handler: async (ctx, args) => {
    const viewer = await getViewer(ctx);
    if (!viewer) return null;

    const predictions = await ctx.db
      .query('h2hPredictions')
      .withIndex('by_user_race_session', (q) =>
        q.eq('userId', viewer._id).eq('raceId', args.raceId),
      )
      .collect();

    // Group by sessionType → { [matchupId]: predictedWinnerId }
    const bySession: Record<SessionType, Record<string, Id<'drivers'>> | null> =
      {
        quali: null,
        sprint_quali: null,
        sprint: null,
        race: null,
      };

    for (const pred of predictions) {
      if (!bySession[pred.sessionType]) {
        bySession[pred.sessionType] = {};
      }
      bySession[pred.sessionType]![pred.matchupId] = pred.predictedWinnerId;
    }

    return bySession;
  },
});

export const getH2HResultsForRace = query({
  args: {
    raceId: v.id('races'),
    sessionType: v.optional(sessionTypeValidator),
  },
  handler: async (ctx, args) => {
    const sessionType = args.sessionType ?? 'race';

    const results = await ctx.db
      .query('h2hResults')
      .withIndex('by_race_session', (q) =>
        q.eq('raceId', args.raceId).eq('sessionType', sessionType),
      )
      .collect();

    if (results.length === 0) return null;

    const enriched = await Promise.all(
      results.map(async (r) => {
        const matchup = await ctx.db.get(r.matchupId);
        const winner = await ctx.db.get(r.winnerId);
        const driver1 = matchup ? await ctx.db.get(matchup.driver1Id) : null;
        const driver2 = matchup ? await ctx.db.get(matchup.driver2Id) : null;

        const enrichDriver = (d: typeof driver1) =>
          d
            ? {
                _id: d._id,
                code: d.code,
                displayName: d.displayName,
                number: d.number ?? null,
                team: d.team ?? null,
                nationality: d.nationality ?? null,
              }
            : null;

        return {
          matchupId: r.matchupId,
          team: matchup?.team ?? 'Unknown',
          winnerId: r.winnerId,
          winnerCode: winner?.code ?? '???',
          driver1: enrichDriver(driver1),
          driver2: enrichDriver(driver2),
        };
      }),
    );

    return enriched;
  },
});

export const getMyH2HScoreForRace = query({
  args: {
    raceId: v.id('races'),
    sessionType: v.optional(sessionTypeValidator),
  },
  handler: async (ctx, args) => {
    const viewer = await getViewer(ctx);
    if (!viewer) return null;

    const sessionType = args.sessionType ?? 'race';

    return await ctx.db
      .query('h2hScores')
      .withIndex('by_user_race_session', (q) =>
        q
          .eq('userId', viewer._id)
          .eq('raceId', args.raceId)
          .eq('sessionType', sessionType),
      )
      .unique();
  },
});

export const getH2HSeasonLeaderboard = query({
  args: {
    season: v.optional(v.number()),
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const viewer = await getViewer(ctx);
    const limit = args.limit ?? 50;
    const offset = args.offset ?? 0;

    const scores = await ctx.db.query('h2hScores').collect();

    const byUser = new Map<
      string,
      {
        userId: Id<'users'>;
        points: number;
        raceCount: number;
        correctPicks: number;
        totalPicks: number;
      }
    >();

    for (const s of scores) {
      const key = s.userId;
      const existing = byUser.get(key) ?? {
        userId: key,
        points: 0,
        raceCount: 0,
        correctPicks: 0,
        totalPicks: 0,
      };
      existing.points += s.points;
      existing.raceCount += 1;
      existing.correctPicks += s.correctPicks;
      existing.totalPicks += s.totalPicks;
      byUser.set(key, existing);
    }

    const rows = Array.from(byUser.values()).sort(
      (a, b) => b.points - a.points,
    );

    let viewerEntry: {
      rank: number;
      userId: Id<'users'>;
      username: string;
      points: number;
      raceCount: number;
      correctPicks: number;
      totalPicks: number;
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
          correctPicks: viewerRow.correctPicks,
          totalPicks: viewerRow.totalPicks,
          isViewer: true,
        };
      }
    }

    const paginatedRows = rows.slice(offset, offset + limit);
    const hasMore = offset + limit < rows.length;

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
          correctPicks: row.correctPicks,
          totalPicks: row.totalPicks,
          isViewer,
        };
      }),
    );

    return {
      entries: enrichedRows,
      totalCount: rows.length,
      hasMore,
      viewerEntry,
    };
  },
});

export const myH2HPredictionHistory = query({
  args: {},
  handler: async (ctx) => {
    const viewer = await getViewer(ctx);
    if (!viewer) return [];

    const h2hScores = await ctx.db
      .query('h2hScores')
      .withIndex('by_user', (q) => q.eq('userId', viewer._id))
      .collect();

    // Group by raceId
    const byRace = new Map<Id<'races'>, Array<(typeof h2hScores)[number]>>();
    for (const score of h2hScores) {
      const existing = byRace.get(score.raceId) ?? [];
      existing.push(score);
      byRace.set(score.raceId, existing);
    }

    const weekends = await Promise.all(
      Array.from(byRace.entries()).map(async ([raceId, scores]) => {
        const race = await ctx.db.get(raceId);
        if (!race) return null;

        const sessions: Record<
          SessionType,
          { correctPicks: number; totalPicks: number; points: number } | null
        > = {
          quali: null,
          sprint_quali: null,
          sprint: null,
          race: null,
        };

        let totalPoints = 0;
        for (const score of scores) {
          sessions[score.sessionType] = {
            correctPicks: score.correctPicks,
            totalPicks: score.totalPicks,
            points: score.points,
          };
          totalPoints += score.points;
        }

        return {
          raceId,
          raceName: race.name,
          raceRound: race.round,
          raceDate: race.raceStartAt,
          hasSprint: race.hasSprint ?? false,
          sessions,
          totalPoints,
        };
      }),
    );

    return weekends
      .filter((w): w is NonNullable<typeof w> => w !== null)
      .sort((a, b) => b.raceDate - a.raceDate);
  },
});

/** Returns which races have H2H picks (for showing on My Predictions before results). */
export const myH2HPicksByRace = query({
  args: {},
  handler: async (ctx) => {
    const viewer = await getViewer(ctx);
    if (!viewer) return [];

    const predictions = await ctx.db
      .query('h2hPredictions')
      .withIndex('by_user_race_session', (q) => q.eq('userId', viewer._id))
      .collect();

    const byRace = new Map<
      Id<'races'>,
      Record<SessionType, boolean>
    >();
    const sessionTypes: SessionType[] = [
      'quali',
      'sprint_quali',
      'sprint',
      'race',
    ];
    for (const pred of predictions) {
      let sessions = byRace.get(pred.raceId);
      if (!sessions) {
        sessions = {
          quali: false,
          sprint_quali: false,
          sprint: false,
          race: false,
        };
        byRace.set(pred.raceId, sessions);
      }
      sessions[pred.sessionType] = true;
    }

    return Array.from(byRace.entries()).map(([raceId, sessions]) => ({
      raceId,
      sessions,
    }));
  },
});

// ───────────────────────── Mutations ─────────────────────────

export const submitH2HPredictions = mutation({
  args: {
    raceId: v.id('races'),
    picks: v.array(
      v.object({
        matchupId: v.id('h2hMatchups'),
        predictedWinnerId: v.id('drivers'),
      }),
    ),
    sessionType: v.optional(sessionTypeValidator),
  },
  handler: async (ctx, args) => {
    const viewer = requireViewer(await getOrCreateViewer(ctx));
    const race = await ctx.db.get(args.raceId);

    if (!race) throw new Error('Race not found');

    const now = Date.now();

    // Only allow predictions for the next upcoming race
    const allRaces = await ctx.db.query('races').collect();
    const upcomingRaces = allRaces
      .filter((r) => r.raceStartAt > now)
      .sort((a, b) => a.raceStartAt - b.raceStartAt);
    const nextRace = upcomingRaces[0];

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- runtime validation
    if (!nextRace || nextRace._id !== args.raceId) {
      throw new Error(
        'H2H predictions are only open for the next upcoming race',
      );
    }

    // Gate: user must have main predictions submitted first
    const mainPrediction = await ctx.db
      .query('predictions')
      .withIndex('by_user_race_session', (q) =>
        q.eq('userId', viewer._id).eq('raceId', args.raceId),
      )
      .first();
    if (!mainPrediction) {
      throw new Error('Submit your top 5 predictions first');
    }

    // Validate each pick
    for (const pick of args.picks) {
      const matchup = await ctx.db.get(pick.matchupId);
      if (!matchup) throw new Error('Matchup not found');
      if (
        pick.predictedWinnerId !== matchup.driver1Id &&
        pick.predictedWinnerId !== matchup.driver2Id
      ) {
        throw new Error(
          'Predicted winner must be one of the drivers in the matchup',
        );
      }
    }

    // Determine sessions (cascade logic)
    const sessionsToUpdate: Array<SessionType> = args.sessionType
      ? [args.sessionType]
      : race.hasSprint
        ? ['quali', 'sprint_quali', 'sprint', 'race']
        : ['quali', 'race'];

    const lockTimes: Record<SessionType, number | undefined> = {
      quali: race.qualiLockAt,
      sprint_quali: race.sprintQualiLockAt,
      sprint: race.sprintLockAt,
      race: race.predictionLockAt,
    };

    let updatedCount = 0;

    for (const sessionType of sessionsToUpdate) {
      const lockTime = lockTimes[sessionType];

      if (lockTime && now >= lockTime) {
        if (args.sessionType) {
          throw new Error(`H2H predictions are locked for ${sessionType}`);
        }
        continue;
      }

      for (const pick of args.picks) {
        const existing = await ctx.db
          .query('h2hPredictions')
          .withIndex('by_user_race_session_matchup', (q) =>
            q
              .eq('userId', viewer._id)
              .eq('raceId', args.raceId)
              .eq('sessionType', sessionType)
              .eq('matchupId', pick.matchupId),
          )
          .unique();

        if (existing) {
          await ctx.db.patch(existing._id, {
            predictedWinnerId: pick.predictedWinnerId,
            updatedAt: now,
          });
        } else {
          await ctx.db.insert('h2hPredictions', {
            userId: viewer._id,
            raceId: args.raceId,
            sessionType,
            matchupId: pick.matchupId,
            predictedWinnerId: pick.predictedWinnerId,
            submittedAt: now,
            updatedAt: now,
          });
        }
        updatedCount++;
      }
    }

    if (updatedCount === 0) {
      throw new Error('All sessions are locked');
    }

    return { ok: true, updatedCount };
  },
});
