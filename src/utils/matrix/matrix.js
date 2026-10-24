import { resolveColors } from './palette';
import { createColumns, advanceColumn, glyph, measureGrid } from './columns';
import {
  CONFIG,
  FONT,
  DEFAULT_DURATION,
  FADE_OUT_DURATION,
  CANVAS_Z_INDEX,
  MAX_FRAME_DELTA,
  RUNNING_ATTRIBUTE,
} from './constants';

const noop = () => {};

const measureStage = (boundary) => {
  const rect =
    boundary instanceof Element
      ? boundary.getBoundingClientRect()
      : { left: 0, top: 0, width: window.innerWidth, height: window.innerHeight };

  return { x: rect.left, y: rect.top, width: rect.width, height: rect.height };
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
 * Rains `G` and `L` glyphs down the screen, then cleans up after itself.
 *
 * Every option has a default, so `matrix()` on its own rains over the whole viewport. Pass
 * `boundary` to keep the rain inside an element. Each column falls at its own speed in one color
 * from the brand ramp, with a head glyph in the default text color and a trail that fades behind it.
 *
 * Only one run happens at a time: a call made while another is still on screen does nothing and
 * returns a no-op.
 *
 * Does nothing when the user prefers reduced motion, or outside a browser.
 *
 * The canvas is `aria-hidden`, so nobody using a screen reader will know it ran. When the rain is
 * the only sign that something happened, the caller has to convey that in the accessibility tree
 * as well.
 *
 * @param {Object} [options]
 * @param {Number} [options.duration=6000] How long the rain runs, in milliseconds.
 * @param {String[]} [options.colors] CSS colors for the columns, picked at random one per column.
 * Defaults to the brand orange and purple and the red color tokens. The head glyph's text color
 * resolves against `boundary` when given, so a `.gl-dark-scope` ancestor is honored.
 * @param {Element} [options.boundary] Element to confine the rain to. Defaults to the viewport.
 * @example
 * const stop = matrix({ boundary: terminal, duration: 4000 });
 * @returns {Function} Stops the rain and removes the canvas early.
 */
export const matrix = ({ duration = DEFAULT_DURATION, colors, boundary } = {}) => {
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

  const { head, rain } = resolveColors(
    colors,
    boundary instanceof Element ? boundary : document.documentElement,
  );
  let columns = createColumns(stage, rain);

  const erase = (delta) => {
    context.globalCompositeOperation = 'destination-out';
    context.fillStyle = `rgba(0, 0, 0, ${1 - Math.exp(-CONFIG.trail * delta)})`;
    context.fillRect(0, 0, stage.width, stage.height);
    context.globalCompositeOperation = 'source-over';
  };

  const paintColumn = (column, previousHead) => {
    const x = column.column * CONFIG.cell;

    if (previousHead !== null) {
      context.fillStyle = column.color;
      context.fillText(glyph(), x, previousHead * CONFIG.cell);
    }

    column.steps.forEach((row, index) => {
      context.fillStyle = index === column.steps.length - 1 ? head : column.color;
      context.fillText(glyph(), x, row * CONFIG.cell);
    });
  };

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

    const grid = measureGrid(stage);
    Object.assign(stage, measureStage(boundary));
    const nextGrid = measureGrid(stage);

    if (nextGrid.across !== grid.across || nextGrid.rows !== grid.rows) {
      columns = createColumns(stage, rain);
    }

    canvas.style.opacity = String(Math.min(1, (duration - elapsed) / FADE_OUT_DURATION));

    context.save();
    context.beginPath();
    context.rect(stage.x, stage.y, stage.width, stage.height);
    context.clip();
    context.translate(stage.x, stage.y);

    erase(delta);
    context.font = `${CONFIG.cell}px ${FONT}`;
    context.textBaseline = 'top';

    columns = columns.map((column) => {
      const next = advanceColumn(column, delta);

      if (next.steps.length) {
        paintColumn(next, column.head);
      }

      return next;
    });

    context.restore();

    frame = window.requestAnimationFrame(render);
  };

  resize();
  window.addEventListener('resize', resize);
  document.body.append(canvas);
  frame = window.requestAnimationFrame(render);

  return stop;
};
