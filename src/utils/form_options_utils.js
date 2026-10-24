/**
 * Normalizes a single option into a standard { value, text, html, disabled } shape.
 */
function normalizeOption(option) {
  if (option !== null && typeof option === 'object') {
    const { value, text, html, disabled } = option;
    return {
      value: value === undefined ? text : value,
      text: String(text),
      html,
      disabled: Boolean(disabled),
    };
  }
  return {
    value: option,
    text: String(option),
    disabled: false,
  };
}

/**
 * Normalizes an options array into a consistent format for rendering.
 *
 * Each option can be a primitive (string, number) or an object with
 * `{ value, text, html, disabled }` properties. Primitives are converted
 * to `{ value, text, disabled: false }`. For objects, `value` defaults to
 * `text` when omitted and `disabled` defaults to `false`.
 *
 * @param {Array<string|number|{value?: *, text: string, html?: string, disabled?: boolean}>} options
 *   The raw options array to normalize.
 * @returns {Array<{value: *, text: string, html?: string, disabled: boolean}>}
 *   The normalized options, or an empty array if the input is not an array.
 */
export function normalizeOptions(options) {
  if (Array.isArray(options)) {
    return options.map((option) => normalizeOption(option));
  }
  return [];
}
