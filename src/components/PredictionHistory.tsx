import { Link } from '@tanstack/react-router';
import { EyeOff, Lock, Swords, Trophy } from 'lucide-react';

import {
  getSessionsForWeekend,
  SESSION_LABELS,
  SESSION_LABELS_SHORT,
} from '@/lib/sessions';

import type { Id } from '../../convex/_generated/dataModel';
import { Badge, StatusBadge } from './Badge';
import { DriverBadge, DriverBadgeSkeleton } from './DriverBadge';
import { getCountryCodeForRace, RaceFlag } from './RaceCard';

type SessionType = 'quali' | 'sprint_quali' | 'sprint' | 'race';

type Driver = {
  _id: Id<'drivers'>;
  code: string;
  displayName: string;
  team?: string | null;
  number?: number | null;
  nationality?: string | null;
};

type SessionData = {
  picks: Array<{ driverId: Id<'drivers'>; code: string }>;
  points: number | null;
  submittedAt: number;
  isHidden?: boolean;
} | null;

type Weekend = {
  raceId: Id<'races'>;
  raceName: string;
  raceRound: number;
  raceStatus: string;
  raceDate: number;
  hasSprint: boolean;
  sessions: Record<SessionType, SessionData>;
  totalPoints: number;
  hasScores: boolean;
  submittedAt: number;
};

type H2HWeekend = {
  raceId: Id<'races'>;
  sessions: Record<
    SessionType,
    { correctPicks: number; totalPicks: number; points: number } | null
  >;
};

type H2HPick = {
  raceId: Id<'races'>;
  sessions: Record<SessionType, boolean>;
};

export function WeekendCard({
  weekend,
  drivers,
  h2hHistory,
  h2hPicksByRace,
  isOwner,
}: {
  weekend: Weekend;
  drivers: Array<Driver> | undefined;
  h2hHistory: Array<H2HWeekend> | undefined;
  h2hPicksByRace: Array<H2HPick> | undefined;
  isOwner: boolean;
}) {
  const sessions = getSessionsForWeekend(!!weekend.hasSprint);
  const countryCode = getCountryCodeForRace({
    slug:
      weekend.raceName
        .toLowerCase()
        .replace(/ grand prix$/i, '')
        .replace(/ /g, '-') + '-2026',
  });

  return (
    <Link
      key={weekend.raceId}
      to="/races/$raceId"
      params={{ raceId: weekend.raceId }}
      className="block overflow-hidden rounded-xl border border-border bg-surface transition-colors hover:border-border-strong"
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-4 p-4">
        <div className="flex min-w-0 items-center gap-3">
          {countryCode && <RaceFlag countryCode={countryCode} />}
          <div className="min-w-0">
            <div className="mb-0.5 flex flex-wrap items-center gap-2">
              <span className="text-sm text-text-muted">
                Round {weekend.raceRound}
              </span>
              <StatusBadge status={weekend.raceStatus} isNext={false} />
              {weekend.hasSprint && <Badge variant="sprint">SPRINT</Badge>}
            </div>
            <h3 className="truncate text-lg font-semibold text-text">
              {weekend.raceName}
            </h3>
          </div>
        </div>

        <div className="shrink-0 text-right">
          {weekend.hasScores ? (
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-accent" />
              <span className="text-2xl font-bold text-accent">
                {weekend.totalPoints}
              </span>
            </div>
          ) : (
            <span className="text-sm text-text-muted">
              {weekend.raceStatus === 'upcoming'
                ? 'Awaiting race'
                : 'Awaiting results'}
            </span>
          )}
        </div>
      </div>

      {/* Predictions table */}
      <div className="border-t border-border/60 bg-surface-muted/30">
        {/* Table header */}
        <div className="grid grid-cols-[auto_1fr] border-b border-border/50">
          <div className="w-12 sm:w-16" />
          <div
            className={`grid ${weekend.hasSprint ? 'grid-cols-4' : 'grid-cols-2'}`}
          >
            {sessions.map((session) => (
              <div key={session} className="px-2 py-2 text-center">
                <span className="hidden text-xs font-semibold text-text-muted sm:inline">
                  {SESSION_LABELS[session]}
                </span>
                <span className="text-xs font-semibold text-text-muted sm:hidden">
                  {SESSION_LABELS_SHORT[session]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Table rows - P1 through P5 */}
        {[0, 1, 2, 3, 4].map((position) => (
          <div
            key={position}
            className={`grid grid-cols-[auto_1fr] ${position < 4 ? 'border-b border-border/30' : ''}`}
          >
            <div className="flex w-12 items-center justify-center py-2 sm:w-16">
              <span className="text-sm font-bold text-accent">
                P{position + 1}
              </span>
            </div>
            <div
              className={`grid ${weekend.hasSprint ? 'grid-cols-4' : 'grid-cols-2'}`}
            >
              {sessions.map((session) => {
                const sessionData = weekend.sessions[session];

                if (sessionData?.isHidden) {
                  return (
                    <div
                      key={session}
                      className="flex justify-center px-2 py-2"
                    >
                      <div className="flex h-8 items-center justify-center">
                        {position === 2 ? (
                          <Lock className="h-4 w-4 text-text-muted/40" />
                        ) : (
                          <span className="text-text-muted/30">—</span>
                        )}
                      </div>
                    </div>
                  );
                }

                const pick = sessionData?.picks[position];
                const driver = pick
                  ? drivers?.find((d) => d._id === pick.driverId)
                  : null;
                return (
                  <div key={session} className="flex justify-center px-2 py-2">
                    <div className="flex h-8 items-center justify-center">
                      {driver ? (
                        <DriverBadge
                          code={driver.code}
                          team={driver.team}
                          displayName={driver.displayName}
                          number={driver.number}
                          nationality={driver.nationality}
                        />
                      ) : pick && drivers === undefined ? (
                        <DriverBadgeSkeleton />
                      ) : (
                        <span className="text-text-muted/50">—</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* Owner-only visibility indicator for hidden sessions */}
        {isOwner &&
          Object.values(weekend.sessions).some(
            (s) => s && !s.isHidden && s.points === null,
          ) &&
          weekend.raceStatus === 'upcoming' && (
            <div className="flex items-center justify-center gap-1.5 border-t border-border/50 px-4 py-1.5">
              <EyeOff className="h-3 w-3 text-text-muted/60" />
              <span className="text-xs text-text-muted/60">
                Only visible to you until session locks
              </span>
            </div>
          )}

        {/* Points row */}
        {weekend.hasScores && (
          <div className="grid grid-cols-[auto_1fr] border-t border-border/50">
            <div className="flex w-12 items-center justify-center py-2 sm:w-16">
              <Trophy className="h-4 w-4 text-accent" />
            </div>
            <div
              className={`grid ${weekend.hasSprint ? 'grid-cols-4' : 'grid-cols-2'}`}
            >
              {sessions.map((session) => {
                const sessionData = weekend.sessions[session];
                const points = sessionData?.points;
                return (
                  <div key={session} className="px-2 py-2 text-center">
                    <span className="text-sm font-bold text-accent">
                      {points ?? '—'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* H2H row */}
        {(() => {
          const h2hWeekend = h2hHistory?.find(
            (h) => h.raceId === weekend.raceId,
          );
          const h2hPicks = h2hPicksByRace?.find(
            (p) => p.raceId === weekend.raceId,
          );
          const hasH2H = h2hWeekend ?? h2hPicks;
          if (!hasH2H) return null;
          return (
            <div className="grid grid-cols-[auto_1fr] border-t border-border/50">
              <div className="flex w-12 items-center justify-center py-2 sm:w-16">
                <Swords className="h-4 w-4 text-accent" />
              </div>
              <div
                className={`grid ${weekend.hasSprint ? 'grid-cols-4' : 'grid-cols-2'}`}
              >
                {sessions.map((session) => {
                  const h2hSession = h2hWeekend?.sessions[session];
                  const hasPicks = h2hPicks?.sessions[session];
                  return (
                    <div key={session} className="px-2 py-2 text-center">
                      <span className="text-xs font-medium text-text-muted">
                        {h2hSession
                          ? `${h2hSession.correctPicks}/${h2hSession.totalPicks}`
                          : hasPicks
                            ? 'Picked'
                            : '—'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })()}
      </div>
    </Link>
  );
}
