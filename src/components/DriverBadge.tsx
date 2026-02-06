import { Flag } from './Flag';
import { Tooltip } from './Tooltip';

// F1 2026 team colors (darkened for white text contrast)
export const TEAM_COLORS: Record<string, string> = {
  McLaren: '#E67300',
  Ferrari: '#DC0028',
  'Red Bull Racing': '#2B5AA8',
  Mercedes: '#00A383',
  'Aston Martin': '#1A7A5A',
  Alpine: '#E0569A',
  Williams: '#1E90D0',
  'Racing Bulls': '#4A72CC',
  Audi: '#6B6B6B',
  Haas: '#6E7275',
  Cadillac: '#1E1E1E',
};

export interface DriverBadgeProps {
  /** Driver 3-letter code (e.g., "VER", "HAM") */
  code: string;
  /** Team name for color lookup */
  team?: string | null;
  /** Driver's full display name */
  displayName?: string | null;
  /** Driver's racing number */
  number?: number | null;
  /** Driver's nationality (ISO 3166-1 alpha-2 code, e.g., "NL", "GB") */
  nationality?: string | null;
}

/**
 * A team-colored badge showing a driver's 3-letter code.
 * Used in results tables to visually match picks with actual results.
 */

export function DriverBadge({
  code,
  team,
  displayName,
  number,
  nationality,
}: DriverBadgeProps) {
  const color = team ? (TEAM_COLORS[team] ?? '#666') : '#666';
  const hasTooltip = displayName || number != null || team || nationality;

  const tooltipContent = hasTooltip ? (
    <div className="relative w-max max-w-[min(100vw-2rem,28rem)] rounded-xl border border-border bg-surface shadow-lg">
      {/* Driver Profile Card */}
      <div className="flex items-stretch">
        {/* Number block with team color */}
        <div
          className="flex w-14 shrink-0 flex-col items-center justify-center rounded-l-xl py-2"
          style={{ backgroundColor: color }}
        >
          {number != null && (
            <span className="font-mono text-xl font-bold text-white">
              {number}
            </span>
          )}
          <span className="font-mono text-[10px] font-bold tracking-wider text-white/80">
            {code}
          </span>
        </div>

        {/* Driver info */}
        <div className="flex flex-col justify-center gap-1 px-3 py-2">
          <div className="flex items-center gap-2">
            {nationality && <Flag code={nationality} size="sm" />}
            {displayName && (
              <span className="whitespace-nowrap font-semibold text-text">
                {displayName}
              </span>
            )}
          </div>
          {team && <span className="text-xs text-text-muted">{team}</span>}
        </div>
      </div>
      <span
        className="absolute top-full left-1/2 -mt-0.25 -translate-x-1/2 border-4 border-transparent border-t-surface"
        aria-hidden
      />
    </div>
  ) : null;

  const badge = (
    <span
      className={`inline-flex h-8 min-w-11 items-center justify-center rounded-md px-2.5 font-mono text-xs leading-none font-bold tracking-wider text-white uppercase shadow-sm ${
        hasTooltip ? 'cursor-help' : ''
      }`}
      style={{ backgroundColor: color }}
    >
      {code}
    </span>
  );

  if (hasTooltip && tooltipContent) {
    return (
      <Tooltip content={tooltipContent} prerender={!!nationality}>
        {badge}
      </Tooltip>
    );
  }

  return badge;
}

/**
 * Skeleton matching DriverBadge dimensions for loading states.
 * Use in tables so layout doesn't shift when driver data loads.
 */
export function DriverBadgeSkeleton() {
  return (
    <span
      className="inline-flex h-8 min-w-11 animate-pulse items-center justify-center rounded-md bg-surface-muted"
      aria-hidden
    />
  );
}
