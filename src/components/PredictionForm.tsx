import { useMutation, useQuery } from 'convex/react';
import { AnimatePresence, motion,Reorder } from 'framer-motion';
import { Check, ChevronDown, ChevronUp, GripVertical, X } from 'lucide-react';
import { useEffect, useState } from 'react';

import { api } from '../../convex/_generated/api';
import type { Doc, Id } from '../../convex/_generated/dataModel';
import Button from './Button';
import InlineLoader from './InlineLoader';

type Driver = Doc<'drivers'>;

interface PredictionFormProps {
  raceId: Id<'races'>;
  existingPicks?: Array<Id<'drivers'>>;
}

export default function PredictionForm({
  raceId,
  existingPicks,
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
      await submitPrediction({ raceId, picks });
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
          className="lg:min-w-0 lg:flex-1 lg:min-w-[400px]"
        >
          <h3 className="text-lg font-semibold text-text mb-2 sm:mb-3">
            Your Picks
          </h3>
          <div
            className="flex gap-0 rounded-xl border border-border overflow-hidden bg-surface"
            data-testid="picks-list"
          >
            {/* Static position labels + vertical divider */}
            <div className="flex flex-col shrink-0 border-r border-border bg-surface-muted/50">
              {[1, 2, 3, 4, 5].map((n) => (
                <div
                  key={n}
                  className="h-11 sm:h-[56px] flex items-center justify-center w-9 sm:w-11 border-b border-border text-accent font-bold text-sm shrink-0"
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
              className="flex flex-col flex-1 min-w-0"
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
                      className="relative flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 border-b border-border bg-surface-muted cursor-grab active:cursor-grabbing touch-none h-11 sm:h-[56px] shrink-0"
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
                      <div className="flex-1 min-w-0">
                        <span className="text-text font-medium truncate block">
                          {driver.displayName}
                        </span>
                        <span className="text-text-muted text-sm">
                          {driver.code}
                        </span>
                      </div>
                      <div className="flex items-center gap-0.5 shrink-0">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            moveUp(index);
                          }}
                          disabled={index === 0}
                          className="p-1 sm:p-1.5 rounded hover:bg-surface-hover disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
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
                          className="p-1 sm:p-1.5 rounded hover:bg-surface-hover disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
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
                          className="p-1 sm:p-1.5 rounded hover:bg-error-muted transition-colors"
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
                  className="flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-1.5 sm:py-2 h-11 sm:h-[56px] border-b border-border bg-surface border-dashed border-t-0 border-x-0 shrink-0"
                >
                  <span className="flex-1 text-text-muted text-sm">
                    Select a driver
                  </span>
                </div>
              ))}
            </Reorder.Group>
          </div>

          {/* Submit row - directly under Your Picks */}
          <div className="mt-3 sm:mt-4 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
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
                className="text-text-muted text-sm"
                data-testid="picks-remaining"
              >
                Select {5 - picks.length} more driver
                {5 - picks.length !== 1 ? 's' : ''}
              </span>
            )}

            {submitStatus === 'success' && hasChanges && (
              <span
                className="text-warning text-sm"
                data-testid="unsaved-changes"
              >
                Unsaved changes
              </span>
            )}

            {submitStatus === 'error' && (
              <span className="text-error text-sm" data-testid="submit-error">
                {errorMessage}
              </span>
            )}
          </div>
        </div>

        {/* Available Drivers - selection pool (right column on desktop) */}
        <div className="lg:min-w-0 lg:flex-[2]">
          <h3 className="text-lg font-semibold text-text mb-2 sm:mb-3">
            Select Drivers
            {picks.length >= 5 && (
              <span className="ml-2 text-sm font-normal text-text-muted">
                (remove a pick to change)
              </span>
            )}
          </h3>
          <motion.div
            layout
            className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-4 gap-1.5 sm:gap-2"
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
                  className="flex flex-col items-center gap-0.5 sm:gap-1 p-2 sm:p-3 rounded-lg border border-border bg-surface hover:border-accent/50 hover:bg-surface-hover disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  whileHover={{ scale: picks.length >= 5 ? 1 : 1.05 }}
                  whileTap={{ scale: picks.length >= 5 ? 1 : 0.95 }}
                >
                  <span className="text-lg font-bold text-accent">
                    {driver.code}
                  </span>
                  <span className="text-xs text-text-muted text-center leading-tight">
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
