import { createFileRoute } from '@tanstack/react-router';
import { ConvexHttpClient } from 'convex/browser';
import { useQuery } from 'convex/react';
import { Loader2, Medal, Swords, Trophy, User } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

import { api } from '../../convex/_generated/api';
import { Button } from '../components/Button';

const convex = new ConvexHttpClient(import.meta.env.VITE_CONVEX_URL);

const PODIUM_SIZE = 3;
const PAGE_SIZE = 50;

export const Route = createFileRoute('/leaderboard')({
  component: LeaderboardPage,
  loader: async () => {
    const leaderboard = await convex.query(
      api.leaderboards.getSeasonLeaderboard,
      { limit: PODIUM_SIZE },
    );
    return { initialLeaderboard: leaderboard };
  },
  head: () => ({
    meta: [
      { title: 'Leaderboard | Grand Prix Picks' },
      {
        name: 'description',
        content:
          'See who tops the 2026 F1 prediction standings. Track your ranking against other players.',
      },
    ],
  }),
});

type LeaderboardEntry = {
  rank: number;
  userId: string;
  username: string;
  points: number;
  raceCount: number;
  isViewer: boolean;
};

type H2HLeaderboardEntry = LeaderboardEntry & {
  correctPicks: number;
  totalPicks: number;
};

type ActiveTab = 'top5' | 'h2h';

function LeaderboardPage() {
  const { initialLeaderboard } = Route.useLoaderData();
  const [activeTab, setActiveTab] = useState<ActiveTab>('top5');

  // Top 5 leaderboard state
  const [entries, setEntries] = useState<Array<LeaderboardEntry>>(
    initialLeaderboard.entries,
  );
  const [offset, setOffset] = useState(PAGE_SIZE);
  const [hasMore, setHasMore] = useState(initialLeaderboard.hasMore);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const clientLeaderboard = useQuery(api.leaderboards.getSeasonLeaderboard, {
    limit: PAGE_SIZE,
  });

  useEffect(() => {
    if (clientLeaderboard && offset === PAGE_SIZE) {
      setEntries(clientLeaderboard.entries);
      setHasMore(clientLeaderboard.hasMore);
    }
  }, [clientLeaderboard, offset]);

  const data = clientLeaderboard ?? initialLeaderboard;
  const viewerEntry = data.viewerEntry;
  const totalCount = data.totalCount;

  const loadMoreRef = useRef<HTMLDivElement>(null);

  const loadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;

    setIsLoadingMore(true);
    try {
      const more = await convex.query(api.leaderboards.getSeasonLeaderboard, {
        limit: PAGE_SIZE,
        offset,
      });
      setEntries((prev) => [...prev, ...more.entries]);
      setOffset((prev) => prev + PAGE_SIZE);
      setHasMore(more.hasMore);
    } finally {
      setIsLoadingMore(false);
    }
  }, [offset, hasMore, isLoadingMore]);

  useEffect(() => {
    if (activeTab !== 'top5') return;

    const observer = new IntersectionObserver(
      (observerEntries) => {
        if (observerEntries[0].isIntersecting && hasMore && !isLoadingMore) {
          void loadMore();
        }
      },
      { rootMargin: '200px' },
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [activeTab, hasMore, isLoadingMore, loadMore]);

  const podiumEntries = entries.slice(0, 3);
  const tableEntries = entries.slice(3);

  return (
    <div className="min-h-screen bg-page">
      <div className="mx-auto max-w-4xl px-4 py-8">
        {/* Header with viewer position */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="mb-1 text-3xl font-bold text-text">Leaderboard</h1>
            <p className="text-text-muted">
              2026 Season Standings · {totalCount.toLocaleString()} players
            </p>
          </div>

          {activeTab === 'top5' && viewerEntry && (
            <div className="-mb-3 flex items-center gap-3 rounded-xl border-2 border-accent bg-accent-muted px-4 py-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-lg font-bold text-white">
                {viewerEntry.rank}
              </span>
              <div>
                <div className="flex items-center gap-1.5 text-sm font-medium text-text">
                  <User className="h-3.5 w-3.5 text-accent" />
                  Your Rank
                </div>
                <div className="text-lg font-bold text-accent">
                  {viewerEntry.points} pts
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Tab bar */}
        <div
          className="mb-6 flex gap-1 rounded-lg border border-border bg-surface-muted/50 p-1"
          role="tablist"
        >
          <Button
            variant="tab"
            size="tab"
            active={activeTab === 'top5'}
            onClick={() => setActiveTab('top5')}
            className="flex-1"
          >
            <Trophy className="h-4 w-4" />
            Top 5
          </Button>
          <Button
            variant="tab"
            size="tab"
            active={activeTab === 'h2h'}
            onClick={() => setActiveTab('h2h')}
            className="flex-1"
          >
            <Swords className="h-4 w-4" />
            Head to Head
          </Button>
        </div>

        {activeTab === 'top5' ? (
          <>
            {entries.length === 0 ? (
              <div
                className="rounded-xl border border-border bg-surface p-8 text-center"
                data-testid="leaderboard-empty"
              >
                <Trophy className="mx-auto mb-4 h-16 w-16 text-text-muted" />
                <h2 className="mb-2 text-xl font-semibold text-text">
                  No scores yet
                </h2>
                <p className="text-text-muted">
                  The leaderboard will populate once race results are published.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {podiumEntries.length >= 3 && (
                  <div className="mb-6 grid grid-cols-3 gap-3">
                    <PodiumCard entry={podiumEntries[1]} place={2} />
                    <PodiumCard entry={podiumEntries[0]} place={1} />
                    <PodiumCard entry={podiumEntries[2]} place={3} />
                  </div>
                )}

                <div className="overflow-hidden rounded-xl border border-border bg-surface">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="px-4 py-3 text-left text-sm font-semibold text-text-muted">
                          Rank
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-text-muted">
                          Player
                        </th>
                        <th className="px-4 py-3 text-right text-sm font-semibold text-text-muted">
                          Races
                        </th>
                        <th className="px-4 py-3 text-right text-sm font-semibold text-text-muted">
                          Points
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {tableEntries.length > 0
                        ? tableEntries.map((entry) => (
                            <LeaderboardRow key={entry.userId} entry={entry} />
                          ))
                        : !clientLeaderboard &&
                          hasMore &&
                          Array.from({ length: 10 }, (_, i) => (
                            <SkeletonRow key={i} />
                          ))}
                    </tbody>
                  </table>

                  {!hasMore && entries.length <= 3 && entries.length > 0 && (
                    <SmallLeaderboard entries={entries} />
                  )}
                </div>

                <div ref={loadMoreRef} className="py-4 text-center">
                  {isLoadingMore && (
                    <div className="flex items-center justify-center gap-2 text-text-muted">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading more...
                    </div>
                  )}
                  {!hasMore && entries.length > PAGE_SIZE && (
                    <p className="text-sm text-text-muted">
                      You've reached the end · {totalCount.toLocaleString()}{' '}
                      players
                    </p>
                  )}
                </div>
              </div>
            )}
          </>
        ) : (
          <H2HLeaderboardContent />
        )}
      </div>
    </div>
  );
}

// ───────────────────────── H2H Leaderboard Tab ─────────────────────────

function H2HLeaderboardContent() {
  const h2hData = useQuery(api.h2h.getH2HSeasonLeaderboard, {
    limit: PAGE_SIZE,
  });

  if (h2hData === undefined) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-text-muted" />
      </div>
    );
  }

  const entries = h2hData.entries as Array<H2HLeaderboardEntry>;
  const viewerEntry = h2hData.viewerEntry as H2HLeaderboardEntry | null;
  const podiumEntries = entries.slice(0, 3);
  const tableEntries = entries.slice(3);

  if (entries.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-surface p-8 text-center">
        <Swords className="mx-auto mb-4 h-16 w-16 text-text-muted" />
        <h2 className="mb-2 text-xl font-semibold text-text">
          No H2H scores yet
        </h2>
        <p className="text-text-muted">
          Head-to-head scores will appear once race results are published.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Viewer's H2H rank */}
      {viewerEntry && (
        <div className="mb-4 flex items-center gap-3 rounded-xl border-2 border-accent bg-accent-muted px-4 py-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-lg font-bold text-white">
            {viewerEntry.rank}
          </span>
          <div>
            <div className="flex items-center gap-1.5 text-sm font-medium text-text">
              <User className="h-3.5 w-3.5 text-accent" />
              Your H2H Rank
            </div>
            <div className="text-lg font-bold text-accent">
              {viewerEntry.points} pts
              <span className="ml-2 text-sm font-normal text-text-muted">
                ({viewerEntry.correctPicks}/{viewerEntry.totalPicks} correct)
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Podium */}
      {podiumEntries.length >= 3 && (
        <div className="mb-6 grid grid-cols-3 gap-3">
          <PodiumCard entry={podiumEntries[1]} place={2} />
          <PodiumCard entry={podiumEntries[0]} place={1} />
          <PodiumCard entry={podiumEntries[2]} place={3} />
        </div>
      )}

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-border bg-surface">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="px-4 py-3 text-left text-sm font-semibold text-text-muted">
                Rank
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-text-muted">
                Player
              </th>
              <th className="hidden px-4 py-3 text-right text-sm font-semibold text-text-muted sm:table-cell">
                Accuracy
              </th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-text-muted">
                Points
              </th>
            </tr>
          </thead>
          <tbody>
            {tableEntries.length > 0
              ? tableEntries.map((entry) => (
                  <tr
                    key={entry.userId}
                    className={`border-b border-border transition-colors last:border-0 ${
                      entry.isViewer
                        ? 'bg-accent-muted hover:bg-accent-muted'
                        : 'hover:bg-surface-muted'
                    }`}
                  >
                    <td className="px-4 py-3">
                      <span
                        className={`font-medium ${entry.isViewer ? 'text-accent' : 'text-text-muted'}`}
                      >
                        {entry.rank}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-2 font-medium text-text">
                        {entry.isViewer && (
                          <User className="h-4 w-4 text-accent" />
                        )}
                        {entry.username}
                        {entry.isViewer && (
                          <span className="rounded-full bg-accent px-1.5 py-0.5 text-[10px] font-bold text-white">
                            YOU
                          </span>
                        )}
                      </span>
                    </td>
                    <td className="hidden px-4 py-3 text-right sm:table-cell">
                      <span className="text-sm text-text-muted">
                        {entry.correctPicks}/{entry.totalPicks}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="font-bold text-accent">
                        {entry.points}
                      </span>
                    </td>
                  </tr>
                ))
              : null}
          </tbody>
        </table>

        {entries.length <= 3 && entries.length > 0 && (
          <SmallLeaderboard entries={entries} />
        )}
      </div>
    </div>
  );
}

// ───────────────────────── Shared Components ─────────────────────────

function LeaderboardRow({ entry }: { entry: LeaderboardEntry }) {
  return (
    <tr
      className={`border-b border-border transition-colors last:border-0 ${
        entry.isViewer
          ? 'bg-accent-muted hover:bg-accent-muted'
          : 'hover:bg-surface-muted'
      }`}
      data-testid="leaderboard-entry"
    >
      <td className="px-4 py-3" data-testid="position">
        <span
          className={`font-medium ${entry.isViewer ? 'text-accent' : 'text-text-muted'}`}
        >
          {entry.rank}
        </span>
      </td>
      <td className="px-4 py-3" data-testid="username">
        <span className="flex items-center gap-2 font-medium text-text">
          {entry.isViewer && <User className="h-4 w-4 text-accent" />}
          {entry.username}
          {entry.isViewer && (
            <span className="rounded-full bg-accent px-1.5 py-0.5 text-[10px] font-bold text-white">
              YOU
            </span>
          )}
        </span>
      </td>
      <td className="px-4 py-3 text-right">
        <span className="text-sm text-text-muted">{entry.raceCount}</span>
      </td>
      <td className="px-4 py-3 text-right" data-testid="points">
        <span className="font-bold text-accent">{entry.points}</span>
      </td>
    </tr>
  );
}

function SkeletonRow() {
  return (
    <tr className="border-b border-border last:border-0">
      <td className="px-4 py-3">
        <div className="h-4 w-6 animate-pulse rounded bg-border" />
      </td>
      <td className="px-4 py-3">
        <div className="h-4 w-24 animate-pulse rounded bg-border" />
      </td>
      <td className="px-4 py-3">
        <div className="ml-auto h-4 w-6 animate-pulse rounded bg-border" />
      </td>
      <td className="px-4 py-3">
        <div className="ml-auto h-4 w-10 animate-pulse rounded bg-border" />
      </td>
    </tr>
  );
}

function SmallLeaderboard({ entries }: { entries: Array<LeaderboardEntry> }) {
  return (
    <div className="p-4">
      {entries.map((entry) => (
        <div
          key={entry.userId}
          className={`flex items-center justify-between border-b border-border py-2 last:border-0 ${
            entry.isViewer ? 'rounded-lg bg-accent-muted px-2' : ''
          }`}
        >
          <div className="flex items-center gap-3">
            <span
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                entry.isViewer
                  ? 'bg-accent text-white'
                  : 'bg-surface-muted text-text-muted'
              }`}
            >
              {entry.rank}
            </span>
            <span className="flex items-center gap-2 font-medium text-text">
              {entry.username}
              {entry.isViewer && (
                <span className="rounded-full bg-accent px-1.5 py-0.5 text-[10px] font-bold text-white">
                  YOU
                </span>
              )}
            </span>
          </div>
          <div className="text-right">
            <div className="font-bold text-accent">{entry.points} pts</div>
            <div className="text-xs text-text-muted">
              {entry.raceCount} race{entry.raceCount !== 1 ? 's' : ''}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function PodiumCard({
  entry,
  place,
}: {
  entry: LeaderboardEntry;
  place: 1 | 2 | 3;
}) {
  const isFirst = place === 1;
  const marginTop = place === 1 ? '' : place === 2 ? 'mt-8' : 'mt-12';

  const borderStyle = entry.isViewer
    ? 'border-accent bg-accent-muted ring-2 ring-accent'
    : isFirst
      ? 'border-warning/30 bg-surface'
      : 'border-border bg-surface';

  const Icon = isFirst ? Trophy : Medal;
  const iconColor = isFirst
    ? 'text-warning'
    : place === 2
      ? 'text-text-muted'
      : 'text-warning';
  const bgColor = isFirst
    ? 'bg-warning-muted'
    : place === 2
      ? 'bg-surface-muted'
      : 'bg-warning-muted';
  const textColor = isFirst
    ? 'text-warning'
    : place === 2
      ? 'text-text-muted'
      : 'text-warning';
  const placeLabels = { 1: '1st', 2: '2nd', 3: '3rd' };

  return (
    <div
      className={`${marginTop} rounded-xl border p-4 text-center ${borderStyle}`}
    >
      <div
        className={`mx-auto mb-2 flex items-center justify-center rounded-full ${bgColor} ${
          isFirst ? 'h-14 w-14' : 'h-12 w-12'
        }`}
      >
        <Icon className={`${isFirst ? 'h-8 w-8' : 'h-6 w-6'} ${iconColor}`} />
      </div>
      <div className={`text-2xl font-bold ${textColor}`}>
        {placeLabels[place]}
      </div>
      <div
        className={`mt-1 flex items-center justify-center gap-1.5 truncate ${
          isFirst ? 'font-semibold' : 'font-medium'
        } text-text`}
      >
        {entry.isViewer && <User className="h-4 w-4 text-accent" />}
        {entry.username}
        {entry.isViewer && (
          <span className="rounded-full bg-accent px-1.5 py-0.5 text-[10px] font-bold text-white">
            YOU
          </span>
        )}
      </div>
      <div
        className={`${isFirst ? 'text-xl' : 'text-lg'} font-bold text-accent`}
      >
        {entry.points} pts
      </div>
      <div className="text-xs text-text-muted">
        {entry.raceCount} race{entry.raceCount !== 1 ? 's' : ''}
      </div>
    </div>
  );
}
