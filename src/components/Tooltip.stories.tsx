import type { Meta, StoryObj } from '@storybook/react';

import { Tooltip } from './Tooltip';

const meta: Meta<typeof Tooltip> = {
  title: 'Design System/Tooltip',
  component: Tooltip,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Custom tooltip that appears quickly on hover (~75ms). Use instead of native title for snappier feedback.',
      },
    },
  },
  argTypes: {
    placement: {
      control: 'radio',
      options: ['top', 'bottom'],
    },
  },
};

export default meta;

type Story = StoryObj<typeof Tooltip>;

export const Default: Story = {
  args: {
    content: 'Additional information on hover',
    children: (
      <span className="text-text underline decoration-dotted">Hover me</span>
    ),
  },
};

export const Top: Story = {
  args: {
    content: 'Tooltip above the trigger',
    placement: 'top',
    children: (
      <button
        type="button"
        className="rounded bg-accent px-3 py-1.5 text-sm font-medium text-white"
      >
        Hover (top)
      </button>
    ),
  },
};

export const Bottom: Story = {
  args: {
    content: 'Tooltip below the trigger',
    placement: 'bottom',
    children: (
      <button
        type="button"
        className="rounded bg-accent px-3 py-1.5 text-sm font-medium text-white"
      >
        Hover (bottom)
      </button>
    ),
  },
};

export const TableHeader: Story = {
  render: () => (
    <table className="w-full border-collapse">
      <thead>
        <tr className="border-b border-border">
          <th className="px-4 py-2 text-left text-text-muted">Pos</th>
          <th className="px-4 py-2 text-left text-text-muted">Result</th>
          <th className="px-4 py-2 text-right text-text-muted">
            <Tooltip content="Points scored for this pick">
              <span>Pts</span>
            </Tooltip>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td className="px-4 py-2">P1</td>
          <td className="px-4 py-2">VER</td>
          <td className="px-4 py-2 text-right">5</td>
        </tr>
      </tbody>
    </table>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Example: abbreviated column header with tooltip explanation.',
      },
    },
  },
};

export const LegendPills: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Tooltip content="Your pick finished exactly where you predicted">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1 text-xs text-text-muted">
          <span className="h-2 w-2 rounded-full bg-success" aria-hidden />
          Exact: 5 pts
        </span>
      </Tooltip>
      <Tooltip content="Your pick was off by one position">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1 text-xs text-text-muted">
          <span className="h-2 w-2 rounded-full bg-warning" aria-hidden />
          ±1: 3 pts
        </span>
      </Tooltip>
      <Tooltip content="Your pick finished in the top 5, off by 2+ positions">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1 text-xs text-text-muted">
          <span className="h-2 w-2 rounded-full bg-text-muted" aria-hidden />
          Top 5: 1 pt
        </span>
      </Tooltip>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Example: scoring legend with explanatory tooltips.',
      },
    },
  },
};
