import { createFileRoute } from '@tanstack/react-router';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Trophy, Medal, Loader2 } from 'lucide-react';

export const Route = createFileRoute('/leaderboard')({
  component: LeaderboardPage,
});

function LeaderboardPage() {
  const leaderboard = useQuery(api.leaderboards.getSeasonLeaderboard, {});

  if (leaderboard === undefined) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Leaderboard</h1>
          <p className="text-slate-400">2026 Season Standings</p>
        </div>

        {leaderboard.length === 0 ? (
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-8 text-center">
            <Trophy className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">
              No scores yet
            </h2>
            <p className="text-slate-400">
              The leaderboard will populate once race results are published.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Top 3 podium */}
            {leaderboard.length >= 3 && (
              <div className="grid grid-cols-3 gap-3 mb-6">
                {/* 2nd place */}
                <div className="bg-slate-800/50 border border-slate-600 rounded-xl p-4 text-center mt-8">
                  <div className="w-12 h-12 bg-slate-400/20 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Medal className="w-6 h-6 text-slate-300" />
                  </div>
                  <div className="text-2xl font-bold text-slate-300">2nd</div>
                  <div className="text-white font-medium truncate mt-1">
                    {leaderboard[1].displayName}
                  </div>
                  <div className="text-cyan-400 font-bold text-lg">
                    {leaderboard[1].points} pts
                  </div>
                  <div className="text-slate-500 text-xs">
                    {leaderboard[1].raceCount} race{leaderboard[1].raceCount !== 1 ? 's' : ''}
                  </div>
                </div>

                {/* 1st place */}
                <div className="bg-gradient-to-b from-yellow-500/20 to-slate-800/50 border border-yellow-500/30 rounded-xl p-4 text-center">
                  <div className="w-14 h-14 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Trophy className="w-8 h-8 text-yellow-400" />
                  </div>
                  <div className="text-2xl font-bold text-yellow-400">1st</div>
                  <div className="text-white font-semibold truncate mt-1">
                    {leaderboard[0].displayName}
                  </div>
                  <div className="text-cyan-400 font-bold text-xl">
                    {leaderboard[0].points} pts
                  </div>
                  <div className="text-slate-500 text-xs">
                    {leaderboard[0].raceCount} race{leaderboard[0].raceCount !== 1 ? 's' : ''}
                  </div>
                </div>

                {/* 3rd place */}
                <div className="bg-slate-800/50 border border-orange-700/30 rounded-xl p-4 text-center mt-12">
                  <div className="w-12 h-12 bg-orange-700/20 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Medal className="w-6 h-6 text-orange-600" />
                  </div>
                  <div className="text-2xl font-bold text-orange-600">3rd</div>
                  <div className="text-white font-medium truncate mt-1">
                    {leaderboard[2].displayName}
                  </div>
                  <div className="text-cyan-400 font-bold text-lg">
                    {leaderboard[2].points} pts
                  </div>
                  <div className="text-slate-500 text-xs">
                    {leaderboard[2].raceCount} race{leaderboard[2].raceCount !== 1 ? 's' : ''}
                  </div>
                </div>
              </div>
            )}

            {/* Rest of leaderboard */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-400">
                      Rank
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-400">
                      Player
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-slate-400">
                      Races
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-slate-400">
                      Points
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.slice(leaderboard.length >= 3 ? 3 : 0).map((entry) => (
                    <tr
                      key={entry.userId}
                      className="border-b border-slate-700/50 last:border-0 hover:bg-slate-700/30 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <span className="text-slate-500 font-medium">
                          {entry.rank}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-white font-medium">
                          {entry.displayName}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="text-slate-400 text-sm">
                          {entry.raceCount}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="text-cyan-400 font-bold">
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
                      className="flex items-center justify-between py-2 border-b border-slate-700/50 last:border-0"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-700 text-slate-300 font-bold text-sm">
                          {entry.rank}
                        </span>
                        <span className="text-white font-medium">
                          {entry.displayName}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-cyan-400 font-bold">{entry.points} pts</div>
                        <div className="text-slate-500 text-xs">
                          {entry.raceCount} race{entry.raceCount !== 1 ? 's' : ''}
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
