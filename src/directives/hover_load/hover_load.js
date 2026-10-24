import { isFunction } from 'lodash-es';

export const DELAY_ON_HOVER = 100;
let mouseOverTimer;
let mouseOverHandler;

const bind = (el, { value: loadHandler }) => {
  if (!isFunction(loadHandler)) {
    throw TypeError('Directive value must be a function');
  }

  const mouseOutHandler = () => {
    if (mouseOverTimer) {
      clearTimeout(mouseOverTimer);
      mouseOverTimer = undefined;
    }
  };

  mouseOverHandler = () => {
    el.addEventListener('mouseout', mouseOutHandler, { passive: true });

    mouseOverTimer = setTimeout(() => {
      loadHandler(el);

      // Only execute once
      el.removeEventListener('mouseover', mouseOverHandler, true);
      el.removeEventListener('mouseout', mouseOutHandler);

      mouseOverTimer = undefined;
    }, DELAY_ON_HOVER);
  };

  el.addEventListener('mouseover', mouseOverHandler, {
    capture: true,
    passive: true,
  });
};

const unbind = (el) => {
  el.removeEventListener('mouseover', mouseOverHandler, true);
};

export const HoverLoadDirective = {
  bind,
  unbind,
};
