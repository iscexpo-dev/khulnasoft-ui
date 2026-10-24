import { buildQueryString } from './url_utils';

describe('url utils', () => {
  describe('buildQueryString', () => {
    it('returns empty string when nothing passed', () => {
      expect(buildQueryString()).toEqual('');
    });

    it('handles special chars', () => {
      expect(buildQueryString({ foo: ", !'()*" })).toEqual('?foo=,%20%21%27%28%29%2a');
      expect(buildQueryString({ ", !'()*": 'foo' })).toEqual('?,%20%21%27%28%29%2a=foo');
    });

    it('handles multiple keys', () => {
      const obj = {
        foo: 1,
        bar: 'baz',
      };
      expect(buildQueryString(obj)).toEqual('?foo=1&bar=baz');
    });

    it('handles array as values', () => {
      const obj = {
        foo: 1,
        bar: ['a', 'b', 'c'],
      };
      expect(buildQueryString(obj)).toEqual('?foo=1&bar=a&bar=b&bar=c');
    });

    it('skips undefined values', () => {
      const obj = {
        foo: 1,
        bar: undefined,
        baz: 2,
      };
      expect(buildQueryString(obj)).toEqual('?foo=1&baz=2');
    });

    it('skips undefined values in arrays', () => {
      const obj = {
        foo: ['a', undefined, 'c'],
      };
      expect(buildQueryString(obj)).toEqual('?foo=a&foo=c');
    });

    it('leaves in null value keys', () => {
      const obj = {
        foo: 1,
        bar: null,
        baz: 2,
      };
      expect(buildQueryString(obj)).toEqual('?foo=1&bar&baz=2');
    });

    it('leaves in null values in arrays', () => {
      const obj = {
        foo: ['a', null, 'c'],
      };
      expect(buildQueryString(obj)).toEqual('?foo=a&foo&foo=c');
    });

    it('returns empty string for non-object inputs', () => {
      expect(buildQueryString(null)).toEqual('');
      expect(buildQueryString('string')).toEqual('');
      expect(buildQueryString([1, 2])).toEqual('');
      expect(buildQueryString(42)).toEqual('');
    });

    it('returns empty string for empty object', () => {
      expect(buildQueryString({})).toEqual('');
    });
  });
});
