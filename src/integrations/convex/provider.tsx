import { ConvexProviderWithClerk } from 'convex/react-clerk';
import { ConvexReactClient } from 'convex/react';
import { useAuth } from '@clerk/clerk-react';
import { PropsWithChildren } from 'react';

const CONVEX_URL = (import.meta as any).env.VITE_CONVEX_URL;
if (!CONVEX_URL) {
  console.error('missing envar CONVEX_URL');
}

const convex = new ConvexReactClient(CONVEX_URL);

export default function AppConvexProvider({ children }: PropsWithChildren) {
  return (
    <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
      {children}
    </ConvexProviderWithClerk>
  );
}
