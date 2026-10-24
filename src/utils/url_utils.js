const RX_ENCODE_REVERSE = /[!'()*]/g;
const RX_ENCODED_COMMA = /%2C/g;

const encodeReserveReplacer = (c) => `%${c.charCodeAt(0).toString(16)}`;

const encode = (str) =>
  encodeURIComponent(String(str))
    .replace(RX_ENCODE_REVERSE, encodeReserveReplacer)
    .replace(RX_ENCODED_COMMA, ',');

/**
 * Converts a query parameter object into a URL query string prefixed with `?`.
 *
 * Uses RFC 3986-compliant encoding which additionally escapes `[!'()*]` and preserves commas,
 * unlike `URLSearchParams` which cannot represent key-only params (`?foo`) or skip `undefined` values.
 *
 * - `undefined` values are omitted entirely.
 * - `null` values produce key-only entries (e.g., `?foo`).
 * - Array values repeat the key for each element (e.g., `?bar=a&bar=b`).
 *
 * @param {Object<string, string | number | null | undefined | Array<string | number | null | undefined>>} obj
 *   An object whose keys are query parameter names and values are parameter values.
 * @returns {string} A query string prefixed with `?`, or an empty string if the input
 *   is not a plain object or produces no parameters.
 *
 * @example
 * buildQueryString({ page: 1, search: 'hello world' })
 * // => '?page=1&search=hello%20world'
 *
 * @example
 * buildQueryString({ foo: null, bar: undefined })
 * // => '?foo'
 */
export const buildQueryString = (obj) => {
  if (obj === null || typeof obj !== 'object' || Array.isArray(obj)) {
    return '';
  }

  const query = Object.keys(obj)
    .map((key) => {
      const value = obj[key];
      if (value === undefined) {
        return '';
      }
      if (value === null) {
        return encode(key);
      }
      if (Array.isArray(value)) {
        return value
          .reduce((results, item) => {
            if (item === null) {
              results.push(encode(key));
            } else if (item !== undefined) {
              results.push(`${encode(key)}=${encode(item)}`);
            }
            return results;
          }, [])
          .join('&');
      }
      return `${encode(key)}=${encode(value)}`;
    })
    .filter((x) => x.length > 0)
    .join('&');

  return query ? `?${query}` : '';
};
