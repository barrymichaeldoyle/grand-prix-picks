import { SignInButton, useAuth } from '@clerk/clerk-react';
import { Lock, LogIn } from 'lucide-react';
import { useState } from 'react';

import type { Doc, Id } from '../../../convex/_generated/dataModel';
import type { SessionType } from '../../lib/sessions';
import { Button } from '../../components/Button';
import { ErrorBoundary } from '../../components/ErrorBoundary';
import { InlineLoader } from '../../components/InlineLoader';
import { RaceResults } from '../../components/RaceResults';
import { WeekendPredictions } from '../../components/WeekendPredictions';
import { formatDate, formatTime } from '../../lib/date';

/** Card wrapper matching RaceResults table/block styling */
const SECTION_CARD =
  'overflow-hidden rounded-lg border border-border bg-surface';

interface PredictionSectionProps {
  race: Doc<'races'>;
  /** When true, user has already submitted predictions for this weekend. */
  hasPredictions?: boolean;
}

export function PredictionSection({
  race,
  hasPredictions = false,
}: PredictionSectionProps) {
  const { isLoaded, isSignedIn } = useAuth();
  const [editingSession, setEditingSession] = useState<SessionType | null>(
    null,
  );

  return (
    <div className="space-y-2 p-4">
      {!editingSession && (
        <h2 className="text-xl font-semibold text-text">
          {hasPredictions ? 'Your Predictions' : 'Make Your Prediction'}
        </h2>
      )}

      {!isLoaded ? (
        <InlineLoader />
      ) : isSignedIn ? (
        <ErrorBoundary>
          <WeekendPredictions
            race={race}
            editingSession={editingSession}
            onEditingSessionChange={setEditingSession}
          />
        </ErrorBoundary>
      ) : (
        <div className="rounded-lg border-2 border-dashed border-border py-8 text-center">
          <LogIn className="mx-auto mb-4 h-12 w-12 text-text-muted" />
          <p className="mb-4 text-text-muted">
            Sign in to make your prediction
          </p>
          <SignInButton mode="modal">
            <Button size="sm">Sign In</Button>
          </SignInButton>
        </div>
      )}
    </div>
  );
}

interface NotYetOpenSectionProps {
  predictionOpenAt: number | null | undefined;
}

export function NotYetOpenSection({
  predictionOpenAt,
}: NotYetOpenSectionProps) {
  return (
    <div className={`${SECTION_CARD} p-4`}>
      <div className="mb-2 flex items-center gap-2">
        <Lock className="h-5 w-5 text-text-muted" />
        <h2 className="text-xl font-semibold text-text">Not Yet Open</h2>
      </div>
      <div className="text-sm text-text-muted">
        <p>
          Predictions for this race will open after the previous race is
          complete.
        </p>
        {predictionOpenAt != null && (
          <p className="mt-2">
            Predictions open{' '}
            <strong className="text-text">
              {formatDate(predictionOpenAt)} at {formatTime(predictionOpenAt)}
            </strong>
          </p>
        )}
        {predictionOpenAt == null && <p className="mt-2">Check back soon!</p>}
      </div>
    </div>
  );
}

export function LockedSection() {
  return (
    <div className={`${SECTION_CARD} p-4`}>
      <h2 className="mb-2 text-xl font-semibold text-text">
        Predictions Locked
      </h2>
      <p className="text-sm text-text-muted">
        Predictions are closed. Results will be available after the race.
      </p>
    </div>
  );
}

interface ResultsSectionProps {
  raceId: Id<'races'>;
  race: Doc<'races'>;
}

export function ResultsSection({ raceId, race }: ResultsSectionProps) {
  return (
    <div className="p-4">
      <ErrorBoundary>
        <div className="md:hidden">
          <RaceResults raceId={raceId} race={race} />
        </div>
        <div className="hidden md:block">
          <RaceResults raceId={raceId} race={race} hideHeader />
        </div>
      </ErrorBoundary>
    </div>
  );
}
