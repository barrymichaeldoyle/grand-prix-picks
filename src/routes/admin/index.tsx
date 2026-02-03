import { SignInButton } from '@clerk/clerk-react';
import { createFileRoute, Link } from '@tanstack/react-router';
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
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
        <div className="mx-auto max-w-4xl px-4 py-8">
          <div className="rounded-xl border border-red-500/30 bg-slate-800/50 p-8 text-center">
            <Shield className="mx-auto mb-4 h-16 w-16 text-red-400" />
            <h1 className="mb-2 text-2xl font-bold text-white">
              Access Denied
            </h1>
            <p className="mb-4 text-slate-400">
              You need admin privileges to access this page.
            </p>
            <SignInButton mode="modal">
              <button className="rounded-lg bg-cyan-500 px-6 py-2 font-medium text-white transition-colors hover:bg-cyan-600">
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
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="mb-2 text-3xl font-bold text-white">
              Admin Dashboard
            </h1>
            <p className="text-slate-400">Manage races and publish results</p>
          </div>
          <Link
            to="/admin/races/new"
            className="flex items-center gap-2 rounded-lg bg-cyan-500 px-4 py-2 font-medium text-white transition-colors hover:bg-cyan-600"
          >
            <Plus size={20} />
            Add Race
          </Link>
        </div>

        {races === undefined ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-cyan-400" />
          </div>
        ) : (
          <div className="space-y-8">
            {/* Locked races - need results */}
            {lockedRaces.length > 0 && (
              <section>
                <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-amber-400">
                  <span className="h-2 w-2 rounded-full bg-amber-400"></span>
                  Awaiting Results ({lockedRaces.length})
                </h2>
                <div className="space-y-2">
                  {lockedRaces.map((race) => (
                    <Link
                      key={race._id}
                      to="/admin/races/$raceId"
                      params={{ raceId: race._id }}
                      className="flex items-center justify-between rounded-lg border border-amber-500/30 bg-slate-800/50 p-4 transition-colors hover:bg-slate-700/50"
                    >
                      <div>
                        <span className="text-sm text-slate-500">
                          Round {race.round}
                        </span>
                        <h3 className="font-medium text-white">{race.name}</h3>
                      </div>
                      <span className="rounded-full bg-amber-500/20 px-3 py-1 text-sm text-amber-400">
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
                <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-emerald-400">
                  <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
                  Upcoming ({upcomingRaces.length})
                </h2>
                <div className="space-y-2">
                  {upcomingRaces.map((race) => (
                    <Link
                      key={race._id}
                      to="/admin/races/$raceId"
                      params={{ raceId: race._id }}
                      className="flex items-center justify-between rounded-lg border border-slate-700 bg-slate-800/50 p-4 transition-colors hover:bg-slate-700/50"
                    >
                      <div>
                        <span className="text-sm text-slate-500">
                          Round {race.round}
                        </span>
                        <h3 className="font-medium text-white">{race.name}</h3>
                      </div>
                      <span className="text-sm text-slate-400">
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
                <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-400">
                  <span className="h-2 w-2 rounded-full bg-slate-400"></span>
                  Completed ({finishedRaces.length})
                </h2>
                <div className="space-y-2">
                  {finishedRaces.map((race) => (
                    <Link
                      key={race._id}
                      to="/admin/races/$raceId"
                      params={{ raceId: race._id }}
                      className="flex items-center justify-between rounded-lg border border-slate-700 bg-slate-800/50 p-4 transition-colors hover:bg-slate-700/50"
                    >
                      <div>
                        <span className="text-sm text-slate-500">
                          Round {race.round}
                        </span>
                        <h3 className="font-medium text-white">{race.name}</h3>
                      </div>
                      <span className="rounded-full bg-slate-700 px-3 py-1 text-sm text-slate-400">
                        Completed
                      </span>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {races.length === 0 && (
              <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-8 text-center">
                <Flag className="mx-auto mb-4 h-16 w-16 text-slate-600" />
                <h2 className="mb-2 text-xl font-semibold text-white">
                  No races yet
                </h2>
                <p className="mb-4 text-slate-400">
                  Add your first race to get started
                </p>
                <Link
                  to="/admin/races/new"
                  className="inline-flex items-center gap-2 rounded-lg bg-cyan-500 px-4 py-2 font-medium text-white transition-colors hover:bg-cyan-600"
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
