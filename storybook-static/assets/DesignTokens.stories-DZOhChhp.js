import { j as e } from './iframe-DH8CsTCL.js';
import './preload-helper-PPVm8Dsz.js';
const c = {
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
  },
  a = {
    render: () =>
      e.jsxs('div', {
        className: 'space-y-6 text-text',
        children: [
          e.jsxs('div', {
            children: [
              e.jsx('h1', {
                className: 'text-2xl font-bold mb-2',
                children: 'Design Tokens',
              }),
              e.jsxs('p', {
                className: 'text-text-muted',
                children: [
                  'Use Tailwind utilities: ',
                  e.jsx('code', {
                    className: 'bg-surface-muted px-1 rounded',
                    children: 'bg-page',
                  }),
                  ',',
                  ' ',
                  e.jsx('code', {
                    className: 'bg-surface-muted px-1 rounded',
                    children: 'bg-surface',
                  }),
                  ',',
                  ' ',
                  e.jsx('code', {
                    className: 'bg-surface-muted px-1 rounded',
                    children: 'text-text',
                  }),
                  ',',
                  ' ',
                  e.jsx('code', {
                    className: 'bg-surface-muted px-1 rounded',
                    children: 'text-text-muted',
                  }),
                  ',',
                  ' ',
                  e.jsx('code', {
                    className: 'bg-surface-muted px-1 rounded',
                    children: 'border-border',
                  }),
                  ',',
                  ' ',
                  e.jsx('code', {
                    className: 'bg-surface-muted px-1 rounded',
                    children: 'bg-accent',
                  }),
                  ', etc.',
                ],
              }),
            ],
          }),
          e.jsx('div', {
            className:
              'grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-4',
            children: [
              { name: 'page', var: 'var(--page)' },
              { name: 'surface', var: 'var(--surface)' },
              { name: 'text', var: 'var(--text)' },
              { name: 'accent', var: 'var(--accent)' },
              { name: 'success', var: 'var(--success)' },
              { name: 'warning', var: 'var(--warning)' },
              { name: 'error', var: 'var(--error)' },
            ].map(({ name: r, var: d }) =>
              e.jsxs(
                'div',
                {
                  children: [
                    e.jsx('div', {
                      className: 'h-16 rounded-lg border border-border',
                      style: { backgroundColor: d },
                    }),
                    e.jsx('div', {
                      className: 'mt-1 text-sm text-text-muted',
                      children: r,
                    }),
                  ],
                },
                r,
              ),
            ),
          }),
          e.jsxs('p', {
            className: 'text-sm text-text-muted',
            children: [
              'Add ',
              e.jsx('code', {
                className: 'bg-surface-muted px-1 rounded',
                children: '.dark',
              }),
              ' to',
              ' ',
              e.jsx('code', {
                className: 'bg-surface-muted px-1 rounded',
                children: '<html>',
              }),
              ' or set',
              ' ',
              e.jsx('code', {
                className: 'bg-surface-muted px-1 rounded',
                children: 'data-theme="dark"',
              }),
              ' to switch to dark mode.',
            ],
          }),
        ],
      }),
  };
a.parameters = {
  ...a.parameters,
  docs: {
    ...a.parameters?.docs,
    source: {
      originalSource: `{
  render: () => <div className="space-y-6 text-text">
      <div>
        <h1 className="text-2xl font-bold mb-2">Design Tokens</h1>
        <p className="text-text-muted">
          Use Tailwind utilities: <code className="bg-surface-muted px-1 rounded">bg-page</code>,{' '}
          <code className="bg-surface-muted px-1 rounded">bg-surface</code>,{' '}
          <code className="bg-surface-muted px-1 rounded">text-text</code>,{' '}
          <code className="bg-surface-muted px-1 rounded">text-text-muted</code>,{' '}
          <code className="bg-surface-muted px-1 rounded">border-border</code>,{' '}
          <code className="bg-surface-muted px-1 rounded">bg-accent</code>, etc.
        </p>
      </div>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-4">
        {[{
        name: 'page',
        var: 'var(--page)'
      }, {
        name: 'surface',
        var: 'var(--surface)'
      }, {
        name: 'text',
        var: 'var(--text)'
      }, {
        name: 'accent',
        var: 'var(--accent)'
      }, {
        name: 'success',
        var: 'var(--success)'
      }, {
        name: 'warning',
        var: 'var(--warning)'
      }, {
        name: 'error',
        var: 'var(--error)'
      }].map(({
        name,
        var: v
      }) => <div key={name}>
            <div className="h-16 rounded-lg border border-border" style={{
          backgroundColor: v
        }} />
            <div className="mt-1 text-sm text-text-muted">{name}</div>
          </div>)}
      </div>

      <p className="text-sm text-text-muted">
        Add <code className="bg-surface-muted px-1 rounded">.dark</code> to{' '}
        <code className="bg-surface-muted px-1 rounded">&lt;html&gt;</code> or set{' '}
        <code className="bg-surface-muted px-1 rounded">data-theme=&quot;dark&quot;</code> to
        switch to dark mode.
      </p>
    </div>
}`,
      ...a.parameters?.docs?.source,
    },
  },
};
const o = ['Tokens'];
export { a as Tokens, o as __namedExportsOrder, c as default };
