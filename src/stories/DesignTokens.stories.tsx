import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta = {
  title: 'Design System/Design Tokens',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Semantic colors used across the app. Toggle **Theme** in the toolbar to compare light and dark mode.',
      },
    },
  },
};

export default meta;

type Story = StoryObj;

export const Tokens: Story = {
  render: () => (
    <div className="space-y-6 text-text">
      <div>
        <h1 className="mb-2 text-2xl font-bold">Design Tokens</h1>
        <p className="text-text-muted">
          Use Tailwind utilities:{' '}
          <code className="rounded bg-surface-muted px-1">bg-page</code>,{' '}
          <code className="rounded bg-surface-muted px-1">bg-surface</code>,{' '}
          <code className="rounded bg-surface-muted px-1">text-text</code>,{' '}
          <code className="rounded bg-surface-muted px-1">text-text-muted</code>
          , <code className="rounded bg-surface-muted px-1">border-border</code>
          , <code className="rounded bg-surface-muted px-1">bg-accent</code>,
          etc.
        </p>
      </div>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-4">
        {[
          { name: 'page', var: 'var(--page)' },
          { name: 'surface', var: 'var(--surface)' },
          { name: 'text', var: 'var(--text)' },
          { name: 'accent', var: 'var(--accent)' },
          { name: 'success', var: 'var(--success)' },
          { name: 'warning', var: 'var(--warning)' },
          { name: 'error', var: 'var(--error)' },
        ].map(({ name, var: v }) => (
          <div key={name}>
            <div
              className="h-16 rounded-lg border border-border"
              style={{ backgroundColor: v }}
            />
            <div className="mt-1 text-sm text-text-muted">{name}</div>
          </div>
        ))}
      </div>

      <p className="text-sm text-text-muted">
        Add <code className="rounded bg-surface-muted px-1">.dark</code> to{' '}
        <code className="rounded bg-surface-muted px-1">&lt;html&gt;</code> or
        set{' '}
        <code className="rounded bg-surface-muted px-1">
          data-theme=&quot;dark&quot;
        </code>{' '}
        to switch to dark mode.
      </p>
    </div>
  ),
};
