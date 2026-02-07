import { SignInButton, useAuth } from '@clerk/clerk-react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useQuery } from 'convex/react';
import { LogIn } from 'lucide-react';
import { useEffect } from 'react';

import { api } from '../../convex/_generated/api';
import { Button } from '../components/Button';
import { PageLoader } from '../components/PageLoader';

export const Route = createFileRoute('/my-predictions')({
  component: MyPredictionsPage,
  head: () => ({
    meta: [
      { title: 'My Predictions | Grand Prix Picks' },
      {
        name: 'description',
        content:
          'View your F1 prediction history and track your scores across the 2026 season.',
      },
    ],
  }),
});

function MyPredictionsPage() {
  const { isSignedIn, isLoaded } = useAuth();
  const me = useQuery(api.users.me, isSignedIn ? {} : 'skip');
  const navigate = useNavigate();

  useEffect(() => {
    if (me?.username) {
      void navigate({
        to: '/p/$username',
        params: { username: me.username },
        replace: true,
      });
    }
  }, [me?.username, navigate]);

  if (!isLoaded) {
    return <PageLoader />;
  }

  if (!isSignedIn) {
    return (
      <div className="bg-page">
        <div className="mx-auto max-w-4xl px-4 py-8">
          <div className="rounded-xl border border-border bg-surface p-8 text-center">
            <LogIn className="mx-auto mb-4 h-16 w-16 text-text-muted" />
            <h1 className="mb-2 text-2xl font-bold text-text">
              Sign In Required
            </h1>
            <p className="mb-4 text-text-muted">
              Sign in to view your prediction history.
            </p>
            <SignInButton mode="modal">
              <Button size="sm">Sign In</Button>
            </SignInButton>
          </div>
        </div>
      </div>
    );
  }

  // Signed in but waiting for username to redirect
  return <PageLoader />;
}
