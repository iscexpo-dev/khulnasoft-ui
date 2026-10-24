import { COVERAGE_RAMP } from './palette';
import { createPieces, advancePiece } from './particles';
import { createField } from './field';
import { CANVAS_Z_INDEX, DEFAULT_DURATION, FADE_OUT_DURATION, MAX_FRAME_DELTA } from './constants';

const noop = () => {};

const RUNNING_ATTRIBUTE = 'data-confetti';

const measureStage = (boundary) => {
  const rect =
    boundary instanceof Element
      ? boundary.getBoundingClientRect()
      : { left: 0, top: 0, width: window.innerWidth, height: window.innerHeight };

  return { x: rect.left, y: rect.top, width: rect.width, height: rect.height };
};

const stagePoint = (element, stage) => {
  if (!(element instanceof Element)) {
    return null;
  }

  const rect = element.getBoundingClientRect();

  return {
    x: rect.left + rect.width / 2 - stage.x,
    y: rect.top + rect.height / 2 - stage.y,
  };
};

const createCanvas = () => {
  const canvas = document.createElement('canvas');

  canvas.setAttribute('aria-hidden', 'true');
  canvas.setAttribute(RUNNING_ATTRIBUTE, '');
  Object.assign(canvas.style, {
    position: 'fixed',
    inset: '0',
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
    zIndex: String(CANVAS_Z_INDEX),
  });

  return canvas;
};

/**
 * Bursts a dithered field of pixel blocks, lets it fall, then cleans up after itself.
 *
 * Every option has a default, so `confetti()` on its own fires from the bottom corners of the
 * viewport. The blocks shrink as they fall and as they fade, and the ones furthest back start
 * smaller, which is what gives the field its depth.
 *
 * Only one burst runs at a time: a call made while another is still on screen does nothing and
 * returns a no-op, so a double click cannot stack two canvases.
 *
 * Does nothing when the user prefers reduced motion, or outside a browser.
 *
 * The canvas is `aria-hidden`, so nobody using a screen reader will know it fired. When the
 * confetti is the only sign that something worked, the caller has to convey that success in the
 * accessibility tree as well.
 *
 * @param {Object} [options]
 * @param {Number} [options.count] Number of pieces. Defaults to a count scaled to the area it
 * plays in, so a small `boundary` gets proportionally fewer.
 * @param {Number} [options.duration=3000] How long the animation runs, in milliseconds.
 * @param {String[]} [options.colors] CSS colors for the coverage ramp, sparse to dense: the first
 * paints the thinnest edge of a cluster and the last its densest center. Any length works, and the
 * first four double as the chromatic fringe colors. Defaults to the brand purple, red and orange
 * color tokens.
 * @param {Element} [options.origin] Element to burst from. Defaults to the bottom corners.
 * @param {Element} [options.boundary] Element to confine the confetti to. Defaults to the viewport.
 * @example
 * const stop = confetti({ origin: button, colors: ['#7759c2', '#a989f5', '#fca326'] });
 * @returns {Function} Stops the animation and removes the canvas early.
 */
export const confetti = ({ count, duration = DEFAULT_DURATION, colors, origin, boundary } = {}) => {
  if (
    typeof window === 'undefined' ||
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ||
    document.querySelector(`[${RUNNING_ATTRIBUTE}]`)
  ) {
    return noop;
  }

  const canvas = createCanvas();
  const context = canvas.getContext('2d');

  if (!context) {
    return noop;
  }

  const stage = measureStage(boundary);

  const resize = () => {
    const ratio = window.devicePixelRatio || 1;

    canvas.width = window.innerWidth * ratio;
    canvas.height = window.innerHeight * ratio;
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
  };

  const fadeOutDuration = Math.min(FADE_OUT_DURATION, duration);
  const field = createField({ ramp: colors?.length ? colors : COVERAGE_RAMP, duration });
  const cleared = { x: 0, y: 0, width: 0, height: 0 };

  let lastColor = null;

  const drawBlock = ({ x, y, size, color }) => {
    if (color !== lastColor) {
      lastColor = color;
      context.fillStyle = color;
    }

    context.fillRect(x, y, size, size);
  };

  const clearStage = () => {
    const moved =
      stage.x !== cleared.x ||
      stage.y !== cleared.y ||
      stage.width !== cleared.width ||
      stage.height !== cleared.height;

    if (moved) {
      context.clearRect(0, 0, window.innerWidth, window.innerHeight);
      Object.assign(cleared, stage);
    } else {
      context.clearRect(stage.x, stage.y, stage.width, stage.height);
    }
  };

  let pieces = createPieces({ stage, origin: stagePoint(origin, stage), count });

  let frame = null;
  let startedAt = null;
  let previousAt = null;

  const stop = () => {
    if (frame !== null) {
      window.cancelAnimationFrame(frame);
      frame = null;
    }
    window.removeEventListener('resize', resize);
    canvas.remove();
  };

  const render = (now) => {
    startedAt ??= now;
    const elapsed = now - startedAt;
    const delta = Math.min(now - (previousAt ?? now), MAX_FRAME_DELTA);
    previousAt = now;

    if (elapsed >= duration) {
      stop();
      return;
    }

    Object.assign(stage, measureStage(boundary));
    clearStage();
    lastColor = null;
    context.globalAlpha = Math.min(1, (duration - elapsed) / fadeOutDuration);
    context.save();
    context.beginPath();
    context.rect(stage.x, stage.y, stage.width, stage.height);
    context.clip();
    context.translate(stage.x, stage.y);

    pieces = pieces.map((piece) => advancePiece(piece, { elapsed, delta }));
    field.resize(stage);
    pieces.forEach((piece) => {
      if (elapsed >= piece.delay) {
        field.stamp(piece, elapsed);
      }
    });
    field.paint(drawBlock);

    context.restore();

    frame = window.requestAnimationFrame(render);
  };

  resize();
  window.addEventListener('resize', resize);
  document.body.append(canvas);
  frame = window.requestAnimationFrame(render);

  return stop;
};
