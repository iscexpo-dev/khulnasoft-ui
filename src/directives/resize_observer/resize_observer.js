import { isFunction } from 'lodash-es';

let observer = null;

// Exported for testing purposes only
export const resetObserver = () => {
  observer?.disconnect();
  observer = null;
};

const attachObserver = (el, resizeHandler) => {
  if (!isFunction(resizeHandler)) {
    throw TypeError('directive value must be a function');
  }

  if (!observer) {
    // the observer instance is shared for performance reasons
    // more information: https://github.com/WICG/ResizeObserver/issues/59
    observer = new ResizeObserver((entries) => {
      entries.forEach((event) => {
        event.target.glResizeHandler(event);
      });
    });
  }

  el.glResizeHandler = resizeHandler;
  observer.observe(el);
};

const detachObserver = (el) => {
  if (el.glResizeHandler) {
    delete el.glResizeHandler;
    observer?.unobserve(el);
  }
};

export const GlResizeObserverDirective = {
  bind(el, { value: resizeHandler, arg: enabled = true }) {
    if (enabled) {
      attachObserver(el, resizeHandler);
    }
  },
  update(el, { value: resizeHandler, arg: enabled = true }) {
    if (enabled) {
      attachObserver(el, resizeHandler);
    } else {
      detachObserver(el);
    }
  },
  unbind: detachObserver,
};
