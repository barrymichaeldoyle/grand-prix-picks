import { Link } from '@tanstack/react-router';
import { ArrowRight, Calendar, Clock, Lock, Trophy } from 'lucide-react';
import type { Doc } from '../../convex/_generated/dataModel';

type Race = Doc<'races'>;

/** Map race slug prefix to ISO 3166-1 alpha-2 country code for flag images (flagcdn.com). */
const SLUG_TO_COUNTRY: Record<string, string> = {
  australia: 'au',
  china: 'cn',
  japan: 'jp',
  bahrain: 'bh',
  'saudi-arabia': 'sa',
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

function getCountryCodeForRace(race: Race): string | null {
  const key = race.slug.replace(/-\d{4}$/, '').toLowerCase();
  return SLUG_TO_COUNTRY[key] ?? null;
}

const FLAG_CDN = 'https://flagcdn.com';

const FLAG_WIDTH = 40;
const FLAG_HEIGHT = 30;

function RaceFlag({ countryCode }: { countryCode: string }) {
  return (
    <span
      className="inline-block shrink-0 overflow-hidden rounded shadow-sm ring-1 ring-black/5"
      style={{ width: FLAG_WIDTH, height: FLAG_HEIGHT }}
    >
      <img
        src={`${FLAG_CDN}/w80/${countryCode}.png`}
        srcSet={`${FLAG_CDN}/w160/${countryCode}.png 2x`}
        alt=""
        width={FLAG_WIDTH}
        height={FLAG_HEIGHT}
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

const styles = {
  upcoming: 'bg-success-muted text-success border border-success/30',
  not_yet_open: 'bg-surface-muted text-text-muted border border-border',
  locked: 'bg-warning-muted text-warning border border-warning/30',
  finished: 'bg-surface-muted text-text-muted border border-border',
};

const icons = {
  upcoming: <Clock size={14} />,
  not_yet_open: <Lock size={14} />,
  locked: <Lock size={14} />,
  finished: <Trophy size={14} />,
};

export const labels = {
  upcoming: 'Open for predictions',
  not_yet_open: 'Not yet open',
  locked: 'Predictions locked',
  finished: 'Finished',
};

export function StatusBadge({
  status,
  isNext,
}: {
  status: string;
  isNext?: boolean;
}) {
  // For upcoming races that aren't the next one, show as "not yet open"
  const effectiveStatus =
    status === 'upcoming' && !isNext ? 'not_yet_open' : status;

  const style =
    styles[effectiveStatus as keyof typeof styles] || styles.upcoming;
  const icon = icons[effectiveStatus as keyof typeof icons] || icons.upcoming;
  const label =
    labels[effectiveStatus as keyof typeof labels] || effectiveStatus;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border ${style}`}
    >
      {icon}
      {label}
    </span>
  );
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
      className={`group block bg-surface border rounded-xl p-4 sm:p-5 transition-all duration-300 hover:shadow-md cursor-pointer ${
        isNext
          ? 'border-accent/50 hover:border-accent'
          : 'border-border hover:border-border-strong'
      }`}
    >
      <div className="flex items-start gap-3 sm:gap-4">
        <div className="flex-1 min-w-0">
          {/* Top row: flag, round, badges – wraps on narrow screens */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 mb-2">
            {countryCode && (
              <span className="inline-flex shrink-0 items-center">
                <RaceFlag countryCode={countryCode} />
              </span>
            )}
            <span className="text-sm font-medium text-text-muted shrink-0">
              Round {race.round}
            </span>
            {isNext && (
              <span className="px-2 py-0.5 text-xs font-semibold bg-accent-muted text-accent rounded shrink-0">
                NEXT UP
              </span>
            )}
            <StatusBadge status={race.status} isNext={isNext} />
          </div>

          <h3 className="text-lg sm:text-xl font-semibold text-text mb-2 sm:mb-3 line-clamp-2">
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
              <span className="text-accent font-medium w-full sm:w-auto">
                {getTimeUntil(race.predictionLockAt)} to predict
              </span>
            )}
            {isNotYetOpen && predictionOpenAt != null && (
              <span className="text-text-muted w-full sm:w-auto">
                Opens {formatDateLong(predictionOpenAt)}
              </span>
            )}
            {race.status === 'locked' && (
              <span className="text-warning font-medium w-full sm:w-auto">
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
          className="shrink-0 mt-1 text-text-muted transition-colors group-hover:text-text"
          aria-hidden
        />
      </div>
    </Link>
  );
}
