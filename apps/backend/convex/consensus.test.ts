/// <reference types="vite/client" />

import { convexTest } from 'convex-test';
import { describe, expect, it } from 'vitest';

import { api } from './_generated/api';
import type { Id } from './_generated/dataModel';
import schema from './schema';

const modules = import.meta.glob('./**/*.ts');

const HOUR = 60 * 60 * 1000;

type Ctx = Parameters<Parameters<ReturnType<typeof convexTest>['run']>[0]>[0];

async function addRace(ctx: Ctx, predictionLockAt: number) {
  return await ctx.db.insert('races', {
    season: 2026,
    round: 5,
    name: 'Test Grand Prix',
    slug: 'test-2026',
    raceStartAt: predictionLockAt,
    predictionLockAt,
    status: 'upcoming',
    createdAt: 0,
    updatedAt: 0,
  });
}

async function addDriver(ctx: Ctx, code: string, team: string) {
  return await ctx.db.insert('drivers', {
    code,
    displayName: `Driver ${code}`,
    team,
    createdAt: 0,
    updatedAt: 0,
  });
}

async function addEntry(
  ctx: Ctx,
  raceId: Id<'races'>,
  index: number,
  picks: Id<'drivers'>[],
) {
  const userId = await ctx.db.insert('users', {
    clerkUserId: `player-${index}`,
    username: `player-${index}`,
    displayName: `Player ${index}`,
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
}

/** Five drivers, and a race whose deadline has passed. */
async function seedLockedRace(ctx: Ctx) {
  const raceId = await addRace(ctx, Date.now() - HOUR);
  const drivers = await Promise.all(
    ['VER', 'NOR', 'LEC', 'RUS', 'PIA', 'HAM'].map((code) =>
      addDriver(ctx, code, `Team ${code}`),
    ),
  );
  return { raceId, drivers };
}

describe('getSessionConsensus', () => {
  it('stays hidden until the session locks, so it is never an answer sheet', async () => {
    const t = convexTest(schema, modules);
    const raceId = await t.run(async (ctx) => {
      const id = await addRace(ctx, Date.now() + HOUR);
      const drivers = await Promise.all(
        ['VER', 'NOR', 'LEC', 'RUS', 'PIA'].map((code) =>
          addDriver(ctx, code, 'Team'),
        ),
      );
      for (let i = 0; i < 8; i += 1) {
        await addEntry(ctx, id, i, drivers);
      }
      return id;
    });

    expect(
      await t.query(api.consensus.getSessionConsensus, {
        raceId,
        sessionType: 'race',
      }),
    ).toBeNull();
  });

  it('reports pick rate and a weighted consensus order once locked', async () => {
    const t = convexTest(schema, modules);
    const { raceId, drivers } = await t.run(async (ctx) => {
      const seeded = await seedLockedRace(ctx);
      const [VER, NOR, LEC, RUS, PIA, HAM] = seeded.drivers;
      // Six entrants. All six pick NOR and only five pick VER, but NOR is
      // always fifth and VER always first, so VER has to outrank NOR on the
      // weighting even though fewer people backed them.
      for (let i = 0; i < 5; i += 1) {
        await addEntry(ctx, seeded.raceId, i, [VER, LEC, RUS, PIA, NOR]);
      }
      await addEntry(ctx, seeded.raceId, 5, [LEC, RUS, PIA, HAM, NOR]);
      return seeded;
    });

    const consensus = await t.query(api.consensus.getSessionConsensus, {
      raceId,
      sessionType: 'race',
    });

    expect(consensus?.entrants).toBe(6);
    expect(consensus?.sampled).toBe(false);
    // LEC and VER tie on weight (25 each); LEC takes it on reach, which is
    // the documented tie-break.
    expect(consensus?.drivers.map((d) => d.code)).toEqual([
      'LEC',
      'VER',
      'RUS',
      'PIA',
      'NOR',
      'HAM',
    ]);
    const ver = consensus?.drivers.find((d) => d.code === 'VER');
    const nor = consensus?.drivers.find((d) => d.code === 'NOR');
    expect(nor?.pickRate).toBe(100);
    expect(nor?.consensusPosition).toBe(5);
    // Reach alone would have put NOR top; the slot weighting is what stops it.
    expect(ver!.consensusPosition).toBeLessThan(nor!.consensusPosition);
    // Every one of the six put NOR fifth.
    expect(nor?.slots).toEqual([0, 0, 0, 0, 6]);
    expect(ver?.pickRate).toBe(83.3);
    expect(ver?.slots).toEqual([5, 0, 0, 0, 0]);
    expect(drivers.length).toBe(6);
  });

  it('reports nothing when too few people entered to make a crowd', async () => {
    const t = convexTest(schema, modules);
    const raceId = await t.run(async (ctx) => {
      const seeded = await seedLockedRace(ctx);
      for (let i = 0; i < 4; i += 1) {
        await addEntry(ctx, seeded.raceId, i, seeded.drivers.slice(0, 5));
      }
      return seeded.raceId;
    });

    expect(
      await t.query(api.consensus.getSessionConsensus, {
        raceId,
        sessionType: 'race',
      }),
    ).toBeNull();
  });

  it('attributes a team by the round raced, not the driver’s current team', async () => {
    const t = convexTest(schema, modules);
    const raceId = await t.run(async (ctx) => {
      const seeded = await seedLockedRace(ctx);
      // VER's row says Red Bull today; the stint says Mercedes for round 5.
      await ctx.db.patch(seeded.drivers[0], { team: 'Red Bull Racing' });
      await ctx.db.insert('driverTeamStints', {
        driverId: seeded.drivers[0],
        season: 2026,
        team: 'Mercedes',
        fromRound: 1,
        toRound: 10,
        createdAt: 0,
        updatedAt: 0,
      });
      for (let i = 0; i < 6; i += 1) {
        await addEntry(ctx, seeded.raceId, i, seeded.drivers.slice(0, 5));
      }
      return seeded.raceId;
    });

    const consensus = await t.query(api.consensus.getSessionConsensus, {
      raceId,
      sessionType: 'race',
    });
    expect(consensus?.drivers.find((d) => d.code === 'VER')?.team).toBe(
      'Mercedes',
    );
  });
});
