import { Link } from '@tanstack/react-router';
import { Calendar, Clock, Lock, Trophy, ChevronRight } from 'lucide-react';
import type { Doc } from '../../convex/_generated/dataModel';

type Race = Doc<'races'>;

interface RaceCardProps {
  race: Race;
  isNext?: boolean;
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

function StatusBadge({ status }: { status: string }) {
  const styles = {
    upcoming: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    locked: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    finished: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
  };

  const icons = {
    upcoming: <Clock size={14} />,
    locked: <Lock size={14} />,
    finished: <Trophy size={14} />,
  };

  const labels = {
    upcoming: 'Open for predictions',
    locked: 'Predictions locked',
    finished: 'Finished',
  };

  const style = styles[status as keyof typeof styles] || styles.upcoming;
  const icon = icons[status as keyof typeof icons] || icons.upcoming;
  const label = labels[status as keyof typeof labels] || status;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border ${style}`}
    >
      {icon}
      {label}
    </span>
  );
}

export default function RaceCard({ race, isNext }: RaceCardProps) {
  const isPredictable = race.status === 'upcoming';

  return (
    <Link
      to="/races/$raceId"
      params={{ raceId: race._id }}
      className={`block bg-slate-800/50 backdrop-blur-sm border rounded-xl p-5 transition-all duration-300 hover:shadow-lg group ${
        isNext
          ? 'border-cyan-500/50 hover:border-cyan-400 hover:shadow-cyan-500/10'
          : 'border-slate-700 hover:border-slate-600'
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-sm font-medium text-slate-500">
              Round {race.round}
            </span>
            {isNext && (
              <span className="px-2 py-0.5 text-xs font-semibold bg-cyan-500/20 text-cyan-400 rounded">
                NEXT UP
              </span>
            )}
          </div>

          <h3 className="text-xl font-semibold text-white mb-3 truncate">
            {race.name}
          </h3>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-400">
            <span className="inline-flex items-center gap-1.5">
              <Calendar size={16} className="text-slate-500" />
              {formatDate(race.raceStartAt)}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock size={16} className="text-slate-500" />
              {formatTime(race.raceStartAt)}
            </span>
            {isPredictable && (
              <span className="text-cyan-400 font-medium">
                {getTimeUntil(race.predictionLockAt)} to predict
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-col items-end gap-3">
          <StatusBadge status={race.status} />
          <ChevronRight
            size={20}
            className="text-slate-600 group-hover:text-slate-400 transition-colors"
          />
        </div>
      </div>
    </Link>
  );
}
