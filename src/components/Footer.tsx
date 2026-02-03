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

export default function Footer() {
  return (
    <footer className="border-t border-border bg-surface mt-auto">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-sm text-text-muted">
          <p className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1">
              <span>Made by</span>
              <a
                href="https://barrymichaeldoyle.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:underline"
              >
                Barry Michael Doyle
              </a>
            </div>
            <span>·</span>
            <a
              href="https://x.com/barrymdoyle"
              target="_blank"
              rel="noopener noreferrer"
              className="text-text-muted hover:text-accent transition-colors"
              aria-label="X (Twitter)"
            >
              <XIcon className="w-4 h-4" />
            </a>
            <a
              href="https://www.linkedin.com/in/barry-michael-doyle-11369683/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-text-muted hover:text-accent transition-colors"
              aria-label="LinkedIn"
            >
              <LinkedInIcon className="w-4 h-4" />
            </a>
          </p>
          <p className="text-xs">
            This is a fan-made project. Not affiliated with Formula 1, FIA, or
            any related entities.
          </p>
        </div>
      </div>
    </footer>
  );
}
