/**
 * Map<HTMLElement, { callback: Function, eventTypes: Array<string> }>
 */
const callbacks = new Map();
const click = 'click';
const focusin = 'focusin';
const supportedEventTypes = [click, focusin];
const defaultEventType = click;

/**
 * A Set to keep track of currently active event types.
 * This ensures that event listeners are only added for the event types that are in use.
 *
 * @type {Set<string>}
 */
const activeEventTypes = new Set();
let lastMousedown = null;
let isMouseDown = false;

const globalListener = (event) => {
  callbacks.forEach(({ callback, eventTypes }, element) => {
    // Safari doesn't focus <button> on click; focus moves to <body>, firing a focusin outside the
    // dropdown before the button's own click handler runs. Fall back to the mousedown target only
    // while the mouse is still down, so a later focusin (e.g. Tab) isn't judged by a stale target.
    const usesMousedownFallback = event.type === click || (event.type === focusin && isMouseDown);
    const originalEvent = usesMousedownFallback ? lastMousedown || event : event;
    if (
      // Ignore events that aren't targeted outside the element
      element.contains(originalEvent.target) ||
      // Ignore events that aren't the specified types for this element
      !eventTypes.includes(event.type)
    ) {
      return;
    }

    try {
      callback(event);
    } catch (e) {
      if (process.env.NODE_ENV !== 'production') {
        // eslint-disable-next-line no-console
        console.error(e);
      }
    }
  });
  if (event.type === click) {
    lastMousedown = null;
  }
};

// We need to listen for mouse events because text selection fires click event only when selection ends.
// This means that the click event target could differ from the element where it originally started.
// As example: if we use mouse events we could guarantee that selecting text within a dropdown won't close it.
// This also covers the Safari focusin case described above, since that focusin is triggered by the
// same mousedown.
const onMousedown = (event) => {
  lastMousedown = event;
  isMouseDown = true;
};

// Only clear the "is the mouse down" flag here. lastMousedown must survive until the click
// fires (click comes after mouseup), or releasing a text selection outside the element would
// wrongly close the dropdown.
const onMouseup = () => {
  isMouseDown = false;
};

const mousedown = 'mousedown';
const mouseup = 'mouseup';

const startListening = (eventTypes) => {
  // Listening to mouse events ensures that a text selection doesn't trigger the
  // GlOutsideDirective 'click' callback if the selection started within the target element,
  // and that a Safari focus-loss 'focusin' doesn't trigger the callback either. Nothing is
  // listening yet when the set is empty, so this is bound exactly once.
  if (activeEventTypes.size === 0) {
    document.addEventListener(mousedown, onMousedown);
    document.addEventListener(mouseup, onMouseup);
  }

  eventTypes.forEach((eventType) => {
    if (!activeEventTypes.has(eventType)) {
      // Added { capture: true } to all event types to prevent the behavior discussed in https://github.com/khulnasoft/khulnasoft-ui/-/merge_requests/1686#note_412545027
      // Ensures the event listener handles the event in the capturing phase, avoiding issues encountered previously.
      // Cannot be tested with Jest or Cypress, but can be tested with Playwright in the future: https://github.com/khulnasoft/khulnasoft-ui/-/merge_requests/4272#note_1947425384
      document.addEventListener(eventType, globalListener, { capture: true });
      activeEventTypes.add(eventType);
    }
  });

  lastMousedown = null;
  isMouseDown = false;
};

const stopListening = (eventTypesToUnbind) => {
  eventTypesToUnbind.forEach((eventType) => {
    if (activeEventTypes.has(eventType)) {
      if ([...callbacks.values()].every(({ eventTypes }) => !eventTypes.includes(eventType))) {
        document.removeEventListener(eventType, globalListener, { capture: true });
        activeEventTypes.delete(eventType);
      }
    }
  });

  // Nothing is listening anymore, so the mouse gesture tracking isn't needed either.
  if (activeEventTypes.size === 0) {
    document.removeEventListener(mousedown, onMousedown);
    document.removeEventListener(mouseup, onMouseup);
  }
};

function parseBinding({ arg, value, modifiers }) {
  const modifiersList = Object.keys(modifiers);

  if (process.env.NODE_ENV !== 'production') {
    if (typeof value !== 'function') {
      throw new Error(`[GlOutsideDirective] Value must be a function; got ${typeof value}!`);
    }

    if (typeof arg !== 'undefined') {
      throw new Error(
        `[GlOutsideDirective] Arguments are not supported. Consider using modifiers instead.`,
      );
    }

    const unsupportedModifiers = modifiersList.filter(
      (modifier) => !supportedEventTypes.includes(modifier),
    );

    if (unsupportedModifiers.length > 0) {
      throw new Error(
        `[GlOutsideDirective] Cannot bind ${unsupportedModifiers.join(', ')} events; supported event types are: ${supportedEventTypes.join(
          ', ',
        )}`,
      );
    }
  }

  return {
    callback: value,
    eventTypes: modifiersList.length > 0 ? modifiersList : [defaultEventType],
  };
}

const bind = (el, bindings) => {
  const { callback, eventTypes } = parseBinding(bindings);

  if (callbacks.has(el)) {
    // This element is already bound. This is possible if two components, which
    // share the same root node, (i.e., one is a higher-order component
    // wrapping another) _both_ have this directive applied.
    //
    // Because Vue binds directives in the direction towards the root, only the
    // deepest instance of this directive will be bound.
    //
    // A future iteration may add support for binding all instances on a given
    // element.
    return;
  }

  callbacks.set(el, { callback, eventTypes });
  startListening(eventTypes);
};

const unbind = (el) => {
  const entry = callbacks.get(el);
  if (entry) {
    callbacks.delete(el);
    stopListening(entry.eventTypes);
  }
};

export const OutsideDirective = {
  bind,
  unbind,
};
