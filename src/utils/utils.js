import { isVisible } from '../vendor/bootstrap-vue/src/utils/dom';
import { COMMA, CONTRAST_LEVELS, labelColorOptions, focusableTags } from './constants';

export { isVisible };

export function debounceByAnimationFrame(fn) {
  let requestId;

  return function debounced(...args) {
    if (requestId) {
      window.cancelAnimationFrame(requestId);
    }
    requestId = window.requestAnimationFrame(() => fn.apply(this, args));
  };
}

export function throttle(fn) {
  let frameId = null;

  return (...args) => {
    if (frameId) {
      return;
    }

    frameId = window.requestAnimationFrame(() => {
      fn(...args);
      frameId = null;
    });
  };
}

export function rgbFromHex(hex) {
  const cleanHex = hex.replace('#', '');
  const rgb =
    cleanHex.length === 3
      ? cleanHex.split('').map((val) => val + val)
      : cleanHex.match(/[\da-f]{2}/gi);
  const [r, g, b] = rgb.map((val) => parseInt(val, 16));
  return [r, g, b];
}

export function rgbFromString(color, sub) {
  const rgb = color.substring(sub, color.length - 1).split(COMMA);
  const [r, g, b] = rgb.map((i) => parseInt(i, 10));
  return [r, g, b];
}

export function hexToRgba(hex, opacity = 1) {
  const [r, g, b] = rgbFromHex(hex);

  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

export function toSrgb(value) {
  const normalized = value / 255;
  return normalized <= 0.03928 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
}

export function relativeLuminance(rgb) {
  // WCAG 2.1 formula: https://www.w3.org/TR/WCAG21/#dfn-relative-luminance
  // -
  // WCAG 3.0 will use APAC
  // Using APAC would be the ultimate goal, but was dismissed by engineering as of now
  // See https://github.com/khulnasoft/khulnasoft-ui/-/merge_requests/3418#note_1370107090
  return 0.2126 * toSrgb(rgb[0]) + 0.7152 * toSrgb(rgb[1]) + 0.0722 * toSrgb(rgb[2]);
}

export function colorFromBackground(backgroundColor, contrastRatio = 2.4) {
  let color;
  const lightColor = rgbFromHex('#FFFFFF');
  const darkColor = rgbFromHex('#18171d');

  if (backgroundColor.startsWith('#')) {
    color = rgbFromHex(backgroundColor);
  } else if (backgroundColor.startsWith('rgba(')) {
    color = rgbFromString(backgroundColor, 5);
  } else if (backgroundColor.startsWith('rgb(')) {
    color = rgbFromString(backgroundColor, 4);
  }

  const luminance = relativeLuminance(color);
  const lightLuminance = relativeLuminance(lightColor);
  const darkLuminance = relativeLuminance(darkColor);

  const contrastLight = (lightLuminance + 0.05) / (luminance + 0.05);
  const contrastDark = (luminance + 0.05) / (darkLuminance + 0.05);

  // Using a default threshold contrast of 2.4 instead of 3
  // as this will solve weird color combinations in the mid tones
  return contrastLight >= contrastRatio || contrastLight > contrastDark
    ? labelColorOptions.light
    : labelColorOptions.dark;
}

export function getColorContrast(foreground, background) {
  // Formula: http://www.w3.org/TR/2008/REC-WCAG20-20081211/#contrast-ratiodef
  const backgroundLuminance = relativeLuminance(rgbFromHex(background)) + 0.05;
  const foregroundLuminance = relativeLuminance(rgbFromHex(foreground)) + 0.05;

  let score = backgroundLuminance / foregroundLuminance;
  if (foregroundLuminance > backgroundLuminance) {
    score = 1 / score;
  }

  const level = CONTRAST_LEVELS.find(({ min, max }) => {
    return score >= min && score < max;
  });

  return {
    score: (Math.round(score * 10) / 10).toFixed(1),
    level,
  };
}

export function uid() {
  return Math.random().toString(36).substring(2);
}

/**
 * Receives an element and validates that it can be focused
 * @param { HTMLElement } The element we want to validate
 * @return { boolean } Is the element focusable
 */

export function isElementFocusable(elt) {
  if (!elt) return false;

  const { tagName } = elt;

  const isValidTag = focusableTags.includes(tagName);
  const hasValidType = elt.getAttribute('type') !== 'hidden';
  const isDisabled = elt.getAttribute('disabled') === '' || elt.getAttribute('disabled');
  const hasValidZIndex = elt.getAttribute('z-index') !== '-1';
  const isInvalidAnchorTag = tagName === 'A' && !elt.getAttribute('href');

  return isValidTag && hasValidType && !isDisabled && hasValidZIndex && !isInvalidAnchorTag;
}

/**
 * Receives an element and validates that it is reachable via sequential keyboard navigation
 * @param { HTMLElement } The element to validate
 * @return { boolean } Is the element focusable in a sequential tab order
 */

export function isElementTabbable(el) {
  if (!el) return false;

  const tabindex = parseInt(el.getAttribute('tabindex'), 10);
  return tabindex > -1;
}

/**
 * Receives an array of HTML elements and focus the first one possible
 * @param { Array.<HTMLElement> } An array of element to potentially focus
 * @return { undefined }
 */

export function focusFirstFocusableElement(elts) {
  const focusableElt = elts.find((el) => isElementFocusable(el));

  if (focusableElt) focusableElt.focus();
}

/**
 * Returns true if the current environment is considered a development environment (it's not
 * production or test).
 *
 * @returns {boolean}
 */
export function isDev() {
  return !['test', 'production'].includes(process.env.NODE_ENV);
}

/**
 * Prints a warning message to the console in non-test and non-production environments.
 * @param {string} message Message to print to the console.
 * @param {Object} [context] Optional object with additional context.
 * @param {string} [context.name] The name of the context of the message. Usually the component's name.
 * @param {HTMLElement} [context.element] The element relevant to the message.
 */
export function logWarning(message, context = {}) {
  if (isDev()) {
    const { name, element } = context;
    const formattedMessage = name ? `[${name}] ${message}` : message;
    const args = element ? [formattedMessage, element] : [formattedMessage];
    console.warn(...args); // eslint-disable-line no-console
  }
}

/**
 * Stop default event handling and propagation
 */
export function stopEvent(
  event,
  { preventDefault = true, stopPropagation = true, stopImmediatePropagation = false } = {},
) {
  if (preventDefault) {
    event.preventDefault();
  }
  if (stopPropagation) {
    event.stopPropagation();
  }
  if (stopImmediatePropagation) {
    event.stopImmediatePropagation();
  }
}

/**
 * Return an Array of visible items
 */
export function filterVisible(els) {
  return (els || []).filter((el) => isVisible(el));
}
