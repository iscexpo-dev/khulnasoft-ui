import emojiRegex from 'emoji-regex';

const EMOJI_REGEX = emojiRegex();

// This contains core validating behavior and **should not** contain
// domain-specific validations.
//
// Look to what's allowed in HTML attributes as a good basis for what belongs here
//
// ```
// // Good
// export const required = ...
//
// // Bad
// export const projectPathIsUnique = ...
// ```
export const factory = (failMessage, isValid) => (val) => (!isValid(val) ? failMessage : '');

/**
 * Validator function to check if a string is present and non-empty.
 *
 * Returns an empty string if the input contains a valid string.
 *
 * Returns `failMessage` if the input string is empty, null, or undefined.
 * @param {string} failMessage - The error message to be returned when validation fails.
 * @returns {Function} A validation function that returns either `failMessage` or empty string.
 */
export const required = (failMessage) =>
  factory(failMessage, (val) => val !== '' && val !== null && val !== undefined);

/**
 * Validator function to check if a string contains any emojis.
 *
 * Returns an empty string if the input is empty, null, or undefined, or if no emoji is present.
 *
 * Returns `failMessage` if the input string contains at least one emoji.
 * @param {string} failMessage - The error message to be returned when validation fails.
 * @returns {Function} A validation function that returns either `failMessage` or empty string.
 */
export const noEmojis = (failMessage) =>
  factory(failMessage, (val) => {
    if (!val || typeof val !== 'string') {
      return true;
    }

    const resultsLength = val.match(EMOJI_REGEX)?.length ?? 0;

    return resultsLength < 1;
  });
