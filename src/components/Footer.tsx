import { Link } from '@tanstack/react-router';

function XIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
      fill="currentColor"
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
      fill="currentColor"
    >
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border bg-surface pb-[max(6rem,calc(env(safe-area-inset-bottom,0px)+2rem))] sm:pb-6">
      <div className="mx-auto max-w-4xl px-4 py-6">
        <div className="flex flex-col gap-4 text-sm text-text-muted sm:flex-row sm:items-center sm:gap-10">
          {/* Author + social: one row, wraps as a unit */}
          <div className="flex shrink-0 flex-wrap items-center gap-x-2 gap-y-1">
            <span>Made by</span>
            <a
              href="https://barrymichaeldoyle.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-accent transition-colors hover:text-accent-hover"
            >
              Barry Michael Doyle
            </a>
            <span
              aria-hidden
              className="inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-border"
            />
            <a
              href="https://x.com/barrymdoyle"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent transition-colors hover:text-accent-hover"
              aria-label="X (Twitter)"
            >
              <XIcon className="h-4 w-4" />
            </a>
            <a
              href="https://www.linkedin.com/in/barry-michael-doyle-11369683/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent transition-colors hover:text-accent-hover"
              aria-label="LinkedIn"
            >
              <LinkedInIcon className="h-4 w-4" />
            </a>
          </div>

          {/* Disclaimer + legal links: grouped next to author block */}
          <div className="flex min-w-0 flex-col gap-1">
            <p className="max-w-lg text-xs text-text-muted">
              This is a fan-made project. Not affiliated with Formula 1, FIA, or
              any related entities.
            </p>
            <div className="flex items-center justify-start gap-x-2 text-xs min-[803px]:justify-center">
              <Link
                to="/privacy"
                className="font-semibold text-accent transition-colors hover:text-accent-hover"
              >
                Privacy
              </Link>
              <span
                aria-hidden
                className="inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-border"
              />
              <Link
                to="/terms"
                className="font-semibold text-accent transition-colors hover:text-accent-hover"
              >
                Terms
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
