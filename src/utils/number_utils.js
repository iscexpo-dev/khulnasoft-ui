/**
 * Adds two numbers together
 * @param {Number|String} a
 * @param {Number|String} b
 */
export const addition = (a, b) => Number(a) + Number(b);

/**
 * Returns the sum of all arguments
 * @param  {...Number} numbers
 */
export const sum = (...numbers) => numbers.reduce(addition); // eslint-disable-line unicorn/no-array-callback-reference

/**
 * Returns the average of all arguments
 * @param  {...Number} numbers
 */
export const average = (...numbers) => sum(...numbers) / numbers.length;

/**
 * Returns the modulo of n for a divisor.
 *
 * Maps the integer n into the range [0, divisor) when the divisor is positive,
 * and (divisor, 0] when the divisor is negative.
 *
 * This is useful when indexing into an array, to ensure you always stay within
 * the array bounds.
 *
 * See https://2ality.com/2019/08/remainder-vs-modulo.html.
 *
 * @param {number} n The number to mod.
 * @param {number} divisor The divisor (e.g., the length of an array).
 * @returns {number}
 */
export function modulo(n, divisor) {
  const result = ((n % divisor) + divisor) % divisor;
  // Never return -0.
  return result === 0 ? 0 : result;
}

/**
 * Convert number to engineering format, using SI suffix
 * @param {Number|String} value - Number or Number-convertible String
 * @param {Number} precision
 * @return {String} number, possibly with a suffix
 */
export const engineeringNotation = (value, precision = 2) => {
  const invalidValues = [NaN, Infinity, -Infinity];
  const num = Number(value);

  if (invalidValues.includes(num) || invalidValues.includes(Number(precision))) {
    return num.toString();
  }

  const allYourBase = {
    '-24': 'y',
    '-21': 'z',
    '-18': 'a',
    '-15': 'f',
    '-12': 'p',
    '-9': 'n',
    '-6': 'μ',
    '-3': 'm',
    0: '',
    3: 'k',
    6: 'M',
    9: 'G',
    12: 'T',
    15: 'P',
    18: 'E',
    21: 'Z',
    24: 'Y',
  };

  const exponentialNotation = num.toExponential(precision);

  const power = exponentialNotation.split('e').map(Number)[1] || 0;

  if (power < -24 || power > 24) {
    return exponentialNotation;
  }

  const scaledPower = 3 * Math.floor(power / 3);
  const scaledMantissa = (exponentialNotation / 10 ** scaledPower)
    // strip trailing decimals from floating point rounding errors
    .toFixed(precision)
    // strip trailing 0s after a decimal point
    .replace(/\.([1-9]*)0+$/, (_, fractionalDigits) => {
      if (fractionalDigits) {
        return `.${fractionalDigits}`;
      }
      return '';
    });

  return `${scaledMantissa}${allYourBase[scaledPower]}`;
};

/**
 * Formats a number as a locale-based string using `Intl.NumberFormat`.
 *
 * 2333 -> 2,333
 * 232324 -> 232,324
 *
 * @param {Number|string} value - number to be converted
 * @param {{}?} options - options to be passed to
 * `Intl.NumberFormat` such as `unit` and `style`.
 * @param {String|String[]} locales - If set, forces a different
 * language code from the one currently in the document.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat/NumberFormat
 *
 * @returns {String}
 */
export const formatNumberToLocale = (value, options = {}, locales = undefined) => {
  if (Number.isNaN(Number(value))) {
    return value;
  }

  return new Intl.NumberFormat(locales, options).format(value);
};

// Converts a value (string, number, etc.) to a number
// Taken from bootstrap-vue
export const toFloat = (value, defaultValue = NaN) => {
  const float = parseFloat(value);
  return Number.isNaN(float) ? defaultValue : float;
};
