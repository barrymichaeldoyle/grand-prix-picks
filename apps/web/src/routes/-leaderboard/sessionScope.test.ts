import { describe, expect, it } from 'vitest';

import {
  defaultSessionScope,
  isSessionScope,
  sessionScopeOptions,
} from './sessionScope';

describe('which board a race weekend opens on', () => {
  const quali = { sessionType: 'quali' as const, viewerScored: false };
  const race = { sessionType: 'race' as const, viewerScored: false };

  it('opens on the session a one-session player actually played', () => {
    // The point of the whole feature: someone who found the game on Sunday
    // has race points only, and the combined board ranks them below everyone
    // who also played qualifying.
    expect(
      defaultSessionScope({
        sessions: [quali, { ...race, viewerScored: true }],
        viewerSessionCount: 1,
      }),
    ).toBe('race');
  });

  it('opens on the whole weekend for someone who played more than one', () => {
    expect(
      defaultSessionScope({
        sessions: [
          { ...quali, viewerScored: true },
          { ...race, viewerScored: true },
        ],
        viewerSessionCount: 2,
      }),
    ).toBe('all');
  });

  it('opens on the whole weekend for someone who played none', () => {
    expect(
      defaultSessionScope({ sessions: [quali, race], viewerSessionCount: 0 }),
    ).toBe('all');
  });

  it('prefers the plainer label when the weekend held one session', () => {
    // "Race" and "whole weekend" are the same list here, so there is nothing
    // to distinguish and the general label reads better.
    expect(
      defaultSessionScope({
        sessions: [{ ...race, viewerScored: true }],
        viewerSessionCount: 1,
      }),
    ).toBe('all');
  });

  it('opens on the whole weekend before the breakdown resolves', () => {
    expect(defaultSessionScope(undefined)).toBe('all');
  });
});

describe('session scope parsing and options', () => {
  it('accepts the scopes the board can render', () => {
    expect(isSessionScope('all')).toBe(true);
    expect(isSessionScope('sprint_quali')).toBe(true);
    expect(isSessionScope('practice')).toBe(false);
    expect(isSessionScope(undefined)).toBe(false);
  });

  it('lists the combined board first, then only scored sessions', () => {
    expect(
      sessionScopeOptions([
        { sessionType: 'quali', playerCount: 12 },
        { sessionType: 'race', playerCount: 20 },
      ]).map((option) => option.value),
    ).toEqual(['all', 'quali', 'race']);
  });
});
