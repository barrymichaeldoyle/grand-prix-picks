import {
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  RouterProvider,
} from '@tanstack/react-router';
import { createContext, useContext } from 'react';

const StoryContext = createContext<React.ReactNode>(null);

function StoryOutlet() {
  const story = useContext(StoryContext);
  return story ?? <Outlet />;
}

const rootRoute = createRootRoute({
  component: StoryOutlet,
});

const racesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'races',
  component: StoryOutlet,
});

const raceIdRoute = createRoute({
  getParentRoute: () => racesRoute,
  path: '$raceId',
  component: StoryOutlet,
});

const routeTree = rootRoute.addChildren([
  racesRoute.addChildren([raceIdRoute]),
]);

const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
});

export function StorybookRouter({ children }: { children: React.ReactNode }) {
  return (
    <StoryContext.Provider value={children}>
      <RouterProvider router={router} />
    </StoryContext.Provider>
  );
}
