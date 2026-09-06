import { getRaceWriteup } from '@/lib/raceWriteups';

/**
 * Head metadata that hands a circuit page's search equity to the race run there.
 *
 * Measured on prod 2026-09-06: about 70% of every circuit page's body text is
 * reproduced verbatim on the corresponding race page, which carries the same
 * venue prose plus the schedule, the classification and how the picks scored.
 * The circuit page is a strict subset of a better page, at 190-240 words, and
 * there are 23 of them — 28% of the sitemap asking to be indexed for content
 * that is already published somewhere stronger. That shape is what AdSense has
 * now turned the site down for three times as "low value content".
 *
 * So the circuit pages stop competing. They stay reachable and unchanged for
 * players — `/circuits` links to them, and they are the natural home for a
 * venue briefing while you are reading about a weekend — they just stop asking
 * to be indexed and point their canonical at the race.
 *
 * Same treatment, and the same reasoning, as `racePageWriteupHeadOptions`.
 *
 * The target is the write-up when the race has one, never the race page that
 * would itself canonicalise onward: a canonical chain wastes the signal this
 * exists to consolidate.
 *
 * Returns null when no race in the loaded season is held at this circuit. Then
 * the page is nobody's duplicate and stays indexable on its own account.
 */
export function circuitPageCanonicalOptions(
  racesHere: readonly { round: number; slug: string }[],
): { canonicalPath: string; noIndex: true } | null {
  const race = [...racesHere].sort((a, b) => a.round - b.round)[0];
  if (!race) {
    return null;
  }
  const writeup = getRaceWriteup(race.slug);
  return {
    canonicalPath: writeup ? writeup.to : `/races/${race.slug}`,
    noIndex: true,
  };
}
