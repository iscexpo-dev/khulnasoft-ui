import { resolveCssValues } from './css_values';

describe('resolveCssValues', () => {
  const tokens = {
    '--gl-text-color-default': '#3a383f',
    '--gl-chart-axis-line-color': '#bfbfc3',
  };
  const element = document.createElement('div');

  beforeEach(() => {
    jest.spyOn(window, 'getComputedStyle').mockReturnValue({
      color: 'rgb(51, 51, 51)',
      getPropertyValue: (name) => tokens[name] ?? '',
    });
  });

  it('resolves a custom property to its value', () => {
    expect(resolveCssValues('var(--gl-text-color-default)', element)).toBe('#3a383f');
  });

  it.each([['currentcolor'], ['currentColor'], ['CURRENTCOLOR']])(
    'resolves %s to the computed color',
    (value) => {
      expect(resolveCssValues(value, element)).toBe('rgb(51, 51, 51)');
    },
  );

  describe('when the custom property is not defined', () => {
    it('falls back to the value declared in the var()', () => {
      expect(resolveCssValues('var(--nope, #ff0000)', element)).toBe('#ff0000');
    });

    it('resolves a fallback that is itself a custom property', () => {
      expect(resolveCssValues('var(--nope, var(--gl-text-color-default))', element)).toBe(
        '#3a383f',
      );
    });

    it('leaves the value untouched when there is no fallback', () => {
      expect(resolveCssValues('var(--nope)', element)).toBe('var(--nope)');
    });
  });

  it('leaves values that are not custom properties untouched', () => {
    expect(resolveCssValues('#617ae2', element)).toBe('#617ae2');
    expect(resolveCssValues('path://M0,0', element)).toBe('path://M0,0');
    expect(resolveCssValues(12, element)).toBe(12);
    expect(resolveCssValues(null, element)).toBe(null);
  });

  it('resolves values nested in objects and arrays', () => {
    const theme = {
      color: ['#617ae2', 'var(--gl-text-color-default)'],
      axis: { splitLine: { lineStyle: { color: ['var(--gl-chart-axis-line-color)'] } } },
    };

    expect(resolveCssValues(theme, element)).toEqual({
      color: ['#617ae2', '#3a383f'],
      axis: { splitLine: { lineStyle: { color: ['#bfbfc3'] } } },
    });
  });

  it('passes functions through untouched', () => {
    const labelFormatter = () => null;

    expect(resolveCssValues({ labelFormatter }, element).labelFormatter).toBe(labelFormatter);
  });

  it('does not mutate the input', () => {
    const theme = { textStyle: { color: 'var(--gl-text-color-default)' } };

    resolveCssValues(theme, element);

    expect(theme.textStyle.color).toBe('var(--gl-text-color-default)');
  });
});
