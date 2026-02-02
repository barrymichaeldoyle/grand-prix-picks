import { useState, useEffect } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../../convex/_generated/api';
import type { Doc, Id } from '../../convex/_generated/dataModel';
import { ChevronUp, ChevronDown, X, Check, Loader2 } from 'lucide-react';

type Driver = Doc<'drivers'>;

interface PredictionFormProps {
  raceId: Id<'races'>;
  existingPicks?: Id<'drivers'>[];
}

export default function PredictionForm({ raceId, existingPicks }: PredictionFormProps) {
  const drivers = useQuery(api.drivers.listDrivers);
  const submitPrediction = useMutation(api.predictions.submitPrediction);

  const [picks, setPicks] = useState<Id<'drivers'>[]>(existingPicks ?? []);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  // Sync with existing picks when they load
  useEffect(() => {
    if (existingPicks && existingPicks.length > 0) {
      setPicks(existingPicks);
    }
  }, [existingPicks]);

  if (drivers === undefined) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 text-cyan-400 animate-spin" />
      </div>
    );
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
    [newPicks[index - 1], newPicks[index]] = [newPicks[index], newPicks[index - 1]];
    setPicks(newPicks);
    setSubmitStatus('idle');
  };

  const moveDown = (index: number) => {
    if (index >= picks.length - 1) return;
    const newPicks = [...picks];
    [newPicks[index], newPicks[index + 1]] = [newPicks[index + 1], newPicks[index]];
    setPicks(newPicks);
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
      setErrorMessage(error instanceof Error ? error.message : 'Failed to submit prediction');
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
    <div className="space-y-6">
      {/* Your Picks */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-3">Your Picks</h3>
        <div className="space-y-2">
          {/* Picked drivers - these animate when reordering */}
          <AnimatePresence mode="popLayout">
            {pickedDrivers.map((driver, index) => (
              <motion.div
                key={driver._id}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                className="flex items-center gap-3 p-3 rounded-lg border bg-slate-700/50 border-slate-600"
              >
                <motion.span
                  layout="position"
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-cyan-500/20 text-cyan-400 font-bold text-sm"
                >
                  P{index + 1}
                </motion.span>

                <div className="flex-1">
                  <span className="text-white font-medium">{driver.displayName}</span>
                  <span className="ml-2 text-slate-500 text-sm">{driver.code}</span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => moveUp(index)}
                    disabled={index === 0}
                    className="p-1.5 rounded hover:bg-slate-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    aria-label="Move up"
                  >
                    <ChevronUp size={18} className="text-slate-400" />
                  </button>
                  <button
                    onClick={() => moveDown(index)}
                    disabled={index >= picks.length - 1}
                    className="p-1.5 rounded hover:bg-slate-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    aria-label="Move down"
                  >
                    <ChevronDown size={18} className="text-slate-400" />
                  </button>
                  <button
                    onClick={() => removeDriver(driver._id)}
                    className="p-1.5 rounded hover:bg-red-500/20 transition-colors ml-1"
                    aria-label="Remove"
                  >
                    <X size={18} className="text-red-400" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Empty slots */}
          {Array.from({ length: emptySlots }).map((_, i) => (
            <div
              key={`empty-${i}`}
              className="flex items-center gap-3 p-3 rounded-lg border bg-slate-800/30 border-slate-700 border-dashed"
            >
              <span className="w-8 h-8 flex items-center justify-center rounded-full bg-cyan-500/20 text-cyan-400 font-bold text-sm">
                P{pickedDrivers.length + i + 1}
              </span>
              <span className="flex-1 text-slate-500 text-sm">
                Select a driver below
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex items-center gap-4">
        <button
          onClick={handleSubmit}
          disabled={picks.length !== 5 || isSubmitting || (submitStatus === 'success' && !hasChanges)}
          className="flex items-center gap-2 px-6 py-3 bg-cyan-500 hover:bg-cyan-600 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
        >
          {isSubmitting ? (
            <>
              <Loader2 size={20} className="animate-spin" />
              Saving...
            </>
          ) : submitStatus === 'success' && !hasChanges ? (
            <>
              <Check size={20} />
              Saved
            </>
          ) : existingPicks && existingPicks.length > 0 ? (
            'Update Prediction'
          ) : (
            'Submit Prediction'
          )}
        </button>

        {picks.length < 5 && (
          <span className="text-slate-400 text-sm">
            Select {5 - picks.length} more driver{5 - picks.length !== 1 ? 's' : ''}
          </span>
        )}

        {submitStatus === 'success' && hasChanges && (
          <span className="text-amber-400 text-sm">Unsaved changes</span>
        )}

        {submitStatus === 'error' && (
          <span className="text-red-400 text-sm">{errorMessage}</span>
        )}
      </div>

      {/* Available Drivers */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-3">
          Select Drivers
          {picks.length >= 5 && (
            <span className="ml-2 text-sm font-normal text-slate-400">
              (remove a pick to change)
            </span>
          )}
        </h3>
        <motion.div layout className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
          <AnimatePresence>
            {availableDrivers.map((driver) => (
              <motion.button
                key={driver._id}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                onClick={() => addDriver(driver._id)}
                disabled={picks.length >= 5}
                className="flex flex-col items-center gap-1 p-3 rounded-lg border border-slate-700 bg-slate-800/50 hover:border-cyan-500/50 hover:bg-slate-700/50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                whileHover={{ scale: picks.length >= 5 ? 1 : 1.05 }}
                whileTap={{ scale: picks.length >= 5 ? 1 : 0.95 }}
              >
                <span className="text-lg font-bold text-cyan-400">{driver.code}</span>
                <span className="text-xs text-slate-400 text-center leading-tight">
                  {driver.familyName || driver.displayName.split(' ').pop()}
                </span>
              </motion.button>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
