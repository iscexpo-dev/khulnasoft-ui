import { toRaw } from 'vue';
import { first, last, isString } from 'lodash-es';
import { modulo } from '../../../utils/number_utils';

export const TERM_TOKEN_TYPE = 'filtered-search-term';

export const INTENT_ACTIVATE_PREVIOUS = 'intent-activate-previous';

export const TOKEN_CLOSE_SELECTOR = '.gl-token-close';

export const FILTERED_SEARCH_SUGGESTIONS_CLASS = 'gl-filtered-search-suggestion-list';

export function isEmptyTerm(token) {
  return token.type === TERM_TOKEN_TYPE && token.value.data.trim() === '';
}

export function normalizeTokens(tokens) {
  const result = [];
  tokens.forEach((token) => {
    if (isEmptyTerm(token)) {
      return;
    }

    if (token.type !== TERM_TOKEN_TYPE) {
      result.push({ ...token });
    } else if (result.length > 0 && typeof result[result.length - 1] === 'string') {
      result[result.length - 1] += ` ${token.value.data}`;
    } else {
      result.push(token.value.data);
    }
  });
  return result;
}

function assertValidTokens(tokens) {
  if (!Array.isArray(tokens) && !typeof tokens === 'string') {
    throw new TypeError('Either string or array of tokens is expected');
  }
}

export function needDenormalization(tokens) {
  if (typeof tokens === 'string') {
    return true;
  }

  assertValidTokens(tokens);

  return tokens.some((t) => typeof t === 'string' || !t.id);
}

/**
 * Given an initial index, step size and array length, returns an index that is
 * within the array bounds (unless step is 0; see † below).
 *
 * The step can be any positive or negative integer, including zero.
 *
 * An out-of-bounds index is considered 'uninitialised', and is handled
 * specially. For instance, the 'next' index of 'uninitialised' is the first
 * index:
 *
 *     stepIndexAndWrap(-1, 1, 5) === 0
 *
 * The 'previous' index of 'uninitialised' is the last index:
 *
 *     stepIndexAndWrap(-1, -1, 5) === 4
 *
 * †: If step is 0, the index is returned as-is, which may be out-of-bounds.
 *
 * @param {number} index The initial index.
 * @param {number} step The amount to step by (positive or negative).
 * @param {number} length The length of the array.
 * @returns {number}
 */
export function stepIndexAndWrap(index, step, length) {
  if (step === 0) return index;

  let start;
  const indexInRange = index >= 0 && index < length;

  if (indexInRange) {
    // Step from the valid index.
    start = index;
  } else if (step > 0) {
    // Step forwards from the beginning of the array.
    start = -1;
  } else {
    // Step backwards from the end of the array.
    start = length;
  }

  return modulo(start + step, length);
}

/**
 * Transforms a given token definition to an option definition.
 *
 * @param {Object} token A token definition (see GlFilteredSearch's
 *     availableTokens prop).
 * @returns {Object} A option definition (see GlFilteredSearchTokenSegment's
 *     options prop).
 */
export function tokenToOption({ icon, title, type, optionComponent }) {
  return { icon, title, value: type, component: optionComponent && toRaw(optionComponent) };
}

let tokenIdCounter = 0;
const getTokenId = () => {
  const tokenId = `token-${tokenIdCounter}`;
  tokenIdCounter += 1;
  return tokenId;
};
/**
 * Ensure the given token has an `id` property, which `GlFilteredSearch` relies
 * on as a unique key for the token.
 *
 * If the given token does not have an `id`, it returns a shallow copy of the
 * token with an `id`. Otherwise, it returns the given token.
 *
 * @param {object} token The token to check.
 * @returns {object} A token with an `id`.
 */
export function ensureTokenId(token) {
  if (!token.id) {
    return {
      ...token,
      id: getTokenId(),
    };
  }

  return token;
}

export function createTerm(data = '') {
  return {
    id: getTokenId(),
    type: TERM_TOKEN_TYPE,
    value: { data },
  };
}

export function denormalizeTokens(inputTokens, termsAsTokens = false) {
  assertValidTokens(inputTokens);

  const tokens = Array.isArray(inputTokens) ? inputTokens : [inputTokens];

  return tokens.reduce((result, t) => {
    if (typeof t === 'string') {
      if (termsAsTokens) {
        const trimmedText = t.trim();
        if (trimmedText) result.push(createTerm(trimmedText));
      } else {
        const stringTokens = t.split(' ').filter(Boolean);
        stringTokens.forEach((strToken) => result.push(createTerm(strToken)));
      }
    } else {
      result.push(ensureTokenId(t));
    }

    return result;
  }, []);
}

/**
 * Returns `true` if `text` contains `query` (case insensitive).
 *
 * This is used in `filter` and `find` array methods for token segment options.
 *
 * @param {string} text The string to look within.
 * @param {string} query The string to find inside the text.
 * @returns {boolean}
 */
export function match(text, query) {
  return text.toLowerCase().includes(query.toLowerCase());
}

export const termTokenDefinition = {
  type: TERM_TOKEN_TYPE,
  icon: 'title',
  title: 'Search for this text',
};

export function splitOnQuotes(str) {
  if (first(str) === "'" && last(str) === "'") {
    return [str];
  }

  if (first(str) === '"' && last(str) === '"') {
    return [str];
  }

  const queue = str.split(' ');
  const result = [];
  let waitingForMatchingQuote = false;
  let quoteContent = '';

  while (queue.length) {
    const part = queue.shift();
    const quoteIndex = part.indexOf('"');
    if (quoteIndex === -1) {
      if (waitingForMatchingQuote) {
        quoteContent += ` ${part}`;
      } else {
        result.push(part);
      }
    } else {
      const [firstPart, secondPart] = part.split('"', 2);

      if (waitingForMatchingQuote) {
        waitingForMatchingQuote = false;
        quoteContent += ` ${firstPart}"`;
        result.push(quoteContent);
        quoteContent = '';
        if (secondPart.length) {
          queue.unshift(secondPart);
        }
      } else {
        waitingForMatchingQuote = true;
        if (firstPart.length) {
          result.push(firstPart);
        }
        quoteContent = `"${secondPart}`;
      }
    }
  }
  return result;
}

/**
 *  wraps the incoming token in double quotes.
 *  Eg. Foo Bar becomes "Foo Bar"
 *
 *  1. token must have space.
 *  2. token should not already have a quote around it.
 */
export function wrapTokenInQuotes(token) {
  if (!isString(token)) {
    return token;
  }

  if (!token.includes(' ')) {
    return token;
  }

  const quotes = ["'", '"'];

  // If the token starts and ends with a quote, eg. "Foo Bar", then return the original token.
  if (quotes.some((quote) => first(token) === quote && last(token) === quote)) {
    return token;
  }

  return `"${token}"`;
}
