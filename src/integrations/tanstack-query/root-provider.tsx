import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { PropsWithChildren } from 'react';

export function getContext() {
  const queryClient = new QueryClient();
  return {
    queryClient,
  };
}

export function Provider({
  children,
  queryClient,
}: PropsWithChildren<{
  queryClient: QueryClient;
}>) {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
