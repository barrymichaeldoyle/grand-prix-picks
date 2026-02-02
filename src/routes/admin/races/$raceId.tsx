import { createFileRoute, Link } from '@tanstack/react-router';
import { useQuery, useMutation } from 'convex/react';
import { useState } from 'react';
import { api } from '../../../../convex/_generated/api';
import type { Id } from '../../../../convex/_generated/dataModel';
import { Loader2, ArrowLeft, Shield, Save, Trophy, Check } from 'lucide-react';

export const Route = createFileRoute('/admin/races/$raceId')({
  component: AdminRaceDetailPage,
});

function AdminRaceDetailPage() {
  const { raceId } = Route.useParams();
  const typedRaceId = raceId as Id<'races'>;
  const isAdmin = useQuery(api.users.amIAdmin);
  const race = useQuery(api.races.getRace, { raceId: typedRaceId });
  const drivers = useQuery(api.drivers.listDrivers);
  const existingResult = useQuery(api.results.getResultForRace, { raceId: typedRaceId });

  const publishResults = useMutation(api.results.adminPublishResults);

  const [selectedDrivers, setSelectedDrivers] = useState<Id<'drivers'>[]>([]);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState(false);

  // Initialize selected drivers from existing result
  if (existingResult?.classification && selectedDrivers.length === 0) {
    setSelectedDrivers(existingResult.classification.slice(0, 5));
  }

  if (isAdmin === undefined || race === undefined || drivers === undefined) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-slate-800/50 border border-red-500/30 rounded-xl p-8 text-center">
            <Shield className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
            <p className="text-slate-400">Admin privileges required.</p>
          </div>
        </div>
      </div>
    );
  }

  if (!race) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <p className="text-white">Race not found</p>
        </div>
      </div>
    );
  }

  const toggleDriver = (driverId: Id<'drivers'>) => {
    setPublishSuccess(false);
    if (selectedDrivers.includes(driverId)) {
      setSelectedDrivers(selectedDrivers.filter((id) => id !== driverId));
    } else if (selectedDrivers.length < 5) {
      setSelectedDrivers([...selectedDrivers, driverId]);
    }
  };

  const moveDriver = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= selectedDrivers.length) return;

    const newDrivers = [...selectedDrivers];
    [newDrivers[index], newDrivers[newIndex]] = [newDrivers[newIndex], newDrivers[index]];
    setSelectedDrivers(newDrivers);
    setPublishSuccess(false);
  };

  const handlePublish = async () => {
    if (selectedDrivers.length !== 5) return;

    setIsPublishing(true);
    try {
      await publishResults({
        raceId: typedRaceId,
        classification: selectedDrivers,
      });
      setPublishSuccess(true);
    } catch (error) {
      console.error('Failed to publish:', error);
    } finally {
      setIsPublishing(false);
    }
  };

  const selectedDriverData = selectedDrivers
    .map((id) => drivers.find((d) => d._id === id))
    .filter(Boolean);

  const availableDrivers = drivers.filter((d) => !selectedDrivers.includes(d._id));

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Link
          to="/admin"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8"
        >
          <ArrowLeft size={20} />
          Back to Admin
        </Link>

        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-medium text-slate-500">
                Round {race.round} - {race.season}
              </span>
              <h1 className="text-2xl font-bold text-white mt-1">{race.name}</h1>
            </div>
            <span
              className={`px-3 py-1 text-sm rounded-full ${
                race.status === 'upcoming'
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : race.status === 'locked'
                    ? 'bg-amber-500/20 text-amber-400'
                    : 'bg-slate-500/20 text-slate-400'
              }`}
            >
              {race.status}
            </span>
          </div>
        </div>

        {/* Publish Results Section */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="w-5 h-5 text-yellow-400" />
            <h2 className="text-xl font-semibold text-white">
              {existingResult ? 'Update Results' : 'Publish Results'}
            </h2>
          </div>

          <p className="text-slate-400 mb-6">
            Select the top 5 finishers in order (P1 to P5).
          </p>

          {/* Selected drivers (top 5) */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-slate-400 mb-3">Classification</h3>
            <div className="space-y-2">
              {[0, 1, 2, 3, 4].map((index) => {
                const driver = selectedDriverData[index];
                return (
                  <div
                    key={index}
                    className={`flex items-center gap-3 p-3 rounded-lg border ${
                      driver
                        ? 'bg-slate-700/50 border-slate-600'
                        : 'bg-slate-800/30 border-slate-700 border-dashed'
                    }`}
                  >
                    <span className="w-8 h-8 flex items-center justify-center rounded-full bg-yellow-500/20 text-yellow-400 font-bold text-sm">
                      P{index + 1}
                    </span>
                    {driver ? (
                      <>
                        <div className="flex-1">
                          <span className="text-white font-medium">{driver.displayName}</span>
                          <span className="ml-2 text-slate-500 text-sm">{driver.code}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => moveDriver(index, 'up')}
                            disabled={index === 0}
                            className="p-1.5 rounded hover:bg-slate-600 disabled:opacity-30 transition-colors text-slate-400"
                          >
                            ↑
                          </button>
                          <button
                            onClick={() => moveDriver(index, 'down')}
                            disabled={index >= selectedDrivers.length - 1}
                            className="p-1.5 rounded hover:bg-slate-600 disabled:opacity-30 transition-colors text-slate-400"
                          >
                            ↓
                          </button>
                          <button
                            onClick={() => toggleDriver(driver._id)}
                            className="p-1.5 rounded hover:bg-red-500/20 transition-colors text-red-400 ml-2"
                          >
                            ✕
                          </button>
                        </div>
                      </>
                    ) : (
                      <span className="text-slate-500 text-sm">Select from below</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Publish button */}
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={handlePublish}
              disabled={selectedDrivers.length !== 5 || isPublishing}
              className="flex items-center gap-2 px-6 py-3 bg-yellow-500 hover:bg-yellow-600 disabled:bg-slate-600 disabled:cursor-not-allowed text-black font-semibold rounded-lg transition-colors"
            >
              {isPublishing ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Publishing...
                </>
              ) : publishSuccess ? (
                <>
                  <Check size={20} />
                  Published!
                </>
              ) : (
                <>
                  <Save size={20} />
                  Publish Results
                </>
              )}
            </button>
            {selectedDrivers.length < 5 && (
              <span className="text-slate-400 text-sm">
                Select {5 - selectedDrivers.length} more driver{5 - selectedDrivers.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>

          {/* Available drivers */}
          <div>
            <h3 className="text-sm font-medium text-slate-400 mb-3">Select Drivers</h3>
            <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2">
              {availableDrivers.map((driver) => (
                <button
                  key={driver._id}
                  onClick={() => toggleDriver(driver._id)}
                  disabled={selectedDrivers.length >= 5}
                  className="flex flex-col items-center gap-1 p-2 rounded-lg border border-slate-700 bg-slate-800/50 hover:border-yellow-500/50 hover:bg-slate-700/50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <span className="text-sm font-bold text-cyan-400">{driver.code}</span>
                  <span className="text-xs text-slate-500">{driver.familyName}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
