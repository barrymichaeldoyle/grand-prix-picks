import { createFileRoute, Link } from '@tanstack/react-router';
import { ConvexHttpClient } from 'convex/browser';
import { useQuery } from 'convex/react';
import { Hash, History, Info, Settings, Star, User } from 'lucide-react';

import { api } from '../../../convex/_generated/api';
import { Avatar } from '../../components/Avatar';
import { primaryButtonStyles } from '../../components/Button';
import { TEAM_COLORS } from '../../components/DriverBadge';
import { Flag } from '../../components/Flag';
import { PageLoader } from '../../components/PageLoader';
import { WeekendCard } from '../../components/PredictionHistory';
import { Tooltip } from '../../components/Tooltip';
import { computeFavoritePick } from '../../lib/favorites';

const convex = new ConvexHttpClient(import.meta.env.VITE_CONVEX_URL);

export const Route = createFileRoute('/p/$username')({
  component: ProfilePage,
  loader: async ({ params }) => {
    const profile = await convex.query(api.users.getProfileByUsername, {
      username: params.username,
    });
    return { initialProfile: profile };
  },
  head: ({ loaderData }) => {
    const name =
      loaderData?.initialProfile?.displayName ??
      loaderData?.initialProfile?.username ??
      'Profile';
    return {
      meta: [
        { title: `${name} | Grand Prix Picks` },
        {
          name: 'description',
          content: `View ${name}'s F1 prediction history and scores on Grand Prix Picks.`,
        },
      ],
    };
  },
});

function ProfilePage() {
  const { username } = Route.useParams();
  const { initialProfile } = Route.useLoaderData();

  const profile = useQuery(api.users.getProfileByUsername, { username });
  const currentProfile = profile ?? initialProfile;

  const stats = useQuery(
    api.users.getUserStats,
    currentProfile ? { userId: currentProfile._id } : 'skip',
  );

  const weekends = useQuery(
    api.predictions.getUserPredictionHistory,
    currentProfile ? { userId: currentProfile._id } : 'skip',
  );

  const h2hHistory = useQuery(
    api.h2h.getUserH2HPredictionHistory,
    currentProfile ? { userId: currentProfile._id } : 'skip',
  );

  const h2hPicksByRace = useQuery(
    api.h2h.getUserH2HPicksByRace,
    currentProfile ? { userId: currentProfile._id } : 'skip',
  );

  const drivers = useQuery(api.drivers.listDrivers);

  if (profile === undefined && !initialProfile) {
    return <PageLoader />;
  }

  if (!currentProfile) {
    return (
      <div className="bg-page">
        <div className="mx-auto max-w-4xl px-4 py-8">
          <div className="rounded-xl border border-border bg-surface p-8 text-center">
            <User className="mx-auto mb-4 h-16 w-16 text-text-muted" />
            <h1 className="mb-2 text-2xl font-bold text-text">
              User not found
            </h1>
            <p className="mb-4 text-text-muted">
              No user with the username &quot;{username}&quot; exists.
            </p>
            <Link to="/leaderboard" className={primaryButtonStyles('sm')}>
              View Leaderboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isOwner = currentProfile.isOwner;
  const displayName =
    currentProfile.displayName ?? currentProfile.username ?? 'Anonymous';

  const favoritePick = weekends ? computeFavoritePick(weekends) : null;
  const favoriteDriver = favoritePick
    ? drivers?.find((d) => d._id === favoritePick.driverId)
    : null;

  return (
    <div className="bg-page">
      <div className="mx-auto max-w-4xl px-4 py-8">
        {/* Profile header */}
        <div className="mb-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-4">
              <Avatar
                avatarUrl={currentProfile.avatarUrl}
                username={currentProfile.username}
                size="lg"
              />
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h1 className="truncate text-3xl font-bold text-text">
                    {displayName}
                  </h1>
                  {isOwner && (
                    <Link
                      to="/settings"
                      className="rounded-md p-1.5 text-text-muted hover:bg-surface-muted hover:text-text"
                      title="Settings"
                    >
                      <Settings className="h-4 w-4" />
                    </Link>
                  )}
                </div>
                {currentProfile.username && (
                  <p className="text-text-muted">@{currentProfile.username}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Stats grid */}
        <div className="mb-4 grid grid-cols-4 gap-3">
          <div className="rounded-xl border border-border bg-surface p-3 text-center">
            <div className="text-2xl font-bold text-accent">
              {stats?.totalPoints ?? '—'}
            </div>
            <div className="text-xs text-text-muted">Total Points</div>
          </div>
          <div className="rounded-xl border border-border bg-surface p-3 text-center">
            <div className="text-2xl font-bold text-text">
              {stats?.weekendCount ?? '—'}
            </div>
            <div className="text-xs text-text-muted">Weekends</div>
          </div>
          <div className="rounded-xl border border-border bg-surface p-3 text-center">
            <div className="text-2xl font-bold text-text">
              {stats?.scoredWeekends ?? '—'}
            </div>
            <div className="text-xs text-text-muted">Scored</div>
          </div>
          <div className="rounded-xl border border-border bg-surface p-3 text-center">
            <div className="flex items-center justify-center gap-1">
              <Hash className="h-4 w-4 text-accent" />
              <span className="text-2xl font-bold text-accent">
                {stats?.seasonRank ?? '—'}
              </span>
            </div>
            <div className="text-xs text-text-muted">
              {stats ? `of ${stats.totalPlayers}` : 'Rank'}
            </div>
          </div>
        </div>

        {/* Favorite Pick */}
        {favoritePick && favoriteDriver && (
          <div className="mb-4 overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
            <div className="flex items-center gap-2 border-b border-border/60 bg-surface-muted/40 px-4 py-2.5">
              <Star className="h-5 w-5 shrink-0 text-accent" />
              <h2 className="text-sm font-semibold text-text">
                {isOwner ? 'Your Favorite Pick' : 'Favorite Pick'}
              </h2>
              <Tooltip
                placement="top"
                content={
                  <span className="block max-w-[240px] rounded bg-text px-2 py-1.5 text-xs font-medium text-white shadow-sm">
                    Weighted by where they were picked: P1 = 5 pts, P2 = 4, P3 =
                    3, P4 = 2, P5 = 1. The driver picked in top positions most.
                  </span>
                }
              >
                <Info className="h-4 w-4 shrink-0 text-text-muted" />
              </Tooltip>
            </div>
            <div className="flex items-stretch">
              <div
                className="flex w-16 shrink-0 flex-col items-center justify-center py-4 text-white"
                style={{
                  backgroundColor:
                    favoriteDriver.team &&
                    (TEAM_COLORS[favoriteDriver.team] ?? '#666'),
                }}
              >
                {favoriteDriver.number != null && (
                  <span className="font-mono text-2xl font-bold">
                    {favoriteDriver.number}
                  </span>
                )}
                <span className="font-mono text-xs font-bold tracking-wider text-white/90">
                  {favoriteDriver.code}
                </span>
              </div>
              <div className="flex min-w-0 flex-1 flex-col justify-center gap-1 px-4 py-4">
                <div className="flex flex-wrap items-center gap-2">
                  {favoriteDriver.nationality && (
                    <Flag
                      code={favoriteDriver.nationality}
                      size="md"
                      className="shrink-0"
                    />
                  )}
                  {favoriteDriver.displayName && (
                    <span className="text-lg font-semibold text-text">
                      {favoriteDriver.displayName}
                    </span>
                  )}
                </div>
                {favoriteDriver.team && (
                  <span className="text-sm text-text-muted">
                    {favoriteDriver.team}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Prediction history */}
        {weekends === undefined ? (
          <PageLoader />
        ) : weekends.length === 0 ? (
          <div className="rounded-xl border border-border bg-surface p-8 text-center">
            <History className="mx-auto mb-4 h-16 w-16 text-text-muted" />
            <h2 className="mb-2 text-xl font-semibold text-text">
              No predictions yet
            </h2>
            <p className="text-text-muted">
              {isOwner
                ? 'Make your first prediction to start tracking your scores.'
                : 'This user has not made any predictions yet.'}
            </p>
            {isOwner && (
              <Link
                to="/races"
                className={`mt-4 inline-block ${primaryButtonStyles('sm')}`}
              >
                View Races
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {weekends.map((weekend) => (
              <WeekendCard
                key={weekend.raceId}
                weekend={weekend}
                drivers={drivers}
                h2hHistory={h2hHistory}
                h2hPicksByRace={h2hPicksByRace}
                isOwner={isOwner}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
