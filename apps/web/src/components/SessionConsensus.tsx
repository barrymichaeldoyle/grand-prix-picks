import { scoreTopFive } from '@grandprixpicks/shared/scoring';

import { DriverBadge } from '@/components/DriverBadge';
import type { SessionType } from '@/lib/sessions';
import { SESSION_LABELS } from '@/lib/sessions';

export type SessionConsensusData = {
  entrants: number;
  lockAt: number;
  sampled: boolean;
  drivers: {
    driverId: string;
    code: string;
    displayName: string;
    team: string | null;
    slots: number[];
    picks: number;
    pickRate: number;
    consensusPosition: number;
  }[];
};

type ConsensusSession = {
  session: SessionType;
  consensus: SessionConsensusData;
  /** Published finishing order, when there is one. */
  classification?: { driverId: string }[];
};

/** Rows shown per session. Beyond the top five the pick rate tails into noise. */
const ROWS = 8;

/** How the crowd's own top five would have scored, on the same 5/3/1/0. */
function crowdScore({ consensus, classification }: ConsensusSession) {
  if (!classification?.length) {
    return null;
  }
  return scoreTopFive({
    picks: consensus.drivers.slice(0, 5).map((driver) => driver.driverId),
    classification: classification.map((entry) => entry.driverId),
  }).total;
}

function ConsensusTable({
  session,
  consensus,
  classification,
}: ConsensusSession) {
  const score = crowdScore({ session, consensus, classification });
  return (
    <section className="mt-6">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h3 className="text-sm font-semibold text-text">
          {SESSION_LABELS[session]}
        </h3>
        <p className="text-xs text-text-muted">
          {/* `sampled` means the query hit its read cap, so the count is a
              floor and the percentages describe that sample. Saying so beats
              presenting a partial count as a total. */}
          {consensus.sampled ? 'First ' : ''}
          {consensus.entrants} entries
          {score !== null && `, worth ${score} of 25`}
        </p>
      </div>
      <div className="mt-2 overflow-x-auto">
        <table className="w-full min-w-[20rem] border-collapse">
          <caption className="sr-only">
            {SESSION_LABELS[session]} pick rates, in the order players
            collectively placed the drivers
          </caption>
          <thead>
            <tr className="border-b border-border">
              <th
                scope="col"
                className="w-14 px-3 py-1.5 text-left text-xs font-semibold tracking-label text-text-muted uppercase"
              >
                Pos
              </th>
              <th
                scope="col"
                className="px-3 py-1.5 text-left text-xs font-semibold tracking-label text-text-muted uppercase"
              >
                Driver
              </th>
              <th
                scope="col"
                className="w-32 px-3 py-1.5 text-right text-xs font-semibold tracking-label text-text-muted uppercase"
              >
                Picked by
              </th>
            </tr>
          </thead>
          <tbody>
            {consensus.drivers.slice(0, ROWS).map((driver) => (
              <tr
                key={driver.driverId}
                className="border-b border-border last:border-0"
              >
                <th
                  scope="row"
                  className="gpp-mono w-14 px-3 py-1.5 text-left text-xs font-semibold text-text-muted"
                >
                  P{driver.consensusPosition}
                </th>
                <td className="min-w-0 px-3 py-1.5">
                  <div className="flex min-w-0 items-center gap-2">
                    <DriverBadge
                      code={driver.code}
                      displayName={driver.displayName}
                      team={driver.team ?? undefined}
                      size="sm"
                      prerenderTooltip={false}
                    />
                    <span className="min-w-0 truncate text-sm text-text">
                      {driver.displayName}
                    </span>
                  </div>
                </td>
                <td className="w-32 px-3 py-1.5">
                  <div className="flex items-center justify-end gap-2">
                    {/* The bar is the comparison; the number is the fact. */}
                    <span aria-hidden className="h-1 w-12 shrink-0 bg-border">
                      <span
                        className="block h-1 bg-accent"
                        style={{ width: `${driver.pickRate}%` }}
                      />
                    </span>
                    <span className="gpp-mono text-xs font-semibold text-text">
                      {driver.pickRate}%
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

/**
 * What everyone picked, for each session that has locked.
 *
 * The one thing on this site that is not published anywhere else. Every other
 * page explains Formula 1 in competition with publications that have covered
 * it for decades; this reports a fact only we hold, it is different every
 * weekend, and it is the half of the game a player cannot see from their own
 * entry. It renders from loader data for the same reason the classification
 * does: a crawler never boots the Convex subscriptions.
 *
 * The backend returns nothing before a session locks, so this cannot become an
 * answer sheet. See `consensus.ts` for that rule.
 *
 * The explanation is written once above all four tables rather than repeated
 * per session. A sprint weekend has four of these, and four copies of the same
 * paragraph is the duplication this page is being cleaned up for.
 */
export function SessionConsensusSections({
  sessions,
}: {
  sessions: ConsensusSession[];
}) {
  if (sessions.length === 0) {
    return null;
  }
  const anyScored = sessions.some((entry) => crowdScore(entry) !== null);

  return (
    <div className="mt-10 max-w-3xl border-t border-border pt-6">
      <h2 className="font-title text-xl font-semibold text-text">
        How players picked this weekend
      </h2>
      <p className="mt-2 text-sm text-text-muted">
        Everyone&rsquo;s picks, as they stood at each deadline. The order
        weights a driver by the positions they were picked in, so a driver
        everyone put second ranks above one everyone put fifth.
        {anyScored &&
          ' Where a session has been classified, the score is what this five would have earned.'}
      </p>
      {sessions.map((entry) => (
        <ConsensusTable key={entry.session} {...entry} />
      ))}
    </div>
  );
}
