import { GL_COLOR_NEUTRAL_0, GL_COLOR_NEUTRAL_950 } from '../../tokens/build/js/tokens';
import { relativeLuminance, rgbFromHex } from '../utils';
import { colorPaletteDefault, colorPaletteDark, heatmapHues, heatmapHuesDark } from './theme';

const LIGHT_SURFACE = GL_COLOR_NEUTRAL_0;
const DARK_SURFACE = GL_COLOR_NEUTRAL_950;

// WCAG 1.4.11: non-text content needs 3:1 against what sits behind it.
const MINIMUM_CONTRAST = 3;

const luminance = (hex) => relativeLuminance(rgbFromHex(hex));

const contrastRatio = (a, b) => {
  const [lighter, darker] = [luminance(a), luminance(b)].sort((x, y) => y - x);

  return (lighter + 0.05) / (darker + 0.05);
};

describe('chart palette contrast', () => {
  describe('categorical palettes', () => {
    /**
     * Series colours are chosen in JavaScript and never change with the colour mode, so a chart in
     * dark mode renders the light palette. That is only survivable because the leading entries
     * clear 3:1 against both surfaces. Nothing in the palette's construction guarantees it, so
     * assert it: if it stops being true, every categorical chart regresses in dark mode at once.
     *
     * Only the leading run is dual-safe. Later entries step towards their own surface by design.
     */
    const DUAL_SURFACE_ENTRIES = 5;

    it.each(colorPaletteDefault.slice(0, DUAL_SURFACE_ENTRIES).map((c, i) => [i, c]))(
      'default palette entry %i (%s) is legible on either surface',
      (_index, color) => {
        expect(contrastRatio(color, LIGHT_SURFACE)).toBeGreaterThanOrEqual(MINIMUM_CONTRAST);
        expect(contrastRatio(color, DARK_SURFACE)).toBeGreaterThanOrEqual(MINIMUM_CONTRAST);
      },
    );

    it('every default palette entry is legible on a light surface', () => {
      colorPaletteDefault.forEach((color) => {
        expect(contrastRatio(color, LIGHT_SURFACE)).toBeGreaterThanOrEqual(MINIMUM_CONTRAST);
      });
    });

    it('every dark palette entry is legible on a dark surface', () => {
      colorPaletteDark.forEach((color) => {
        expect(contrastRatio(color, DARK_SURFACE)).toBeGreaterThanOrEqual(MINIMUM_CONTRAST);
      });
    });
  });

  describe('heatmap sequential scale', () => {
    // The lowest step means "nothing here", so it is deliberately close to the surface and exempt.
    it.each([
      ['light', heatmapHues, LIGHT_SURFACE],
      ['dark', heatmapHuesDark, DARK_SURFACE],
    ])('%s data steps are legible on their own surface', (_mode, hues, surface) => {
      hues.slice(1).forEach((color) => {
        expect(contrastRatio(color, surface)).toBeGreaterThanOrEqual(MINIMUM_CONTRAST);
      });
    });

    it.each([
      ['light', heatmapHues, LIGHT_SURFACE],
      ['dark', heatmapHuesDark, DARK_SURFACE],
    ])('%s steps increase in contrast with the surface', (_mode, hues, surface) => {
      const ratios = hues.map((color) => contrastRatio(color, surface));

      expect(ratios).toEqual([...ratios].sort((a, b) => a - b));
    });
  });
});
