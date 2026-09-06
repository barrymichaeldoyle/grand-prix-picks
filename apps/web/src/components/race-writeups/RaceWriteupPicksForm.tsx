import { api } from '@convex-generated/api';
import type { Id } from '@convex-generated/dataModel';

import { InlineLoader } from '@/components/InlineLoader';
import { H2HPredictionForm } from '@/components/H2HPredictionForm';
import { PredictionForm } from '@/components/PredictionForm';
import { useQuery } from '@/integrations/convex/query';
import type { RaceWriteupPhase } from '@/lib/raceWriteupPhase';

export function RaceWriteupPicksForm({
  analyticsSource,
  phase,
  raceId,
  round,
  season,
}: {
  /** Which page the picker is embedded in, for the conversion funnel. */
  analyticsSource: 'writeup' | 'predictions_hub';
  phase: RaceWriteupPhase;
  raceId: Id<'races'>;
  round: number;
  season: number;
}) {
  const drivers = useQuery(api.drivers.listDrivers, {
    round,
    season,
    includeNotRacing: true,
  });
  const weekendPredictions = useQuery(api.predictions.myWeekendPredictions, {
    raceId,
  });
  const matchups = useQuery(api.h2h.getMatchupsForSeason, { round, season });
  const h2hPredictions = useQuery(api.h2h.myH2HPredictionsForRace, { raceId });

  if (drivers === undefined || weekendPredictions === undefined) {
    return (
      <InlineLoader
        label="Loading the prediction picker"
        className="min-h-96"
      />
    );
  }

  const sessionType = phase === 'race-picks' ? ('race' as const) : undefined;
  const predictions = weekendPredictions?.predictions;
  const existingPicks = sessionType
    ? predictions?.race
    : (predictions?.quali ?? predictions?.race);
  const existingH2HPicks = sessionType
    ? (h2hPredictions?.race ?? undefined)
    : (h2hPredictions?.quali ?? h2hPredictions?.race ?? undefined);

  return (
    <>
      <PredictionForm
        raceId={raceId}
        initialDrivers={drivers}
        existingPicks={existingPicks ?? undefined}
        sessionType={sessionType}
        analyticsSource={analyticsSource}
        mobileActionFirst
      />

      {/* Stacked under the Top 5 rather than gated behind a "continue" step.
          The two are separate games on one weekend, and a visitor who has been
          told the site has team-mate battles should be able to see and play
          them by scrolling, not by first finishing a Top 5 they may not have
          come for. */}
      <section
        aria-labelledby="race-writeup-h2h-heading"
        className="mt-10 border-t border-border pt-8"
      >
        <h3
          id="race-writeup-h2h-heading"
          className="font-title text-xl font-medium text-text"
        >
          Team-mate battles
        </h3>
        <p className="gpp-reading-copy mt-2 max-w-2xl text-text-muted">
          Pick who finishes ahead in each team. One point for every one you get
          right.
        </p>

        <div className="mt-6">
          {matchups === undefined || h2hPredictions === undefined ? (
            <InlineLoader
              label="Loading the team-mate battles"
              className="min-h-64"
            />
          ) : matchups.length === 0 ? (
            <p className="text-base text-text-muted">
              Team-mate battles open once the grid for this round is confirmed.
            </p>
          ) : (
            <H2HPredictionForm
              raceId={raceId}
              matchups={matchups}
              sessionType={sessionType}
              existingPicks={existingH2HPicks}
              analyticsSource={analyticsSource}
            />
          )}
        </div>
      </section>
    </>
  );
}
