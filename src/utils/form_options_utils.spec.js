import { normalizeOptions } from './form_options_utils';

describe('normalizeOptions', () => {
  it('returns an empty array when given an empty array', () => {
    expect(normalizeOptions([])).toEqual([]);
  });

  it('returns an empty array when given a non-array value', () => {
    expect(normalizeOptions(undefined)).toEqual([]);
    expect(normalizeOptions(null)).toEqual([]);
    expect(normalizeOptions('string')).toEqual([]);
  });

  it('normalizes an array of strings', () => {
    expect(normalizeOptions(['one', 'two', 'three'])).toEqual([
      { value: 'one', text: 'one', disabled: false },
      { value: 'two', text: 'two', disabled: false },
      { value: 'three', text: 'three', disabled: false },
    ]);
  });

  it('normalizes an array of objects with text and value', () => {
    const options = [
      { text: 'One', value: 'one' },
      { text: 'Two', value: 'two' },
    ];
    expect(normalizeOptions(options)).toEqual([
      { value: 'one', text: 'One', html: undefined, disabled: false },
      { value: 'two', text: 'Two', html: undefined, disabled: false },
    ]);
  });

  it('respects the disabled field', () => {
    const options = [
      { text: 'One', value: 'one' },
      { text: 'Two', value: 'two', disabled: true },
    ];
    expect(normalizeOptions(options)).toEqual([
      { value: 'one', text: 'One', html: undefined, disabled: false },
      { value: 'two', text: 'Two', html: undefined, disabled: true },
    ]);
  });

  it('falls back to text when value is not provided', () => {
    const options = [{ text: 'One' }];
    expect(normalizeOptions(options)).toEqual([
      { value: 'One', text: 'One', html: undefined, disabled: false },
    ]);
  });

  it('preserves null as value when explicitly set', () => {
    const options = [{ text: 'One', value: null }];
    expect(normalizeOptions(options)).toEqual([
      { value: null, text: 'One', html: undefined, disabled: false },
    ]);
  });

  it('includes html field when provided', () => {
    const options = [{ text: 'One', value: 'one', html: '<b>One</b>' }];
    expect(normalizeOptions(options)).toEqual([
      { value: 'one', text: 'One', html: '<b>One</b>', disabled: false },
    ]);
  });
});
