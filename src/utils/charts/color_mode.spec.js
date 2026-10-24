import { isDarkMode, onColorModeChange } from './color_mode';

describe('color mode', () => {
  let element;

  // MutationObserver callbacks are queued as microtasks, so yielding the task lets them run.
  const flush = () =>
    new Promise((resolve) => {
      setTimeout(resolve, 0);
    });

  // Everything is built inside a per-test container, so that a test adding a scope class to an
  // ancestor cannot leak that scope into the next test through <body>.
  let container;

  const nest = (...classNames) => {
    let parent = container;

    classNames.forEach((className) => {
      const child = document.createElement('div');
      if (className) child.className = className;
      parent.appendChild(child);
      parent = child;
    });

    return parent;
  };

  beforeEach(() => {
    document.body.innerHTML = '';
    container = document.createElement('div');
    document.body.appendChild(container);
    element = nest('');
  });

  afterEach(() => {
    document.documentElement.className = '';
    document.body.className = '';
    document.body.innerHTML = '';
  });

  describe('isDarkMode', () => {
    it('is false by default', () => {
      expect(isDarkMode(element)).toBe(false);
    });

    it('is true under gl-dark on the document root', () => {
      document.documentElement.classList.add('gl-dark');

      expect(isDarkMode(element)).toBe(true);
    });

    it('is true inside a gl-dark-scope subtree of a light document', () => {
      expect(isDarkMode(nest('gl-dark-scope', 'wrapper', ''))).toBe(true);
    });

    it('lets the nearest scope win over the document root', () => {
      document.documentElement.classList.add('gl-dark');

      expect(isDarkMode(nest('gl-light-scope', ''))).toBe(false);
    });

    it('lets the nearest scope win over an outer scope', () => {
      expect(isDarkMode(nest('gl-dark-scope', 'gl-light-scope', ''))).toBe(false);
      expect(isDarkMode(nest('gl-light-scope', 'gl-dark-scope', ''))).toBe(true);
    });

    it('is false when there is no element', () => {
      expect(isDarkMode(null)).toBe(false);
      expect(isDarkMode(undefined)).toBe(false);
    });
  });

  describe('onColorModeChange', () => {
    let subscriber;
    let unsubscribe;

    beforeEach(() => {
      subscriber = jest.fn();
      unsubscribe = onColorModeChange(element, subscriber);
    });

    afterEach(() => {
      unsubscribe();
    });

    it('calls back when the document root flips', async () => {
      document.documentElement.classList.add('gl-dark');
      await flush();

      expect(subscriber).toHaveBeenCalledWith(true);

      document.documentElement.classList.remove('gl-dark');
      await flush();

      expect(subscriber).toHaveBeenCalledWith(false);
    });

    it('calls back when an ancestor becomes a dark scope', async () => {
      element.parentElement.classList.add('gl-dark-scope');
      await flush();

      expect(subscriber).toHaveBeenCalledWith(true);
    });

    it('does not call back when a change leaves this element in the same mode', async () => {
      const elsewhere = nest('');
      elsewhere.classList.add('gl-dark-scope');
      await flush();

      expect(subscriber).not.toHaveBeenCalled();
    });

    it('does not call back for class changes that touch no scope', async () => {
      element.parentElement.classList.add('an-unrelated-class');
      await flush();

      expect(subscriber).not.toHaveBeenCalled();
    });

    it('tracks each subscribed element separately', async () => {
      const scoped = nest('scope-host', '');
      const scopedSubscriber = jest.fn();
      const unsubscribeScoped = onColorModeChange(scoped, scopedSubscriber);

      scoped.parentElement.classList.add('gl-dark-scope');
      await flush();

      expect(scopedSubscriber).toHaveBeenCalledWith(true);
      expect(subscriber).not.toHaveBeenCalled();

      unsubscribeScoped();
    });

    it('stops calling back once unsubscribed', async () => {
      unsubscribe();

      document.documentElement.classList.add('gl-dark');
      await flush();

      expect(subscriber).not.toHaveBeenCalled();
    });
  });

  it('starts observing again after every subscriber has left', async () => {
    onColorModeChange(element, jest.fn())();

    const subscriber = jest.fn();
    const unsubscribe = onColorModeChange(element, subscriber);

    document.documentElement.classList.add('gl-dark');
    await flush();

    expect(subscriber).toHaveBeenCalledWith(true);

    unsubscribe();
  });
});
