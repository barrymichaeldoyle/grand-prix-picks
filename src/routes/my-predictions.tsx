import { SignInButton, useAuth } from '@clerk/clerk-react';
import { createFileRoute,Link } from '@tanstack/react-router';
import { useQuery } from 'convex/react';
import { CheckCircle, Clock, History, LogIn, Trophy } from 'lucide-react';

import { api } from '../../convex/_generated/api';
import Button, { primaryButtonStyles } from '../components/Button';
import PageLoader from '../components/PageLoader';

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
  const predictions = useQuery(
    api.predictions.myPredictionHistory,
    isSignedIn ? {} : 'skip',
  );

  if (!isLoaded) {
    return <PageLoader />;
  }

  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-page">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-surface border border-border rounded-xl p-8 text-center">
            <LogIn className="w-16 h-16 text-text-muted mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-text mb-2">
              Sign In Required
            </h1>
            <p className="text-text-muted mb-4">
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

  if (predictions === undefined) {
    return <PageLoader />;
  }

  const totalPoints = predictions.reduce((sum, p) => sum + (p.points ?? 0), 0);
  const completedRaces = predictions.filter((p) => p.points !== null).length;

  return (
    <div className="min-h-screen bg-page">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text mb-2">My Predictions</h1>
          <p className="text-text-muted">Your prediction history and scores</p>
        </div>

        {/* Stats summary */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-surface border border-border rounded-xl p-4 text-center">
            <div className="text-3xl font-bold text-accent">{totalPoints}</div>
            <div className="text-sm text-text-muted">Total Points</div>
          </div>
          <div className="bg-surface border border-border rounded-xl p-4 text-center">
            <div className="text-3xl font-bold text-text">
              {predictions.length}
            </div>
            <div className="text-sm text-text-muted">Predictions Made</div>
          </div>
          <div className="bg-surface border border-border rounded-xl p-4 text-center">
            <div className="text-3xl font-bold text-text">{completedRaces}</div>
            <div className="text-sm text-text-muted">Races Scored</div>
          </div>
        </div>

        {predictions.length === 0 ? (
          <div className="bg-surface border border-border rounded-xl p-8 text-center">
            <History className="w-16 h-16 text-text-muted mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-text mb-2">
              No predictions yet
            </h2>
            <p className="text-text-muted mb-4">
              Make your first prediction to start tracking your scores.
            </p>
            <Link to="/races" className={primaryButtonStyles('sm')}>
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
                className="block bg-surface border border-border rounded-xl p-4 hover:bg-surface-muted transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm text-text-muted">
                        Round {prediction.raceRound}
                      </span>
                      {prediction.raceStatus === 'finished' ? (
                        <CheckCircle className="w-4 h-4 text-success" />
                      ) : prediction.raceStatus === 'locked' ? (
                        <Clock className="w-4 h-4 text-warning" />
                      ) : null}
                    </div>
                    <h3 className="text-lg font-semibold text-text mb-2">
                      {prediction.raceName}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {prediction.picks.map((pick, index) => (
                        <span
                          key={pick.driverId}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-surface-muted rounded text-sm"
                        >
                          <span className="text-text-muted">P{index + 1}</span>
                          <span className="text-accent font-medium">
                            {pick.code}
                          </span>
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="text-right">
                    {prediction.points !== null ? (
                      <div className="flex items-center gap-2">
                        <Trophy className="w-5 h-5 text-accent" />
                        <span className="text-2xl font-bold text-accent">
                          {prediction.points}
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm text-text-muted">
                        {prediction.raceStatus === 'upcoming'
                          ? 'Awaiting race'
                          : 'Awaiting results'}
                      </span>
                    )}
                    <div className="text-xs text-text-muted mt-1">
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
