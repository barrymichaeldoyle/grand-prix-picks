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
        <h1 className="text-2xl font-bold mb-2">Design Tokens</h1>
        <p className="text-text-muted">
          Use Tailwind utilities:{' '}
          <code className="bg-surface-muted px-1 rounded">bg-page</code>,{' '}
          <code className="bg-surface-muted px-1 rounded">bg-surface</code>,{' '}
          <code className="bg-surface-muted px-1 rounded">text-text</code>,{' '}
          <code className="bg-surface-muted px-1 rounded">text-text-muted</code>
          , <code className="bg-surface-muted px-1 rounded">border-border</code>
          , <code className="bg-surface-muted px-1 rounded">bg-accent</code>,
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
        Add <code className="bg-surface-muted px-1 rounded">.dark</code> to{' '}
        <code className="bg-surface-muted px-1 rounded">&lt;html&gt;</code> or
        set{' '}
        <code className="bg-surface-muted px-1 rounded">
          data-theme=&quot;dark&quot;
        </code>{' '}
        to switch to dark mode.
      </p>
    </div>
  ),
};
