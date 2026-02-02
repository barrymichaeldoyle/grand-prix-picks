import { createFileRoute, Link } from '@tanstack/react-router';
import { useQuery } from 'convex/react';
import { useAuth, SignInButton } from '@clerk/clerk-react';
import { api } from '../../convex/_generated/api';
import { Loader2, History, LogIn, Trophy, Clock, CheckCircle } from 'lucide-react';

export const Route = createFileRoute('/my-predictions')({
  component: MyPredictionsPage,
});

function MyPredictionsPage() {
  const { isSignedIn, isLoaded } = useAuth();
  const predictions = useQuery(
    api.predictions.myPredictionHistory,
    isSignedIn ? {} : 'skip'
  );

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-8 text-center">
            <LogIn className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-white mb-2">Sign In Required</h1>
            <p className="text-slate-400 mb-4">
              Sign in to view your prediction history.
            </p>
            <SignInButton mode="modal">
              <button className="px-6 py-2 bg-cyan-500 hover:bg-cyan-600 text-white font-medium rounded-lg transition-colors">
                Sign In
              </button>
            </SignInButton>
          </div>
        </div>
      </div>
    );
  }

  if (predictions === undefined) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
      </div>
    );
  }

  const totalPoints = predictions.reduce((sum, p) => sum + (p.points ?? 0), 0);
  const completedRaces = predictions.filter((p) => p.points !== null).length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">My Predictions</h1>
          <p className="text-slate-400">Your prediction history and scores</p>
        </div>

        {/* Stats summary */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 text-center">
            <div className="text-3xl font-bold text-cyan-400">{totalPoints}</div>
            <div className="text-sm text-slate-400">Total Points</div>
          </div>
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 text-center">
            <div className="text-3xl font-bold text-white">{predictions.length}</div>
            <div className="text-sm text-slate-400">Predictions Made</div>
          </div>
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 text-center">
            <div className="text-3xl font-bold text-white">{completedRaces}</div>
            <div className="text-sm text-slate-400">Races Scored</div>
          </div>
        </div>

        {predictions.length === 0 ? (
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-8 text-center">
            <History className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">
              No predictions yet
            </h2>
            <p className="text-slate-400 mb-4">
              Make your first prediction to start tracking your scores.
            </p>
            <Link
              to="/races"
              className="inline-flex px-6 py-2 bg-cyan-500 hover:bg-cyan-600 text-white font-medium rounded-lg transition-colors"
            >
              View Races
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {predictions.map((prediction) => (
              <Link
                key={prediction._id}
                to="/races/$raceId"
                params={{ raceId: prediction.raceId }}
                className="block bg-slate-800/50 border border-slate-700 rounded-xl p-4 hover:bg-slate-700/50 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm text-slate-500">
                        Round {prediction.raceRound}
                      </span>
                      {prediction.raceStatus === 'finished' ? (
                        <CheckCircle className="w-4 h-4 text-emerald-400" />
                      ) : prediction.raceStatus === 'locked' ? (
                        <Clock className="w-4 h-4 text-amber-400" />
                      ) : null}
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">
                      {prediction.raceName}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {prediction.picks.map((pick, index) => (
                        <span
                          key={pick.driverId}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-slate-700/50 rounded text-sm"
                        >
                          <span className="text-slate-500">P{index + 1}</span>
                          <span className="text-cyan-400 font-medium">{pick.code}</span>
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="text-right">
                    {prediction.points !== null ? (
                      <div className="flex items-center gap-2">
                        <Trophy className="w-5 h-5 text-yellow-400" />
                        <span className="text-2xl font-bold text-cyan-400">
                          {prediction.points}
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm text-slate-500">
                        {prediction.raceStatus === 'upcoming'
                          ? 'Awaiting race'
                          : 'Awaiting results'}
                      </span>
                    )}
                    <div className="text-xs text-slate-500 mt-1">
                      {new Date(prediction.submittedAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
