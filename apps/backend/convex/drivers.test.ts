/// <reference types="vite/client" />

import { convexTest } from 'convex-test';
import { describe, expect, it } from 'vitest';

import { api } from './_generated/api';
import schema from './schema';

const modules = import.meta.glob('./**/*.ts');

describe('listDrivers reserve handling', () => {
  it('keeps a reserve out of the pick pool while a stintless race driver stays in', async () => {
    const t = convexTest(schema, modules);
    await t.run(async (ctx) => {
      await ctx.db.insert('races', {
        season: 2026,
        round: 17,
        name: 'Azerbaijan Grand Prix',
        slug: 'azerbaijan-2026',
        raceStartAt: Date.now() + 200_000,
        predictionLockAt: Date.now() + 100_000,
        status: 'upcoming',
        createdAt: 100,
        updatedAt: 100,
      });

      const verstappen = await ctx.db.insert('drivers', {
        code: 'VER',
        displayName: 'Max Verstappen',
        team: 'Red Bull Racing',
        number: 3,
        createdAt: 100,
        updatedAt: 100,
      });
      await ctx.db.insert('driverTeamStints', {
        driverId: verstappen,
        season: 2026,
        team: 'Red Bull Racing',
        fromRound: 1,
        createdAt: 100,
        updatedAt: 100,
      });

      // A race driver whose stint has not been backfilled yet must still
      // appear, so a fresh deploy serves a grid rather than an empty one.
      await ctx.db.insert('drivers', {
        code: 'NOR',
        displayName: 'Lando Norris',
        team: 'McLaren',
        number: 1,
        createdAt: 100,
        updatedAt: 100,
      });

      // The reserve carries a number so the smoke test can map it, but holds
      // no race seat, so it must not be offerable as a pick.
      await ctx.db.insert('drivers', {
        code: 'IWA',
        displayName: 'Ayumu Iwasa',
        team: 'Red Bull Racing',
        number: 36,
        reserve: true,
        createdAt: 100,
        updatedAt: 100,
      });
    });

    const codes = (await t.query(api.drivers.listDrivers, {})).map(
      (driver) => driver.code,
    );
    expect(codes).toContain('VER');
    expect(codes).toContain('NOR');
    expect(codes).not.toContain('IWA');
  });
});
