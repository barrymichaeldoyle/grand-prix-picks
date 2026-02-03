import { createFileRoute } from '@tanstack/react-router';
import { ConvexHttpClient } from 'convex/browser';
import { Medal, Trophy } from 'lucide-react';

import { api } from '../../convex/_generated/api';

const convex = new ConvexHttpClient(import.meta.env.VITE_CONVEX_URL);

export const Route = createFileRoute('/leaderboard')({
  component: LeaderboardPage,
  loader: async () => {
    const leaderboard = await convex.query(
      api.leaderboards.getSeasonLeaderboard,
      {},
    );
    return { leaderboard };
  },
  head: () => ({
    meta: [
      { title: 'Leaderboard | Grand Prix Picks' },
      {
        name: 'description',
        content:
          'See who tops the 2026 F1 prediction standings. Track your ranking against other players.',
      },
    ],
  }),
});

function LeaderboardPage() {
  const { leaderboard } = Route.useLoaderData();

  return (
    <div className="min-h-screen bg-page">
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-text">Leaderboard</h1>
          <p className="text-text-muted">2026 Season Standings</p>
        </div>

        {leaderboard.length === 0 ? (
          <div
            className="rounded-xl border border-border bg-surface p-8 text-center"
            data-testid="leaderboard-empty"
          >
            <Trophy className="mx-auto mb-4 h-16 w-16 text-text-muted" />
            <h2 className="mb-2 text-xl font-semibold text-text">
              No scores yet
            </h2>
            <p className="text-text-muted">
              The leaderboard will populate once race results are published.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Top 3 podium */}
            {leaderboard.length >= 3 && (
              <div className="mb-6 grid grid-cols-3 gap-3">
                {/* 2nd place */}
                <div className="mt-8 rounded-xl border border-border bg-surface p-4 text-center">
                  <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-surface-muted">
                    <Medal className="h-6 w-6 text-text-muted" />
                  </div>
                  <div className="text-2xl font-bold text-text-muted">2nd</div>
                  <div className="mt-1 truncate font-medium text-text">
                    {leaderboard[1].displayName}
                  </div>
                  <div className="text-lg font-bold text-accent">
                    {leaderboard[1].points} pts
                  </div>
                  <div className="text-xs text-text-muted">
                    {leaderboard[1].raceCount} race
                    {leaderboard[1].raceCount !== 1 ? 's' : ''}
                  </div>
                </div>

                {/* 1st place */}
                <div className="rounded-xl border border-warning/30 bg-surface p-4 text-center">
                  <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-warning-muted">
                    <Trophy className="h-8 w-8 text-warning" />
                  </div>
                  <div className="text-2xl font-bold text-warning">1st</div>
                  <div className="mt-1 truncate font-semibold text-text">
                    {leaderboard[0].displayName}
                  </div>
                  <div className="text-xl font-bold text-accent">
                    {leaderboard[0].points} pts
                  </div>
                  <div className="text-xs text-text-muted">
                    {leaderboard[0].raceCount} race
                    {leaderboard[0].raceCount !== 1 ? 's' : ''}
                  </div>
                </div>

                {/* 3rd place */}
                <div className="mt-12 rounded-xl border border-border bg-surface p-4 text-center">
                  <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-warning-muted">
                    <Medal className="h-6 w-6 text-warning" />
                  </div>
                  <div className="text-2xl font-bold text-warning">3rd</div>
                  <div className="mt-1 truncate font-medium text-text">
                    {leaderboard[2].displayName}
                  </div>
                  <div className="text-lg font-bold text-accent">
                    {leaderboard[2].points} pts
                  </div>
                  <div className="text-xs text-text-muted">
                    {leaderboard[2].raceCount} race
                    {leaderboard[2].raceCount !== 1 ? 's' : ''}
                  </div>
                </div>
              </div>
            )}

            {/* Rest of leaderboard */}
            <div className="overflow-hidden rounded-xl border border-border bg-surface">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-4 py-3 text-left text-sm font-semibold text-text-muted">
                      Rank
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-text-muted">
                      Player
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-text-muted">
                      Races
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-text-muted">
                      Points
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard
                    .slice(leaderboard.length >= 3 ? 3 : 0)
                    .map((entry) => (
                      <tr
                        key={entry.userId}
                        className="border-b border-border transition-colors last:border-0 hover:bg-surface-muted"
                        data-testid="leaderboard-entry"
                      >
                        <td className="px-4 py-3" data-testid="position">
                          <span className="font-medium text-text-muted">
                            {entry.rank}
                          </span>
                        </td>
                        <td className="px-4 py-3" data-testid="username">
                          <span className="font-medium text-text">
                            {entry.displayName}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="text-sm text-text-muted">
                            {entry.raceCount}
                          </span>
                        </td>
                        <td
                          className="px-4 py-3 text-right"
                          data-testid="points"
                        >
                          <span className="font-bold text-accent">
                            {entry.points}
                          </span>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>

              {leaderboard.length <= 3 && leaderboard.length > 0 && (
                <div className="p-4">
                  {leaderboard.map((entry) => (
                    <div
                      key={entry.userId}
                      className="flex items-center justify-between border-b border-border py-2 last:border-0"
                    >
                      <div className="flex items-center gap-3">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-muted text-sm font-bold text-text-muted">
                          {entry.rank}
                        </span>
                        <span className="font-medium text-text">
                          {entry.displayName}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-accent">
                          {entry.points} pts
                        </div>
                        <div className="text-xs text-text-muted">
                          {entry.raceCount} race
                          {entry.raceCount !== 1 ? 's' : ''}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
