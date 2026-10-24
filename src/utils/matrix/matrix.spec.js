import { matrix } from './matrix';
import { CONFIG } from './constants';

const createContext = () => {
  const fillStyles = [];

  return {
    fillStyles,
    fillRect: jest.fn(),
    fillText: jest.fn(),
    save: jest.fn(),
    restore: jest.fn(),
    translate: jest.fn(),
    beginPath: jest.fn(),
    rect: jest.fn(),
    clip: jest.fn(),
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

describe('matrix', () => {
  let context;
  let frameCallbacks;

  const runFrame = (timestamp) => {
    const callback = frameCallbacks.shift();
    callback(timestamp);
  };

  const runFramesUpTo = (timestamp, from = 0, step = 16) => {
    for (let at = from; at <= timestamp; at += step) {
      runFrame(at);
    }
  };

  const glyphsDrawn = () => context.fillText.mock.calls.map(([character]) => character);

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
    matrix();

    const [canvas] = findCanvases();

    expect(canvas.getAttribute('aria-hidden')).toBe('true');
    expect(canvas.style.position).toBe('fixed');
    expect(canvas.style.pointerEvents).toBe('none');
  });

  it('rains only G and L glyphs', () => {
    matrix();

    runFramesUpTo(1000);

    expect(glyphsDrawn().length).toBeGreaterThan(0);
    expect(new Set(glyphsDrawn())).toEqual(new Set(['G', 'L']));
  });

  it('draws each glyph on the column grid', () => {
    matrix();

    runFramesUpTo(1000);

    context.fillText.mock.calls.forEach(([, x, y]) => {
      expect(x % CONFIG.cell).toBe(0);
      expect(y % CONFIG.cell).toBe(0);
    });
  });

  it('fills columns from the top downwards', () => {
    matrix();

    runFramesUpTo(300);
    const early = context.fillText.mock.calls.map(([, , y]) => y);

    runFramesUpTo(2000);
    const late = context.fillText.mock.calls.map(([, , y]) => y);

    expect(Math.max(...late)).toBeGreaterThan(Math.max(...early));
  });

  it('rains with the given colors', () => {
    matrix({ colors: ['rebeccapurple'] });

    runFramesUpTo(1000);

    expect(context.fillStyles).toContain('rebeccapurple');
  });

  it('removes the canvas once the duration has passed', () => {
    matrix({ duration: 1000 });

    runFrame(0);
    runFrame(1000);

    expect(findCanvases()).toHaveLength(0);
  });

  it('removes the canvas when the returned function is called', () => {
    const stop = matrix();

    stop();

    expect(findCanvases()).toHaveLength(0);
  });

  it('ignores a second run while the first is still going', () => {
    const stop = matrix();
    const ignored = matrix();

    ignored();

    expect(findCanvases()).toHaveLength(1);

    stop();

    expect(findCanvases()).toHaveLength(0);
  });

  it('confines the rain to a `boundary` element', () => {
    const box = document.body.appendChild(document.createElement('div'));

    jest.spyOn(box, 'getBoundingClientRect').mockReturnValue({
      left: 120,
      top: 60,
      width: 300,
      height: 200,
    });

    matrix({ boundary: box });
    runFrame(0);

    expect(context.rect).toHaveBeenCalledWith(120, 60, 300, 200);
    expect(context.clip).toHaveBeenCalled();
  });

  it('reads color tokens from the `boundary` element', () => {
    const box = document.body.appendChild(document.createElement('div'));
    box.style.setProperty('--gl-text-color-default', 'papayawhip');
    jest
      .spyOn(box, 'getBoundingClientRect')
      .mockReturnValue({ left: 0, top: 0, width: 300, height: 200 });
    jest.spyOn(Math, 'random').mockReturnValue(0);

    matrix({ boundary: box });
    runFramesUpTo(1000);

    expect(context.fillStyles).toContain('papayawhip');
  });

  it('lays out new columns when the `boundary` grows', () => {
    const box = document.body.appendChild(document.createElement('div'));
    const rect = jest
      .spyOn(box, 'getBoundingClientRect')
      .mockReturnValue({ left: 0, top: 0, width: CONFIG.cell, height: 200 });
    jest.spyOn(Math, 'random').mockReturnValue(0);

    matrix({ boundary: box });
    runFramesUpTo(500);
    rect.mockReturnValue({ left: 0, top: 0, width: CONFIG.cell * 4, height: 200 });
    context.fillText.mockClear();
    runFramesUpTo(1000, 512);

    expect(new Set(context.fillText.mock.calls.map(([, x]) => x)).size).toBe(4);
  });

  it('keeps its columns while the `boundary` resizes within a cell', () => {
    const box = document.body.appendChild(document.createElement('div'));
    const rect = jest
      .spyOn(box, 'getBoundingClientRect')
      .mockReturnValue({ left: 0, top: 0, width: CONFIG.cell * 4, height: 200 });
    jest.spyOn(Math, 'random').mockReturnValue(0);

    matrix({ boundary: box });
    runFramesUpTo(500);
    rect.mockReturnValue({ left: 0, top: 0, width: CONFIG.cell * 4 - 0.5, height: 199.5 });
    context.fillText.mockClear();
    runFramesUpTo(600, 512);

    expect(Math.min(...context.fillText.mock.calls.map(([, , y]) => y))).toBeGreaterThan(0);
  });

  it('does nothing when the user prefers reduced motion', () => {
    window.matchMedia = jest.fn().mockReturnValue({ matches: true });

    matrix();

    expect(findCanvases()).toHaveLength(0);
    expect(window.requestAnimationFrame).not.toHaveBeenCalled();
  });
});
