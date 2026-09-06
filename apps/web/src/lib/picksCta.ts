/**
 * Copy for the picks call to action that closes a public page.
 *
 * The public pages were terminal for conversion: a reader who finished
 * `/f1-standings` or a guide could reach six other reference pages and never a
 * surface that takes a pick. This is the one panel that ends them, so it has to
 * read correctly in three different situations rather than one.
 *
 * Kept pure and separate from the component so the wording is unit-testable and
 * so the three states are visible in one place when they are edited.
 */
export type PicksCtaState = 'signed-out' | 'no-picks' | 'has-picks';

export type PicksCtaCopy = {
  heading: string;
  body: string;
  action: string;
};

/**
 * Without a venue the heading names the round instead of repeating the button
 * beneath it: "Make your picks" in both places is the same four words twice
 * inside one small panel. With a venue the two already differ enough to stand.
 *
 * A signed-out reader can build a top five without an account but cannot keep
 * one: the draft is held locally and submitted after sign-in. Saying so here is
 * the honest version of the invitation — the alternative ("no account needed")
 * reads as a promise the save step then breaks.
 */
export function picksCtaCopy(
  state: PicksCtaState,
  venueName?: string,
): PicksCtaCopy {
  switch (state) {
    case 'signed-out':
      return {
        heading: venueName
          ? `Make your ${venueName} picks`
          : "This weekend's picks",
        body: 'Rank five drivers for each session. Saving them needs a free account.',
        action: 'Make your picks',
      };
    case 'no-picks':
      return {
        heading: venueName
          ? `Make your ${venueName} picks`
          : "This weekend's picks",
        body: 'Rank five drivers for each session. You can change them until each session locks.',
        action: 'Make your picks',
      };
    case 'has-picks':
      return {
        heading: venueName
          ? `Your ${venueName} picks are in`
          : 'Your picks are in',
        body: 'You can change them until each session locks.',
        action: 'Review your picks',
      };
  }
}
