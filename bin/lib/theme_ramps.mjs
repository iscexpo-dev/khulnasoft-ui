/**
 * Theme ramp generation library.
 *
 * Pure functions used by `../generate_theme_ramps.mjs` to derive the
 * `--gl-color-neutral-*` ramps for every theme (default included) from a
 * single frozen contrast spec.
 *
 * Design:
 *
 * 1. `TARGET_RATIOS` is the structural source of truth for every neutral
 *    ramp. The default scale is generated from the same spec as the tinted
 *    themes, so all six themes go through one code path.
 * 2. `THEME_KEY_COLORS` contains per-theme key colors (one or more
 *    anchors per theme). Leonardo interpolates through them in
 *    `COLOR_SPACE` to hit each target ratio against `ANCHOR_HEX`.
 * 3. The script is utility-only and never writes to disk; output is copied
 *    by hand into `src/tokens/constant/color.neutral.tokens.json` (the
 *    `default` block) and `src/scss/themes.scss` (the tinted blocks). See
 *    `doc/contributing/theme_ramps.md`.
 */

import { BackgroundColor, Color, Theme, contrast } from '@adobe/leonardo-contrast-colors';

/**
 * The 14 ordered neutral steps shipped by the design system.
 */
export const NEUTRAL_STEPS = [0, 10, 50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950, 1000];

/**
 * Light-mode anchor; the ratio of every other step is measured against this.
 */
export const ANCHOR_HEX = '#ffffff';

/**
 * Leonardo InterpolationColorspace. OKLCH gives perceptually even ramps and
 * is the chosen baseline for tinted neutrals.
 */
export const COLOR_SPACE = 'OKLCH';

/**
 * WCAG2 contrast ratios (vs. `ANCHOR_HEX`) that every theme's ramp targets.
 *
 * Frozen as the structural spec; hexes are derived from these. Provenance:
 * measured from the legacy hand-tuned default neutral scale in
 * `src/tokens/constant/color.neutral.tokens.json` (rounded to 2dp), then
 * promoted to the canonical spec so the default ramp goes through the
 * same code path as the tinted ones.
 */
export const TARGET_RATIOS = [
  { step: 0, ratio: 1.0 },
  { step: 10, ratio: 1.06 },
  { step: 50, ratio: 1.18 },
  { step: 100, ratio: 1.37 },
  { step: 200, ratio: 1.83 },
  { step: 300, ratio: 2.51 },
  { step: 400, ratio: 3.52 },
  { step: 500, ratio: 4.77 },
  { step: 600, ratio: 6.12 },
  { step: 700, ratio: 8.63 },
  { step: 800, ratio: 11.56 },
  { step: 900, ratio: 14.81 },
  { step: 950, ratio: 17.81 },
  { step: 1000, ratio: 20.37 },
];

/**
 * Per-step ratio overrides applied to every theme except `default`.
 *
 * At 20.37, tinted neutral-1000 (OKLCH L ~0.117) reads as black and sits
 * below the ramp's trend. 19.4 lifts it to L ~0.16. The near-black stays
 * available through the default ramp (`ui-neutral`), which keeps the
 * frozen `TARGET_RATIOS`.
 */
export const TINTED_RATIO_OVERRIDES = {
  1000: 19.4,
};

/**
 * Per-theme key colors. One or more hex anchors per theme (for example a
 * near-white, a mid-tone, and a near-black). Leonardo interpolates
 * through them in `COLOR_SPACE` to hit each `TARGET_RATIOS` step.
 *
 * The `default` entry uses achromatic anchors lifted from the legacy
 * neutral-0/500/1000 hexes so the regenerated default ramp tracks the
 * existing scale closely.
 */
export const THEME_KEY_COLORS = {
  default: ['#f8f8f6', '#747273', '#28272d'],
  indigo: ['#ded6e4', '#777777', '#3e3445'],
  blue: ['#d6dbe4', '#777777', '#343a46'],
  green: ['#d7e3df', '#777777', '#3d4844'],
  red: ['#e7d3db', '#777777', '#45383c'],
  gray: ['#777777'],
};

/**
 * Convert a hex color to an [r, g, b] tuple of 0-255 integers.
 *
 * @param {string} hex
 * @returns {[number, number, number]}
 */
export function hexToRgb(hex) {
  const trimmed = hex.replace(/^#/, '');
  const expanded =
    trimmed.length === 3
      ? trimmed
          .split('')
          .map((c) => c + c)
          .join('')
      : trimmed;
  if (!/^[0-9a-fA-F]{6}$/.test(expanded)) {
    throw new Error(`Invalid hex color: ${hex}`);
  }
  return [
    parseInt(expanded.slice(0, 2), 16),
    parseInt(expanded.slice(2, 4), 16),
    parseInt(expanded.slice(4, 6), 16),
  ];
}

/**
 * Expand 3-digit hex to 6-digit and lowercase. Idempotent on 6-digit hex.
 *
 * @param {string} hex
 * @returns {string}
 */
export function normalizeHex(hex) {
  const trimmed = hex.replace(/^#/, '').toLowerCase();
  const expanded =
    trimmed.length === 3
      ? trimmed
          .split('')
          .map((c) => c + c)
          .join('')
      : trimmed;
  return `#${expanded}`;
}

/**
 * Collapse a 6-digit hex to 3-digit form when each channel pair is
 * redundant (e.g. `#ffffff` -> `#fff`). Stylelint's `color-hex-length:
 * short` rule expects shorthand where possible; this keeps generated SCSS
 * lint-clean by default.
 *
 * @param {string} hex
 * @returns {string}
 */
export function shortenHex(hex) {
  const m = /^#([0-9a-f])\1([0-9a-f])\2([0-9a-f])\3$/i.exec(hex);
  return m ? `#${m[1]}${m[2]}${m[3]}` : hex;
}

/**
 * Round to 2 decimal places for stable diffing.
 *
 * @param {number} n
 * @returns {number}
 */
function roundRatio(n) {
  return Math.round(n * 100) / 100;
}

/**
 * Generate one theme's ramp by feeding `keyColors` plus the module-level
 * `TARGET_RATIOS` (sans anchor) into Leonardo.
 *
 * @param {string[]} keyColors - One or more hex anchors for the ramp.
 * @param {Object<number, number>} [ratioOverrides] - step -> ratio, replacing
 *   that step's `TARGET_RATIOS` entry.
 * @returns {Array<{ step: number, hex: string }>} ordered by step.
 */
export function generateRamp(keyColors, ratioOverrides = {}) {
  if (!Array.isArray(keyColors) || keyColors.length === 0) {
    throw new Error('keyColors must be a non-empty array');
  }

  const anchorEntry = TARGET_RATIOS.find((t) => t.ratio === 1);
  const targets = TARGET_RATIOS.filter((t) => t !== anchorEntry).map((t) =>
    t.step in ratioOverrides ? { step: t.step, ratio: ratioOverrides[t.step] } : t,
  );
  const ratios = targets.map((t) => t.ratio);

  const background = new BackgroundColor({
    name: 'background',
    colorKeys: [ANCHOR_HEX],
    colorSpace: COLOR_SPACE,
    ratios: [1],
  });

  const neutral = new Color({
    name: 'neutral',
    colorKeys: keyColors,
    colorSpace: COLOR_SPACE,
    ratios,
  });

  const theme = new Theme({
    colors: [neutral],
    backgroundColor: background,
    lightness: 100,
    output: 'HEX',
  });

  // contrastColors[0] = { background: '#xxxxxx' }
  // contrastColors[1] = { name: 'neutral', values: [{ name, contrast, value }, ...] }
  const themeColors = theme.contrastColors;
  const neutralEntry = themeColors[1];
  if (!neutralEntry?.values) {
    throw new Error('Leonardo did not return neutral values');
  }

  const generated = neutralEntry.values.map((v, i) => ({
    step: targets[i].step,
    hex: normalizeHex(v.value),
  }));

  return [{ step: anchorEntry.step, hex: normalizeHex(ANCHOR_HEX) }, ...generated];
}

/**
 * Generate ramps for every theme in `THEME_KEY_COLORS`. Tinted themes get
 * `TINTED_RATIO_OVERRIDES`; `default` does not.
 *
 * @returns {Object<string, Array<{ step: number, hex: string }>>} themeValue -> ramp
 */
export function generateAllThemes() {
  return Object.fromEntries(
    Object.entries(THEME_KEY_COLORS).map(([themeValue, keyColors]) => [
      themeValue,
      generateRamp(keyColors, themeValue === 'default' ? {} : TINTED_RATIO_OVERRIDES),
    ]),
  );
}

/**
 * Format a generated theme set as the SCSS shape used in
 * `src/scss/themes.scss` (tinted themes) and as a paste target for the
 * `default` neutrals in `src/tokens/constant/color.neutral.tokens.json`.
 *
 * `default` emits `:root { ... }` (no class). Tinted themes emit
 * `:root.ui-<value> { ... }`. The class name is derived as
 * `ui-${value}`;
 * adding a theme is a one-line change to `THEME_KEY_COLORS`.
 *
 * @param {Object<string, Array<{ step: number, hex: string }>>} themesOutput
 * @returns {string}
 */
export function formatScss(themesOutput) {
  const blocks = [];
  for (const [themeValue, ramp] of Object.entries(themesOutput)) {
    const selector = themeValue === 'default' ? ':root' : `:root.ui-${themeValue}`;
    const lines = ramp.map(({ step, hex }) => `  --gl-color-neutral-${step}: ${shortenHex(hex)};`);
    blocks.push(`${selector} {\n${lines.join('\n')}\n}`);
  }
  return `${blocks.join('\n\n')}\n`;
}

/**
 * Compute the actual achieved WCAG2 contrast ratio of a generated ramp
 * against `ANCHOR_HEX`. Useful for diagnostic logging.
 *
 * @param {Array<{ step: number, hex: string }>} ramp
 * @returns {Array<{ step: number, hex: string, ratio: number }>}
 */
export function measureRamp(ramp) {
  const anchorRgb = hexToRgb(ANCHOR_HEX);
  return ramp.map(({ step, hex }) => ({
    step,
    hex,
    ratio: roundRatio(contrast(hexToRgb(hex), anchorRgb)),
  }));
}
