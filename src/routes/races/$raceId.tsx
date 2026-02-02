import { createFileRoute, Link } from '@tanstack/react-router';
import { useQuery } from 'convex/react';
import { useAuth, SignInButton } from '@clerk/clerk-react';
import { api } from '../../../convex/_generated/api';
import type { Id } from '../../../convex/_generated/dataModel';
import { Loader2, ArrowLeft, Calendar, Clock, Lock, LogIn, Trophy } from 'lucide-react';
import PredictionForm from '../../components/PredictionForm';
import RaceResults from '../../components/RaceResults';

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

  // Only fetch prediction if user is signed in
  const existingPrediction = useQuery(
    api.predictions.myPredictionForRace,
    isSignedIn ? { raceId: typedRaceId } : 'skip'
  );

  if (race === undefined || !authLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
      </div>
    );
  }

  if (race === null) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Link
            to="/races"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8"
          >
            <ArrowLeft size={20} />
            Back to races
          </Link>
          <div className="text-center py-16">
            <h1 className="text-2xl font-bold text-white mb-2">
              Race not found
            </h1>
            <p className="text-slate-400">
              This race doesn't exist or has been removed.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const isPredictable = race.status === 'upcoming';

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Link
          to="/races"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8"
        >
          <ArrowLeft size={20} />
          Back to races
        </Link>

        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 mb-6">
          <span className="text-sm font-medium text-slate-500">
            Round {race.round} - {race.season} Season
          </span>
          <h1 className="text-3xl font-bold text-white mt-2 mb-4">
            {race.name}
          </h1>

          <div className="flex flex-wrap gap-6 text-slate-400">
            <div className="flex items-center gap-2">
              <Calendar size={18} className="text-slate-500" />
              <span>{formatDate(race.raceStartAt)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={18} className="text-slate-500" />
              <span>{formatTime(race.raceStartAt)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Lock size={18} className="text-slate-500" />
              <span>Predictions lock {formatTime(race.predictionLockAt)}</span>
            </div>
          </div>
        </div>

        {isPredictable ? (
          <div className="bg-slate-800/50 backdrop-blur-sm border border-cyan-500/30 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-white mb-2">
              Make Your Prediction
            </h2>
            <p className="text-slate-400 mb-6">
              Select the 5 drivers you think will finish in the top 5 positions.
            </p>

            {isSignedIn ? (
              existingPrediction === undefined ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 text-cyan-400 animate-spin" />
                </div>
              ) : (
                <PredictionForm
                  raceId={typedRaceId}
                  existingPicks={existingPrediction?.picks}
                />
              )
            ) : (
              <div className="text-center py-8 border-2 border-dashed border-slate-700 rounded-lg">
                <LogIn className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400 mb-4">
                  Sign in to make your prediction
                </p>
                <SignInButton mode="modal">
                  <button className="px-6 py-2 bg-cyan-500 hover:bg-cyan-600 text-white font-medium rounded-lg transition-colors">
                    Sign In
                  </button>
                </SignInButton>
              </div>
            )}
          </div>
        ) : race.status === 'locked' ? (
          <div className="bg-slate-800/50 backdrop-blur-sm border border-amber-500/30 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-white mb-2">
              Predictions Locked
            </h2>
            <p className="text-slate-400">
              Predictions are closed. Results will be available after the race.
            </p>
          </div>
        ) : (
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Trophy className="w-5 h-5 text-yellow-400" />
              <h2 className="text-xl font-semibold text-white">Race Results</h2>
            </div>
            <RaceResults raceId={typedRaceId} />
          </div>
        )}
      </div>
    </div>
  );
}
