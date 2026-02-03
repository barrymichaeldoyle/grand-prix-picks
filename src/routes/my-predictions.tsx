import { SignInButton, useAuth } from '@clerk/clerk-react';
import { createFileRoute, Link } from '@tanstack/react-router';
import { useQuery } from 'convex/react';
import { CheckCircle, Clock, History, LogIn, Trophy } from 'lucide-react';

import { api } from '../../convex/_generated/api';
import Button, { primaryButtonStyles } from '../components/Button';
import PageLoader from '../components/PageLoader';
import { getCountryCodeForRace, RaceFlag } from '../components/RaceCard';

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

type SessionType = 'quali' | 'sprint_quali' | 'sprint' | 'race';

const SESSION_LABELS: Record<SessionType, string> = {
  quali: 'Qualifying',
  sprint_quali: 'Sprint Quali',
  sprint: 'Sprint',
  race: 'Race',
};

const SESSION_LABELS_SHORT: Record<SessionType, string> = {
  quali: 'Q',
  sprint_quali: 'SQ',
  sprint: 'S',
  race: 'R',
};

function getSessionsForWeekend(hasSprint: boolean): Array<SessionType> {
  return hasSprint
    ? ['quali', 'sprint_quali', 'sprint', 'race']
    : ['quali', 'race'];
}

function MyPredictionsPage() {
  const { isSignedIn, isLoaded } = useAuth();
  const weekends = useQuery(
    api.predictions.myPredictionHistory,
    isSignedIn ? {} : 'skip',
  );

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

  return (
    <div className="bg-page">
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-text">My Predictions</h1>
          <p className="text-text-muted">Your prediction history and scores</p>
        </div>

        {/* Stats summary */}
        <div className="mb-8 grid grid-cols-3 gap-4">
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
              const sessions = getSessionsForWeekend(weekend.hasSprint);
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
                        <div className="mb-0.5 flex items-center gap-2">
                          <span className="text-sm text-text-muted">
                            Round {weekend.raceRound}
                          </span>
                          {weekend.raceStatus === 'finished' ? (
                            <CheckCircle className="h-4 w-4 text-success" />
                          ) : weekend.raceStatus === 'locked' ? (
                            <Clock className="h-4 w-4 text-warning" />
                          ) : null}
                          {weekend.hasSprint && (
                            <span className="rounded bg-purple-100 px-1.5 py-0.5 text-xs font-semibold text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                              SPRINT
                            </span>
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
                            return (
                              <div
                                key={session}
                                className="px-2 py-2 text-center"
                              >
                                <span className="text-sm font-medium text-text">
                                  {pick?.code ?? '—'}
                                </span>
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
