import {
  SignInButton,
  SignedIn,
  SignedOut,
  UserButton,
} from '@clerk/clerk-react';

const signInButtonClasses =
  'inline-flex items-center justify-center gap-2 px-3 py-2 text-sm font-semibold rounded-lg bg-button-accent text-white hover:bg-button-accent-hover transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 disabled:cursor-not-allowed disabled:opacity-50';

/**
 * User avatar when signed in; Sign in button when signed out. Sign in is hidden
 * on mobile (min-[703px]:block) so it can live in the mobile menu; matches Header MEDIA_MATCH_BREAKPOINT.
 */
export default function HeaderUser() {
  return (
    <>
      <SignedIn>
        <UserButton
          appearance={{
            elements: {
              userButtonTrigger:
                'rounded-lg border border-border bg-surface px-2 py-1 transition-colors hover:bg-surface-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/60',
            },
          }}
        />
      </SignedIn>
      <SignedOut>
        <div className="hidden min-[703px]:block">
          <SignInButton mode="modal">
            <button type="button" className={signInButtonClasses}>
              Sign in
            </button>
          </SignInButton>
        </div>
      </SignedOut>
    </>
  );
}

export { signInButtonClasses };
