import { createFileRoute } from '@tanstack/react-router';
import { useQuery } from 'convex/react';
import { Medal, Trophy } from 'lucide-react';

import { api } from '../../convex/_generated/api';
import PageLoader from '../components/PageLoader';

export const Route = createFileRoute('/leaderboard')({
  component: LeaderboardPage,
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
  const leaderboard = useQuery(api.leaderboards.getSeasonLeaderboard, {});

  if (leaderboard === undefined) {
    return <PageLoader />;
  }

  return (
    <div className="min-h-screen bg-page">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text mb-2">Leaderboard</h1>
          <p className="text-text-muted">2026 Season Standings</p>
        </div>

        {leaderboard.length === 0 ? (
          <div
            className="bg-surface border border-border rounded-xl p-8 text-center"
            data-testid="leaderboard-empty"
          >
            <Trophy className="w-16 h-16 text-text-muted mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-text mb-2">
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
              <div className="grid grid-cols-3 gap-3 mb-6">
                {/* 2nd place */}
                <div className="bg-surface border border-border rounded-xl p-4 text-center mt-8">
                  <div className="w-12 h-12 bg-surface-muted rounded-full flex items-center justify-center mx-auto mb-2">
                    <Medal className="w-6 h-6 text-text-muted" />
                  </div>
                  <div className="text-2xl font-bold text-text-muted">2nd</div>
                  <div className="text-text font-medium truncate mt-1">
                    {leaderboard[1].displayName}
                  </div>
                  <div className="text-accent font-bold text-lg">
                    {leaderboard[1].points} pts
                  </div>
                  <div className="text-text-muted text-xs">
                    {leaderboard[1].raceCount} race
                    {leaderboard[1].raceCount !== 1 ? 's' : ''}
                  </div>
                </div>

                {/* 1st place */}
                <div className="bg-surface border border-warning/30 rounded-xl p-4 text-center">
                  <div className="w-14 h-14 bg-warning-muted rounded-full flex items-center justify-center mx-auto mb-2">
                    <Trophy className="w-8 h-8 text-warning" />
                  </div>
                  <div className="text-2xl font-bold text-warning">1st</div>
                  <div className="text-text font-semibold truncate mt-1">
                    {leaderboard[0].displayName}
                  </div>
                  <div className="text-accent font-bold text-xl">
                    {leaderboard[0].points} pts
                  </div>
                  <div className="text-text-muted text-xs">
                    {leaderboard[0].raceCount} race
                    {leaderboard[0].raceCount !== 1 ? 's' : ''}
                  </div>
                </div>

                {/* 3rd place */}
                <div className="bg-surface border border-border rounded-xl p-4 text-center mt-12">
                  <div className="w-12 h-12 bg-warning-muted rounded-full flex items-center justify-center mx-auto mb-2">
                    <Medal className="w-6 h-6 text-warning" />
                  </div>
                  <div className="text-2xl font-bold text-warning">3rd</div>
                  <div className="text-text font-medium truncate mt-1">
                    {leaderboard[2].displayName}
                  </div>
                  <div className="text-accent font-bold text-lg">
                    {leaderboard[2].points} pts
                  </div>
                  <div className="text-text-muted text-xs">
                    {leaderboard[2].raceCount} race
                    {leaderboard[2].raceCount !== 1 ? 's' : ''}
                  </div>
                </div>
              </div>
            )}

            {/* Rest of leaderboard */}
            <div className="bg-surface border border-border rounded-xl overflow-hidden">
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
                        className="border-b border-border last:border-0 hover:bg-surface-muted transition-colors"
                        data-testid="leaderboard-entry"
                      >
                        <td className="px-4 py-3" data-testid="position">
                          <span className="text-text-muted font-medium">
                            {entry.rank}
                          </span>
                        </td>
                        <td className="px-4 py-3" data-testid="username">
                          <span className="text-text font-medium">
                            {entry.displayName}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="text-text-muted text-sm">
                            {entry.raceCount}
                          </span>
                        </td>
                        <td
                          className="px-4 py-3 text-right"
                          data-testid="points"
                        >
                          <span className="text-accent font-bold">
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
                      className="flex items-center justify-between py-2 border-b border-border last:border-0"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 flex items-center justify-center rounded-full bg-surface-muted text-text-muted font-bold text-sm">
                          {entry.rank}
                        </span>
                        <span className="text-text font-medium">
                          {entry.displayName}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-accent font-bold">
                          {entry.points} pts
                        </div>
                        <div className="text-text-muted text-xs">
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
