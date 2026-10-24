import {
  valuesAreEqual,
  scopesAreEqual,
  parseFloatWithPrecision,
  DTCGToFigmaColorFormat,
  convertValue,
  getVariableType,
} from './figma_sync_tokens_utilities.mjs';

describe('Sync Tokens Utilities', () => {
  describe('valuesAreEqual', () => {
    it('should handle null, undefined, and strict equality', () => {
      expect(valuesAreEqual(null, null)).toBe(true);
      expect(valuesAreEqual(undefined, undefined)).toBe(true);
      expect(valuesAreEqual(42, 42)).toBe(true);
      expect(valuesAreEqual('hello', 'hello')).toBe(true);
      expect(valuesAreEqual(true, true)).toBe(true);
    });

    it('should return false for null/undefined mismatches', () => {
      expect(valuesAreEqual(null, undefined)).toBe(false);
      expect(valuesAreEqual(null, 0)).toBe(false);
      expect(valuesAreEqual(undefined, '')).toBe(false);
    });

    it('should compare variable aliases by ID', () => {
      const alias1 = { type: 'VARIABLE_ALIAS', id: 'var-123' };
      const alias2 = { type: 'VARIABLE_ALIAS', id: 'var-123' };
      const alias3 = { type: 'VARIABLE_ALIAS', id: 'var-456' };

      expect(valuesAreEqual(alias1, alias2)).toBe(true);
      expect(valuesAreEqual(alias1, alias3)).toBe(false);
      expect(valuesAreEqual(alias1, 'string')).toBe(false);
    });

    it('should compare colors with floating-point precision', () => {
      const color1 = { r: 255, g: 128, b: 0, a: 1 };
      const color2 = { r: 255, g: 128, b: 0, a: 1 };
      const color3 = { r: 255.001, g: 128.002, b: 0.003, a: 1.001 };
      const color4 = { r: 254, g: 128, b: 0, a: 1 };

      expect(valuesAreEqual(color1, color2)).toBe(true);
      expect(valuesAreEqual(color1, color3)).toBe(true); // Minor differences
      expect(valuesAreEqual(color1, color4)).toBe(false); // Significant difference
      expect(valuesAreEqual(color1, 'red')).toBe(false);
    });

    it('should handle floating-point precision and special values', () => {
      expect(valuesAreEqual(1.001, 1.002)).toBe(true);
      expect(valuesAreEqual(0.1 + 0.2, 0.3)).toBe(true);
      expect(valuesAreEqual(-1.001, -1.002)).toBe(true);
      expect(valuesAreEqual(0, -0)).toBe(true);
      expect(valuesAreEqual(Infinity, Infinity)).toBe(true);
      expect(valuesAreEqual(-Infinity, -Infinity)).toBe(true);

      expect(valuesAreEqual(1.0, 1.1)).toBe(false);
      expect(valuesAreEqual(Infinity, -Infinity)).toBe(false);
      expect(valuesAreEqual(NaN, NaN)).toBe(false); // NaN !== NaN
    });

    it('should handle strings and booleans', () => {
      expect(valuesAreEqual('hello', 'hello')).toBe(true);
      expect(valuesAreEqual(true, true)).toBe(true);
      expect(valuesAreEqual('hello', 'world')).toBe(false);
      expect(valuesAreEqual(true, false)).toBe(false);
    });

    it('should return false for different types', () => {
      expect(valuesAreEqual('42', 42)).toBe(false);
      expect(valuesAreEqual(true, 1)).toBe(false);
      expect(valuesAreEqual({}, 'object')).toBe(false);
      expect(valuesAreEqual([1, 2, 3], [1, 2, 3])).toBe(false);
    });
  });

  describe('scopesAreEqual', () => {
    it('returns true for arrays with the same scopes regardless of order', () => {
      expect(scopesAreEqual(['SHAPE_FILL', 'FRAME_FILL'], ['FRAME_FILL', 'SHAPE_FILL'])).toBe(true);
      expect(scopesAreEqual(['SHAPE_FILL'], ['SHAPE_FILL'])).toBe(true);
    });

    it('returns false when the scopes differ', () => {
      expect(scopesAreEqual(['SHAPE_FILL'], ['SHAPE_FILL', 'FRAME_FILL'])).toBe(false);
      expect(scopesAreEqual(['SHAPE_FILL'], ['FRAME_FILL'])).toBe(false);
    });

    it('treats non-array inputs as empty', () => {
      expect(scopesAreEqual(undefined, [])).toBe(true);
      expect(scopesAreEqual(undefined, undefined)).toBe(true);
      expect(scopesAreEqual(undefined, ['SHAPE_FILL'])).toBe(false);
    });
  });

  describe('parseFloatWithPrecision', () => {
    it('should parse integer strings', () => {
      expect(parseFloatWithPrecision('42')).toBe(42);
      expect(parseFloatWithPrecision('0')).toBe(0);
      expect(parseFloatWithPrecision('-15')).toBe(-15);
    });

    it('should parse decimal strings', () => {
      expect(parseFloatWithPrecision('3.14')).toBe(3.14);
      expect(parseFloatWithPrecision('0.5')).toBe(0.5);
      expect(parseFloatWithPrecision('-2.7')).toBe(-2.7);
    });

    it('should parse numeric values', () => {
      expect(parseFloatWithPrecision(42)).toBe(42);
      expect(parseFloatWithPrecision(3.14)).toBe(3.14);
      expect(parseFloatWithPrecision(-2.7)).toBe(-2.7);
    });

    it('should fix common floating-point precision issues', () => {
      expect(parseFloatWithPrecision(0.1 + 0.2)).toBe(0.3);
      expect(parseFloatWithPrecision(1.1)).toBe(1.1);
      expect(parseFloatWithPrecision(0.10000000149011612)).toBe(0.1);
    });

    it('should throw error for non-numeric strings', () => {
      expect(() => parseFloatWithPrecision('abc')).toThrow('Cannot convert "abc" to float');
    });
  });

  describe('DTCGToFigmaColorFormat', () => {
    it('converts DTCG color with explicit alpha to Figma format', () => {
      const input = {
        colorSpace: 'srgb',
        components: [255, 128, 0],
        alpha: 0.8,
      };

      const result = DTCGToFigmaColorFormat(input);

      expect(result).toEqual({
        r: 255,
        g: 128,
        b: 0,
        a: 0.8,
      });
    });

    it('converts DTCG color without alpha (defaults to 1)', () => {
      const input = {
        colorSpace: 'srgb',
        components: [0, 150, 255],
      };

      const result = DTCGToFigmaColorFormat(input);

      expect(result).toEqual({
        r: 0,
        g: 150,
        b: 255,
        a: 1,
      });
    });

    it('handles alpha value of 0 (fully transparent)', () => {
      const input = {
        colorSpace: 'srgb',
        components: [100, 200, 50],
        alpha: 0,
      };

      const result = DTCGToFigmaColorFormat(input);

      expect(result).toEqual({
        r: 100,
        g: 200,
        b: 50,
        a: 0,
      });
    });

    it('handles decimal RGB values', () => {
      const input = {
        colorSpace: 'srgb',
        components: [0.5, 0.8, 0.2],
        alpha: 0.6,
      };

      const result = DTCGToFigmaColorFormat(input);

      expect(result).toEqual({
        r: 0.5,
        g: 0.8,
        b: 0.2,
        a: 0.6,
      });
    });

    it('handles edge case with alpha explicitly set to undefined', () => {
      const input = {
        colorSpace: 'srgb',
        components: [255, 255, 255],
        alpha: undefined,
      };

      const result = DTCGToFigmaColorFormat(input);

      expect(result).toEqual({
        r: 255,
        g: 255,
        b: 255,
        a: 1,
      });
    });

    it('throws error when components array is missing', () => {
      const input = {
        colorSpace: 'srgb',
        alpha: 0.5,
      };

      expect(() => DTCGToFigmaColorFormat(input)).toThrow();
    });
  });

  describe('convertValue', () => {
    it('should convert color tokens with components', () => {
      const token = {
        $value: { colorSpace: 'srgb', components: [1, 0, 0], alpha: 1 },
        $type: 'color',
      };

      const result = convertValue(token);

      expect(result).toEqual({ r: 1, g: 0, b: 0, a: 1 });
    });

    it('should convert dimension tokens', () => {
      const token = {
        $value: { value: 16 },
        $type: 'dimension',
      };

      const result = convertValue(token);

      expect(result).toBe(16);
    });

    it('should convert number tokens', () => {
      const token = {
        $value: 0.5,
        $type: 'number',
      };

      const result = convertValue(token);

      expect(result).toBe(0.5);
    });

    it('should convert string tokens', () => {
      const token = {
        $value: '600',
        $type: 'fontWeight',
      };

      const result = convertValue(token);

      expect(result).toBe('600');
    });
  });

  describe('getVariableType', () => {
    it('should map token types to Figma variable types', () => {
      expect(getVariableType('color')).toBe('COLOR');
      expect(getVariableType('dimension')).toBe('FLOAT');
      expect(getVariableType('number')).toBe('FLOAT');
      expect(getVariableType('string')).toBe('STRING');
      expect(getVariableType('fontWeight')).toBe('FLOAT');
    });

    it('should default to STRING for unknown types', () => {
      expect(getVariableType('unknown')).toBe('STRING');
    });
  });
});
