import emojiRegexFactory from 'emoji-regex';

/**
 * Split the given string after each occurrence of each of the given symbols.
 *
 * Symbols are strings, and can be of length one or more. Zero-length symbols
 * are ignored.
 *
 * Unlike with `String::split`, the symbol is left in results, with
 * the split occurring _after_ the symbol.
 *
 * For example:
 *
 *     splitAfterSymbols(['/'], 'a/b/c')    // ['a/', 'b/', 'c']
 *     splitAfterSymbols(['foo'], 'foobar') // ['foo', 'bar']
 *
 * @param {string[]} symbols The symbols to split the string by.
 * @param {string} string The string to split.
 * @returns {string[]} The resulting strings.
 */
export const splitAfterSymbols = (symbols, string) => {
  const textParts = [];
  let textPartStartIndex = 0;

  if (string.length === 0) {
    return [string];
  }

  for (let i = 0; i < string.length;) {
    let symbolFound = false;

    for (let j = 0; j < symbols.length; j += 1) {
      const symbol = symbols[j];

      if (!symbol) {
        continue;
      }

      symbolFound = string.slice(i, i + symbol.length) === symbol;

      if (symbolFound) {
        const textPartEndIndex = i + symbol.length;
        const textPart = string.slice(textPartStartIndex, textPartEndIndex);
        textParts.push(textPart);
        textPartStartIndex = textPartEndIndex;
        i = textPartStartIndex;
        break;
      }
    }

    if (!symbolFound) {
      i += 1;
    }
  }

  const final = string.slice(textPartStartIndex);
  if (final) {
    textParts.push(final);
  }

  return textParts;
};

const startsWithEmojiRegex = `^(${emojiRegexFactory().source})`;

export const getAvatarChar = (name) => {
  if (name) {
    // Check if string starts with an emoji (which could be multiple characters and zero-width joined)
    const match = name.match(startsWithEmojiRegex);
    if (match) {
      // Return the first match
      return match[0];
    }
    return name.charAt(0).toUpperCase();
  }

  return '';
};
