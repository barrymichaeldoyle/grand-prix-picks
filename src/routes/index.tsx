import { createFileRoute, Link } from '@tanstack/react-router';
import { ConvexHttpClient } from 'convex/browser';
import {
  ChevronRight,
  Clock,
  Flag,
  HelpCircle,
  Lock,
  Target,
  Trophy,
  Users,
} from 'lucide-react';

import { api } from '../../convex/_generated/api';
import { primaryButtonStyles } from '../components/Button';
import RaceCard from '../components/RaceCard';

const convex = new ConvexHttpClient(import.meta.env.VITE_CONVEX_URL);

export const Route = createFileRoute('/')({
  component: HomePage,
  loader: async () => {
    const nextRace = await convex.query(api.races.getNextRace);
    return { nextRace };
  },
  head: () => ({
    meta: [
      { title: 'Grand Prix Picks - F1 Prediction Game' },
      {
        name: 'description',
        content:
          'Predict the top 5 finishers for each Formula 1 race and compete with friends throughout the 2026 season.',
      },
    ],
  }),
});

function HomePage() {
  const { nextRace } = Route.useLoaderData();

  return (
    <div className="min-h-screen bg-page">
      {/* Hero Section */}
      <section className="relative py-16 px-6 text-center overflow-hidden">
        <div className="relative max-w-3xl mx-auto">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Flag className="w-12 h-12 text-accent" />
            <h1 className="text-4xl md:text-5xl font-black text-text tracking-tight">
              Grand Prix Picks
            </h1>
          </div>
          <p className="text-xl text-text-muted mb-8">
            Predict the top 5 finishers for each Formula 1 race and compete with
            friends throughout the 2026 season.
          </p>
          <Link
            to="/races"
            className={`${primaryButtonStyles('md')} shadow-md`}
          >
            View Races
            <ChevronRight size={20} />
          </Link>
        </div>
      </section>

      {/* Next Race Section */}
      <section className="px-6 pb-12 max-w-4xl mx-auto">
        <h2 className="text-lg font-semibold text-text-muted mb-4">
          Next Race
        </h2>
        {nextRace ? (
          <RaceCard race={nextRace} isNext />
        ) : (
          <div className="bg-surface border border-border rounded-xl p-6 text-center">
            <p className="text-text-muted">No upcoming races scheduled</p>
          </div>
        )}
      </section>

      {/* How It Works */}
      <section className="py-12 px-6 max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold text-text text-center mb-8">
          How It Works
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-surface border border-border rounded-xl p-6 text-center">
            <div className="w-12 h-12 bg-accent-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Flag className="w-6 h-6 text-accent" />
            </div>
            <h3 className="text-lg font-semibold text-text mb-2">
              Pick Your Top 5
            </h3>
            <p className="text-text-muted text-sm">
              Before each race, select the 5 drivers you think will finish in
              the top positions.
            </p>
          </div>

          <div className="bg-surface border border-border rounded-xl p-6 text-center">
            <div className="w-12 h-12 bg-accent-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Trophy className="w-6 h-6 text-accent" />
            </div>
            <h3 className="text-lg font-semibold text-text mb-2">
              Earn Points
            </h3>
            <p className="text-text-muted text-sm">
              Score points based on how accurate your predictions are. Exact
              position matches earn the most.
            </p>
          </div>

          <div className="bg-surface border border-border rounded-xl p-6 text-center">
            <div className="w-12 h-12 bg-accent-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-6 h-6 text-accent" />
            </div>
            <h3 className="text-lg font-semibold text-text mb-2">
              Climb the Leaderboard
            </h3>
            <p className="text-text-muted text-sm">
              Compete against other fans throughout the season to see who knows
              F1 best.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-12 px-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-center gap-2 mb-8">
          <HelpCircle className="w-6 h-6 text-accent" />
          <h2 className="text-2xl font-bold text-text text-center">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-4">
          <div className="bg-surface border border-border rounded-xl p-6">
            <h3 className="flex items-center gap-3 text-lg font-semibold text-text mb-3">
              <Target className="w-5 h-5 text-accent shrink-0" />
              How does scoring work?
            </h3>
            <div className="pl-8">
              <p className="text-text-muted mb-3">
                Points are awarded based on how close your predictions are to
                the actual race results:
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <span className="w-16 font-bold text-accent">5 points</span>
                  <span className="text-text-muted">Exact position match</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-16 font-bold text-accent">3 points</span>
                  <span className="text-text-muted">Off by one position</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-16 font-bold text-accent">1 point</span>
                  <span className="text-text-muted">
                    Driver finishes in top 5, but off by 2+ positions
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-16 font-bold text-text-muted">
                    0 points
                  </span>
                  <span className="text-text-muted">
                    Driver finishes outside the top 5
                  </span>
                </li>
              </ul>
              <p className="text-text-muted mt-3 text-sm">
                Maximum possible score per race: 25 points (all 5 predictions
                exactly correct).
              </p>
            </div>
          </div>

          <div className="bg-surface border border-border rounded-xl p-6">
            <h3 className="flex items-center gap-3 text-lg font-semibold text-text mb-3">
              <Lock className="w-5 h-5 text-accent shrink-0" />
              When do predictions lock?
            </h3>
            <p className="text-text-muted pl-8">
              Predictions lock 1 hour before the race starts. Once locked, you
              cannot change your picks. Make sure to submit your predictions
              before the deadline!
            </p>
          </div>

          <div className="bg-surface border border-border rounded-xl p-6">
            <h3 className="flex items-center gap-3 text-lg font-semibold text-text mb-3">
              <Clock className="w-5 h-5 text-accent shrink-0" />
              When can I make predictions?
            </h3>
            <p className="text-text-muted pl-8">
              You can only predict for the next upcoming race. Predictions for
              future races open once the current race begins. This keeps things
              fair and prevents early predictions based on outdated information.
            </p>
          </div>

          <div className="bg-surface border border-border rounded-xl p-6">
            <h3 className="flex items-center gap-3 text-lg font-semibold text-text mb-3">
              <Trophy className="w-5 h-5 text-accent shrink-0" />
              How is the leaderboard calculated?
            </h3>
            <p className="text-text-muted pl-8">
              Your total season score is the sum of all your race scores. The
              leaderboard ranks players by total points. Compete throughout the
              entire 2026 season to claim the top spot!
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
