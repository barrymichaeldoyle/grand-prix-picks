import { Link, createFileRoute, useNavigate } from '@tanstack/react-router';
import { useMutation, useQuery } from 'convex/react';
import { ArrowLeft, Loader2, Save, Shield } from 'lucide-react';
import { useState } from 'react';

import { api } from '../../../../convex/_generated/api';

export const Route = createFileRoute('/admin/races/new')({
  component: AdminNewRacePage,
});

function AdminNewRacePage() {
  const navigate = useNavigate();
  const isAdmin = useQuery(api.users.amIAdmin);
  const upsertRace = useMutation(api.races.adminUpsertRace);

  const [formData, setFormData] = useState({
    name: '',
    round: 1,
    season: 2026,
    slug: '',
    raceDate: '',
    raceTime: '14:00',
    lockHoursBefore: 1,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (isAdmin === undefined) {
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
            <h1 className="text-2xl font-bold text-white mb-2">
              Access Denied
            </h1>
            <p className="text-slate-400">Admin privileges required.</p>
          </div>
        </div>
      </div>
    );
  }

  const generateSlug = (name: string) => {
    return (
      name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '') + `-${formData.season}`
    );
  };

  const handleNameChange = (name: string) => {
    setFormData({
      ...formData,
      name,
      slug: generateSlug(name),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.name || !formData.raceDate) {
      setError('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);

    try {
      const raceDateTime = new Date(
        `${formData.raceDate}T${formData.raceTime}:00`,
      );
      const raceStartAt = raceDateTime.getTime();
      const predictionLockAt =
        raceStartAt - formData.lockHoursBefore * 60 * 60 * 1000;

      await upsertRace({
        season: formData.season,
        round: formData.round,
        name: formData.name,
        slug: formData.slug,
        raceStartAt,
        predictionLockAt,
        status: 'upcoming',
      });

      navigate({ to: '/admin' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create race');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Link
          to="/admin"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8"
        >
          <ArrowLeft size={20} />
          Back to Admin
        </Link>

        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <h1 className="text-2xl font-bold text-white mb-6">Add New Race</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Race Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g. Monaco Grand Prix"
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Round
                </label>
                <input
                  type="number"
                  value={formData.round}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      round: parseInt(e.target.value) || 1,
                    })
                  }
                  min={1}
                  max={30}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Season
                </label>
                <input
                  type="number"
                  value={formData.season}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      season: parseInt(e.target.value) || 2026,
                    })
                  }
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                URL Slug
              </label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) =>
                  setFormData({ ...formData, slug: e.target.value })
                }
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Race Date *
                </label>
                <input
                  type="date"
                  value={formData.raceDate}
                  onChange={(e) =>
                    setFormData({ ...formData, raceDate: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Race Time (local)
                </label>
                <input
                  type="time"
                  value={formData.raceTime}
                  onChange={(e) =>
                    setFormData({ ...formData, raceTime: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Lock predictions (hours before race)
              </label>
              <input
                type="number"
                value={formData.lockHoursBefore}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    lockHoursBefore: parseInt(e.target.value) || 1,
                  })
                }
                min={0}
                max={48}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-cyan-500 hover:bg-cyan-600 disabled:bg-slate-600 text-white font-semibold rounded-lg transition-colors"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Save size={20} />
                  Create Race
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
