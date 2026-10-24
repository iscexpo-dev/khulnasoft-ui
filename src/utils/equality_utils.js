/**
 * Performs a deep, type-coercing equality check between two values.
 *
 * Unlike strict equality (`===`) or lodash's `isEqual`, this function:
 * - Compares objects and arrays by structure, not reference
 * - Coerces types before comparing primitives (e.g. `123` equals `'123'`)
 * - Compares Date objects by timestamp
 * - Compares File objects by inherited properties (name, size, type, lastModified)
 *
 * Used in form components (radio, checkbox) to detect meaningful value changes
 * in watchers, avoiding redundant event emissions when values are loosely equivalent.
 *
 * @param {*} a - First value to compare
 * @param {*} b - Second value to compare
 * @returns {boolean} Whether the two values are loosely equal
 */
export function looseEqual(a, b) {
  if (a === b) {
    return true;
  }
  let aValidType = a instanceof Date;
  let bValidType = b instanceof Date;
  if (aValidType || bValidType) {
    return aValidType && bValidType ? a.getTime() === b.getTime() : false;
  }
  aValidType = Array.isArray(a);
  bValidType = Array.isArray(b);
  if (aValidType || bValidType) {
    if (!aValidType || !bValidType || a.length !== b.length) {
      return false;
    }
    // Compare arrays element by element
    // Uses a for loop to handle sparse arrays (array.every doesn't handle sparse)
    let equal = true;
    for (let i = 0; equal && i < a.length; i += 1) {
      equal = looseEqual(a[i], b[i]);
    }
    return equal;
  }
  aValidType = a !== null && typeof a === 'object';
  bValidType = b !== null && typeof b === 'object';
  if (aValidType || bValidType) {
    if (!aValidType || !bValidType) {
      return false;
    }
    const aKeysCount = Object.keys(a).length;
    const bKeysCount = Object.keys(b).length;
    if (aKeysCount !== bKeysCount) {
      return false;
    }
    // Intentionally iterates inherited properties to compare complex types
    // like File objects where properties are on the prototype
    // eslint-disable-next-line guard-for-in
    for (const key in a) {
      const aHasKey = Object.prototype.hasOwnProperty.call(a, key);
      const bHasKey = Object.prototype.hasOwnProperty.call(b, key);
      if ((aHasKey && !bHasKey) || (!aHasKey && bHasKey) || !looseEqual(a[key], b[key])) {
        return false;
      }
    }
  }
  return String(a) === String(b);
}

/**
 * Finds the first index in an array where the element is loosely equal to the given value.
 *
 * Works like `Array.prototype.indexOf`, but uses {@link looseEqual} for comparison
 * instead of strict equality.
 *
 * @param {Array} array - The array to search
 * @param {*} value - The value to find
 * @returns {number} The index of the first loosely matching element, or -1 if not found
 */
export function looseIndexOf(array, value) {
  for (let i = 0; i < array.length; i += 1) {
    if (looseEqual(array[i], value)) {
      return i;
    }
  }
  return -1;
}
