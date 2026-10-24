const Vue = require('vue');
const VTU = require('@vue/test-utils');
const { matcherHint, printReceived, printExpected } = require('jest-matcher-utils');
const { default: setConfigs, defaultConfig } = require('../src/config');
const { useMockResizeObserver } = require('./__helpers__/mock_dom_observer');
const { createMockDirective: mockDirectiveCreator } = require('./__helpers__/vue_mock_directive');
const { setWindowLocation } = require('./__helpers__/set_window_location');
const { TEST_HOST } = require('./__helpers__/constants');

VTU.enableAutoDestroy?.(afterEach);

beforeEach(() => {
  // Reset global configuration
  defaultConfig.firstDayOfWeek = undefined;

  setWindowLocation(TEST_HOST);

  setConfigs();
});

// Tooltips require complex DOM setup
// Since we're just reusing bootstrap-vue functionality
// We can safely mock it
jest.mock('../src/directives/tooltip/tooltip.js', () => ({
  GlTooltipDirective: mockDirectiveCreator('gl-tooltip'),
}));

// Mock lodash-es/uniqueId to return deterministic values for snapshot tests
let mockUniqueIdCounter = 0;
jest.mock('lodash-es', () => ({
  ...jest.requireActual('lodash-es'),
  uniqueId: (prefix = '') => {
    mockUniqueIdCounter += 1;
    return `${prefix}${mockUniqueIdCounter}`;
  },
}));

beforeEach(() => {
  mockUniqueIdCounter = 0;
});

VTU.config.deprecationWarningHandler = (method, message) => {
  throw new Error(`[vue-test-utils] ${method}: ${message}`);
};

// bootstrap-vue uses transitions and relies on some actual functionality from them
// Vue Test Utils stubs them by default. Let's unstub them to be able to rely on the
// functionality
if (VTU.config.stubs) {
  VTU.config.stubs.transition = false;
  VTU.config.stubs['transition-group'] = false;
}

const vueErrorHandler = jest.fn();
const vueWarnHandler = jest.fn();

function toHaveLoggedVueWarnings() {
  const { calls } = vueWarnHandler.mock;
  vueWarnHandler.mockClear();

  return {
    pass: calls.length > 0,
    message: () =>
      calls.length > 0
        ? `Vue warnings were logged: ${calls.map((c) => c[0]).join('\n')}`
        : 'No Vue warnings were logged',
  };
}

expect.extend({
  toHaveLoggedVueErrors() {
    if (Vue.version.startsWith('3')) {
      const { calls } = vueErrorHandler.mock;
      vueErrorHandler.mockClear();

      return {
        pass: calls.length > 0,
        message: () =>
          calls.length > 0
            ? `Vue errors were logged: ${calls.map((c) => c[0]).join('\n')}`
            : 'No Vue errors were logged',
      };
    }

    // VTU@1 (for Vue 2) forcefully overwrites Vue.config.errorHandler[1], so
    // we can't track calls to it. The error handler it sets up throws the
    // error[2] because we don't use localVue, which is then caught by Vue's
    // error handling, which then falls through to Vue.config.warningHandler[3].
    //
    // In other words, errors are logged as warnings in this case.
    //
    // [1]: https://github.com/vuejs/vue-test-utils/blob/v1.3.6/packages/test-utils/src/error.js#L50-L68
    // [2]: https://github.com/vuejs/vue-test-utils/blob/v1.3.6/packages/test-utils/src/error.js#L26
    // [3]: https://github.com/vuejs/vue/blob/v2.7.16/src/core/util/error.ts#L56-L69
    return toHaveLoggedVueWarnings();
  },
  toHaveLoggedVueWarnings,
});

// Adopted from https://github.com/testing-library/jest-dom/blob/main/src/to-have-focus.js
expect.extend({
  toHaveFocus(element) {
    return {
      pass: element.ownerDocument.activeElement === element,
      message: () => {
        return [
          matcherHint(`${this.isNot ? '.not' : ''}.toHaveFocus`, 'element', ''),
          '',
          'Expected',
          `  ${printExpected(element)}`,
          'Received:',
          `  ${printReceived(element.ownerDocument.activeElement)}`,
        ].join('\n');
      },
    };
  },
});

if (!process.env.IS_VISUAL_TEST) {
  useMockResizeObserver();

  beforeAll(() => {
    Vue.config.warnHandler = vueWarnHandler;

    if (Vue.version.startsWith('3')) {
      Vue.config.errorHandler = vueErrorHandler;
    }
  });

  afterEach(() => {
    expect(global.console).not.toHaveLoggedVueErrors();
    expect(global.console).not.toHaveLoggedVueWarnings();
  });
}
