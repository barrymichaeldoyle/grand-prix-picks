import { act } from 'react';
import type { Root } from 'react-dom/client';
import { createRoot } from 'react-dom/client';
import { afterEach, describe, expect, it } from 'vitest';

import type { OfficialResultSession } from './RaceWriteupOfficialResult';
import { RaceWriteupOfficialResult } from './RaceWriteupOfficialResult';

(
  globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

function driver(position: number, code: string) {
  return {
    position,
    driverId: `driver-${code}`,
    code,
    displayName: `${code} Driver`,
    team: 'Mercedes',
    number: position,
    nationality: 'GB',
  };
}

describe('race write-up official result', () => {
  let container: HTMLDivElement | null = null;
  let root: Root | null = null;

  afterEach(() => {
    act(() => root?.unmount());
    container?.remove();
    container = null;
    root = null;
  });

  function render(sessions: OfficialResultSession[]) {
    container = document.createElement('div');
    document.body.append(container);
    root = createRoot(container);
    act(() =>
      root!.render(
        <RaceWriteupOfficialResult sessions={sessions} venueName="Monza" />,
      ),
    );
    return container;
  }

  it('renders a table per scored session, in the order they ran', () => {
    const rendered = render([
      { session: 'quali', classification: [driver(1, 'GAS')] },
      { session: 'race', classification: [driver(1, 'ANT'), driver(2, 'RUS')] },
    ]);

    expect(
      [...rendered.querySelectorAll('h3')].map(
        (heading) => heading.textContent,
      ),
    ).toEqual(['Qualifying', 'Race']);
    expect(
      [...rendered.querySelectorAll('tbody tr')].map(
        (row) => row.querySelector('th')?.textContent,
      ),
    ).toEqual(['P1', 'P1', 'P2']);
  });

  // A weekend where only qualifying has been published is a real state on
  // Saturday evening, and it must not render an empty Race table beside it.
  it('drops a session with nothing published', () => {
    const rendered = render([
      { session: 'quali', classification: [driver(1, 'GAS')] },
      { session: 'race', classification: [] },
    ]);

    expect(
      [...rendered.querySelectorAll('h3')].map(
        (heading) => heading.textContent,
      ),
    ).toEqual(['Qualifying']);
  });

  it('renders nothing before anything is published', () => {
    expect(
      render([
        { session: 'quali', classification: [] },
        { session: 'race', classification: [] },
      ]).textContent,
    ).toBe('');
  });
});
