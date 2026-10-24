import {
  ANCHOR_HEX,
  COLOR_SPACE,
  NEUTRAL_STEPS,
  TARGET_RATIOS,
  THEME_KEY_COLORS,
  TINTED_RATIO_OVERRIDES,
  formatScss,
  generateAllThemes,
  generateRamp,
  hexToRgb,
  measureRamp,
  normalizeHex,
  shortenHex,
} from './theme_ramps.mjs';

describe('theme_ramps', () => {
  describe('module constants', () => {
    it('TARGET_RATIOS covers every neutral step in order', () => {
      expect(TARGET_RATIOS.map((t) => t.step)).toEqual(NEUTRAL_STEPS);
    });

    it('TARGET_RATIOS starts at the anchor (ratio 1)', () => {
      expect(TARGET_RATIOS[0]).toEqual({ step: 0, ratio: 1.0 });
    });

    it('TARGET_RATIOS is monotonically increasing', () => {
      for (let i = 1; i < TARGET_RATIOS.length; i += 1) {
        expect(TARGET_RATIOS[i].ratio).toBeGreaterThan(TARGET_RATIOS[i - 1].ratio);
      }
    });

    it('THEME_KEY_COLORS contains the default theme', () => {
      expect(THEME_KEY_COLORS.default).toBeDefined();
      expect(THEME_KEY_COLORS.default.length).toBeGreaterThan(0);
    });

    it('declares a single anchor and color space', () => {
      expect(ANCHOR_HEX).toBe('#ffffff');
      expect(COLOR_SPACE).toBe('OKLCH');
    });
  });

  describe('hexToRgb', () => {
    it('parses 6-digit hex', () => {
      expect(hexToRgb('#ff0000')).toEqual([255, 0, 0]);
    });

    it('parses 3-digit hex', () => {
      expect(hexToRgb('#fff')).toEqual([255, 255, 255]);
    });

    it('handles missing # prefix', () => {
      expect(hexToRgb('00ff00')).toEqual([0, 255, 0]);
    });

    it('throws on invalid hex', () => {
      expect(() => hexToRgb('#xyz')).toThrow(/Invalid hex/);
    });
  });

  describe('normalizeHex', () => {
    it('expands 3-digit to 6-digit and lowercases', () => {
      expect(normalizeHex('#FFF')).toBe('#ffffff');
    });

    it('lowercases 6-digit hex', () => {
      expect(normalizeHex('#ABCDEF')).toBe('#abcdef');
    });

    it('is idempotent', () => {
      expect(normalizeHex(normalizeHex('#FFF'))).toBe('#ffffff');
    });
  });

  describe('shortenHex', () => {
    it('collapses fully redundant 6-digit hex to 3-digit', () => {
      expect(shortenHex('#ffffff')).toBe('#fff');
      expect(shortenHex('#000000')).toBe('#000');
      expect(shortenHex('#aabbcc')).toBe('#abc');
    });

    it('leaves non-redundant hex alone', () => {
      expect(shortenHex('#abcdef')).toBe('#abcdef');
      expect(shortenHex('#737278')).toBe('#737278');
    });

    it('is idempotent on already-short hex', () => {
      expect(shortenHex('#fff')).toBe('#fff');
    });
  });

  describe('generateRamp', () => {
    it('returns one entry per neutral step', () => {
      const ramp = generateRamp(['#1f2458']);
      expect(ramp).toHaveLength(NEUTRAL_STEPS.length);
      expect(ramp.map((entry) => entry.step)).toEqual(NEUTRAL_STEPS);
    });

    it('pins the anchor step to ANCHOR_HEX', () => {
      const ramp = generateRamp(['#1f2458']);
      expect(ramp[0]).toEqual({ step: 0, hex: ANCHOR_HEX });
    });

    it('produces hex values that approximately hit each target ratio', () => {
      const ramp = generateRamp(['#1f2458']);
      const measured = measureRamp(ramp);
      // Allow generous tolerance — Leonardo's solver is approximate.
      measured.forEach((entry, i) => {
        const target = TARGET_RATIOS[i].ratio;
        expect(Math.abs(entry.ratio - target)).toBeLessThan(0.5);
      });
    });

    it('throws on empty keyColors', () => {
      expect(() => generateRamp([])).toThrow(/non-empty/);
    });

    it('accepts multiple key colors', () => {
      const ramp = generateRamp(['#d1d3e9', '#737278', '#1f2458']);
      expect(ramp).toHaveLength(NEUTRAL_STEPS.length);
    });

    it('targets an overridden ratio for that step only', () => {
      const base = measureRamp(generateRamp(['#1f2458']));
      const overridden = measureRamp(generateRamp(['#1f2458'], { 1000: 19 }));
      expect(Math.abs(overridden.at(-1).ratio - 19)).toBeLessThan(0.5);
      expect(overridden.slice(0, -1)).toEqual(base.slice(0, -1));
    });
  });

  describe('generateAllThemes', () => {
    it('generates a ramp for every theme in THEME_KEY_COLORS', () => {
      const result = generateAllThemes();
      expect(Object.keys(result).sort()).toEqual(Object.keys(THEME_KEY_COLORS).sort());
    });

    it('includes the default theme', () => {
      const result = generateAllThemes();
      expect(result.default).toHaveLength(NEUTRAL_STEPS.length);
    });

    it('applies TINTED_RATIO_OVERRIDES to tinted themes but not default', () => {
      const result = generateAllThemes();
      expect(result.default).toEqual(generateRamp(THEME_KEY_COLORS.default));
      expect(result.indigo).toEqual(generateRamp(THEME_KEY_COLORS.indigo, TINTED_RATIO_OVERRIDES));
    });

    it('produces full-length ramps for every theme', () => {
      const result = generateAllThemes();
      for (const ramp of Object.values(result)) {
        expect(ramp).toHaveLength(NEUTRAL_STEPS.length);
      }
    });
  });

  describe('formatScss', () => {
    it('emits :root for the default theme (no class)', () => {
      const themesOutput = {
        default: [
          { step: 0, hex: '#ffffff' },
          { step: 1000, hex: '#050506' },
        ],
      };
      const scss = formatScss(themesOutput);
      expect(scss).toContain(':root {');
      expect(scss).not.toContain(':root.ui-default');
    });

    it('emits :root.ui-<value> for tinted themes', () => {
      const themesOutput = {
        blue: [
          { step: 0, hex: '#ffffff' },
          { step: 1000, hex: '#040508' },
        ],
      };
      const scss = formatScss(themesOutput);
      expect(scss).toContain(':root.ui-blue {');
      expect(scss).toContain('--gl-color-neutral-1000: #040508;');
    });

    it('shortens fully-redundant hex values', () => {
      const themesOutput = {
        default: [{ step: 0, hex: '#ffffff' }],
      };
      const scss = formatScss(themesOutput);
      expect(scss).toContain('--gl-color-neutral-0: #fff;');
      expect(scss).not.toContain('#ffffff');
    });

    it('separates blocks with a blank line', () => {
      const themesOutput = {
        default: [{ step: 0, hex: '#fff' }],
        blue: [{ step: 0, hex: '#fff' }],
      };
      const scss = formatScss(themesOutput);
      expect(scss).toMatch(/}\n\n:root\.ui-blue/);
    });

    it('emits the default block before tinted blocks when iterated in order', () => {
      const themesOutput = {
        default: [{ step: 0, hex: '#fff' }],
        blue: [{ step: 0, hex: '#fff' }],
      };
      const scss = formatScss(themesOutput);
      expect(scss.indexOf(':root {')).toBeLessThan(scss.indexOf(':root.ui-blue'));
    });

    it('terminates output with a trailing newline', () => {
      const themesOutput = { default: [{ step: 0, hex: '#fff' }] };
      const scss = formatScss(themesOutput);
      expect(scss.endsWith('}\n')).toBe(true);
    });
  });

  describe('measureRamp', () => {
    it('returns ratio 1 for the anchor itself', () => {
      const measured = measureRamp([{ step: 0, hex: '#ffffff' }]);
      expect(measured[0].ratio).toBe(1);
    });

    it('returns ~21 for black against white', () => {
      const measured = measureRamp([{ step: 1000, hex: '#000000' }]);
      expect(measured[0].ratio).toBeGreaterThan(20);
      expect(measured[0].ratio).toBeLessThan(22);
    });
  });
});
