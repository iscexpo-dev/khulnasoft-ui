/* eslint-disable class-methods-use-this, max-classes-per-file */
import { isMatch } from 'lodash-es';

/**
 * This class gives us a JSDom friendly DOM observer which we can manually trigger in tests
 *
 * Use this in place of MutationObserver or IntersectionObserver
 */
class MockObserver {
  constructor(cb) {
    this.$_cb = cb;
    this.$_observers = [];
  }

  observe(node, options = {}) {
    this.$_observers.push([node, options]);
  }

  disconnect() {
    this.$_observers = [];
  }

  takeRecords() {}

  $_triggerObserve(node, { entry = {}, options = {} } = {}) {
    if (this.$_hasObserver(node, options)) {
      this.$_cb([{ target: node, ...entry }]);
    }
  }

  $_hasObserver(node, options = {}) {
    return this.$_observers.some(
      ([obvNode, obvOptions]) => node === obvNode && isMatch(options, obvOptions),
    );
  }
}

class MockResizeObserver extends MockObserver {
  unobserve(node) {
    this.$_observers = this.$_observers.filter(([obvNode]) => node === obvNode);
  }
}

/**
 * Use this function to setup a mock observer instance in place of the given DOM Observer
 *
 * Example:
 * ```
 * describe('', () => {
 *   const { trigger: triggerMutate } = useMockMutationObserver();
 *
 *   it('test', () => {
 *     trigger(el, { options: { childList: true }, entry: { } });
 *   });
 * })
 * ```
 *
 * @param {String} key
 */
const useMockObserver = (key, createMock) => {
  let mockObserver;

  beforeAll(() => {
    global[key] = jest.fn().mockImplementation((...args) => {
      if (!mockObserver) {
        mockObserver = createMock(...args);
      }
      return mockObserver;
    });
  });

  afterEach(() => {
    // Clear our mock observer
    mockObserver?.disconnect();
    // Clear our mock calls
    global[key].mockClear();
  });

  const trigger = (...args) => {
    if (!mockObserver) {
      return;
    }

    mockObserver.$_triggerObserve(...args);
  };

  const observersCount = () => mockObserver?.$_observers?.length || 0;

  const observesElement = (element) =>
    mockObserver?.$_observers.some(([observedElement]) => observedElement === element) || false;

  return { trigger, observersCount, observesElement };
};

export const useMockResizeObserver = () =>
  useMockObserver('ResizeObserver', (...args) => new MockResizeObserver(...args));
