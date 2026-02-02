import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import type { Id } from '../../convex/_generated/dataModel';
import { Trophy, Check, Minus, X, Loader2 } from 'lucide-react';

interface RaceResultsProps {
  raceId: Id<'races'>;
}

export default function RaceResults({ raceId }: RaceResultsProps) {
  const result = useQuery(api.results.getResultForRace, { raceId });
  const myScore = useQuery(api.results.getMyScoreForRace, { raceId });

  if (result === undefined) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 text-cyan-400 animate-spin" />
      </div>
    );
  }

  if (!result) {
    return (
      <div className="text-center py-8 border-2 border-dashed border-slate-700 rounded-lg">
        <p className="text-slate-500">Results not yet published</p>
      </div>
    );
  }

  const top5 = result.enrichedClassification.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Official Results */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-3">Official Results</h3>
        <div className="grid grid-cols-5 gap-2">
          {top5.map((entry) => (
            <div
              key={entry.driverId}
              className={`p-3 rounded-lg border text-center ${
                entry.position === 1
                  ? 'bg-yellow-500/10 border-yellow-500/30'
                  : entry.position === 2
                    ? 'bg-slate-400/10 border-slate-400/30'
                    : entry.position === 3
                      ? 'bg-orange-600/10 border-orange-600/30'
                      : 'bg-slate-800/50 border-slate-700'
              }`}
            >
              <div className="text-sm text-slate-400 mb-1">P{entry.position}</div>
              <div className="text-lg font-bold text-cyan-400">{entry.code}</div>
              <div className="text-xs text-slate-500 truncate">{entry.displayName.split(' ').pop()}</div>
            </div>
          ))}
        </div>
      </div>

      {/* My Score */}
      {myScore && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-white">Your Score</h3>
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-cyan-400" />
              <span className="text-2xl font-bold text-cyan-400">{myScore.points} pts</span>
            </div>
          </div>

          {myScore.enrichedBreakdown && (
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700 text-sm">
                    <th className="px-4 py-2 text-left text-slate-400">Your Pick</th>
                    <th className="px-4 py-2 text-center text-slate-400">Predicted</th>
                    <th className="px-4 py-2 text-center text-slate-400">Actual</th>
                    <th className="px-4 py-2 text-right text-slate-400">Points</th>
                  </tr>
                </thead>
                <tbody>
                  {myScore.enrichedBreakdown.map((item, index) => {
                    const diff = item.actualPosition
                      ? Math.abs(item.predictedPosition - item.actualPosition)
                      : null;

                    return (
                      <tr
                        key={index}
                        className="border-b border-slate-700/50 last:border-0"
                      >
                        <td className="px-4 py-3">
                          <span className="text-white font-medium">{item.displayName}</span>
                          <span className="ml-2 text-slate-500 text-sm">{item.code}</span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="text-slate-300">P{item.predictedPosition}</span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          {item.actualPosition ? (
                            <span className={
                              diff === 0
                                ? 'text-emerald-400 font-medium'
                                : diff === 1
                                  ? 'text-amber-400'
                                  : 'text-slate-400'
                            }>
                              P{item.actualPosition}
                            </span>
                          ) : (
                            <span className="text-red-400">Outside top 5</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {item.points === 5 ? (
                              <Check className="w-4 h-4 text-emerald-400" />
                            ) : item.points === 3 ? (
                              <Minus className="w-4 h-4 text-amber-400" />
                            ) : item.points === 1 ? (
                              <Minus className="w-4 h-4 text-slate-400" />
                            ) : (
                              <X className="w-4 h-4 text-red-400" />
                            )}
                            <span className={`font-bold ${
                              item.points === 5
                                ? 'text-emerald-400'
                                : item.points === 3
                                  ? 'text-amber-400'
                                  : item.points === 1
                                    ? 'text-slate-400'
                                    : 'text-red-400'
                            }`}>
                              +{item.points}
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          <div className="mt-3 text-sm text-slate-500">
            <span className="inline-flex items-center gap-1 mr-4">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              Exact match: 5 pts
            </span>
            <span className="inline-flex items-center gap-1 mr-4">
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              Off by 1: 3 pts
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-slate-400"></span>
              In top 5: 1 pt
            </span>
          </div>
        </div>
      )}

      {!myScore && (
        <div className="bg-slate-800/30 border border-slate-700 rounded-lg p-4 text-center">
          <p className="text-slate-400">You didn't submit a prediction for this race</p>
        </div>
      )}
    </div>
  );
}
