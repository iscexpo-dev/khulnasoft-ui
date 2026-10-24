import {
  getScalesAndCSSCustomProperties,
  generateBaseColors,
  generateColorMap,
  getTokenCssCustomProperty,
  findDesignTokenByPath,
  isContextualDesignToken,
  createDesignTokenKey,
  processDesignTokenAlias,
  transformDesignTokenAlias,
  getFigmaFormattedTokens,
} from './build_tokens_formats';

jest.mock('style-dictionary/utils', () => ({
  fileHeader: jest.fn().mockResolvedValue('// Mock header\n'),
}));

const tokens = {
  color: {
    constant: {
      $value: '#000',
      prefix: false,
      original: {
        $value: '#000',
      },
      path: ['color', 'constant'],
    },
    constantObject: {
      $value: '#000',
      prefix: false,
      original: {
        $value: {
          default: '#000',
          dark: '#fff',
        },
      },
      path: ['color', 'constantObject'],
    },
    alias: {
      $value: '#000',
      prefix: false,
      original: {
        $value: '{color.constant}',
        dark: '#fff',
      },
      path: ['color', 'alias'],
    },
    aliasObject: {
      $value: '#000',
      prefix: false,
      original: {
        $value: {
          default: '{color.constant}',
        },
      },
      path: ['color', 'aliasObject'],
    },
    prefixConstant: {
      $value: '#000',
      original: {
        $value: '#000',
      },
      path: ['color', 'prefixConstant'],
    },
    prefixAlias: {
      $value: '#000',
      original: {
        $value: '{color.prefixConstant}',
      },
      path: ['color', 'prefixAlias'],
    },
  },
};

const mockAllTokens = {
  color: {
    semantic: { $value: '#000', filePath: '/semantic/color.json' },
    contextual: { $value: '#fff', filePath: '/contextual/color.json' },
  },
  button: {
    bg: { $value: '{color-primary}', filePath: '/contextual/button.json' },
  },
};

describe('Build tokens formats', () => {
  describe('getScalesAndCSSCustomProperties', () => {
    it('should correctly extract cssWithValue property from tokens', () => {
      const colorsTokens = {
        color: {
          cssWithValue: 'var(--blue-50, #e9f3fc)',
        },
        background: {
          cssWithValue: 'var(--blue-100, #cbe2f9)',
        },
      };

      const result = getScalesAndCSSCustomProperties(colorsTokens);

      expect(result).toEqual({
        color: 'var(--blue-50, #e9f3fc)',
        background: 'var(--blue-100, #cbe2f9)',
      });
    });

    it('should handle nested tokens correctly', () => {
      const colorsTokens = {
        color: {
          primary: {
            cssWithValue: '--color-primary: blue;',
          },
          secondary: {
            cssWithValue: '--color-secondary: green;',
          },
        },
        accent: {
          highlight: {
            cssWithValue: '--accent-highlight: yellow;',
          },
          border: {
            cssWithValue: '--accent-border: orange;',
          },
        },
      };

      const result = getScalesAndCSSCustomProperties(colorsTokens);

      expect(result).toEqual({
        color: {
          primary: '--color-primary: blue;',
          secondary: '--color-secondary: green;',
        },
        accent: {
          highlight: '--accent-highlight: yellow;',
          border: '--accent-border: orange;',
        },
      });
    });
  });

  describe('generateBaseColors', () => {
    it('should correctly extract path and cssWithValue from color tokens', () => {
      const colorTokens = {
        primary: {
          blue: {
            path: ['color', 'primary', 'blue'],
            cssWithValue: '--color-primary-blue: #0000ff;',
          },
          red: {
            path: ['color', 'primary', 'red'],
            cssWithValue: '--color-primary-red: #ff0000;',
          },
        },
      };

      const result = generateBaseColors(colorTokens);

      expect(result).toEqual({
        'color-primary-blue': '--color-primary-blue: #0000ff;',
        'color-primary-red': '--color-primary-red: #ff0000;',
      });
    });

    it('should handle a mix of token structures', () => {
      const colorTokens = {
        primary: {
          main: {
            path: ['color', 'primary'],
            cssWithValue: '--color-primary: #0000ff;',
          },
          light: {
            path: ['color', 'primary', 'light'],
            cssWithValue: '--color-primary-light: #3333ff;',
          },
        },
        grayscale: {
          white: {
            path: ['color', 'white'],
            cssWithValue: '--color-white: #ffffff;',
          },
          black: {
            path: ['color', 'black'],
            cssWithValue: '--color-black: #000000;',
          },
          gray: {
            path: ['color', 'gray'],
            cssWithValue: '--color-gray: #888888;',
          },
        },
      };

      const result = generateBaseColors(colorTokens);

      expect(result).toEqual({
        'color-primary': '--color-primary: #0000ff;',
        'color-primary-light': '--color-primary-light: #3333ff;',
        'color-white': '--color-white: #ffffff;',
        'color-black': '--color-black: #000000;',
        'color-gray': '--color-gray: #888888;',
      });
    });
  });

  describe('generateColorMap', () => {
    const mockTokens = {
      background: {
        status: {
          info: { cssWithValue: 'var(--background-status-info, #ffffff)' },
          success: { cssWithValue: 'var(--background-status-success, #f0f0f0)' },
          warning: { cssWithValue: 'var(--background-status-warning, #e0e0e0)' },
        },
        feedback: {
          info: { cssWithValue: 'var(--background-feedback-info, #eeeeee)' },
          success: { cssWithValue: 'var(--background-feedback-success, #dddddd)' },
          warning: { cssWithValue: 'var(--background-feedback-warning, #cccccc)' },
        },
      },
      text: {
        status: {
          info: { cssWithValue: 'var(--text-status-info, #000000)' },
          success: { cssWithValue: 'var(--text-status-success, #111111)' },
          warning: { cssWithValue: 'var(--text-status-warning, #222222)' },
        },
        feedback: {
          info: { cssWithValue: 'var(--text-feedback-info, #333333)' },
          success: { cssWithValue: 'var(--text-feedback-success, #444444)' },
          warning: { cssWithValue: 'var(--text-feedback-warning, #555555)' },
        },
      },
      fill: {
        status: {
          info: { cssWithValue: 'var(--fill-status-info, #0088ff)' },
          success: { cssWithValue: 'var(--fill-status-success, #0077ee)' },
          warning: { cssWithValue: 'var(--fill-status-warning, #0066dd)' },
        },
        feedback: {
          info: { cssWithValue: 'var(--fill-feedback-info, #00aaee)' },
          success: { cssWithValue: 'var(--fill-feedback-success, #0099dd)' },
          warning: { cssWithValue: 'var(--fill-feedback-warning, #0088cc)' },
        },
      },
    };

    it('should generate color map for status element with default properties', () => {
      const variants = ['info', 'success', 'warning'];
      const result = generateColorMap(mockTokens, variants, 'status');

      // Expected output
      const expected = {
        statusBackgroundColors: {
          'status-info': 'var(--background-status-info, #ffffff)',
          'status-success': 'var(--background-status-success, #f0f0f0)',
          'status-warning': 'var(--background-status-warning, #e0e0e0)',
        },
        statusTextColors: {
          'status-info': 'var(--text-status-info, #000000)',
          'status-success': 'var(--text-status-success, #111111)',
          'status-warning': 'var(--text-status-warning, #222222)',
        },
        statusFillColors: {
          'status-info': 'var(--fill-status-info, #0088ff)',
          'status-success': 'var(--fill-status-success, #0077ee)',
          'status-warning': 'var(--fill-status-warning, #0066dd)',
        },
      };

      expect(result).toEqual(expected);
    });

    it('should generate color map for feedback element with default properties', () => {
      const variants = ['info', 'success', 'warning'];
      const result = generateColorMap(mockTokens, variants, 'feedback');

      const expected = {
        feedbackBackgroundColors: {
          'feedback-info': 'var(--background-feedback-info, #eeeeee)',
          'feedback-success': 'var(--background-feedback-success, #dddddd)',
          'feedback-warning': 'var(--background-feedback-warning, #cccccc)',
        },
        feedbackTextColors: {
          'feedback-info': 'var(--text-feedback-info, #333333)',
          'feedback-success': 'var(--text-feedback-success, #444444)',
          'feedback-warning': 'var(--text-feedback-warning, #555555)',
        },
        feedbackFillColors: {
          'feedback-info': 'var(--fill-feedback-info, #00aaee)',
          'feedback-success': 'var(--fill-feedback-success, #0099dd)',
          'feedback-warning': 'var(--fill-feedback-warning, #0088cc)',
        },
      };

      expect(result).toEqual(expected);
    });

    it('should generate color map with custom properties', () => {
      const variants = ['info', 'success'];
      const properties = ['background', 'text'];
      const result = generateColorMap(mockTokens, variants, 'status', properties);

      const expected = {
        statusBackgroundColors: {
          'status-info': 'var(--background-status-info, #ffffff)',
          'status-success': 'var(--background-status-success, #f0f0f0)',
        },
        statusTextColors: {
          'status-info': 'var(--text-status-info, #000000)',
          'status-success': 'var(--text-status-success, #111111)',
        },
      };

      expect(result).toEqual(expected);
    });
  });

  describe('getTokenCssCustomProperty', () => {
    it('returns CSS custom property', () => {
      expect(getTokenCssCustomProperty(tokens.color.constant)).toBe('var(--color-constant)');
    });

    it('returns CSS custom property with prefix', () => {
      expect(getTokenCssCustomProperty(tokens.color.prefixConstant)).toBe(
        'var(--gl-color-prefixConstant)',
      );
    });
  });

  describe('findDesignTokenByPath', () => {
    it('finds token by path array', () => {
      const result = findDesignTokenByPath(mockAllTokens, ['color', 'semantic']);
      expect(result).toEqual({ $value: '#000', filePath: '/semantic/color.json' });
    });

    it('returns null for invalid path', () => {
      const result = findDesignTokenByPath(mockAllTokens, ['invalid', 'path']);
      expect(result).toBeNull();
    });

    it('returns null for non-token object', () => {
      const result = findDesignTokenByPath(mockAllTokens, ['color']);
      expect(result).toBeNull();
    });
  });

  describe('isContextualDesignToken', () => {
    it('returns true for contextual tokens', () => {
      const token = { filePath: '/contextual/colors.json' };
      expect(isContextualDesignToken(token)).toBe(true);
    });

    it('returns false for regular tokens', () => {
      const token = { filePath: '/tokens/colors.json' };
      expect(isContextualDesignToken(token)).toBe(false);
    });

    it('returns false for tokens without filePath', () => {
      expect(isContextualDesignToken({})).toBe(false);
      expect(isContextualDesignToken(null)).toBe(false);
    });
  });

  describe('createDesignTokenKey', () => {
    it('creates regular token key', () => {
      const result = createDesignTokenKey(['color', 'blue', '500'], false);
      expect(result).toBe('color-blue-500');
    });

    it('creates contextual token key with prefix', () => {
      const result = createDesignTokenKey(['button', 'primary'], true);
      expect(result).toBe('🔒/button-primary');
    });
  });

  describe('processDesignTokenAlias', () => {
    it('returns alias unchanged if already has path separator', () => {
      const result = processDesignTokenAlias(
        '{color.primary}',
        '{🔒/color-primary}',
        mockAllTokens,
      );
      expect(result).toBe('{🔒/color-primary}');
    });

    it('adds contextual prefix when target is contextual', () => {
      const result = processDesignTokenAlias(
        '{color.contextual}',
        '{color-contextual}',
        mockAllTokens,
      );
      expect(result).toBe('{🔒/color-contextual}');
    });

    it('keeps alias unchanged when target is regular', () => {
      const result = processDesignTokenAlias('{color.primary}', '{color-primary}', mockAllTokens);
      expect(result).toBe('{color-primary}');
    });
  });

  describe('transformDesignTokenAlias', () => {
    it('processes contextual alias when token is contextual', () => {
      const result = transformDesignTokenAlias('{color.primary}', true, mockAllTokens);
      expect(result).toBe('{color-primary}');
    });

    it('returns flattened alias for non-contextual tokens', () => {
      const result = transformDesignTokenAlias('{color.primary}', false, mockAllTokens);
      expect(result).toBe('{color-primary}');
    });

    it('returns flattened alias when no allTokens provided', () => {
      const result = transformDesignTokenAlias('{color.primary}', true, null);
      expect(result).toBe('{color-primary}');
    });
  });

  describe('getFigmaFormattedTokens', () => {
    const nestedTokens = {
      color: {
        primary: {
          $value: '#0066cc',
          filePath: '/semantic/color.json',
          original: { $value: '#0066cc', $type: 'color', $description: 'Primary color' },
        },
      },
      button: {
        background: {
          $value: '#0066cc',
          filePath: '/contextual/button.json',
          original: { $value: '{color.primary}', $type: 'color', $description: 'Button bg' },
        },
        border: {
          $value: '#333',
          filePath: '/contextual/button.json',
          original: { $value: '#333', $type: 'color', $description: 'Button border' },
        },
      },
      badge: {
        background: {
          $value: '#0066cc',
          filePath: '/contextual/badge.json',
          original: {
            $value: '{button.background}',
            $type: 'color',
            $description: 'Badge bg',
          },
        },
      },
      text: {
        size: {
          $value: '1rem',
          filePath: '/semantic/text.json',
          original: {
            $value: { value: '1', unit: 'rem' },
            $type: 'dimension',
            $description: 'Text size',
          },
        },
      },
    };

    it('flattens non-contextual tokens with plain keys', () => {
      const result = getFigmaFormattedTokens(nestedTokens);
      expect(result['color-primary']).toBeDefined();
      expect(result['color-primary'].$value).toBe('#0066cc');
      expect(result['color-primary'].$type).toBe('color');
    });

    it('prefixes contextual tokens', () => {
      const result = getFigmaFormattedTokens(nestedTokens);
      expect(result['🔒/button-background']).toBeDefined();
      expect(result['🔒/button-border']).toBeDefined();
      expect(result['🔒/badge-background']).toBeDefined();
    });

    it('does not prefix alias value when contextual token references a semantic token', () => {
      const result = getFigmaFormattedTokens(nestedTokens);
      expect(result['🔒/button-background'].$value).toBe('{color-primary}');
    });

    it('prefixes alias value when contextual token references another contextual token', () => {
      const result = getFigmaFormattedTokens(nestedTokens);
      expect(result['🔒/badge-background'].$value).toBe('{🔒/button-background}');
    });

    it('converts rem dimensions to px', () => {
      const result = getFigmaFormattedTokens(nestedTokens);
      expect(result['text-size'].$value).toEqual({ value: 16, unit: 'px' });
    });

    it('preserves $description and $type on all tokens', () => {
      const result = getFigmaFormattedTokens(nestedTokens);
      expect(result['color-primary'].$description).toBe('Primary color');
      expect(result['🔒/button-border'].$description).toBe('Button border');
      expect(result['🔒/button-border'].$type).toBe('color');
    });

    it('does not include unprefixed keys for contextual tokens', () => {
      const result = getFigmaFormattedTokens(nestedTokens);
      expect(result['button-background']).toBeUndefined();
      expect(result['button-border']).toBeUndefined();
      expect(result['badge-background']).toBeUndefined();
    });
  });
});
