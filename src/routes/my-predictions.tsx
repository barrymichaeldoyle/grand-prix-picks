import { SignInButton, useAuth } from '@clerk/clerk-react';
import { createFileRoute, Link } from '@tanstack/react-router';
import { useQuery } from 'convex/react';
import { History, LogIn, Star, Trophy } from 'lucide-react';

import { api } from '../../convex/_generated/api';
import type { Id } from '../../convex/_generated/dataModel';
import { Badge, StatusBadge } from '../components/Badge';
import { Button, primaryButtonStyles } from '../components/Button';
import {
  DriverBadge,
  DriverBadgeSkeleton,
  TEAM_COLORS,
} from '../components/DriverBadge';
import { Flag } from '../components/Flag';
import { PageLoader } from '../components/PageLoader';
import { getCountryCodeForRace, RaceFlag } from '../components/RaceCard';
import {
  getSessionsForWeekend,
  SESSION_LABELS,
  SESSION_LABELS_SHORT,
} from '../lib/sessions';

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
function computeFavoritePick(
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

export const Route = createFileRoute('/my-predictions')({
  component: MyPredictionsPage,
  head: () => ({
    meta: [
      { title: 'My Predictions | Grand Prix Picks' },
      {
        name: 'description',
        content:
          'View your F1 prediction history and track your scores across the 2026 season.',
      },
    ],
  }),
});

function MyPredictionsPage() {
  const { isSignedIn, isLoaded } = useAuth();
  const weekends = useQuery(
    api.predictions.myPredictionHistory,
    isSignedIn ? {} : 'skip',
  );
  const drivers = useQuery(api.drivers.listDrivers);

  if (!isLoaded) {
    return <PageLoader />;
  }

  if (!isSignedIn) {
    return (
      <div className="bg-page">
        <div className="mx-auto max-w-4xl px-4 py-8">
          <div className="rounded-xl border border-border bg-surface p-8 text-center">
            <LogIn className="mx-auto mb-4 h-16 w-16 text-text-muted" />
            <h1 className="mb-2 text-2xl font-bold text-text">
              Sign In Required
            </h1>
            <p className="mb-4 text-text-muted">
              Sign in to view your prediction history.
            </p>
            <SignInButton mode="modal">
              <Button size="sm">Sign In</Button>
            </SignInButton>
          </div>
        </div>
      </div>
    );
  }

  if (weekends === undefined) {
    return <PageLoader />;
  }

  const totalPoints = weekends.reduce((sum, w) => sum + w.totalPoints, 0);
  const scoredWeekends = weekends.filter((w) => w.hasScores).length;
  const favoritePick = computeFavoritePick(weekends);
  const favoriteDriver = favoritePick
    ? drivers?.find((d) => d._id === favoritePick.driverId)
    : null;

  return (
    <div className="bg-page">
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="mb-4">
          <h1 className="mb-2 text-3xl font-bold text-text">My Predictions</h1>
          <p className="text-text-muted">Your prediction history and scores</p>
        </div>

        {/* Stats summary */}
        <div className="mb-4 grid grid-cols-3 gap-4">
          <div className="rounded-xl border border-border bg-surface p-4 text-center">
            <div className="text-3xl font-bold text-accent">{totalPoints}</div>
            <div className="text-sm text-text-muted">Total Points</div>
          </div>
          <div className="rounded-xl border border-border bg-surface p-4 text-center">
            <div className="text-3xl font-bold text-text">
              {weekends.length}
            </div>
            <div className="text-sm text-text-muted">Weekends</div>
          </div>
          <div className="rounded-xl border border-border bg-surface p-4 text-center">
            <div className="text-3xl font-bold text-text">{scoredWeekends}</div>
            <div className="text-sm text-text-muted">Scored</div>
          </div>
        </div>

        {/* Your Favorite Pick */}
        {favoritePick && favoriteDriver && (
          <div className="mb-4 overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
            <div className="flex items-center gap-2 border-b border-border/60 bg-surface-muted/40 px-4 py-2.5">
              <Star className="h-5 w-5 shrink-0 text-accent" />
              <h2 className="text-sm font-semibold text-text">
                Your Favorite Pick
              </h2>
            </div>
            <div className="flex items-stretch">
              <div
                className="flex w-16 shrink-0 flex-col items-center justify-center py-4 text-white"
                style={{
                  backgroundColor:
                    favoriteDriver.team &&
                    (TEAM_COLORS[favoriteDriver.team] ?? '#666'),
                }}
              >
                {favoriteDriver.number != null && (
                  <span className="font-mono text-2xl font-bold">
                    {favoriteDriver.number}
                  </span>
                )}
                <span className="font-mono text-xs font-bold tracking-wider text-white/90">
                  {favoriteDriver.code}
                </span>
              </div>
              <div className="flex min-w-0 flex-1 flex-col justify-center gap-1 px-4 py-4">
                <div className="flex flex-wrap items-center gap-2">
                  {favoriteDriver.nationality && (
                    <Flag
                      code={favoriteDriver.nationality}
                      size="md"
                      className="shrink-0"
                    />
                  )}
                  {favoriteDriver.displayName && (
                    <span className="text-lg font-semibold text-text">
                      {favoriteDriver.displayName}
                    </span>
                  )}
                </div>
                {favoriteDriver.team && (
                  <span className="text-sm text-text-muted">
                    {favoriteDriver.team}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {weekends.length === 0 ? (
          <div className="rounded-xl border border-border bg-surface p-8 text-center">
            <History className="mx-auto mb-4 h-16 w-16 text-text-muted" />
            <h2 className="mb-2 text-xl font-semibold text-text">
              No predictions yet
            </h2>
            <p className="mb-4 text-text-muted">
              Make your first prediction to start tracking your scores.
            </p>
            <Link to="/races" className={primaryButtonStyles('sm')}>
              View Races
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {weekends.map((weekend) => {
              const sessions = getSessionsForWeekend(!!weekend.hasSprint);
              const countryCode = getCountryCodeForRace({
                slug:
                  weekend.raceName
                    .toLowerCase()
                    .replace(/ grand prix$/i, '')
                    .replace(/ /g, '-') + '-2026',
              });

              return (
                <Link
                  key={weekend.raceId}
                  to="/races/$raceId"
                  params={{ raceId: weekend.raceId }}
                  className="block overflow-hidden rounded-xl border border-border bg-surface transition-colors hover:border-border-strong"
                >
                  {/* Header */}
                  <div className="flex items-center justify-between gap-4 p-4">
                    <div className="flex min-w-0 items-center gap-3">
                      {countryCode && <RaceFlag countryCode={countryCode} />}
                      <div className="min-w-0">
                        <div className="mb-0.5 flex flex-wrap items-center gap-2">
                          <span className="text-sm text-text-muted">
                            Round {weekend.raceRound}
                          </span>
                          <StatusBadge
                            status={weekend.raceStatus}
                            isNext={false}
                          />
                          {weekend.hasSprint && (
                            <Badge variant="sprint">SPRINT</Badge>
                          )}
                        </div>
                        <h3 className="truncate text-lg font-semibold text-text">
                          {weekend.raceName}
                        </h3>
                      </div>
                    </div>

                    <div className="shrink-0 text-right">
                      {weekend.hasScores ? (
                        <div className="flex items-center gap-2">
                          <Trophy className="h-5 w-5 text-accent" />
                          <span className="text-2xl font-bold text-accent">
                            {weekend.totalPoints}
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-text-muted">
                          {weekend.raceStatus === 'upcoming'
                            ? 'Awaiting race'
                            : 'Awaiting results'}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Predictions table */}
                  <div className="border-t border-border/60 bg-surface-muted/30">
                    {/* Table header */}
                    <div className="grid grid-cols-[auto_1fr] border-b border-border/50">
                      <div className="w-12 sm:w-16" />
                      <div
                        className={`grid ${weekend.hasSprint ? 'grid-cols-4' : 'grid-cols-2'}`}
                      >
                        {sessions.map((session) => (
                          <div key={session} className="px-2 py-2 text-center">
                            <span className="hidden text-xs font-semibold text-text-muted sm:inline">
                              {SESSION_LABELS[session]}
                            </span>
                            <span className="text-xs font-semibold text-text-muted sm:hidden">
                              {SESSION_LABELS_SHORT[session]}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Table rows - P1 through P5 */}
                    {[0, 1, 2, 3, 4].map((position) => (
                      <div
                        key={position}
                        className={`grid grid-cols-[auto_1fr] ${position < 4 ? 'border-b border-border/30' : ''}`}
                      >
                        <div className="flex w-12 items-center justify-center py-2 sm:w-16">
                          <span className="text-sm font-bold text-accent">
                            P{position + 1}
                          </span>
                        </div>
                        <div
                          className={`grid ${weekend.hasSprint ? 'grid-cols-4' : 'grid-cols-2'}`}
                        >
                          {sessions.map((session) => {
                            const sessionData = weekend.sessions[session];
                            const pick = sessionData?.picks[position];
                            const driver = pick
                              ? drivers?.find((d) => d._id === pick.driverId)
                              : null;
                            return (
                              <div
                                key={session}
                                className="flex justify-center px-2 py-2"
                              >
                                <div className="flex h-8 items-center justify-center">
                                  {driver ? (
                                    <DriverBadge
                                      code={driver.code}
                                      team={driver.team}
                                      displayName={driver.displayName}
                                      number={driver.number}
                                      nationality={driver.nationality}
                                    />
                                  ) : pick && drivers === undefined ? (
                                    <DriverBadgeSkeleton />
                                  ) : (
                                    <span className="text-text-muted/50">
                                      —
                                    </span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}

                    {/* Points row */}
                    {weekend.hasScores && (
                      <div className="grid grid-cols-[auto_1fr] border-t border-border/50">
                        <div className="flex w-12 items-center justify-center py-2 sm:w-16">
                          <Trophy className="h-4 w-4 text-accent" />
                        </div>
                        <div
                          className={`grid ${weekend.hasSprint ? 'grid-cols-4' : 'grid-cols-2'}`}
                        >
                          {sessions.map((session) => {
                            const sessionData = weekend.sessions[session];
                            const points = sessionData?.points;
                            return (
                              <div
                                key={session}
                                className="px-2 py-2 text-center"
                              >
                                <span className="text-sm font-bold text-accent">
                                  {points ?? '—'}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
