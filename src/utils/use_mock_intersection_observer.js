/* global jest, beforeEach, afterEach */
/* eslint-disable class-methods-use-this, max-classes-per-file */
import { isMatch } from 'lodash-es';

/**
 * This class gives us a JSDom friendly DOM observer which we can manually trigger in tests
 *
 * Use this in place of MutationObserver or IntersectionObserver
 *
 * This class is largely influenced from [a test helper][1] in the main KhulnaSoft project
 *
 * [1]: https://github.com/khulnasoft/khulnasoft/blob/a123813c63147392b95cd03c4744ae9db0575b0f/spec/frontend/helpers/mock_dom_observer.js#L95
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

  $_triggerObserve(nodeParam, { entry = {}, options = {} } = {}) {
    const nodes = this.$_getNodesFromParam(nodeParam);

    nodes.forEach((node) => {
      if (this.$_hasObserver(node, options)) {
        this.$_cb([{ target: node, ...entry }]);
      }
    });
  }

  $_hasObserver(node, options = {}) {
    return this.$_observers.some(
      ([obvNode, obvOptions]) => node === obvNode && isMatch(options, obvOptions),
    );
  }

  $_getNodesFromParam(nodeParam) {
    if (!nodeParam) {
      return this.$_observers.map(([node]) => node);
    }
    if (!Array.isArray(nodeParam)) {
      return [nodeParam];
    }

    return nodeParam;
  }
}

class MockIntersectionObserver extends MockObserver {
  unobserve(node) {
    this.$_observers = this.$_observers.filter(([obvNode]) => node !== obvNode);
  }
}

export const useMockIntersectionObserver = () => {
  let instances;
  let origObserver;

  beforeEach(() => {
    instances = [];
    origObserver = global.IntersectionObserver;
    global.IntersectionObserver = jest.fn().mockImplementation((...args) => {
      const mockObserver = new MockIntersectionObserver(...args);

      instances.push(mockObserver);

      return mockObserver;
    });
  });

  afterEach(() => {
    instances = [];
    global.IntersectionObserver = origObserver;
  });

  const trigger = (observer, ...args) => {
    observer.$_triggerObserve(...args);
  };

  const getInstances = () => {
    return instances;
  };

  const observersCount = (observer) => observer?.$_observers?.length || 0;

  const observesElement = (observer, element) =>
    observer?.$_observers.some(([observedElement]) => observedElement === element) || false;

  return { getInstances, trigger, observersCount, observesElement };
};
