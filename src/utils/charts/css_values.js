import { mapValues } from 'lodash-es';

const CSS_VAR = /^var\(\s*(--[\w-]+)\s*(?:,\s*([\s\S]*?)\s*)?\)$/;

const resolveString = (value, styles) => {
  if (value.toLowerCase() === 'currentcolor') {
    return styles.color;
  }

  const match = CSS_VAR.exec(value);
  if (!match) {
    return value;
  }

  const [, name, fallback] = match;
  const resolved = styles.getPropertyValue(name).trim();

  if (resolved) {
    return resolved;
  }

  return fallback ? resolveString(fallback, styles) : value;
};

/**
 * Deeply replaces `var(--token)` and `currentcolor` strings with the values they resolve to for the
 * given element.
 *
 * The SVG renderer needs none of this: it emits both forms into the DOM, where the browser resolves
 * them and keeps them live across a colour-mode change. Canvas has no such context. `fillStyle` is
 * a plain string setter, so an unparseable `var(--token)` is dropped on the floor and leaves the
 * previous fill in place, while `currentcolor` has no element to inherit from and is defined to
 * resolve to opaque black. Either way a canvas-rendered chart silently loses its themed colours.
 *
 * Resolution is relative to `element` rather than the document root so that `.gl-dark-scope`
 * ancestors are honoured.
 *
 * Values are resolved once, so callers are responsible for resolving again when the colour mode
 * changes.
 */
export const resolveCssValues = (input, element) => {
  const styles = window.getComputedStyle(element);

  const walk = (value) => {
    if (typeof value === 'string') {
      return resolveString(value, styles);
    }
    if (Array.isArray(value)) {
      return value.map((item) => walk(item));
    }
    // Themes carry functions (formatters) which must pass through untouched.
    if (value !== null && typeof value === 'object') {
      return mapValues(value, walk);
    }
    return value;
  };

  return walk(input);
};
