import { useMutation, useQuery } from 'convex/react';
import { AnimatePresence, motion, Reorder } from 'framer-motion';
import { Check, ChevronDown, ChevronUp, GripVertical, X } from 'lucide-react';
import { useEffect, useState } from 'react';

import { api } from '../../convex/_generated/api';
import type { Doc, Id } from '../../convex/_generated/dataModel';
import Button from './Button';
import InlineLoader from './InlineLoader';

type Driver = Doc<'drivers'>;
type SessionType = 'quali' | 'sprint_quali' | 'sprint' | 'race';

interface PredictionFormProps {
  raceId: Id<'races'>;
  existingPicks?: Array<Id<'drivers'>>;
  /** If provided, only update this specific session. Otherwise cascade to all. */
  sessionType?: SessionType;
}

export default function PredictionForm({
  raceId,
  existingPicks,
  sessionType,
}: PredictionFormProps) {
  const drivers = useQuery(api.drivers.listDrivers);
  const submitPrediction = useMutation(api.predictions.submitPrediction);

  const [picks, setPicks] = useState<Array<Id<'drivers'>>>(existingPicks ?? []);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<
    'idle' | 'success' | 'error'
  >('idle');
  const [errorMessage, setErrorMessage] = useState('');

  // Sync with existing picks when they load
  useEffect(() => {
    if (existingPicks && existingPicks.length > 0) {
      setPicks(existingPicks);
    }
  }, [existingPicks]);

  if (drivers === undefined) {
    return <InlineLoader />;
  }

  const pickedDrivers = picks
    .map((id) => drivers.find((d) => d._id === id))
    .filter((d): d is Driver => d !== undefined);

  const availableDrivers = drivers.filter((d) => !picks.includes(d._id));

  const addDriver = (driverId: Id<'drivers'>) => {
    if (picks.length >= 5) return;
    if (picks.includes(driverId)) return;
    setPicks([...picks, driverId]);
    setSubmitStatus('idle');
  };

  const removeDriver = (driverId: Id<'drivers'>) => {
    setPicks(picks.filter((id) => id !== driverId));
    setSubmitStatus('idle');
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    const newPicks = [...picks];
    [newPicks[index - 1], newPicks[index]] = [
      newPicks[index],
      newPicks[index - 1],
    ];
    setPicks(newPicks);
    setSubmitStatus('idle');
  };

  const moveDown = (index: number) => {
    if (index >= picks.length - 1) return;
    const newPicks = [...picks];
    [newPicks[index], newPicks[index + 1]] = [
      newPicks[index + 1],
      newPicks[index],
    ];
    setPicks(newPicks);
    setSubmitStatus('idle');
  };

  const handleReorder = (newOrder: Array<Id<'drivers'>>) => {
    setPicks(newOrder);
    setSubmitStatus('idle');
  };

  const handleSubmit = async () => {
    if (picks.length !== 5) return;

    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');

    try {
      await submitPrediction({ raceId, picks, sessionType });
      setSubmitStatus('success');
    } catch (error) {
      setSubmitStatus('error');
      setErrorMessage(
        error instanceof Error ? error.message : 'Failed to submit prediction',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasChanges = existingPicks
    ? JSON.stringify(picks) !== JSON.stringify(existingPicks)
    : picks.length > 0;

  // Empty slots needed
  const emptySlots = 5 - pickedDrivers.length;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Two-column layout on desktop: Your Picks | Select Drivers */}
      <div className="flex flex-col gap-4 sm:gap-6 lg:flex-row lg:items-start lg:gap-8">
        {/* Your Picks - tier list: static positions + draggable cards */}
        <div
          data-testid="your-picks"
          className="lg:min-w-0 lg:min-w-[400px] lg:flex-1"
        >
          <h3 className="mb-2 text-lg font-semibold text-text sm:mb-3">
            Your Picks
          </h3>
          <div
            className="flex gap-0 overflow-hidden rounded-xl border border-border bg-surface"
            data-testid="picks-list"
          >
            {/* Static position labels + vertical divider */}
            <div className="flex shrink-0 flex-col border-r border-border bg-surface-muted/50">
              {[1, 2, 3, 4, 5].map((n) => (
                <div
                  key={n}
                  className="flex h-11 w-9 shrink-0 items-center justify-center border-b border-border text-sm font-bold text-accent sm:h-[56px] sm:w-11"
                  aria-hidden
                >
                  {n}
                </div>
              ))}
            </div>

            {/* Draggable cards + empty slots (lane borders) */}
            <Reorder.Group
              as="div"
              axis="y"
              values={picks}
              onReorder={handleReorder}
              className="flex min-w-0 flex-1 flex-col"
            >
              <AnimatePresence mode="popLayout">
                {picks.map((driverId, index) => {
                  const driver = drivers.find((d) => d._id === driverId);
                  if (!driver) return null;
                  return (
                    <Reorder.Item
                      key={driverId}
                      value={driverId}
                      as="div"
                      data-testid={`picked-driver-${index + 1}`}
                      className="relative flex h-11 shrink-0 cursor-grab touch-none items-center gap-1.5 border-b border-border bg-surface-muted px-2 py-1.5 active:cursor-grabbing sm:h-[56px] sm:gap-2 sm:px-3 sm:py-2"
                      transition={{
                        type: 'spring',
                        stiffness: 150,
                        damping: 22,
                      }}
                      whileDrag={{
                        scale: 1.02,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                      }}
                    >
                      <span className="shrink-0 text-text-muted" aria-hidden>
                        <GripVertical size={16} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <span className="block truncate font-medium text-text">
                          {driver.displayName}
                        </span>
                        <span className="text-sm text-text-muted">
                          {driver.code}
                        </span>
                      </div>
                      <div className="flex shrink-0 items-center gap-0.5">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            moveUp(index);
                          }}
                          disabled={index === 0}
                          className="rounded p-1 transition-colors hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-30 sm:p-1.5"
                          aria-label="Move up"
                        >
                          <ChevronUp size={16} className="text-text-muted" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            moveDown(index);
                          }}
                          disabled={index >= picks.length - 1}
                          className="rounded p-1 transition-colors hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-30 sm:p-1.5"
                          aria-label="Move down"
                        >
                          <ChevronDown size={16} className="text-text-muted" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeDriver(driver._id);
                          }}
                          className="rounded p-1 transition-colors hover:bg-error-muted sm:p-1.5"
                          aria-label="Remove"
                          data-testid={`remove-pick-${index + 1}`}
                        >
                          <X size={16} className="text-error" />
                        </button>
                      </div>
                    </Reorder.Item>
                  );
                })}
              </AnimatePresence>

              {/* Empty slots */}
              {Array.from({ length: emptySlots }).map((_, i) => (
                <div
                  key={`empty-${i}`}
                  className="flex h-11 shrink-0 items-center gap-2 border-x-0 border-t-0 border-b border-dashed border-border bg-surface px-2 py-1.5 sm:h-[56px] sm:gap-3 sm:px-3 sm:py-2"
                >
                  <span className="flex-1 text-sm text-text-muted">
                    Select a driver
                  </span>
                </div>
              ))}
            </Reorder.Group>
          </div>

          {/* Submit row - directly under Your Picks */}
          <div className="mt-3 flex flex-wrap items-center justify-center gap-3 sm:mt-4 sm:gap-4">
            <Button
              variant="primary"
              size="md"
              className="w-100 max-w-full"
              loading={isSubmitting}
              saved={
                submitStatus === 'success' && !hasChanges && picks.length === 5
              }
              disabled={
                picks.length !== 5 ||
                isSubmitting ||
                (submitStatus === 'success' && !hasChanges)
              }
              onClick={handleSubmit}
              data-testid="submit-prediction"
            >
              {submitStatus === 'success' &&
              !hasChanges &&
              picks.length === 5 ? (
                <>
                  <Check size={20} className="shrink-0" />
                  Saved
                </>
              ) : isSubmitting ? (
                'Saving...'
              ) : existingPicks && existingPicks.length > 0 ? (
                'Update Prediction'
              ) : (
                'Submit Prediction'
              )}
            </Button>

            {picks.length < 5 && (
              <span
                className="text-sm text-text-muted"
                data-testid="picks-remaining"
              >
                Select {5 - picks.length} more driver
                {5 - picks.length !== 1 ? 's' : ''}
              </span>
            )}

            {submitStatus === 'success' && hasChanges && (
              <span
                className="text-sm text-warning"
                data-testid="unsaved-changes"
              >
                Unsaved changes
              </span>
            )}

            {submitStatus === 'error' && (
              <span className="text-sm text-error" data-testid="submit-error">
                {errorMessage}
              </span>
            )}
          </div>
        </div>

        {/* Available Drivers - selection pool (right column on desktop) */}
        <div className="lg:min-w-0 lg:flex-[2]">
          <h3 className="mb-2 text-lg font-semibold text-text sm:mb-3">
            Select Drivers
            {picks.length >= 5 && (
              <span className="ml-2 text-sm font-normal text-text-muted">
                (remove a pick to change)
              </span>
            )}
          </h3>
          <motion.div
            layout
            className="grid grid-cols-3 gap-1.5 sm:grid-cols-4 sm:gap-2 md:grid-cols-5 lg:grid-cols-4"
            data-testid="driver-selection"
          >
            <AnimatePresence mode="popLayout">
              {availableDrivers.map((driver) => (
                <motion.button
                  key={driver._id}
                  layout
                  type="button"
                  data-testid={`driver-${driver.code}`}
                  initial={false}
                  transition={{
                    type: 'spring',
                    stiffness: 500,
                    damping: 30,
                  }}
                  onClick={() => addDriver(driver._id)}
                  disabled={picks.length >= 5}
                  className="flex flex-col items-center gap-0.5 rounded-lg border border-border bg-surface p-2 transition-colors hover:border-accent/50 hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-40 sm:gap-1 sm:p-3"
                  whileHover={{ scale: picks.length >= 5 ? 1 : 1.05 }}
                  whileTap={{ scale: picks.length >= 5 ? 1 : 0.95 }}
                >
                  <span className="text-lg font-bold text-accent">
                    {driver.code}
                  </span>
                  <span className="text-center text-xs leading-tight text-text-muted">
                    {driver.familyName || driver.displayName.split(' ').pop()}
                  </span>
                </motion.button>
              ))}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
