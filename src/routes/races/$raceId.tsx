import { SignInButton, useAuth } from '@clerk/clerk-react';
import { createFileRoute, Link } from '@tanstack/react-router';
import { ConvexHttpClient } from 'convex/browser';
import { useQuery } from 'convex/react';
import { ArrowLeft, Calendar, Clock, Lock, LogIn, Trophy } from 'lucide-react';

import { api } from '../../../convex/_generated/api';
import type { Id } from '../../../convex/_generated/dataModel';
import Button from '../../components/Button';
import InlineLoader from '../../components/InlineLoader';
import PredictionForm from '../../components/PredictionForm';
import {
  getCountryCodeForRace,
  RaceFlag,
  StatusBadge,
} from '../../components/RaceCard';
import RaceResults from '../../components/RaceResults';

const convex = new ConvexHttpClient(import.meta.env.VITE_CONVEX_URL);

export const Route = createFileRoute('/races/$raceId')({
  component: RaceDetailPage,
  loader: async ({ params }) => {
    const raceId = params.raceId as Id<'races'>;
    const [race, nextRace, predictionOpenAt] = await Promise.all([
      convex.query(api.races.getRace, { raceId }),
      convex.query(api.races.getNextRace),
      convex.query(api.races.getPredictionOpenAt, { raceId }),
    ]);
    return { race, nextRace, predictionOpenAt };
  },
  head: ({ loaderData }) => ({
    meta: [
      {
        title: loaderData?.race
          ? `${loaderData.race.name} | Grand Prix Picks`
          : 'Race Details | Grand Prix Picks',
      },
      {
        name: 'description',
        content: loaderData?.race
          ? `Make your prediction for the ${loaderData.race.name}. Pick the top 5 finishers and compete for points.`
          : 'Make your prediction for this Grand Prix. Pick the top 5 finishers and compete for points.',
      },
    ],
  }),
});

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
}

function formatTimeWithTz(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short',
  });
}

function RaceDetailPage() {
  const { raceId } = Route.useParams();
  const typedRaceId = raceId as Id<'races'>;
  const { race, nextRace, predictionOpenAt } = Route.useLoaderData();

  const { isSignedIn } = useAuth();

  // Only fetch prediction if user is signed in (user-specific, must be client-side)
  const existingPrediction = useQuery(
    api.predictions.myPredictionForRace,
    isSignedIn ? { raceId: typedRaceId } : 'skip',
  );

  if (race === null) {
    return (
      <div className="min-h-screen bg-page">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Link
            to="/races"
            className="inline-flex items-center gap-2 text-text-muted hover:text-text transition-colors mb-8"
          >
            <ArrowLeft size={20} />
            Back to races
          </Link>
          <div className="text-center py-16">
            <h1 className="text-2xl font-bold text-text mb-2">
              Race not found
            </h1>
            <p className="text-text-muted">
              This race doesn't exist or has been removed.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Only the next upcoming race is open for predictions
  const isNextRace = nextRace?._id === race._id;
  const isPredictable = race.status === 'upcoming' && isNextRace;
  const isNotYetOpen = race.status === 'upcoming' && !isNextRace;

  const statusStyles = isPredictable
    ? {
        border: 'border-accent/40',
        background: 'bg-surface',
      }
    : race.status === 'locked'
      ? {
          border: 'border-warning/40',
          background: 'bg-warning-muted',
        }
      : {
          border: 'border-border',
          background: 'bg-surface',
        };
  const countryCode = getCountryCodeForRace(race);

  return (
    <div className="min-h-screen bg-page">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Link
          to="/races"
          className="inline-flex items-center gap-2 text-text-muted hover:text-text transition-colors mb-6"
        >
          <ArrowLeft size={20} />
          Back to races
        </Link>

        <div
          className={`rounded-xl overflow-hidden shadow-sm border ${
            isNextRace
              ? 'border-accent/50 bg-surface'
              : 'border-border bg-surface'
          }`}
        >
          <div className="p-4 sm:p-5">
            {/* Same top row as RaceCard: flag, round, badges */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2 mb-2">
              {countryCode && (
                <span className="inline-flex shrink-0 items-center">
                  <RaceFlag countryCode={countryCode} size="lg" />
                </span>
              )}
              <span className="text-sm font-medium text-text-muted shrink-0">
                Round {race.round}
              </span>
              {isNextRace && (
                <span className="px-2 py-0.5 text-xs font-semibold bg-accent-muted text-accent rounded shrink-0">
                  NEXT UP
                </span>
              )}
              <StatusBadge status={race.status} isNext={isNextRace} />
            </div>

            <h1 className="text-lg sm:text-xl font-semibold text-text mb-2 sm:mb-3">
              {race.name}
            </h1>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-text-muted">
              <span className="inline-flex items-center gap-1.5">
                <Calendar size={16} className="shrink-0 text-text-muted" />
                {formatDate(race.raceStartAt)}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock size={16} className="shrink-0 text-text-muted" />
                {formatTime(race.raceStartAt)}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Lock size={16} className="shrink-0 text-text-muted" />
                Predictions lock {formatTimeWithTz(race.predictionLockAt)}
              </span>
            </div>
          </div>

          <div className={`border-t ${statusStyles.border}`}>
            <div className={`p-6 ${statusStyles.background}`}>
              {isPredictable ? (
                <>
                  <h2 className="text-xl font-semibold text-text mb-2">
                    Make Your Prediction
                  </h2>
                  <p className="text-text-muted mb-6">
                    Select the 5 drivers you think will finish in the top 5
                    positions.
                  </p>

                  {isSignedIn ? (
                    existingPrediction === undefined ? (
                      <InlineLoader />
                    ) : (
                      <PredictionForm
                        raceId={typedRaceId}
                        existingPicks={existingPrediction?.picks}
                      />
                    )
                  ) : (
                    <div className="text-center py-8 border-2 border-dashed border-border rounded-lg bg-surface">
                      <LogIn className="w-12 h-12 text-text-muted mx-auto mb-4" />
                      <p className="text-text-muted mb-4">
                        Sign in to make your prediction
                      </p>
                      <SignInButton mode="modal">
                        <Button size="sm">Sign In</Button>
                      </SignInButton>
                    </div>
                  )}
                </>
              ) : isNotYetOpen ? (
                <>
                  <div className="flex items-center gap-2 mb-2">
                    <Lock className="w-5 h-5 text-text-muted" />
                    <h2 className="text-xl font-semibold text-text">
                      Not Yet Open
                    </h2>
                  </div>
                  <div className="text-text-muted">
                    <p>
                      Predictions for this race will open after the previous
                      race is complete.
                    </p>
                    {predictionOpenAt != null && (
                      <p className="mt-2 text-text-muted">
                        Predictions open{' '}
                        <strong className="text-text">
                          {formatDate(predictionOpenAt)} at{' '}
                          {formatTime(predictionOpenAt)}
                        </strong>
                      </p>
                    )}
                    {predictionOpenAt == null && (
                      <p className="mt-2">Check back soon!</p>
                    )}
                  </div>
                </>
              ) : race.status === 'locked' ? (
                <>
                  <h2 className="text-xl font-semibold text-text mb-2">
                    Predictions Locked
                  </h2>
                  <p className="text-text-muted">
                    Predictions are closed. Results will be available after the
                    race.
                  </p>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2 mb-4">
                    <Trophy className="w-5 h-5 text-accent" />
                    <h2 className="text-xl font-semibold text-text">
                      Race Results
                    </h2>
                  </div>
                  <RaceResults raceId={typedRaceId} />
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
