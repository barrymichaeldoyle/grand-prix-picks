import { internalMutation } from './_generated/server';

const F1_DRIVERS_2026 = [
  // McLaren (Constructors' Champions)
  {
    code: 'NOR',
    givenName: 'Lando',
    familyName: 'Norris',
    displayName: 'Lando Norris',
  },
  {
    code: 'PIA',
    givenName: 'Oscar',
    familyName: 'Piastri',
    displayName: 'Oscar Piastri',
  },

  // Ferrari
  {
    code: 'LEC',
    givenName: 'Charles',
    familyName: 'Leclerc',
    displayName: 'Charles Leclerc',
  },
  {
    code: 'HAM',
    givenName: 'Lewis',
    familyName: 'Hamilton',
    displayName: 'Lewis Hamilton',
  },

  // Red Bull Racing
  {
    code: 'VER',
    givenName: 'Max',
    familyName: 'Verstappen',
    displayName: 'Max Verstappen',
  },
  {
    code: 'HAD',
    givenName: 'Isack',
    familyName: 'Hadjar',
    displayName: 'Isack Hadjar',
  },

  // Mercedes
  {
    code: 'RUS',
    givenName: 'George',
    familyName: 'Russell',
    displayName: 'George Russell',
  },
  {
    code: 'ANT',
    givenName: 'Kimi',
    familyName: 'Antonelli',
    displayName: 'Kimi Antonelli',
  },

  // Aston Martin
  {
    code: 'ALO',
    givenName: 'Fernando',
    familyName: 'Alonso',
    displayName: 'Fernando Alonso',
  },
  {
    code: 'STR',
    givenName: 'Lance',
    familyName: 'Stroll',
    displayName: 'Lance Stroll',
  },

  // Alpine
  {
    code: 'GAS',
    givenName: 'Pierre',
    familyName: 'Gasly',
    displayName: 'Pierre Gasly',
  },
  {
    code: 'COL',
    givenName: 'Franco',
    familyName: 'Colapinto',
    displayName: 'Franco Colapinto',
  },

  // Williams
  {
    code: 'ALB',
    givenName: 'Alex',
    familyName: 'Albon',
    displayName: 'Alex Albon',
  },
  {
    code: 'SAI',
    givenName: 'Carlos',
    familyName: 'Sainz',
    displayName: 'Carlos Sainz',
  },

  // Racing Bulls
  {
    code: 'LAW',
    givenName: 'Liam',
    familyName: 'Lawson',
    displayName: 'Liam Lawson',
  },
  {
    code: 'LIN',
    givenName: 'Arvid',
    familyName: 'Lindblad',
    displayName: 'Arvid Lindblad',
  },

  // Audi (formerly Sauber)
  {
    code: 'HUL',
    givenName: 'Nico',
    familyName: 'Hülkenberg',
    displayName: 'Nico Hülkenberg',
  },
  {
    code: 'BOR',
    givenName: 'Gabriel',
    familyName: 'Bortoleto',
    displayName: 'Gabriel Bortoleto',
  },

  // Haas
  {
    code: 'OCO',
    givenName: 'Esteban',
    familyName: 'Ocon',
    displayName: 'Esteban Ocon',
  },
  {
    code: 'BEA',
    givenName: 'Oliver',
    familyName: 'Bearman',
    displayName: 'Oliver Bearman',
  },

  // Cadillac (New for 2026)
  {
    code: 'BOT',
    givenName: 'Valtteri',
    familyName: 'Bottas',
    displayName: 'Valtteri Bottas',
  },
  {
    code: 'PER',
    givenName: 'Sergio',
    familyName: 'Pérez',
    displayName: 'Sergio Pérez',
  },
];

export const seedDrivers = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    let created = 0;
    let skipped = 0;

    for (const driver of F1_DRIVERS_2026) {
      // Check if driver already exists by code
      const existing = await ctx.db
        .query('drivers')
        .withIndex('by_code', (q) => q.eq('code', driver.code))
        .first();

      if (existing) {
        skipped++;
        continue;
      }

      await ctx.db.insert('drivers', {
        ...driver,
        createdAt: now,
        updatedAt: now,
      });
      created++;
    }

    return { created, skipped, total: F1_DRIVERS_2026.length };
  },
});

// 2026 F1 Calendar
// Standard weekend: Fri practice, Sat quali, Sun race
// Sprint weekend: Fri sprint quali, Sat sprint + quali, Sun race
// Times are approximate based on typical F1 scheduling
const F1_RACES_2026: Array<{
  round: number;
  name: string;
  slug: string;
  raceDate: string;
  qualiDate: string;
  hasSprint?: boolean;
  sprintQualiDate?: string;
  sprintDate?: string;
}> = [
  {
    round: 1,
    name: 'Australian Grand Prix',
    slug: 'australia-2026',
    qualiDate: '2026-03-07T05:00:00Z',
    raceDate: '2026-03-08T04:00:00Z',
  },
  {
    round: 2,
    name: 'Chinese Grand Prix',
    slug: 'china-2026',
    hasSprint: true,
    sprintQualiDate: '2026-03-13T10:30:00Z',
    sprintDate: '2026-03-14T03:00:00Z',
    qualiDate: '2026-03-14T07:00:00Z',
    raceDate: '2026-03-15T07:00:00Z',
  },
  {
    round: 3,
    name: 'Japanese Grand Prix',
    slug: 'japan-2026',
    qualiDate: '2026-03-28T06:00:00Z',
    raceDate: '2026-03-29T05:00:00Z',
  },
  {
    round: 4,
    name: 'Bahrain Grand Prix',
    slug: 'bahrain-2026',
    qualiDate: '2026-04-11T15:00:00Z',
    raceDate: '2026-04-12T15:00:00Z',
  },
  {
    round: 5,
    name: 'Saudi Arabian Grand Prix',
    slug: 'saudi-arabia-2026',
    qualiDate: '2026-04-18T17:00:00Z',
    raceDate: '2026-04-19T17:00:00Z',
  },
  {
    round: 6,
    name: 'Miami Grand Prix',
    slug: 'miami-2026',
    hasSprint: true,
    sprintQualiDate: '2026-05-01T21:30:00Z',
    sprintDate: '2026-05-02T16:00:00Z',
    qualiDate: '2026-05-02T20:00:00Z',
    raceDate: '2026-05-03T20:00:00Z',
  },
  {
    round: 7,
    name: 'Canadian Grand Prix',
    slug: 'canada-2026',
    qualiDate: '2026-05-23T20:00:00Z',
    raceDate: '2026-05-24T18:00:00Z',
  },
  {
    round: 8,
    name: 'Monaco Grand Prix',
    slug: 'monaco-2026',
    qualiDate: '2026-06-06T14:00:00Z',
    raceDate: '2026-06-07T13:00:00Z',
  },
  {
    round: 9,
    name: 'Spanish Grand Prix',
    slug: 'spain-2026',
    qualiDate: '2026-06-13T14:00:00Z',
    raceDate: '2026-06-14T13:00:00Z',
  },
  {
    round: 10,
    name: 'Austrian Grand Prix',
    slug: 'austria-2026',
    qualiDate: '2026-06-27T14:00:00Z',
    raceDate: '2026-06-28T13:00:00Z',
  },
  {
    round: 11,
    name: 'British Grand Prix',
    slug: 'britain-2026',
    qualiDate: '2026-07-04T14:00:00Z',
    raceDate: '2026-07-05T14:00:00Z',
  },
  {
    round: 12,
    name: 'Belgian Grand Prix',
    slug: 'belgium-2026',
    hasSprint: true,
    sprintQualiDate: '2026-07-17T17:30:00Z',
    sprintDate: '2026-07-18T10:30:00Z',
    qualiDate: '2026-07-18T14:00:00Z',
    raceDate: '2026-07-19T13:00:00Z',
  },
  {
    round: 13,
    name: 'Hungarian Grand Prix',
    slug: 'hungary-2026',
    qualiDate: '2026-07-25T14:00:00Z',
    raceDate: '2026-07-26T13:00:00Z',
  },
  {
    round: 14,
    name: 'Dutch Grand Prix',
    slug: 'netherlands-2026',
    qualiDate: '2026-08-22T13:00:00Z',
    raceDate: '2026-08-23T13:00:00Z',
  },
  {
    round: 15,
    name: 'Italian Grand Prix',
    slug: 'italy-2026',
    qualiDate: '2026-09-05T14:00:00Z',
    raceDate: '2026-09-06T13:00:00Z',
  },
  {
    round: 16,
    name: 'Madrid Grand Prix',
    slug: 'madrid-2026',
    qualiDate: '2026-09-12T14:00:00Z',
    raceDate: '2026-09-13T13:00:00Z',
  },
  {
    round: 17,
    name: 'Azerbaijan Grand Prix',
    slug: 'azerbaijan-2026',
    qualiDate: '2026-09-25T12:00:00Z',
    raceDate: '2026-09-26T11:00:00Z',
  },
  {
    round: 18,
    name: 'Singapore Grand Prix',
    slug: 'singapore-2026',
    qualiDate: '2026-10-10T13:00:00Z',
    raceDate: '2026-10-11T12:00:00Z',
  },
  {
    round: 19,
    name: 'United States Grand Prix',
    slug: 'usa-2026',
    hasSprint: true,
    sprintQualiDate: '2026-10-23T23:30:00Z',
    sprintDate: '2026-10-24T19:00:00Z',
    qualiDate: '2026-10-24T23:00:00Z',
    raceDate: '2026-10-25T19:00:00Z',
  },
  {
    round: 20,
    name: 'Mexican Grand Prix',
    slug: 'mexico-2026',
    qualiDate: '2026-10-31T21:00:00Z',
    raceDate: '2026-11-01T20:00:00Z',
  },
  {
    round: 21,
    name: 'Brazilian Grand Prix',
    slug: 'brazil-2026',
    hasSprint: true,
    sprintQualiDate: '2026-11-06T18:30:00Z',
    sprintDate: '2026-11-07T14:00:00Z',
    qualiDate: '2026-11-07T18:00:00Z',
    raceDate: '2026-11-08T17:00:00Z',
  },
  {
    round: 22,
    name: 'Las Vegas Grand Prix',
    slug: 'las-vegas-2026',
    qualiDate: '2026-11-20T06:00:00Z',
    raceDate: '2026-11-21T06:00:00Z',
  },
  {
    round: 23,
    name: 'Qatar Grand Prix',
    slug: 'qatar-2026',
    hasSprint: true,
    sprintQualiDate: '2026-11-27T18:30:00Z',
    sprintDate: '2026-11-28T13:30:00Z',
    qualiDate: '2026-11-28T18:00:00Z',
    raceDate: '2026-11-29T14:00:00Z',
  },
  {
    round: 24,
    name: 'Abu Dhabi Grand Prix',
    slug: 'abu-dhabi-2026',
    qualiDate: '2026-12-05T14:00:00Z',
    raceDate: '2026-12-06T13:00:00Z',
  },
];

// H2H matchups - teammate pairings for 2026
const H2H_MATCHUPS_2026 = [
  { team: 'McLaren', driver1Code: 'NOR', driver2Code: 'PIA' },
  { team: 'Ferrari', driver1Code: 'LEC', driver2Code: 'HAM' },
  { team: 'Red Bull Racing', driver1Code: 'VER', driver2Code: 'HAD' },
  { team: 'Mercedes', driver1Code: 'RUS', driver2Code: 'ANT' },
  { team: 'Aston Martin', driver1Code: 'ALO', driver2Code: 'STR' },
  { team: 'Alpine', driver1Code: 'GAS', driver2Code: 'COL' },
  { team: 'Williams', driver1Code: 'ALB', driver2Code: 'SAI' },
  { team: 'Racing Bulls', driver1Code: 'LAW', driver2Code: 'LIN' },
  { team: 'Audi', driver1Code: 'HUL', driver2Code: 'BOR' },
  { team: 'Haas', driver1Code: 'OCO', driver2Code: 'BEA' },
  { team: 'Cadillac', driver1Code: 'BOT', driver2Code: 'PER' },
];

export const seedRaces = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    let created = 0;
    let updated = 0;
    const skipped = 0;

    for (const race of F1_RACES_2026) {
      const raceStartAt = new Date(race.raceDate).getTime();
      const qualiStartAt = new Date(race.qualiDate).getTime();

      // Lock times: at each session's scheduled start time
      const predictionLockAt = raceStartAt;
      const qualiLockAt = qualiStartAt;

      // Sprint times (if applicable)
      const sprintQualiStartAt = race.sprintQualiDate
        ? new Date(race.sprintQualiDate).getTime()
        : undefined;
      const sprintStartAt = race.sprintDate
        ? new Date(race.sprintDate).getTime()
        : undefined;
      const sprintQualiLockAt = sprintQualiStartAt;
      const sprintLockAt = sprintStartAt;

      // Check if race already exists by slug
      const existing = await ctx.db
        .query('races')
        .withIndex('by_slug', (q) => q.eq('slug', race.slug))
        .first();

      if (existing) {
        // Update existing race with new session fields
        await ctx.db.patch(existing._id, {
          qualiStartAt,
          qualiLockAt,
          hasSprint: race.hasSprint ?? false,
          sprintQualiStartAt,
          sprintQualiLockAt,
          sprintStartAt,
          sprintLockAt,
          updatedAt: now,
        });
        updated++;
        continue;
      }

      await ctx.db.insert('races', {
        season: 2026,
        round: race.round,
        name: race.name,
        slug: race.slug,
        qualiStartAt,
        qualiLockAt,
        hasSprint: race.hasSprint ?? false,
        sprintQualiStartAt,
        sprintQualiLockAt,
        sprintStartAt,
        sprintLockAt,
        raceStartAt,
        predictionLockAt,
        status: 'upcoming',
        createdAt: now,
        updatedAt: now,
      });
      created++;
    }

    return { created, updated, skipped, total: F1_RACES_2026.length };
  },
});

export const seedH2HMatchups = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    let created = 0;
    let skipped = 0;

    // First, get all drivers by code
    const drivers = await ctx.db.query('drivers').collect();
    const driverByCode = new Map(drivers.map((d) => [d.code, d]));

    for (const matchup of H2H_MATCHUPS_2026) {
      const driver1 = driverByCode.get(matchup.driver1Code);
      const driver2 = driverByCode.get(matchup.driver2Code);

      if (!driver1 || !driver2) {
        console.warn(
          `Skipping ${matchup.team}: missing driver ${matchup.driver1Code} or ${matchup.driver2Code}`,
        );
        skipped++;
        continue;
      }

      // Check if matchup already exists
      const existing = await ctx.db
        .query('h2hMatchups')
        .withIndex('by_season_team', (q) =>
          q.eq('season', 2026).eq('team', matchup.team),
        )
        .first();

      if (existing) {
        skipped++;
        continue;
      }

      await ctx.db.insert('h2hMatchups', {
        season: 2026,
        team: matchup.team,
        driver1Id: driver1._id,
        driver2Id: driver2._id,
        createdAt: now,
        updatedAt: now,
      });
      created++;
    }

    return { created, skipped, total: H2H_MATCHUPS_2026.length };
  },
});
