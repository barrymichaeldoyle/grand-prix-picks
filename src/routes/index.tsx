import { createFileRoute, Link } from '@tanstack/react-router';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Flag, Trophy, Users, ChevronRight, Loader2 } from 'lucide-react';
import RaceCard from '../components/RaceCard';

export const Route = createFileRoute('/')({ component: HomePage });

function HomePage() {
  const nextRace = useQuery(api.races.getNextRace);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      {/* Hero Section */}
      <section className="relative py-16 px-6 text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-purple-500/10"></div>
        <div className="relative max-w-3xl mx-auto">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Flag className="w-12 h-12 text-cyan-400" />
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">
              Grand Prix Picks
            </h1>
          </div>
          <p className="text-xl text-slate-300 mb-8">
            Predict the top 5 finishers for each Formula 1 race and compete with
            friends throughout the 2026 season.
          </p>
          <Link
            to="/races"
            className="inline-flex items-center gap-2 px-6 py-3 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold rounded-lg transition-colors shadow-lg shadow-cyan-500/30"
          >
            View Races
            <ChevronRight size={20} />
          </Link>
        </div>
      </section>

      {/* Next Race Section */}
      <section className="px-6 pb-12 max-w-4xl mx-auto">
        <h2 className="text-lg font-semibold text-slate-300 mb-4">
          Next Race
        </h2>
        {nextRace === undefined ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 text-cyan-400 animate-spin" />
          </div>
        ) : nextRace ? (
          <RaceCard race={nextRace} isNext />
        ) : (
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 text-center">
            <p className="text-slate-400">No upcoming races scheduled</p>
          </div>
        )}
      </section>

      {/* How It Works */}
      <section className="py-12 px-6 max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold text-white text-center mb-8">
          How It Works
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 text-center">
            <div className="w-12 h-12 bg-cyan-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Flag className="w-6 h-6 text-cyan-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              Pick Your Top 5
            </h3>
            <p className="text-slate-400 text-sm">
              Before each race, select the 5 drivers you think will finish in
              the top positions.
            </p>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 text-center">
            <div className="w-12 h-12 bg-cyan-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trophy className="w-6 h-6 text-cyan-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              Earn Points
            </h3>
            <p className="text-slate-400 text-sm">
              Score points based on how accurate your predictions are. Exact
              position matches earn the most.
            </p>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 text-center">
            <div className="w-12 h-12 bg-cyan-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-6 h-6 text-cyan-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              Climb the Leaderboard
            </h3>
            <p className="text-slate-400 text-sm">
              Compete against other fans throughout the season to see who knows
              F1 best.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
