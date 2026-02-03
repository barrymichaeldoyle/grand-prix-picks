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
      className={`block animate-pulse rounded-xl border bg-surface p-4 sm:p-5 ${
        isNext ? 'border-accent/50' : 'border-border'
      }`}
      aria-hidden
    >
      <div className="flex items-start gap-3 sm:gap-4">
        <div className="min-w-0 flex-1">
          {/* Top row: flag, round, optional NEXT UP, status badge */}
          <div className="mb-2 flex flex-wrap items-center gap-x-3 gap-y-2">
            <span
              className="shrink-0 rounded bg-surface-muted"
              style={{ width: FLAG_WIDTH, height: FLAG_HEIGHT }}
            />
            <span className="h-[14px] w-12 shrink-0 rounded bg-surface-muted" />
            {isNext && (
              <span className="h-5 w-16 shrink-0 rounded bg-accent/20" />
            )}
            <span className="h-6.5 w-28 shrink-0 rounded-full bg-surface-muted" />
          </div>

          {/* Title: one line so skeleton isn’t taller than typical content */}
          <div className="mb-2 flex h-7 items-center py-1 sm:mb-3">
            <span className="block h-5 w-full max-w-[240px] rounded bg-surface-muted" />
          </div>

          {/* Meta: date+time, then second line – "to predict" (isNext) or "Opens [date]" (!isNext); min-height for 2 lines */}
          <div className="flex min-h-[2.5rem] flex-wrap items-center gap-x-4 gap-y-1.5 text-sm">
            <span className="h-5 w-24 shrink-0 rounded bg-surface-muted" />
            <span className="h-5 w-20 shrink-0 rounded bg-surface-muted" />
            {isNext ? (
              <span className="h-5 w-28 min-w-28 shrink-0 basis-full rounded bg-surface-muted sm:basis-auto" />
            ) : (
              <span className="h-5 w-40 min-w-28 shrink-0 basis-full rounded bg-surface-muted sm:basis-auto" />
            )}
          </div>
        </div>
        <span
          className="mt-1 h-[18px] w-[18px] shrink-0 rounded bg-surface-muted"
          aria-hidden
        />
      </div>
    </div>
  );
}
