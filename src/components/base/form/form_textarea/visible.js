import { isFunction } from 'lodash-es';

// IntersectionObserver-backed visibility directive.
// Calls the function when the element enters the viewport.
// The element is expanded by ROOT_MARGIN.
const ROOT_MARGIN = '640px';

let observer = null;

// Exported for testing purposes only
export const resetObserver = () => {
  observer?.disconnect();
  observer = null;
};

const attachObserver = (el, callback) => {
  if (!isFunction(callback)) {
    throw TypeError('directive value must be a function');
  }

  if (!observer) {
    // the observer instance is shared for performance reasons
    // more information: https://github.com/WICG/ResizeObserver/issues/59
    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.glVisibleHandler();
          }
        });
      },
      { rootMargin: ROOT_MARGIN },
    );
  }

  el.glVisibleHandler = callback;
  observer.observe(el);
};

const detachObserver = (el) => {
  if (el.glVisibleHandler) {
    delete el.glVisibleHandler;
    observer?.unobserve(el);
  }
};

export const GlVisibleDirective = {
  bind(el, { value: callback }) {
    attachObserver(el, callback);
  },
  unbind: detachObserver,
};
