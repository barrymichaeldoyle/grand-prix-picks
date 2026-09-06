import { describe, expect, it } from 'vitest';

import { circuitPageCanonicalOptions } from './circuitPageSeo';

describe('circuitPageCanonicalOptions', () => {
  it('hands the circuit page to the race held there', () => {
    expect(
      circuitPageCanonicalOptions([{ round: 6, slug: 'monaco-2026' }]),
    ).toEqual({ canonicalPath: '/races/monaco-2026', noIndex: true });
  });

  it('skips a race page that would itself canonicalise onward', () => {
    // italy-2026 has a write-up, so pointing at /races/italy-2026 would build
    // a chain that loses the signal this exists to consolidate.
    expect(
      circuitPageCanonicalOptions([{ round: 16, slug: 'italy-2026' }]),
    ).toEqual({
      canonicalPath: '/f1-2026-italian-grand-prix-predictions',
      noIndex: true,
    });
  });

  it('takes the earliest round when a circuit hosts more than one', () => {
    expect(
      circuitPageCanonicalOptions([
        { round: 20, slug: 'later-2026' },
        { round: 4, slug: 'earlier-2026' },
      ])?.canonicalPath,
    ).toBe('/races/earlier-2026');
  });

  it('leaves a circuit with no round this season indexable on its own', () => {
    expect(circuitPageCanonicalOptions([])).toBeNull();
  });
});
