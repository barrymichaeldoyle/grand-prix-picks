import { SESSION_LABELS, type SessionType } from '@/lib/sessions';

/**
 * Which slice of a race weekend the board is ranking.
 *
 * `all` sums every session, which is the fair comparison between players who
 * were there for the whole weekend and the answer this board has always given.
 * A single session is the fair comparison for everyone else: someone who finds
 * the game on Sunday morning has one session's points against people who
 * banked four, and a combined board ranks them near the bottom of something
 * they were never actually in.
 */
export type SessionScope = 'all' | SessionType;

const SESSION_SCOPES: readonly SessionScope[] = [
  'all',
  'quali',
  'sprint_quali',
  'sprint',
  'race',
];

export function isSessionScope(value: unknown): value is SessionScope {
  return (
    typeof value === 'string' && SESSION_SCOPES.includes(value as SessionScope)
  );
}

/**
 * Tabs for the sessions this weekend actually scored, newest weekend order
 * preserved, with the combined board first.
 *
 * Sessions with no scores are left out rather than disabled: an empty Sprint
 * tab on a weekend that had no sprint is a dead control, and a session whose
 * results are not published yet has nothing to rank.
 */
export function sessionScopeOptions(
  scored: readonly { sessionType: SessionType; playerCount: number }[],
) {
  return [
    { value: 'all' as const, label: 'Whole weekend' },
    ...scored.map((session) => ({
      value: session.sessionType,
      label: SESSION_LABELS[session.sessionType],
    })),
  ];
}

/**
 * Where the weekend board should open.
 *
 * A player who picked exactly one of the weekend's scored sessions opens on
 * that session, because the combined board is the one place their result looks
 * like a failure rather than a score. Anyone who played more than one — or
 * none, or who is signed out — opens on the whole weekend, which is what this
 * board has always meant.
 *
 * Only ever a default. An explicit `?session=` in the URL wins, so a link
 * someone shares keeps showing the board they were looking at.
 */
export function defaultSessionScope(
  breakdown:
    | {
        sessions: readonly {
          sessionType: SessionType;
          viewerScored: boolean;
        }[];
        viewerSessionCount: number;
      }
    | undefined,
): SessionScope {
  if (!breakdown || breakdown.viewerSessionCount !== 1) {
    return 'all';
  }
  if (breakdown.sessions.length < 2) {
    // The viewer played the only session there is, so "this session" and "the
    // whole weekend" are the same board. Prefer the plainer label.
    return 'all';
  }
  return (
    breakdown.sessions.find((session) => session.viewerScored)?.sessionType ??
    'all'
  );
}
