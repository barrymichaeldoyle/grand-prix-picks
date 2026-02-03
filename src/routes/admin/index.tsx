import { SignInButton } from '@clerk/clerk-react';
import { createFileRoute,Link } from '@tanstack/react-router';
import { useQuery } from 'convex/react';
import { Flag, Loader2, Plus, Shield } from 'lucide-react';

import { api } from '../../../convex/_generated/api';

export const Route = createFileRoute('/admin/')({
  component: AdminPage,
});

function AdminPage() {
  const isAdmin = useQuery(api.users.amIAdmin);
  const races = useQuery(api.races.listRaces, { season: 2026 });

  if (isAdmin === undefined) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-slate-800/50 border border-red-500/30 rounded-xl p-8 text-center">
            <Shield className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-white mb-2">
              Access Denied
            </h1>
            <p className="text-slate-400 mb-4">
              You need admin privileges to access this page.
            </p>
            <SignInButton mode="modal">
              <button className="px-6 py-2 bg-cyan-500 hover:bg-cyan-600 text-white font-medium rounded-lg transition-colors">
                Sign In as Admin
              </button>
            </SignInButton>
          </div>
        </div>
      </div>
    );
  }

  const upcomingRaces = races?.filter((r) => r.status === 'upcoming') ?? [];
  const lockedRaces = races?.filter((r) => r.status === 'locked') ?? [];
  const finishedRaces = races?.filter((r) => r.status === 'finished') ?? [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Admin Dashboard
            </h1>
            <p className="text-slate-400">Manage races and publish results</p>
          </div>
          <Link
            to="/admin/races/new"
            className="flex items-center gap-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white font-medium rounded-lg transition-colors"
          >
            <Plus size={20} />
            Add Race
          </Link>
        </div>

        {races === undefined ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 text-cyan-400 animate-spin" />
          </div>
        ) : (
          <div className="space-y-8">
            {/* Locked races - need results */}
            {lockedRaces.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold text-amber-400 mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 bg-amber-400 rounded-full"></span>
                  Awaiting Results ({lockedRaces.length})
                </h2>
                <div className="space-y-2">
                  {lockedRaces.map((race) => (
                    <Link
                      key={race._id}
                      to="/admin/races/$raceId"
                      params={{ raceId: race._id }}
                      className="flex items-center justify-between p-4 bg-slate-800/50 border border-amber-500/30 rounded-lg hover:bg-slate-700/50 transition-colors"
                    >
                      <div>
                        <span className="text-slate-500 text-sm">
                          Round {race.round}
                        </span>
                        <h3 className="text-white font-medium">{race.name}</h3>
                      </div>
                      <span className="px-3 py-1 text-sm bg-amber-500/20 text-amber-400 rounded-full">
                        Publish Results
                      </span>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Upcoming races */}
            {upcomingRaces.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold text-emerald-400 mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 bg-emerald-400 rounded-full"></span>
                  Upcoming ({upcomingRaces.length})
                </h2>
                <div className="space-y-2">
                  {upcomingRaces.map((race) => (
                    <Link
                      key={race._id}
                      to="/admin/races/$raceId"
                      params={{ raceId: race._id }}
                      className="flex items-center justify-between p-4 bg-slate-800/50 border border-slate-700 rounded-lg hover:bg-slate-700/50 transition-colors"
                    >
                      <div>
                        <span className="text-slate-500 text-sm">
                          Round {race.round}
                        </span>
                        <h3 className="text-white font-medium">{race.name}</h3>
                      </div>
                      <span className="text-slate-400 text-sm">
                        {new Date(race.raceStartAt).toLocaleDateString()}
                      </span>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Finished races */}
            {finishedRaces.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold text-slate-400 mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 bg-slate-400 rounded-full"></span>
                  Completed ({finishedRaces.length})
                </h2>
                <div className="space-y-2">
                  {finishedRaces.map((race) => (
                    <Link
                      key={race._id}
                      to="/admin/races/$raceId"
                      params={{ raceId: race._id }}
                      className="flex items-center justify-between p-4 bg-slate-800/50 border border-slate-700 rounded-lg hover:bg-slate-700/50 transition-colors"
                    >
                      <div>
                        <span className="text-slate-500 text-sm">
                          Round {race.round}
                        </span>
                        <h3 className="text-white font-medium">{race.name}</h3>
                      </div>
                      <span className="px-3 py-1 text-sm bg-slate-700 text-slate-400 rounded-full">
                        Completed
                      </span>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {races.length === 0 && (
              <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-8 text-center">
                <Flag className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-white mb-2">
                  No races yet
                </h2>
                <p className="text-slate-400 mb-4">
                  Add your first race to get started
                </p>
                <Link
                  to="/admin/races/new"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white font-medium rounded-lg transition-colors"
                >
                  <Plus size={20} />
                  Add Race
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
