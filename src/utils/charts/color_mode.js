import { DARK_ROOT_CLASS, DARK_SCOPE_CLASS, LIGHT_SCOPE_CLASS } from '../../tokens/color_mode';

const SCOPE_CLASSES = [DARK_SCOPE_CLASS, LIGHT_SCOPE_CLASS, DARK_ROOT_CLASS];

const SCOPE_SELECTOR = SCOPE_CLASSES.map((scopeClass) => `.${scopeClass}`).join(', ');

/**
 * Whether the given element sits in dark mode.
 *
 * Colour mode is not a document-wide fact. Tokens are declared for the root dark class and for a
 * dark scope class, so any subtree can be flipped independently, and a light scope can flip one
 * back inside a dark document. The nearest scope wins, which is what `closest` gives us.
 *
 * This lives under `charts` rather than in the general utilities because charts are the only thing
 * in the package that needs it. Everywhere else, colour follows tokens and CSS re-resolves them on
 * its own. Charts cannot always do that: ECharts parses colours numerically for its visual maps,
 * and canvas cannot read custom properties at all, so those values have to be chosen in JavaScript
 * and re-chosen when the mode changes.
 */
export const isDarkMode = (element) => {
  const scope = element?.closest?.(SCOPE_SELECTOR);

  return Boolean(scope) && !scope.classList.contains(LIGHT_SCOPE_CLASS);
};

// Keyed by subscription so that each subscribed element's last known mode is tracked separately.
const subscriptions = new Map();
let observer = null;

// Most class mutations (hover states, dropdowns opening and closing) have nothing to do with the
// colour mode. Only mutations that added or removed a scope class can change it, so anything else
// can be dismissed with this cheap check instead of re-checking every subscriber.
const touchesColorMode = ({ target, oldValue }) =>
  SCOPE_CLASSES.some(
    (scopeClass) => target.classList?.contains(scopeClass) || oldValue?.includes(scopeClass),
  );

const notify = () => {
  subscriptions.forEach(({ element, subscriber, mode }, key) => {
    const current = isDarkMode(element);

    if (current !== mode) {
      subscriptions.set(key, { element, subscriber, mode: current });
      subscriber(current);
    }
  });
};

/**
 * Calls back when the colour mode of `element` changes, and returns a function that unsubscribes.
 *
 * Most colour can be left to CSS, which re-resolves custom properties on its own. This exists for
 * the places that cannot: colours ECharts parses numerically, such as the interpolated stops of a
 * continuous `visualMap`, and colours handed to a canvas context. Both need a concrete value picked
 * in JavaScript, so both need telling when the mode flips.
 *
 * Because a scope class can live on any ancestor, this watches the whole document for class
 * changes, then re-checks each subscribed element and only calls back when its own mode changed.
 */
export const onColorModeChange = (element, subscriber) => {
  if (!subscriptions.size && typeof MutationObserver !== 'undefined') {
    observer = new MutationObserver((mutations) => {
      if (mutations.some((mutation) => touchesColorMode(mutation))) notify();
    });
    observer.observe(document.documentElement, {
      attributeFilter: ['class'],
      attributeOldValue: true,
      subtree: true,
    });
  }

  const key = Symbol('colorModeSubscription');
  subscriptions.set(key, { element, subscriber, mode: isDarkMode(element) });

  return () => {
    subscriptions.delete(key);

    if (!subscriptions.size) {
      observer?.disconnect();
      observer = null;
    }
  };
};
