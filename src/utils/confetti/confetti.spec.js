import { confetti } from './confetti';
import { CONFIG } from './constants';

const BURST_WINDOW = 220;
const MIDPOINT_DELAY = BURST_WINDOW / 2;
const { cell: CELL, pixelMin: PIXEL_MIN } = CONFIG;

const createContext = () => {
  const fillStyles = [];

  return {
    fillStyles,
    fillRect: jest.fn(),
    save: jest.fn(),
    restore: jest.fn(),
    translate: jest.fn(),
    beginPath: jest.fn(),
    rect: jest.fn(),
    clip: jest.fn(),
    clearRect: jest.fn(),
    setTransform: jest.fn(),
    set fillStyle(value) {
      fillStyles.push(value);
    },
    get fillStyle() {
      return fillStyles.at(-1);
    },
  };
};

const findCanvases = () => document.body.querySelectorAll('canvas');

describe('confetti', () => {
  let context;
  let frameCallbacks;

  const runFrame = (timestamp) => {
    const callback = frameCallbacks.shift();
    callback(timestamp);
  };

  const runFramesUpTo = (timestamp, step = 16) => {
    for (let at = 0; at <= timestamp; at += step) {
      runFrame(at);
    }
  };

  const paintField = (timestamp) => {
    context.fillRect.mockClear();
    runFrame(timestamp);

    return context.fillRect.mock.calls.map(([x, y, width, height]) => ({ x, y, width, height }));
  };

  const addBox = (rect) => {
    const element = document.body.appendChild(document.createElement('div'));

    jest.spyOn(element, 'getBoundingClientRect').mockReturnValue(rect);

    return element;
  };

  const mockReducedMotion = (matches) => {
    window.matchMedia = jest.fn().mockReturnValue({ matches });
  };

  beforeEach(() => {
    context = createContext();
    frameCallbacks = [];
    jest.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(context);
    jest.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
      frameCallbacks.push(callback);
      return frameCallbacks.length;
    });
    jest.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {});
  });

  afterEach(() => {
    document.body.innerHTML = '';
    delete window.matchMedia;
    jest.restoreAllMocks();
  });

  it('adds a non-interactive, aria-hidden canvas to the document', () => {
    confetti();

    const [canvas] = findCanvases();

    expect(canvas.getAttribute('aria-hidden')).toBe('true');
    expect(canvas.style.position).toBe('fixed');
    expect(canvas.style.pointerEvents).toBe('none');
  });

  it('paints blocks once the burst has finished launching', () => {
    confetti({ count: 60 });

    runFramesUpTo(BURST_WINDOW);

    expect(paintField(BURST_WINDOW + 16).length).toBeGreaterThan(0);
  });

  it('paints square blocks snapped to the grid, never larger than a cell', () => {
    confetti({ count: 60 });

    runFramesUpTo(BURST_WINDOW);

    paintField(BURST_WINDOW + 16).forEach(({ x, y, width, height }) => {
      expect(width).toBe(height);
      expect(width).toBeGreaterThanOrEqual(PIXEL_MIN);
      expect(Number.isInteger(width)).toBe(true);
      expect((x % CELL) + width).toBeLessThanOrEqual(CELL);
      expect((y % CELL) + height).toBeLessThanOrEqual(CELL);
    });
  });

  it('shrinks the blocks as the burst ages', () => {
    confetti({ count: 200, duration: 3000 });

    runFramesUpTo(BURST_WINDOW);
    const early = paintField(BURST_WINDOW + 16);

    runFramesUpTo(2000);
    const late = paintField(2016);

    const area = (blocks) =>
      blocks.reduce((total, { width }) => total + width * width, 0) / blocks.length;

    expect(area(late)).toBeLessThan(area(early));
  });

  it('launches pieces from the bottom of the viewport and carries them upwards', () => {
    confetti({ count: 40 });

    runFramesUpTo(BURST_WINDOW);
    const launched = paintField(BURST_WINDOW + 16);

    runFramesUpTo(600);
    const risen = paintField(616);

    expect(Math.max(...launched.map(({ y }) => y))).toBeGreaterThan(window.innerHeight * 0.9);
    expect(Math.min(...risen.map(({ y }) => y))).toBeLessThan(window.innerHeight / 2);
  });

  it('removes the canvas once the duration has passed', () => {
    confetti({ duration: 1000 });

    runFrame(0);
    runFrame(1000);

    expect(findCanvases()).toHaveLength(0);
  });

  it('starts fully opaque when the duration is shorter than the fade out', () => {
    confetti({ duration: 300 });

    runFrame(0);

    expect(context.globalAlpha).toBe(1);
  });

  it('removes the canvas when the returned function is called', () => {
    const stop = confetti();

    stop();

    expect(findCanvases()).toHaveLength(0);
  });

  it('ignores a second burst while the first is still running', () => {
    const stop = confetti({ count: 10 });
    const ignored = confetti({ count: 10 });

    ignored();

    expect(findCanvases()).toHaveLength(1);

    stop();

    expect(findCanvases()).toHaveLength(0);
  });

  it('bursts again once the running one has stopped', () => {
    confetti({ count: 10 })();
    confetti({ count: 10 });

    expect(findCanvases()).toHaveLength(1);
  });

  it('paints with the given colors', () => {
    confetti({ count: 60, colors: ['rebeccapurple'] });

    runFramesUpTo(BURST_WINDOW + 16);

    expect(new Set(context.fillStyles)).toEqual(new Set(['rebeccapurple']));
  });

  describe('with a `boundary` element', () => {
    it('clips the confetti to the bounds of the element', () => {
      const box = addBox({ left: 120, top: 60, width: 300, height: 200 });

      confetti({ boundary: box, count: 10 });
      runFrame(0);

      expect(context.rect).toHaveBeenCalledWith(120, 60, 300, 200);
      expect(context.clip).toHaveBeenCalled();
    });

    it('launches from the bottom corners of the element, not of the viewport', () => {
      const box = addBox({ left: 0, top: 0, width: 300, height: 200 });

      confetti({ boundary: box, count: 40 });
      runFramesUpTo(BURST_WINDOW);

      const painted = paintField(BURST_WINDOW + 16);

      expect(Math.max(...painted.map(({ y }) => y))).toBeLessThan(220);
    });

    it('scales the piece count down to suit the smaller area', () => {
      const box = addBox({ left: 0, top: 0, width: 200, height: 120 });
      const stop = confetti({ boundary: box });

      runFramesUpTo(BURST_WINDOW);
      const confined = paintField(BURST_WINDOW + 16).length;

      stop();
      frameCallbacks = [];
      confetti();
      runFramesUpTo(BURST_WINDOW);

      expect(confined).toBeLessThan(paintField(BURST_WINDOW + 16).length);
    });
  });

  it('bursts from the center of the `origin` element', () => {
    jest.spyOn(Math, 'random').mockReturnValue(0.5);

    const button = addBox({ left: 400, top: 500, width: 100, height: 40 });

    confetti({ origin: button, count: 1 });
    runFramesUpTo(MIDPOINT_DELAY);

    const painted = paintField(MIDPOINT_DELAY + 16);
    const distances = painted.map(({ x, y }) => Math.hypot(x - 450, y - 520));

    expect(painted.length).toBeGreaterThan(0);
    expect(Math.max(...distances)).toBeLessThan(100);
  });

  it('clips to the live viewport size after the window grows mid-animation', () => {
    confetti({ count: 10 });
    runFrame(0);

    window.innerWidth = 1600;
    window.innerHeight = 1200;
    context.rect.mockClear();
    runFrame(16);

    expect(context.rect).toHaveBeenCalledWith(0, 0, 1600, 1200);
  });

  it('clips to the live bounds after the `boundary` element resizes', () => {
    const box = addBox({ left: 10, top: 20, width: 300, height: 200 });

    confetti({ boundary: box, count: 10 });
    runFrame(0);

    box.getBoundingClientRect.mockReturnValue({ left: 40, top: 50, width: 500, height: 260 });
    context.rect.mockClear();
    runFrame(16);

    expect(context.rect).toHaveBeenCalledWith(40, 50, 500, 260);
  });

  it('does nothing when the user prefers reduced motion', () => {
    mockReducedMotion(true);

    confetti();

    expect(findCanvases()).toHaveLength(0);
    expect(window.requestAnimationFrame).not.toHaveBeenCalled();
  });
});
