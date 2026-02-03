import type { Meta, StoryObj } from '@storybook/react';

import type { BadgeVariant } from './Badge';
import { Badge } from './Badge';

const meta: Meta<typeof Badge> = {
  title: 'Design System/Badges',
  component: Badge,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Pill-style badges for race cards: **Next up**, **Sprint** (weekend has a sprint), and **status** (open for predictions, not yet open, locked, finished). Toggle **Theme** to check contrast.',
      },
    },
  },
  argTypes: {
    variant: {
      control: 'select',
      options: [
        'next',
        'sprint',
        'upcoming',
        'not_yet_open',
        'locked',
        'finished',
      ] satisfies Array<BadgeVariant>,
    },
  },
};

export default meta;

type Story = StoryObj<typeof Badge>;

export const NextUp: Story = {
  args: {
    variant: 'next',
    children: 'NEXT UP',
  },
};

export const Sprint: Story = {
  args: {
    variant: 'sprint',
    children: 'SPRINT',
  },
};

export const OpenForPredictions: Story = {
  args: {
    variant: 'upcoming',
  },
  parameters: {
    docs: {
      description: {
        story: 'Status when the race is next and predictions are open.',
      },
    },
  },
};

export const NotYetOpen: Story = {
  args: {
    variant: 'not_yet_open',
  },
};

export const Locked: Story = {
  args: {
    variant: 'locked',
  },
};

export const Finished: Story = {
  args: {
    variant: 'finished',
  },
};

export const AllBadges: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Badge variant="next">NEXT UP</Badge>
      <Badge variant="sprint">SPRINT</Badge>
      <Badge variant="upcoming" />
      <Badge variant="not_yet_open" />
      <Badge variant="locked" />
      <Badge variant="finished" />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'All badge variants in one row. Toggle theme to verify light/dark.',
      },
    },
  },
};
