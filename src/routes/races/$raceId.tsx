import { createFileRoute, Link } from '@tanstack/react-router';
import { useQuery } from 'convex/react';
import { useAuth, SignInButton } from '@clerk/clerk-react';
import { api } from '../../../convex/_generated/api';
import type { Id } from '../../../convex/_generated/dataModel';
import {
  Loader2,
  ArrowLeft,
  Calendar,
  Clock,
  Lock,
  LogIn,
  Trophy,
} from 'lucide-react';
import PredictionForm from '../../components/PredictionForm';
import RaceResults from '../../components/RaceResults';
import PageLoader from '../../components/PageLoader';

export const Route = createFileRoute('/races/$raceId')({
  component: RaceDetailPage,
});

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short',
  });
}

function RaceDetailPage() {
  const { raceId } = Route.useParams();
  const typedRaceId = raceId as Id<'races'>;

  const { isSignedIn, isLoaded: authLoaded } = useAuth();

  const race = useQuery(api.races.getRace, { raceId: typedRaceId });
  const nextRace = useQuery(api.races.getNextRace);
  const predictionOpenAt = useQuery(api.races.getPredictionOpenAt, {
    raceId: typedRaceId,
  });

  // Only fetch prediction if user is signed in
  const existingPrediction = useQuery(
    api.predictions.myPredictionForRace,
    isSignedIn ? { raceId: typedRaceId } : 'skip',
  );

  if (race === undefined || nextRace === undefined || !authLoaded) {
    return <PageLoader />;
  }

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

        <div className="bg-surface border border-border rounded-xl p-6 mb-6">
          <span className="text-sm font-medium text-text-muted">
            Round {race.round} - {race.season} Season
          </span>
          <h1 className="text-3xl font-bold text-text mt-2 mb-4">
            {race.name}
          </h1>

          <div className="flex flex-wrap gap-6 text-text-muted">
            <div className="flex items-center gap-2">
              <Calendar size={18} className="text-text-muted" />
              <span>{formatDate(race.raceStartAt)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={18} className="text-text-muted" />
              <span>{formatTime(race.raceStartAt)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Lock size={18} className="text-text-muted" />
              <span>Predictions lock {formatTime(race.predictionLockAt)}</span>
            </div>
          </div>
        </div>

        {isPredictable ? (
          <div className="bg-surface border border-accent/30 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-text mb-2">
              Make Your Prediction
            </h2>
            <p className="text-text-muted mb-6">
              Select the 5 drivers you think will finish in the top 5 positions.
            </p>

            {isSignedIn ? (
              existingPrediction === undefined ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 text-accent animate-spin" />
                </div>
              ) : (
                <PredictionForm
                  raceId={typedRaceId}
                  existingPicks={existingPrediction?.picks}
                />
              )
            ) : (
              <div className="text-center py-8 border-2 border-dashed border-border rounded-lg">
                <LogIn className="w-12 h-12 text-text-muted mx-auto mb-4" />
                <p className="text-text-muted mb-4">
                  Sign in to make your prediction
                </p>
                <SignInButton mode="modal">
                  <button className="px-6 py-2 bg-accent hover:bg-accent-hover text-white font-medium rounded-lg transition-colors">
                    Sign In
                  </button>
                </SignInButton>
              </div>
            )}
          </div>
        ) : isNotYetOpen ? (
          <div className="bg-surface border border-border rounded-xl p-6">
            <div className="flex items-center gap-2 mb-2">
              <Lock className="w-5 h-5 text-text-muted" />
              <h2 className="text-xl font-semibold text-text">Not Yet Open</h2>
            </div>
            <div className="text-text-muted">
              <p>
                Predictions for this race will open after the previous race is
                complete.
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
          </div>
        ) : race.status === 'locked' ? (
          <div className="bg-surface border border-warning/30 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-text mb-2">
              Predictions Locked
            </h2>
            <p className="text-text-muted">
              Predictions are closed. Results will be available after the race.
            </p>
          </div>
        ) : (
          <div className="bg-surface border border-border rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Trophy className="w-5 h-5 text-accent" />
              <h2 className="text-xl font-semibold text-text">Race Results</h2>
            </div>
            <RaceResults raceId={typedRaceId} />
          </div>
        )}
      </div>
    </div>
  );
}
