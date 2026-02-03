import type { Meta, StoryObj } from '@storybook/react';

import type { Doc, Id } from '../../convex/_generated/dataModel';
import { StorybookRouter } from '../stories/router-decorator';
import RaceCard from './RaceCard';
import RaceCardSkeleton from './RaceCardSkeleton';

/** Mock race for comparison stories (no Convex). */
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

const meta: Meta<typeof RaceCardSkeleton> = {
  component: RaceCardSkeleton,
  decorators: [
    (Story) => (
      <StorybookRouter>
        <Story />
      </StorybookRouter>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof RaceCardSkeleton>;

export const Default: Story = {
  args: {},
};

export const AsNext: Story = {
  args: {
    isNext: true,
  },
};

/** Side-by-side: skeleton vs real RaceCard for layout and isNext comparison. */
export const CompareWithRaceCard: Story = {
  render: () => (
    <StorybookRouter>
      <div className="flex flex-col gap-10 p-4 max-w-2xl">
        <div className="flex flex-col gap-3">
          <p className="text-sm font-semibold text-text-muted">
            Skeleton (isNext) vs RaceCard (isNext)
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <span className="text-xs text-text-muted">Skeleton</span>
              <RaceCardSkeleton isNext />
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs text-text-muted">RaceCard</span>
              <RaceCard
                race={mockRace({ status: 'upcoming' })}
                isNext
                predictionOpenAt={null}
              />
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-3">
          <p className="text-sm font-semibold text-text-muted">
            Skeleton (!isNext) vs RaceCard (!isNext)
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <span className="text-xs text-text-muted">Skeleton</span>
              <RaceCardSkeleton />
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs text-text-muted">RaceCard</span>
              <RaceCard
                race={mockRace({
                  round: 2,
                  name: 'Saudi Arabian Grand Prix',
                  slug: 'saudi-2026',
                  status: 'upcoming',
                })}
                isNext={false}
                predictionOpenAt={Date.now() + 14 * 24 * 60 * 60 * 1000}
              />
            </div>
          </div>
        </div>
      </div>
    </StorybookRouter>
  ),
};
