/// <reference types="vite/client" />

import { convexTest } from 'convex-test';
import { describe, expect, it } from 'vitest';

import { api } from './_generated/api';
import type { Id } from './_generated/dataModel';
import schema from './schema';

const modules = import.meta.glob('./**/*.ts');

const HOUR = 60 * 60 * 1000;

type Ctx = Parameters<Parameters<ReturnType<typeof convexTest>['run']>[0]>[0];

const GRID = ['VER', 'NOR', 'LEC', 'RUS', 'HAM', 'PIA'];

async function seedRunningRace(ctx: Ctx) {
  const raceId = await ctx.db.insert('races', {
    season: 2026,
    round: 13,
    name: 'Italian Grand Prix',
    slug: 'italy-2026',
    raceStartAt: Date.now() - HOUR,
    predictionLockAt: Date.now() - HOUR,
    status: 'locked',
    createdAt: 0,
    updatedAt: 0,
  });

  const drivers: Record<string, Id<'drivers'>> = {};
  for (const [index, code] of GRID.entries()) {
    drivers[code] = await ctx.db.insert('drivers', {
      code,
      displayName: code,
      team: 'Red Bull Racing',
      number: index + 1,
      createdAt: 0,
      updatedAt: 0,
    });
  }

  await ctx.db.insert('liveSnapshots', {
    raceId,
    sessionType: 'race',
    // The running order as it stands: VER leads, then NOR, LEC, RUS, HAM.
    order: GRID.slice(0, 5).map((code, index) => ({
      driverId: drivers[code]!,
      position: index + 1,
    })),
    // Filled in per test: the duel half of a player's live total lives here,
    // written by the poller rather than derived by the query.
    standings: [],
    source: 'openf1-position',
    updatedAt: Date.now(),
  });

  return { raceId, drivers };
}

async function addPlayer(
  ctx: Ctx,
  username: string,
  raceId: Id<'races'>,
  picks: Id<'drivers'>[],
) {
  const userId = await ctx.db.insert('users', {
    clerkUserId: username,
    username,
    displayName: username,
    createdAt: 0,
    updatedAt: 0,
  });
  await ctx.db.insert('predictions', {
    userId,
    raceId,
    sessionType: 'race',
    picks,
    submittedAt: 0,
    updatedAt: 0,
  });
  return userId;
}

describe('liveScoring.getLiveSessionBoard', () => {
  it('scores each named player against the running order', async () => {
    const t = convexTest(schema, modules);
    const args = await t.run(async (ctx) => {
      const { raceId, drivers } = await seedRunningRace(ctx);
      const exact = await addPlayer(ctx, 'exact', raceId, [
        drivers.VER!,
        drivers.NOR!,
        drivers.LEC!,
        drivers.RUS!,
        drivers.HAM!,
      ]);
      const swapped = await addPlayer(ctx, 'swapped', raceId, [
        drivers.NOR!,
        drivers.VER!,
        drivers.LEC!,
        drivers.RUS!,
        drivers.PIA!,
      ]);
      return { raceId, userIds: [exact, swapped] };
    });

    const board = await t.query(api.liveScoring.getLiveSessionBoard, {
      raceId: args.raceId,
      sessionType: 'race',
      userIds: args.userIds,
    });

    expect(board!.top5.map((driver: { code: string }) => driver.code)).toEqual([
      'VER',
      'NOR',
      'LEC',
      'RUS',
      'HAM',
    ]);
    // A perfect card against the order as it stands is the full 25.
    expect(board!.players[0].top5Points).toBe(25);
    // Two off-by-one, two exact, and a car outside the live top five.
    expect(board!.players[1].top5Points).toBe(3 + 3 + 5 + 5 + 0);
    expect(board!.players[1].picks[4]).toMatchObject({
      code: 'PIA',
      predictedPosition: 5,
      points: 0,
    });
  });

  it("adds the snapshot's duel points to each player's total", async () => {
    const t = convexTest(schema, modules);
    const args = await t.run(async (ctx) => {
      const seeded = await seedRunningRace(ctx);
      const userId = await addPlayer(ctx, 'player', seeded.raceId, [
        seeded.drivers.VER!,
        seeded.drivers.NOR!,
        seeded.drivers.LEC!,
        seeded.drivers.RUS!,
        seeded.drivers.HAM!,
      ]);
      const snapshot = await ctx.db
        .query('liveSnapshots')
        .withIndex('by_raceId_and_sessionType', (q) =>
          q.eq('raceId', seeded.raceId).eq('sessionType', 'race'),
        )
        .unique();
      await ctx.db.patch(snapshot!._id, {
        standings: [{ userId, rank: 1, topFive: 25, h2h: 7, weekend: 32 }],
      });
      return { raceId: seeded.raceId, userIds: [userId] };
    });

    const board = await t.query(api.liveScoring.getLiveSessionBoard, {
      raceId: args.raceId,
      sessionType: 'race',
      userIds: args.userIds,
    });

    expect(board!.players[0]).toMatchObject({
      rank: 1,
      top5Points: 25,
      h2hPoints: 7,
      total: 32,
    });
  });

  it('drops a player who has no picks for the session', async () => {
    const t = convexTest(schema, modules);
    const args = await t.run(async (ctx) => {
      const { raceId, drivers } = await seedRunningRace(ctx);
      const picker = await addPlayer(ctx, 'picker', raceId, [
        drivers.VER!,
        drivers.NOR!,
        drivers.LEC!,
        drivers.RUS!,
        drivers.HAM!,
      ]);
      const bystander = await ctx.db.insert('users', {
        clerkUserId: 'bystander',
        username: 'bystander',
        displayName: 'bystander',
        createdAt: 0,
        updatedAt: 0,
      });
      return { raceId, userIds: [picker, bystander] };
    });

    const board = await t.query(api.liveScoring.getLiveSessionBoard, {
      raceId: args.raceId,
      sessionType: 'race',
      userIds: args.userIds,
    });

    expect(board!.players).toHaveLength(1);
  });

  it('goes quiet once the result is published', async () => {
    const t = convexTest(schema, modules);
    const args = await t.run(async (ctx) => {
      const { raceId, drivers } = await seedRunningRace(ctx);
      const userId = await addPlayer(ctx, 'player', raceId, [
        drivers.VER!,
        drivers.NOR!,
        drivers.LEC!,
        drivers.RUS!,
        drivers.HAM!,
      ]);
      await ctx.db.insert('results', {
        raceId,
        sessionType: 'race',
        classification: GRID.map((code) => drivers[code]!),
        publishedAt: Date.now(),
        updatedAt: Date.now(),
      });
      return { raceId, userIds: [userId] };
    });

    // The published result is the fact; a stale snapshot must not outlive it.
    expect(
      await t.query(api.liveScoring.getLiveSessionBoard, {
        raceId: args.raceId,
        sessionType: 'race',
        userIds: args.userIds,
      }),
    ).toBeNull();
  });

  it('answers nothing for a session with no snapshot at all', async () => {
    const t = convexTest(schema, modules);
    const args = await t.run(async (ctx) => {
      const { raceId, drivers } = await seedRunningRace(ctx);
      const userId = await addPlayer(ctx, 'player', raceId, [
        drivers.VER!,
        drivers.NOR!,
        drivers.LEC!,
        drivers.RUS!,
        drivers.HAM!,
      ]);
      return { raceId, userIds: [userId] };
    });

    expect(
      await t.query(api.liveScoring.getLiveSessionBoard, {
        raceId: args.raceId,
        sessionType: 'sprint',
        userIds: args.userIds,
      }),
    ).toBeNull();
  });
});
