import { describe, expect, it } from 'vitest';

import type { Id } from '@convex-generated/dataModel';
import {
  type LiveBoard,
  type LivePlayer,
  liveSessionType,
  rankLiveGroup,
} from './liveSessionBoard';

function userId(name: string) {
  return name as unknown as Id<'users'>;
}

function player(name: string, total: number): LivePlayer {
  return {
    userId: userId(name),
    rank: null,
    top5Points: total,
    h2hPoints: 0,
    total,
    picks: [],
  };
}

function board(players: LivePlayer[]): LiveBoard {
  return {
    sessionType: 'race',
    updatedAt: 0,
    totalPlayers: players.length,
    top5: [{ code: 'VER', displayName: 'Max Verstappen', team: null }],
    players,
  };
}

describe('liveSessionType', () => {
  it('accepts the two sessions a running order can score', () => {
    expect(liveSessionType('race')).toBe('race');
    expect(liveSessionType('sprint')).toBe('sprint');
  });

  it('refuses qualifying, whose order is not a classification', () => {
    expect(liveSessionType('quali')).toBeNull();
    expect(liveSessionType('sprint_quali')).toBeNull();
    expect(liveSessionType(undefined)).toBeNull();
  });
});

describe('rankLiveGroup', () => {
  const events = [
    { _id: 'a', userId: userId('ana') },
    { _id: 'b', userId: userId('ben') },
  ];

  it('puts the best live total at the top', () => {
    const live = rankLiveGroup(
      events,
      board([player('ana', 11), player('ben', 18)]),
    );

    expect(live?.events.map((event) => event._id)).toEqual(['b', 'a']);
    expect(live && live.playerFor(live.events[0]!).total).toBe(18);
  });

  it('waits rather than rank a player the board has not scored', () => {
    expect(rankLiveGroup(events, board([player('ana', 11)]))).toBeNull();
  });

  it('waits for an author-less event, which has nothing to score', () => {
    // A `lineup_change` is the shape this rules out: the site authors it, so
    // there is no player for the board to have scored.
    const authorless: { _id: string; userId?: Id<'users'> } = { _id: 'c' };
    expect(
      rankLiveGroup(
        [...events, authorless],
        board([player('ana', 11), player('ben', 18)]),
      ),
    ).toBeNull();
  });

  it('stays out of the way with no board, or an empty running order', () => {
    expect(rankLiveGroup(events, undefined)).toBeNull();
    expect(rankLiveGroup(events, null)).toBeNull();
    expect(
      rankLiveGroup(events, {
        ...board([player('ana', 11), player('ben', 18)]),
        top5: [],
      }),
    ).toBeNull();
  });
});
