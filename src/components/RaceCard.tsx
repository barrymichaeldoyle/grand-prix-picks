import { Link } from '@tanstack/react-router';
import { ArrowRight, Calendar, Clock } from 'lucide-react';

import type { Doc } from '../../convex/_generated/dataModel';
import { Badge, StatusBadge } from './Badge';

export { StatusBadge } from './Badge';

type Race = Doc<'races'>;

/** Map race slug prefix to ISO 3166-1 alpha-2 country code for flag images (flagcdn.com). */
const SLUG_TO_COUNTRY: Record<string, string> = {
  australia: 'au',
  china: 'cn',
  japan: 'jp',
  bahrain: 'bh',
  'saudi-arabia': 'sa',
  saudi: 'sa',
  miami: 'us',
  canada: 'ca',
  monaco: 'mc',
  spain: 'es',
  madrid: 'es',
  austria: 'at',
  britain: 'gb',
  belgium: 'be',
  hungary: 'hu',
  netherlands: 'nl',
  italy: 'it',
  'emilia-romagna': 'it',
  imola: 'it',
  singapore: 'sg',
  usa: 'us',
  'united-states': 'us',
  mexico: 'mx',
  brazil: 'br',
  qatar: 'qa',
  'abu-dhabi': 'ae',
  uae: 'ae',
  portugal: 'pt',
  'las-vegas': 'us',
  azerbaijan: 'az',
};

export function getCountryCodeForRace(race: { slug: string }): string | null {
  const key = race.slug.replace(/-\d{4}$/, '').toLowerCase();
  return SLUG_TO_COUNTRY[key] ?? null;
}

const FLAG_CDN = 'https://flagcdn.com';

const FLAG_WIDTH = 40;
const FLAG_HEIGHT = 30;

export function RaceFlag({
  countryCode,
  size = 'md',
}: {
  countryCode: string;
  size?: 'md' | 'lg';
}) {
  const w = size === 'lg' ? 56 : FLAG_WIDTH;
  const h = size === 'lg' ? 42 : FLAG_HEIGHT;
  return (
    <span
      className="inline-block shrink-0 overflow-hidden rounded shadow-sm ring-1 ring-black/5"
      style={{ width: w, height: h }}
    >
      <img
        src={`${FLAG_CDN}/w80/${countryCode}.png`}
        srcSet={`${FLAG_CDN}/w160/${countryCode}.png 2x`}
        alt=""
        width={w}
        height={h}
        className="h-full w-full object-cover"
        loading="lazy"
      />
    </span>
  );
}

interface RaceCardProps {
  race: Race;
  isNext?: boolean;
  /** When predictions open (previous race start). Shown for "not yet open" races. */
  predictionOpenAt?: number | null;
}

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
}

function formatDateLong(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function getTimeUntil(timestamp: number): string {
  const now = Date.now();
  const diff = timestamp - now;

  if (diff <= 0) return 'Started';

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  if (days > 0) {
    return `${days}d ${hours}h`;
  }
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours}h ${minutes}m`;
}

export default function RaceCard({
  race,
  isNext,
  predictionOpenAt,
}: RaceCardProps) {
  // Only the next upcoming race is open for predictions
  const isPredictable = race.status === 'upcoming' && isNext;
  const isNotYetOpen = race.status === 'upcoming' && !isNext;

  const countryCode = getCountryCodeForRace(race);

  return (
    <Link
      to="/races/$raceId"
      params={{ raceId: race._id }}
      className={`group block cursor-pointer rounded-xl border bg-surface p-4 transition-all duration-300 hover:scale-[1.02] hover:shadow-md focus-visible:scale-[1.02] focus-visible:shadow-md sm:p-5 ${
        isNext
          ? 'border-accent/50 hover:border-accent'
          : 'border-border hover:border-border-strong'
      }`}
    >
      <div className="flex items-start gap-3 sm:gap-4">
        <div className="min-w-0 flex-1">
          {/* Top row: flag, round, badges – wraps on narrow screens */}
          <div className="mb-2 flex flex-wrap items-center gap-x-3 gap-y-2">
            {countryCode && (
              <span className="inline-flex shrink-0 items-center">
                <RaceFlag countryCode={countryCode} />
              </span>
            )}
            <span className="shrink-0 text-sm font-medium text-text-muted">
              Round {race.round}
            </span>
            {isNext && <Badge variant="next">NEXT UP</Badge>}
            {race.hasSprint && <Badge variant="sprint">SPRINT</Badge>}
            <StatusBadge status={race.status} isNext={isNext} />
          </div>

          <h3 className="mb-2 line-clamp-2 text-lg font-semibold text-text sm:mb-3 sm:text-xl">
            {race.name}
          </h3>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-text-muted">
            <span className="inline-flex items-center gap-1.5">
              <Calendar size={16} className="shrink-0 text-text-muted" />
              {formatDate(race.raceStartAt)}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock size={16} className="shrink-0 text-text-muted" />
              {formatTime(race.raceStartAt)}
            </span>
            {isPredictable && (
              <span className="w-full font-medium text-accent sm:w-auto">
                {getTimeUntil(race.predictionLockAt)} to predict
              </span>
            )}
            {isNotYetOpen && predictionOpenAt != null && (
              <span className="w-full text-text-muted sm:w-auto">
                Opens {formatDateLong(predictionOpenAt)}
              </span>
            )}
            {race.status === 'locked' && (
              <span className="w-full font-medium text-warning sm:w-auto">
                {race.raceStartAt > Date.now()
                  ? `Race in ${getTimeUntil(race.raceStartAt)}`
                  : 'Results pending'}
              </span>
            )}
          </div>
        </div>
        <ArrowRight
          size={18}
          strokeWidth={2}
          className="mt-1 shrink-0 text-text-muted transition-colors group-hover:text-text"
          aria-hidden
        />
      </div>
    </Link>
  );
}
