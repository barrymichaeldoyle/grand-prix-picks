import {
  SignInButton,
  SignedIn,
  SignedOut,
  UserButton,
} from '@clerk/clerk-react';

export default function HeaderUser() {
  const buttonClasses =
    'inline-flex items-center justify-center gap-2 px-3 py-2 text-sm font-semibold rounded-lg bg-button-accent text-white hover:bg-button-accent-hover transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/60';

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
        <SignInButton mode="modal">
          <button
            type="button"
            className={`${buttonClasses} disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            Sign in
          </button>
        </SignInButton>
      </SignedOut>
    </>
  );
}
