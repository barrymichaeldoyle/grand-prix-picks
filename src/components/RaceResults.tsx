import { useQuery } from 'convex/react';
import { Check, Minus, Trophy, X } from 'lucide-react';

import { api } from '../../convex/_generated/api';
import type { Id } from '../../convex/_generated/dataModel';
import { InlineLoader } from './InlineLoader';

interface RaceResultsProps {
  raceId: Id<'races'>;
}

export function RaceResults({ raceId }: RaceResultsProps) {
  const result = useQuery(api.results.getResultForRace, { raceId });
  const myScore = useQuery(api.results.getMyScoreForRace, { raceId });

  if (result === undefined) {
    return <InlineLoader />;
  }

  if (!result) {
    return (
      <div className="rounded-lg border-2 border-dashed border-border py-8 text-center">
        <p className="text-text-muted">Results not yet published</p>
      </div>
    );
  }

  const top5 = result.enrichedClassification.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Official Results */}
      <div>
        <h3 className="mb-3 text-lg font-semibold text-text">
          Official Results
        </h3>
        <div className="grid grid-cols-5 gap-2">
          {top5.map((entry) => (
            <div
              key={entry.driverId}
              className={`rounded-lg border p-3 text-center ${
                entry.position === 1
                  ? 'border-warning/30 bg-warning-muted'
                  : entry.position === 2
                    ? 'border-border bg-surface-muted'
                    : entry.position === 3
                      ? 'border-warning/20 bg-warning-muted/70'
                      : 'border-border bg-surface'
              }`}
            >
              <div className="mb-1 text-sm text-text-muted">
                P{entry.position}
              </div>
              <div className="text-lg font-bold text-accent">{entry.code}</div>
              <div className="truncate text-xs text-text-muted">
                {entry.displayName.split(' ').pop()}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* My Score */}
      {myScore && (
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-text">Your Score</h3>
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-accent" />
              <span className="text-2xl font-bold text-accent">
                {myScore.points} pts
              </span>
            </div>
          </div>

          {myScore.enrichedBreakdown && (
            <div className="overflow-hidden rounded-lg border border-border bg-surface">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border text-sm">
                    <th className="px-4 py-2 text-left text-text-muted">
                      Your Pick
                    </th>
                    <th className="px-4 py-2 text-center text-text-muted">
                      Predicted
                    </th>
                    <th className="px-4 py-2 text-center text-text-muted">
                      Actual
                    </th>
                    <th className="px-4 py-2 text-right text-text-muted">
                      Points
                    </th>
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
                        className="border-b border-border last:border-0"
                      >
                        <td className="px-4 py-3">
                          <span className="font-medium text-text">
                            {item.displayName}
                          </span>
                          <span className="ml-2 text-sm text-text-muted">
                            {item.code}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="text-text-muted">
                            P{item.predictedPosition}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          {item.actualPosition ? (
                            <span
                              className={
                                diff === 0
                                  ? 'font-medium text-success'
                                  : diff === 1
                                    ? 'text-warning'
                                    : 'text-text-muted'
                              }
                            >
                              P{item.actualPosition}
                            </span>
                          ) : (
                            <span className="text-error">Outside top 5</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {item.points === 5 ? (
                              <Check className="h-4 w-4 text-success" />
                            ) : item.points === 3 ? (
                              <Minus className="h-4 w-4 text-warning" />
                            ) : item.points === 1 ? (
                              <Minus className="h-4 w-4 text-text-muted" />
                            ) : (
                              <X className="h-4 w-4 text-error" />
                            )}
                            <span
                              className={`font-bold ${
                                item.points === 5
                                  ? 'text-success'
                                  : item.points === 3
                                    ? 'text-warning'
                                    : item.points === 1
                                      ? 'text-text-muted'
                                      : 'text-error'
                              }`}
                            >
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

          <div className="mt-3 text-sm text-text-muted">
            <span className="mr-4 inline-flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-success"></span>
              Exact match: 5 pts
            </span>
            <span className="mr-4 inline-flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-warning"></span>
              Off by 1: 3 pts
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-text-muted"></span>
              In top 5: 1 pt
            </span>
          </div>
        </div>
      )}

      {!myScore && (
        <div className="rounded-lg border border-border bg-surface-muted p-4 text-center">
          <p className="text-text-muted">
            You didn't submit a prediction for this race
          </p>
        </div>
      )}
    </div>
  );
}
