import type { WriteUpNewsPhotoProps } from '@/components/WriteUpNewsPhoto';

/**
 * Every photo in this page's margin sits in the same 18rem column, so the
 * width and the shape are shared and only the subject changes.
 *
 * Landscape 3:2 throughout. The portrait shape the Monza set uses is for a
 * person, and none of these are people: a circuit, a car and a tyre.
 */
const MADRID_WRITEUP_LANDSCAPE = {
  sizes: '(min-width: 1024px) 18rem, 100vw',
  width: 900,
  height: 600,
  modificationNote: 'cropped and resized',
} as const;

/**
 * The Madrid write-up's first photograph.
 *
 * There is nothing to photograph at the Madring yet: it has held a Formula 3
 * test and no Grand Prix, and Wikimedia carries the circuit's logo and two
 * layout diagrams but no usable picture of the place. So the one section on
 * the page with a subject that can be photographed is the one about 1981, and
 * the picture is Jarama.
 *
 * Landscape, following the rule the Monza set established: a circuit, not a
 * person. The `context` line is load-bearing here rather than decorative. The
 * section is about a race in 1981 and the photo is from 2010, so without a
 * date on it a reader would take the grandstand, the timing board and the
 * modern signage for how it looked when Formula 1 last raced there.
 */
export const JARAMA_WRITEUP_IMAGE = {
  ...MADRID_WRITEUP_LANDSCAPE,
  src: '/media/carlos-delgado-jarama-pit-straight-2010-900.webp',
  srcSet:
    '/media/carlos-delgado-jarama-pit-straight-2010-450.webp 450w, /media/carlos-delgado-jarama-pit-straight-2010-900.webp 900w',
  alt: 'The pit straight at the Jarama circuit near Madrid, with the control tower and an empty concrete grandstand behind it',
  context: 'Jarama, 2010',
  creditName: 'Carlos Delgado',
  creditUrl:
    'https://commons.wikimedia.org/wiki/File:Tribuna_recta_Circuito_del_Jarama.jpg',
  licenseName: 'CC BY-SA 3.0',
  licenseUrl: 'https://creativecommons.org/licenses/by-sa/3.0/',
} as const satisfies WriteUpNewsPhotoProps;

/**
 * Hraynor, CC0. Silverstone, July 2026; beside the Formula 3 test.
 *
 * The section it sits in is about the only competitive laps this circuit has
 * seen, and they were run in this car. A driver photo would name somebody who
 * is not on the Formula 1 grid and cannot be picked; the car is the fact the
 * section turns on, which is why this one is a car and the house preference
 * for people does not apply.
 *
 * Silverstone rather than the Madring, because there is no photograph of the
 * Madring: Wikimedia carries the circuit's logo and two layout diagrams and
 * nothing else, checked again on 6 September 2026. The `context` line says
 * where and when, so nobody reads a British circuit as a Spanish one.
 */
export const FORMULA_THREE_WRITEUP_IMAGE = {
  ...MADRID_WRITEUP_LANDSCAPE,
  src: '/media/hraynor-formula-3-silverstone-2026-900.webp',
  srcSet:
    '/media/hraynor-formula-3-silverstone-2026-450.webp 450w, /media/hraynor-formula-3-silverstone-2026-900.webp 900w',
  alt: 'A 2026 Formula 3 car at speed on track, panned against a blurred background',
  context: 'Formula 3 at Silverstone, 2026',
  creditName: 'Hraynor',
  creditUrl:
    'https://commons.wikimedia.org/wiki/File:Louis_Sharp_2026_Formula_3_British_Grand_Prix.jpg',
  licenseName: 'CC0',
  licenseUrl: 'https://creativecommons.org/publicdomain/zero/1.0/',
} as const satisfies WriteUpNewsPhotoProps;

/**
 * TaurusEmerald, CC BY-SA 4.0. Beside the compound selection.
 *
 * The same two files the Monza write-up serves. A tyre is not a fact about a
 * circuit, so the picture is reusable in a way none of the others here are,
 * and re-encoding it under a Madrid name would put a second copy of the same
 * bytes in the bundle to no end.
 *
 * What cannot be shared is the entry. It is the one portrait photo on this
 * page, so it does not take the landscape shape above, and `sizes` has to
 * describe this page's column rather than Monza's.
 */
export const PIRELLI_MEDIUM_WRITEUP_IMAGE = {
  src: '/media/taurusemerald-pirelli-medium-slick-2026-896.webp',
  srcSet:
    '/media/taurusemerald-pirelli-medium-slick-2026-448.webp 448w, /media/taurusemerald-pirelli-medium-slick-2026-896.webp 896w',
  // The column from `lg` up, and the cap `WriteUpNewsPhoto` puts on a portrait
  // below it, which is the width this actually paints when it is stacked.
  sizes: '(min-width: 1024px) 18rem, (min-width: 640px) 20rem, 16rem',
  width: 896,
  height: 1120,
  modificationNote: 'cropped and resized',
  alt: 'A Pirelli P Zero medium slick tyre on a Formula 1 car, with the yellow P Zero and Pirelli lettering on the sidewall',
  context: 'August 2026',
  creditName: 'TaurusEmerald',
  creditUrl:
    'https://commons.wikimedia.org/wiki/File:Pirelli_P_Zero_Formula_1_Medium_Slick_Tyre_2026.jpg',
  licenseName: 'CC BY-SA 4.0',
  licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
} as const satisfies WriteUpNewsPhotoProps;
