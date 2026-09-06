import { act } from 'react';
import type { Root } from 'react-dom/client';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// The section closes with a router `<Link>`, which needs a router context this
// test has no reason to build: the subject is the attribution row.
vi.mock('@/components/ScoringPolicyNote', () => ({
  ScoringPolicyNote: () => null,
}));

const { WeekendNewsSection } = await import('./WeekendNewsSection');

(
  globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

let container: HTMLDivElement;
let root: Root;

beforeEach(() => {
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
});

const item = {
  key: 'alonso-pit-lane-start',
  headline: 'Alonso starts from the pit lane at Monza',
  body: 'Aston Martin changed his power unit under parc ferme overnight.',
  affectsSessions: ['race'],
  sourceName: 'Formula 1',
  sourceUrl: 'https://www.formula1.com/en/latest/article/example',
};

function render(items: Parameters<typeof WeekendNewsSection>[0]['items']) {
  act(() => root.render(<WeekendNewsSection items={items} />));
}

describe('WeekendNewsSection source date', () => {
  it('shows when the source published the story', () => {
    render([
      { ...item, sourcePublishedAt: Date.parse('2026-09-05T09:30:00Z') },
    ]);
    const time = container.querySelector('time');
    expect(time?.textContent).toContain('5 Sept 2026');
    // The machine-readable half. A date a reader can see and a crawler cannot
    // parse is half the reason this field exists.
    expect(time?.getAttribute('datetime')).toBe('2026-09-05');
  });

  it('renders the same date whatever the viewer timezone', () => {
    // SSR writes this into HTML a cache hands to everybody, so a local date
    // would either mismatch on hydration or serve one visitor's day to the
    // next. 23:30 UTC is the hour that would slip to the 6th in Sydney and back
    // to the 5th in Los Angeles.
    render([
      { ...item, sourcePublishedAt: Date.parse('2026-09-05T23:30:00Z') },
    ]);
    expect(container.querySelector('time')?.getAttribute('datetime')).toBe(
      '2026-09-05',
    );
  });

  it('shows no date when the source carried none', () => {
    // Older items predate the field, and a source without a date line is left
    // blank rather than guessed at.
    render([item]);
    expect(container.querySelector('time')).toBeNull();
    // The attribution itself still renders.
    expect(container.textContent).toContain('Formula 1');
  });
});
