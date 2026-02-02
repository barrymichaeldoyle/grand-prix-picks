import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
  users: defineTable({
    clerkUserId: v.string(),
    email: v.optional(v.string()),
    displayName: v.optional(v.string()),
    isAdmin: v.optional(v.boolean()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index('by_clerkUserId', ['clerkUserId']),

  drivers: defineTable({
    code: v.string(), // "VER"
    givenName: v.optional(v.string()),
    familyName: v.optional(v.string()),
    displayName: v.string(), // "Max Verstappen"
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_code', ['code'])
    .index('by_displayName', ['displayName']),

  races: defineTable({
    season: v.number(), // 2026
    round: v.number(), // 1..N
    name: v.string(), // "Bahrain Grand Prix"
    slug: v.string(), // "bahrain-2026"
    raceStartAt: v.number(), // ms epoch
    predictionLockAt: v.number(), // ms epoch
    status: v.string(), // "upcoming" | "locked" | "finished"
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_season_round', ['season', 'round'])
    .index('by_slug', ['slug'])
    .index('by_predictionLockAt', ['predictionLockAt'])
    .index('by_raceStartAt', ['raceStartAt']),

  predictions: defineTable({
    userId: v.id('users'),
    raceId: v.id('races'),
    picks: v.array(v.id('drivers')), // length 5
    submittedAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_user_race', ['userId', 'raceId'])
    .index('by_race', ['raceId'])
    .index('by_user', ['userId']),

  results: defineTable({
    raceId: v.id('races'),
    classification: v.array(v.id('drivers')), // ordered, ideally full 20
    publishedAt: v.number(),
    updatedAt: v.number(),
  }).index('by_race', ['raceId']),

  scores: defineTable({
    userId: v.id('users'),
    raceId: v.id('races'),
    points: v.number(),
    breakdown: v.optional(
      v.array(
        v.object({
          driverId: v.id('drivers'),
          predictedPosition: v.number(), // 1..5
          actualPosition: v.optional(v.number()),
          points: v.number(),
        }),
      ),
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_user_race', ['userId', 'raceId'])
    .index('by_race', ['raceId'])
    .index('by_user', ['userId']),
});
