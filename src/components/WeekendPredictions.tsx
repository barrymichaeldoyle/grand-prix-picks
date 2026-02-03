import { useQuery } from 'convex/react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { useState } from 'react'

import { api } from '../../convex/_generated/api'
import type { Doc, Id } from '../../convex/_generated/dataModel'
import { Badge } from './Badge'
import PredictionForm from './PredictionForm'

type Race = Doc<'races'>
type SessionType = 'quali' | 'sprint_quali' | 'sprint' | 'race'

interface WeekendPredictionsProps {
  race: Race
}

const SESSION_LABELS: Record<SessionType, string> = {
  quali: 'Qualifying',
  sprint_quali: 'Sprint Quali',
  sprint: 'Sprint',
  race: 'Race',
}

const SESSION_LABELS_SHORT: Record<SessionType, string> = {
  quali: 'Q',
  sprint_quali: 'SQ',
  sprint: 'S',
  race: 'R',
}

function getSessionsForRace(race: Race): SessionType[] {
  if (race.hasSprint) {
    return ['quali', 'sprint_quali', 'sprint', 'race']
  }
  return ['quali', 'race']
}

function getSessionLockTime(
  race: Race,
  session: SessionType,
): number | undefined {
  switch (session) {
    case 'quali':
      return race.qualiLockAt
    case 'sprint_quali':
      return race.sprintQualiLockAt
    case 'sprint':
      return race.sprintLockAt
    case 'race':
      return race.predictionLockAt
  }
}

function isSessionLocked(race: Race, session: SessionType): boolean {
  const lockTime = getSessionLockTime(race, session)
  return lockTime !== undefined && Date.now() >= lockTime
}

function formatLockTime(timestamp: number | undefined): string {
  if (!timestamp) return ''
  return new Date(timestamp).toLocaleString('en-US', {
    weekday: 'short',
    hour: 'numeric',
    minute: '2-digit',
  })
}

interface SessionTabProps {
  session: SessionType
  race: Race
  picks: Array<Id<'drivers'>> | null
  isExpanded: boolean
  onToggle: () => void
  drivers: Array<Doc<'drivers'>> | undefined
}

function SessionTab({
  session,
  race,
  picks,
  isExpanded,
  onToggle,
  drivers,
}: SessionTabProps) {
  const locked = isSessionLocked(race, session)
  const lockTime = getSessionLockTime(race, session)

  return (
    <div className="overflow-hidden rounded-lg border border-border/60 bg-surface-muted/30">
      <button
        type="button"
        onClick={onToggle}
        disabled={locked}
        className={`flex w-full items-center justify-between p-4 text-left transition-colors ${
          locked ? 'cursor-not-allowed opacity-60' : 'hover:bg-surface-muted/50'
        }`}
      >
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-text">
              {SESSION_LABELS[session]}
            </span>
            {locked && <Badge variant="locked">Locked</Badge>}
            {!locked && picks && <Badge variant="submitted" />}
          </div>
          {picks && drivers && (
            <div className="mt-2 flex items-center gap-3 text-sm">
              {picks.map((driverId, i) => {
                const driver = drivers.find((d) => d._id === driverId)
                return (
                  <span key={driverId} className="flex items-center gap-1">
                    <span className="text-xs font-bold text-accent">
                      P{i + 1}
                    </span>
                    <span className="text-text-muted">{driver?.code}</span>
                  </span>
                )
              })}
            </div>
          )}
          {!picks && !locked && (
            <p className="mt-1 text-sm text-text-muted">No prediction yet</p>
          )}
          {lockTime && (
            <p className="mt-1 text-xs text-text-muted">
              {locked ? 'Locked' : 'Locks'} {formatLockTime(lockTime)}
            </p>
          )}
        </div>
        {!locked && (
          <motion.span
            className="ml-2 shrink-0 text-text-muted"
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown size={20} />
          </motion.span>
        )}
      </button>

      <AnimatePresence initial={false}>
        {isExpanded && !locked && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="border-t border-border/50 p-4">
              <PredictionForm
                raceId={race._id}
                sessionType={session}
                existingPicks={picks ?? undefined}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function WeekendPredictions({ race }: WeekendPredictionsProps) {
  const weekendPredictions = useQuery(api.predictions.myWeekendPredictions, {
    raceId: race._id,
  })
  const drivers = useQuery(api.drivers.listDrivers)

  const [expandedSession, setExpandedSession] = useState<SessionType | null>(
    null,
  )
  const [showSessionDetails, setShowSessionDetails] = useState(false)

  const sessions = getSessionsForRace(race)
  const hasPredictions =
    weekendPredictions?.predictions &&
    Object.values(weekendPredictions.predictions).some((p) => p !== null)

  // If user has no predictions yet, show the simple form
  // This will cascade to all sessions on submit
  if (!hasPredictions) {
    return (
      <div>
        <p className="mb-4 text-text-muted">
          Pick your top 5 drivers. This prediction will apply to{' '}
          {race.hasSprint
            ? 'Qualifying, Sprint Qualifying, Sprint, and Race'
            : 'Qualifying and Race'}
          . You can fine-tune individual sessions after submitting.
        </p>
        <PredictionForm raceId={race._id} />
      </div>
    )
  }

  // User has predictions - show option to view/edit by session
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-text-muted">
          Your predictions are set for this weekend.
        </p>
        <button
          type="button"
          onClick={() => setShowSessionDetails(!showSessionDetails)}
          className="hover:text-accent-strong px-1 text-sm font-medium text-accent"
        >
          {showSessionDetails ? 'Hide details' : 'Edit by session'}
        </button>
      </div>

      <AnimatePresence mode="wait">
        {!showSessionDetails && weekendPredictions?.predictions && (
          <motion.div
            key="summary"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden rounded-lg border border-border/60 bg-surface-muted/30"
          >
            {/* Table header */}
            <div className="grid grid-cols-[auto_1fr] border-b border-border/50">
              <div className="w-12 sm:w-16" />
              <div
                className={`grid ${race.hasSprint ? 'grid-cols-4' : 'grid-cols-2'}`}
              >
                {sessions.map((session) => {
                  const locked = isSessionLocked(race, session)
                  return (
                    <div key={session} className="px-2 py-2.5 text-center">
                      <span className="hidden text-xs font-semibold text-text-muted sm:inline">
                        {SESSION_LABELS[session]}
                      </span>
                      <span className="text-xs font-semibold text-text-muted sm:hidden">
                        {SESSION_LABELS_SHORT[session]}
                      </span>
                      {locked && (
                        <span className="ml-1 inline-block h-1.5 w-1.5 rounded-full bg-warning" />
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Table rows - P1 through P5 */}
            {[0, 1, 2, 3, 4].map((position) => (
              <div
                key={position}
                className={`grid grid-cols-[auto_1fr] ${position < 4 ? 'border-b border-border/30' : ''}`}
              >
                <div className="flex w-12 items-center justify-center py-2.5 sm:w-16">
                  <span className="text-sm font-bold text-accent">
                    P{position + 1}
                  </span>
                </div>
                <div
                  className={`grid ${race.hasSprint ? 'grid-cols-4' : 'grid-cols-2'}`}
                >
                  {sessions.map((session) => {
                    const picks = weekendPredictions.predictions[session]
                    const driverId = picks?.[position]
                    const driver = driverId
                      ? drivers?.find((d) => d._id === driverId)
                      : null
                    return (
                      <div key={session} className="px-2 py-2.5 text-center">
                        <span className="text-sm font-medium text-text">
                          {driver?.code ?? '—'}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {showSessionDetails && (
          <motion.div
            key="details"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            className="space-y-3"
          >
            {sessions.map((session) => (
              <SessionTab
                key={session}
                session={session}
                race={race}
                picks={weekendPredictions?.predictions[session] ?? null}
                isExpanded={expandedSession === session}
                onToggle={() =>
                  setExpandedSession(
                    expandedSession === session ? null : session,
                  )
                }
                drivers={drivers}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
