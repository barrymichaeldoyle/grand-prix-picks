import type { Meta, StoryObj } from '@storybook/react';
import { Check } from 'lucide-react';

import Button from '../components/Button';

const meta: Meta<typeof Button> = {
  title: 'Design System/Buttons',
  component: Button,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Use the <Button> component for consistent primary, saved, loading, and disabled states. For links styled as buttons, use `primaryButtonStyles(size)`. Toggle **Theme** to verify contrast.',
      },
    },
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'saved', 'loading'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md'],
    },
  },
};

export default meta;

type Story = StoryObj<typeof Button>;

export const Primary: Story = {
  args: {
    variant: 'primary',
    size: 'md',
    children: 'Submit Prediction',
  },
};

export const PrimarySmall: Story = {
  args: {
    variant: 'primary',
    size: 'sm',
    children: 'Sign In',
  },
};

export const Saved: Story = {
  args: {
    saved: true,
    children: (
      <>
        <Check size={20} className="shrink-0" />
        Saved
      </>
    ),
  },
  parameters: {
    docs: {
      description: {
        story: 'Success state after submit. High-contrast in both themes.',
      },
    },
  },
};

export const Loading: Story = {
  args: {
    loading: true,
    children: 'Saving...',
  },
};

export const Disabled: Story = {
  args: {
    variant: 'primary',
    disabled: true,
    children: 'Submit Prediction',
  },
  parameters: {
    docs: {
      description: {
        story: 'Disabled primary (e.g. not enough picks selected).',
      },
    },
  },
};

export const AllStates: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-4">
      <Button variant="primary" size="md">
        Submit Prediction
      </Button>
      <Button saved>
        <Check size={20} className="shrink-0" />
        Saved
      </Button>
      <Button loading>Saving...</Button>
      <Button variant="primary" disabled>
        Submit Prediction
      </Button>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Side-by-side comparison of all button states.',
      },
    },
  },
};
