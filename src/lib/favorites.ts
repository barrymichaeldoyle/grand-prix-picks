import type { Id } from '../../convex/_generated/dataModel';
import { getSessionsForWeekend } from './sessions';

/** Points per position: P1=5, P2=4, P3=3, P4=2, P5=1 */
const POSITION_POINTS = [5, 4, 3, 2, 1] as const;

type WeekendWithSessions = {
  raceDate: number;
  hasSprint: boolean;
  sessions: Record<
    string,
    { picks: Array<{ driverId: Id<'drivers'>; code: string }> } | null
  >;
};

/**
 * Compute "favorite pick": driver with highest weighted score (P1=5 … P5=1).
 * Tiebreaker: most 1sts, then most 2nds, … then earliest pick at that position.
 */
export function computeFavoritePick(
  weekends: ReadonlyArray<WeekendWithSessions>,
): { driverId: Id<'drivers'>; favoritePoints: number } | null {
  if (weekends.length === 0) return null;

  // Chronological order (oldest first) for "initial" tiebreaker
  const sorted = [...weekends].sort((a, b) => a.raceDate - b.raceDate);

  type DriverStats = {
    totalPoints: number;
    countByPosition: [number, number, number, number, number]; // P1..P5
    firstOrderAtPosition: [number, number, number, number, number]; // global order index
  };

  const stats = new Map<Id<'drivers'>, DriverStats>();
  let globalOrder = 0;

  function getOrCreate(driverId: Id<'drivers'>): DriverStats {
    let s = stats.get(driverId);
    if (!s) {
      s = {
        totalPoints: 0,
        countByPosition: [0, 0, 0, 0, 0],
        firstOrderAtPosition: [
          Number.POSITIVE_INFINITY,
          Number.POSITIVE_INFINITY,
          Number.POSITIVE_INFINITY,
          Number.POSITIVE_INFINITY,
          Number.POSITIVE_INFINITY,
        ],
      };
      stats.set(driverId, s);
    }
    return s;
  }

  for (const weekend of sorted) {
    const sessions = getSessionsForWeekend(weekend.hasSprint);
    for (const session of sessions) {
      const sessionData = weekend.sessions[session];
      const picks = sessionData?.picks ?? [];
      for (let pos = 0; pos < 5; pos++) {
        const pick = pos < picks.length ? picks[pos] : undefined;
        if (pick == null) continue;
        const s = getOrCreate(pick.driverId);
        s.totalPoints += POSITION_POINTS[pos];
        s.countByPosition[pos]++;
        if (globalOrder < s.firstOrderAtPosition[pos]) {
          s.firstOrderAtPosition[pos] = globalOrder;
        }
        globalOrder++;
      }
    }
  }

  const candidates = Array.from(stats.entries()).map(([driverId, s]) => ({
    driverId,
    ...s,
  }));

  if (candidates.length === 0) return null;

  candidates.sort((a, b) => {
    if (a.totalPoints !== b.totalPoints) return b.totalPoints - a.totalPoints;
    for (let pos = 0; pos < 5; pos++) {
      if (a.countByPosition[pos] !== b.countByPosition[pos])
        return b.countByPosition[pos] - a.countByPosition[pos];
    }
    for (let pos = 0; pos < 5; pos++) {
      if (a.firstOrderAtPosition[pos] !== b.firstOrderAtPosition[pos])
        return a.firstOrderAtPosition[pos] - b.firstOrderAtPosition[pos];
    }
    return String(a.driverId).localeCompare(String(b.driverId));
  });

  const top = candidates[0];
  return { driverId: top.driverId, favoritePoints: top.totalPoints };
}
