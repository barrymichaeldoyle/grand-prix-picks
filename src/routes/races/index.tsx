import { createFileRoute } from '@tanstack/react-router';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import RaceCard from '../../components/RaceCard';
import PageLoader from '../../components/PageLoader';
import { Calendar } from 'lucide-react';

export const Route = createFileRoute('/races/')({
  component: RacesPage,
  head: () => ({
    meta: [
      { title: '2026 F1 Races | Grand Prix Picks' },
      {
        name: 'description',
        content:
          'View the full 2026 Formula 1 calendar. Make predictions for upcoming races and see results from past Grands Prix.',
      },
    ],
  }),
});

function RacesPage() {
  const races = useQuery(api.races.listRaces, { season: 2026 });
  const nextRace = useQuery(api.races.getNextRace);

  if (races === undefined) {
    return <PageLoader />;
  }

  const upcomingRaces = races.filter((r) => r.status === 'upcoming');
  const lockedRaces = races.filter((r) => r.status === 'locked');
  const finishedRaces = races.filter((r) => r.status === 'finished');

  // When predictions open for a race = previous race's start (same season, round - 1)
  const getPredictionOpenAt = (race: (typeof races)[0]) => {
    if (race.round <= 1) return null;
    const prev = races.find(
      (r) => r.season === race.season && r.round === race.round - 1,
    );
    return prev?.raceStartAt ?? null;
  };

  return (
    <div className="min-h-screen bg-page">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <header className="mb-8 flex flex-col gap-1 md:flex-row md:items-baseline md:gap-3">
          <h1 className="text-3xl font-bold text-text">2026 Season</h1>
          <p className="text-text-muted md:text-base">
            Predict the top 5 finishers for each Grand Prix
          </p>
        </header>

        {races.length === 0 ? (
          <div className="text-center py-16">
            <Calendar className="w-16 h-16 text-text-muted mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-text mb-2">
              No races scheduled yet
            </h2>
            <p className="text-text-muted">
              Check back soon for the 2026 race calendar
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {upcomingRaces.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold text-text-muted mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 bg-success rounded-full"></span>
                  Upcoming Races
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {upcomingRaces.map((race) => (
                    <RaceCard
                      key={race._id}
                      race={race}
                      isNext={nextRace?._id === race._id}
                      predictionOpenAt={getPredictionOpenAt(race)}
                    />
                  ))}
                </div>
              </section>
            )}

            {lockedRaces.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold text-text-muted mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 bg-warning rounded-full"></span>
                  In Progress
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {lockedRaces.map((race) => (
                    <RaceCard key={race._id} race={race} />
                  ))}
                </div>
              </section>
            )}

            {finishedRaces.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold text-text-muted mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 bg-text-muted rounded-full"></span>
                  Completed
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
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
