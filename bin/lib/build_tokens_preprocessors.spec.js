import {
  stripDescriptionsPreprocessor,
  resolveUnitsPreprocessor,
  selectDefaultValuePreprocessor,
  selectDarkValuePreprocessor,
  selectColorValuePreprocessor,
  convertClampStringToDimension,
} from './build_tokens_preprocessors';

describe('buildTokens', () => {
  describe('stripDescriptionsPreprocessor', () => {
    const token1 = {
      $value: '#cbbbf23d',
      $type: 'color',
      $description: 'Purple background.',
    };
    const token2 = {
      $value: { default: '{color.red.600}', dark: '{color.red.300}' },
      $type: 'color',
      $description: 'Indicates a problem.',
    };

    it('strips description from token', () => {
      expect(stripDescriptionsPreprocessor(token1)).toEqual({
        $value: '#cbbbf23d',
        $type: 'color',
      });
    });

    it('strips description from array of tokens', () => {
      expect(stripDescriptionsPreprocessor([token1, token2])).toEqual([
        {
          $value: '#cbbbf23d',
          $type: 'color',
        },
        {
          $value: { default: '{color.red.600}', dark: '{color.red.300}' },
          $type: 'color',
        },
      ]);
    });

    it('preserves arrays of primitives', () => {
      expect(
        stripDescriptionsPreprocessor({
          path: ['color', 'alpha', '0'],
          numbers: [0, 1, 2],
        }),
      ).toEqual({
        path: ['color', 'alpha', '0'],
        numbers: [0, 1, 2],
      });
    });

    it('strips description from deeply nested tokens', () => {
      expect(
        stripDescriptionsPreprocessor({
          component: { parent: { token1, token2 } },
        }),
      ).toEqual({
        component: {
          parent: {
            token1: { $type: 'color', $value: '#cbbbf23d' },
            token2: {
              $type: 'color',
              $value: { dark: '{color.red.300}', default: '{color.red.600}' },
            },
          },
        },
      });
    });
  });

  describe('resolveUnitsPreprocessor', () => {
    it('converts unit objects to string values', () => {
      const input = {
        spacing: {
          small: { value: 8, unit: 'px' },
          medium: { value: 16, unit: 'px' },
        },
      };

      const expected = {
        spacing: {
          small: '8px',
          medium: '16px',
        },
      };

      expect(resolveUnitsPreprocessor(input)).toEqual(expected);
    });

    it('handles different unit types', () => {
      const input = {
        fontSize: { value: 1.5, unit: 'rem' },
        duration: { value: 300, unit: 'ms' },
      };

      const expected = {
        fontSize: '1.5rem',
        duration: '300ms',
      };

      expect(resolveUnitsPreprocessor(input)).toEqual(expected);
    });

    it('preserves objects that are not unit objects', () => {
      const input = {
        color: { red: '#ff0000', blue: '#0000ff' },
        config: { value: 'test', type: 'string', other: 'prop' },
      };

      expect(resolveUnitsPreprocessor(input)).toEqual(input);
    });

    it('handles arrays with unit objects', () => {
      const input = [{ value: 4, unit: 'px' }, { value: 8, unit: 'px' }, 'regular-string'];

      const expected = ['4px', '8px', 'regular-string'];

      expect(resolveUnitsPreprocessor(input)).toEqual(expected);
    });

    it('handles deeply nested structures', () => {
      const input = {
        parent: {
          spacing: {
            padding: { value: 12, unit: 'px' },
            margin: { value: 24, unit: 'px' },
          },
        },
      };

      const expected = {
        parent: {
          spacing: {
            padding: '12px',
            margin: '24px',
          },
        },
      };

      expect(resolveUnitsPreprocessor(input)).toEqual(expected);
    });
  });

  describe('selectDefaultValuePreprocessor', () => {
    it('selects default value from color mode objects', () => {
      const input = {
        color: {
          primary: { default: '#000000', dark: '#ffffff' },
          secondary: { default: '#333333', dark: '#cccccc' },
        },
      };

      const expected = {
        color: {
          primary: '#000000',
          secondary: '#333333',
        },
      };

      expect(selectDefaultValuePreprocessor(input)).toEqual(expected);
    });

    it('preserves objects without default/dark structure', () => {
      const input = {
        color: { red: '#ff0000', blue: '#0000ff' },
        spacing: { small: '8px', large: '24px' },
      };

      expect(selectDefaultValuePreprocessor(input)).toEqual(input);
    });

    it('handles mixed structures', () => {
      const input = {
        colors: {
          dynamic: { default: '#ffffff', dark: '#000000' },
          static: '#ff0000',
        },
        spacing: { value: '16px' },
      };

      const expected = {
        colors: {
          dynamic: '#ffffff',
          static: '#ff0000',
        },
        spacing: { value: '16px' },
      };

      expect(selectDefaultValuePreprocessor(input)).toEqual(expected);
    });

    it('handles deeply nested color mode objects', () => {
      const input = {
        component: {
          button: {
            background: { default: '#333333', dark: '#cccccc' },
            text: { default: '#000000', dark: '#ffffff' },
          },
        },
      };

      const expected = {
        component: {
          button: {
            background: '#333333',
            text: '#000000',
          },
        },
      };

      expect(selectDefaultValuePreprocessor(input)).toEqual(expected);
    });

    it('preserves arrays and primitive values', () => {
      const input = {
        array: [1, 2, 3],
        string: 'test',
        number: 42,
      };

      expect(selectDefaultValuePreprocessor(input)).toEqual(input);
    });

    it('handles objects with additional properties', () => {
      const input = {
        color: { default: '#ffffff', dark: '#000000', type: 'color' },
      };

      // Should not transform because it has more than 2 properties
      expect(selectDefaultValuePreprocessor(input)).toEqual(input);
    });
  });

  describe('selectDarkValuePreprocessor', () => {
    it('selects dark value from color mode objects', () => {
      const input = {
        color: {
          primary: { default: '#000000', dark: '#ffffff' },
          secondary: { default: '#333333', dark: '#cccccc' },
        },
      };

      const expected = {
        color: {
          primary: '#ffffff',
          secondary: '#cccccc',
        },
      };

      expect(selectDarkValuePreprocessor(input)).toEqual(expected);
    });

    it('preserves objects without default/dark structure', () => {
      const input = {
        color: { red: '#ff0000', blue: '#0000ff' },
        spacing: { small: '8px', large: '24px' },
      };

      expect(selectDarkValuePreprocessor(input)).toEqual(input);
    });

    it('handles mixed structures', () => {
      const input = {
        colors: {
          dynamic: { default: '#ffffff', dark: '#000000' },
          static: '#ff0000',
        },
        spacing: { value: '16px' },
      };

      const expected = {
        colors: {
          dynamic: '#000000',
          static: '#ff0000',
        },
        spacing: { value: '16px' },
      };

      expect(selectDarkValuePreprocessor(input)).toEqual(expected);
    });

    it('handles deeply nested color mode objects', () => {
      const input = {
        component: {
          button: {
            background: { default: '#333333', dark: '#cccccc' },
            text: { default: '#000000', dark: '#ffffff' },
          },
        },
      };

      const expected = {
        component: {
          button: {
            background: '#cccccc',
            text: '#ffffff',
          },
        },
      };

      expect(selectDarkValuePreprocessor(input)).toEqual(expected);
    });

    it('preserves arrays and primitive values', () => {
      const input = {
        array: [1, 2, 3],
        string: 'test',
        number: 42,
      };

      expect(selectDarkValuePreprocessor(input)).toEqual(input);
    });

    it('handles objects with additional properties', () => {
      const input = {
        color: { default: '#ffffff', dark: '#000000', type: 'color' },
      };

      // Should not transform because it has more than 2 properties
      expect(selectDarkValuePreprocessor(input)).toEqual(input);
    });
  });

  describe('selectColorValuePreprocessor', () => {
    it('should return hex value when hex property is provided', () => {
      const input = {
        colorSpace: 'srgb',
        components: [0.89, 0.157, 0.157],
        alpha: 1,
        hex: '#e32828',
      };

      const result = selectColorValuePreprocessor(input);

      expect(result).toBe('#e32828');
    });

    it('should return rgba string when hex property is not provided', () => {
      const input = {
        colorSpace: 'srgb',
        components: [0.643, 0.639, 0.659],
        alpha: 0.16,
      };

      const result = selectColorValuePreprocessor(input);

      expect(result).toBe('rgba(164, 163, 168, 0.16)');
    });

    it('should return original value for non-srgb colorSpace', () => {
      const input = {
        colorSpace: 'p3',
        components: [0.5, 0.5, 0.5],
        alpha: 1,
      };

      const result = selectColorValuePreprocessor(input);

      expect(result).toEqual(input);
    });

    it('should return original value when colorSpace is missing', () => {
      const input = {
        components: [0.5, 0.5, 0.5],
        alpha: 1,
      };

      const result = selectColorValuePreprocessor(input);

      expect(result).toEqual(input);
    });
  });

  describe('convertClampStringToDimension', () => {
    it('converts clamp string to dimension with rem unit', () => {
      const input = {
        $value: 'clamp(1.125rem, 0.9027777778rem + 0.462962963vw, 1.25rem)',
        $type: 'string',
      };

      const result = convertClampStringToDimension(input);

      expect(result).toEqual({
        $value: { value: 1.25, unit: 'rem' },
        $type: 'dimension',
      });
    });

    it('converts clamp string to dimension with px unit', () => {
      const input = {
        $value: 'clamp(16px, 1rem + 2vw, 32px)',
        $type: 'string',
      };

      const result = convertClampStringToDimension(input);

      expect(result).toEqual({
        $value: { value: 32, unit: 'px' },
        $type: 'dimension',
      });
    });

    it('preserves other token properties', () => {
      const input = {
        $value: 'clamp(1.125rem, 0.9027777778rem + 0.462962963vw, 1.25rem)',
        $type: 'string',
        $description: 'Responsive font size',
        $extensions: { com: { figma: { scopes: ['FONT_SIZE'] } } },
      };

      const result = convertClampStringToDimension(input);

      expect(result).toEqual({
        $value: { value: 1.25, unit: 'rem' },
        $type: 'dimension',
        $description: 'Responsive font size',
        $extensions: { com: { figma: { scopes: ['FONT_SIZE'] } } },
      });
    });

    it('does not convert non-clamp strings', () => {
      const input = {
        $value: 'some-other-string-value',
        $type: 'string',
      };

      const result = convertClampStringToDimension(input);

      expect(result).toEqual(input);
    });

    it('does not convert tokens with non-string $type', () => {
      const input = {
        $value: 'clamp(1.125rem, 0.9027777778rem + 0.462962963vw, 1.25rem)',
        $type: 'dimension',
      };

      const result = convertClampStringToDimension(input);

      expect(result).toEqual(input);
    });
  });
});
