import type { Meta, StoryObj } from '@storybook/react';
import RaceCard from './RaceCard';
import { StorybookRouter } from '../stories/router-decorator';
import type { Doc } from '../../convex/_generated/dataModel';
import type { Id } from '../../convex/_generated/dataModel';

/** Mock race for Storybook (no Convex). */
function mockRace(
  overrides: Partial<Doc<'races'> & { _id: Id<'races'> }> = {},
): Doc<'races'> & { _id: Id<'races'> } {
  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;
  return {
    _id: 'mockRace1' as Id<'races'>,
    _creationTime: now,
    season: 2026,
    round: 1,
    name: 'Bahrain Grand Prix',
    slug: 'bahrain-2026',
    raceStartAt: now + 7 * day,
    predictionLockAt: now + 6 * day,
    status: 'upcoming',
    createdAt: now - 30 * day,
    updatedAt: now,
    ...overrides,
  };
}

const meta: Meta<typeof RaceCard> = {
  component: RaceCard,
  decorators: [
    (Story) => (
      <StorybookRouter>
        <div style={{ maxWidth: 480 }}>
          <Story />
        </div>
      </StorybookRouter>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof RaceCard>;

export const NextUp: Story = {
  args: {
    race: mockRace({ status: 'upcoming' }),
    isNext: true,
    predictionOpenAt: null,
  },
};

export const UpcomingNotOpen: Story = {
  args: {
    race: mockRace({
      round: 2,
      name: 'Saudi Arabian Grand Prix',
      slug: 'saudi-2026',
      status: 'upcoming',
    }),
    isNext: false,
    predictionOpenAt: Date.now() + 14 * 24 * 60 * 60 * 1000,
  },
};

export const Locked: Story = {
  args: {
    race: mockRace({
      round: 3,
      name: 'Australian Grand Prix',
      slug: 'australia-2026',
      status: 'locked',
      raceStartAt: Date.now() - 2 * 24 * 60 * 60 * 1000,
    }),
  },
};

export const Finished: Story = {
  args: {
    race: mockRace({
      round: 4,
      name: 'Japanese Grand Prix',
      slug: 'japan-2026',
      status: 'finished',
      raceStartAt: Date.now() - 14 * 24 * 60 * 60 * 1000,
    }),
  },
};
