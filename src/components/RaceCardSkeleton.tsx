/** Skeleton that mirrors RaceCard layout for loading states. */
interface RaceCardSkeletonProps {
  /** When true, shows a placeholder for the "NEXT UP" badge to match the next-race card. */
  isNext?: boolean;
}

const FLAG_WIDTH = 40;
const FLAG_HEIGHT = 30;

export default function RaceCardSkeleton({ isNext }: RaceCardSkeletonProps) {
  return (
    <div
      className={`block bg-surface border rounded-xl p-4 sm:p-5 animate-pulse ${
        isNext ? 'border-accent/50' : 'border-border'
      }`}
      aria-hidden
    >
      <div className="flex items-start gap-3 sm:gap-4">
        <div className="flex-1 min-w-0">
          {/* Top row: flag, round, optional NEXT UP, status badge */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 mb-2">
            <span
              className="shrink-0 rounded bg-surface-muted"
              style={{ width: FLAG_WIDTH, height: FLAG_HEIGHT }}
            />
            <span className="h-[14px] w-12 rounded bg-surface-muted shrink-0" />
            {isNext && (
              <span className="h-5 w-16 rounded bg-accent/20 shrink-0" />
            )}
            <span className="h-6.5 w-28 rounded-full bg-surface-muted shrink-0" />
          </div>

          {/* Title: one line so skeleton isn’t taller than typical content */}
          <div className="mb-2 sm:mb-3 h-7 py-1 flex items-center">
            <span className="block h-5 w-full max-w-[240px] rounded bg-surface-muted" />
          </div>

          {/* Meta: date+time, then second line – "to predict" (isNext) or "Opens [date]" (!isNext); min-height for 2 lines */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm min-h-[2.5rem]">
            <span className="h-5 w-24 rounded bg-surface-muted shrink-0" />
            <span className="h-5 w-20 rounded bg-surface-muted shrink-0" />
            {isNext ? (
              <span className="h-5 w-28 min-w-28 rounded bg-surface-muted basis-full sm:basis-auto shrink-0" />
            ) : (
              <span className="h-5 w-40 min-w-28 rounded bg-surface-muted basis-full sm:basis-auto shrink-0" />
            )}
          </div>
        </div>
        <span
          className="shrink-0 mt-1 h-[18px] w-[18px] rounded bg-surface-muted"
          aria-hidden
        />
      </div>
    </div>
  );
}
