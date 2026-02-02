import { createFileRoute } from '@tanstack/react-router';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import RaceCard from '../../components/RaceCard';
import { Loader2, Calendar } from 'lucide-react';

export const Route = createFileRoute('/races/')({
  component: RacesPage,
});

function RacesPage() {
  const races = useQuery(api.races.listRaces, { season: 2026 });
  const nextRace = useQuery(api.races.getNextRace);

  if (races === undefined) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
      </div>
    );
  }

  const upcomingRaces = races.filter((r) => r.status === 'upcoming');
  const lockedRaces = races.filter((r) => r.status === 'locked');
  const finishedRaces = races.filter((r) => r.status === 'finished');

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">2026 Season</h1>
          <p className="text-slate-400">
            Predict the top 5 finishers for each Grand Prix
          </p>
        </div>

        {races.length === 0 ? (
          <div className="text-center py-16">
            <Calendar className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">
              No races scheduled yet
            </h2>
            <p className="text-slate-400">
              Check back soon for the 2026 race calendar
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {upcomingRaces.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold text-slate-300 mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 bg-emerald-400 rounded-full"></span>
                  Upcoming Races
                </h2>
                <div className="space-y-3">
                  {upcomingRaces.map((race) => (
                    <RaceCard
                      key={race._id}
                      race={race}
                      isNext={nextRace?._id === race._id}
                    />
                  ))}
                </div>
              </section>
            )}

            {lockedRaces.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold text-slate-300 mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 bg-amber-400 rounded-full"></span>
                  In Progress
                </h2>
                <div className="space-y-3">
                  {lockedRaces.map((race) => (
                    <RaceCard key={race._id} race={race} />
                  ))}
                </div>
              </section>
            )}

            {finishedRaces.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold text-slate-300 mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 bg-slate-400 rounded-full"></span>
                  Completed
                </h2>
                <div className="space-y-3">
                  {finishedRaces.map((race) => (
                    <RaceCard key={race._id} race={race} />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
