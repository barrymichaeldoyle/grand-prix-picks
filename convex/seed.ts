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

// 2026 F1 Calendar - race times are approximate (14:00 local time converted to UTC)
const F1_RACES_2026 = [
  {
    round: 1,
    name: 'Australian Grand Prix',
    slug: 'australia-2026',
    date: '2026-03-08T04:00:00Z',
  },
  {
    round: 2,
    name: 'Chinese Grand Prix',
    slug: 'china-2026',
    date: '2026-03-15T07:00:00Z',
  },
  {
    round: 3,
    name: 'Japanese Grand Prix',
    slug: 'japan-2026',
    date: '2026-03-29T05:00:00Z',
  },
  {
    round: 4,
    name: 'Bahrain Grand Prix',
    slug: 'bahrain-2026',
    date: '2026-04-12T15:00:00Z',
  },
  {
    round: 5,
    name: 'Saudi Arabian Grand Prix',
    slug: 'saudi-arabia-2026',
    date: '2026-04-19T17:00:00Z',
  },
  {
    round: 6,
    name: 'Miami Grand Prix',
    slug: 'miami-2026',
    date: '2026-05-03T20:00:00Z',
  },
  {
    round: 7,
    name: 'Canadian Grand Prix',
    slug: 'canada-2026',
    date: '2026-05-24T18:00:00Z',
  },
  {
    round: 8,
    name: 'Monaco Grand Prix',
    slug: 'monaco-2026',
    date: '2026-06-07T13:00:00Z',
  },
  {
    round: 9,
    name: 'Spanish Grand Prix',
    slug: 'spain-2026',
    date: '2026-06-14T13:00:00Z',
  },
  {
    round: 10,
    name: 'Austrian Grand Prix',
    slug: 'austria-2026',
    date: '2026-06-28T13:00:00Z',
  },
  {
    round: 11,
    name: 'British Grand Prix',
    slug: 'britain-2026',
    date: '2026-07-05T14:00:00Z',
  },
  {
    round: 12,
    name: 'Belgian Grand Prix',
    slug: 'belgium-2026',
    date: '2026-07-19T13:00:00Z',
  },
  {
    round: 13,
    name: 'Hungarian Grand Prix',
    slug: 'hungary-2026',
    date: '2026-07-26T13:00:00Z',
  },
  {
    round: 14,
    name: 'Dutch Grand Prix',
    slug: 'netherlands-2026',
    date: '2026-08-23T13:00:00Z',
  },
  {
    round: 15,
    name: 'Italian Grand Prix',
    slug: 'italy-2026',
    date: '2026-09-06T13:00:00Z',
  },
  {
    round: 16,
    name: 'Madrid Grand Prix',
    slug: 'madrid-2026',
    date: '2026-09-13T13:00:00Z',
  },
  {
    round: 17,
    name: 'Azerbaijan Grand Prix',
    slug: 'azerbaijan-2026',
    date: '2026-09-26T11:00:00Z',
  },
  {
    round: 18,
    name: 'Singapore Grand Prix',
    slug: 'singapore-2026',
    date: '2026-10-11T12:00:00Z',
  },
  {
    round: 19,
    name: 'United States Grand Prix',
    slug: 'usa-2026',
    date: '2026-10-25T19:00:00Z',
  },
  {
    round: 20,
    name: 'Mexican Grand Prix',
    slug: 'mexico-2026',
    date: '2026-11-01T20:00:00Z',
  },
  {
    round: 21,
    name: 'Brazilian Grand Prix',
    slug: 'brazil-2026',
    date: '2026-11-08T17:00:00Z',
  },
  {
    round: 22,
    name: 'Las Vegas Grand Prix',
    slug: 'las-vegas-2026',
    date: '2026-11-21T06:00:00Z',
  },
  {
    round: 23,
    name: 'Qatar Grand Prix',
    slug: 'qatar-2026',
    date: '2026-11-29T14:00:00Z',
  },
  {
    round: 24,
    name: 'Abu Dhabi Grand Prix',
    slug: 'abu-dhabi-2026',
    date: '2026-12-06T13:00:00Z',
  },
];

export const seedRaces = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    let created = 0;
    let skipped = 0;

    for (const race of F1_RACES_2026) {
      // Check if race already exists by slug
      const existing = await ctx.db
        .query('races')
        .withIndex('by_slug', (q) => q.eq('slug', race.slug))
        .first();

      if (existing) {
        skipped++;
        continue;
      }

      const raceStartAt = new Date(race.date).getTime();
      // Predictions lock 1 hour before race start
      const predictionLockAt = raceStartAt - 60 * 60 * 1000;

      await ctx.db.insert('races', {
        season: 2026,
        round: race.round,
        name: race.name,
        slug: race.slug,
        raceStartAt,
        predictionLockAt,
        status: 'upcoming',
        createdAt: now,
        updatedAt: now,
      });
      created++;
    }

    return { created, skipped, total: F1_RACES_2026.length };
  },
});
