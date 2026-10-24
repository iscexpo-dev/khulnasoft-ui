const { TEST_HOST } = require('./tests/__helpers__/constants');
const { USE_VUE_3, JEST_VUE_TRANSFORMER } = require('./use_vue3');

const reporters = ['default'];
const setupFilesAfterEnv = ['<rootDir>/tests/jest_setup.js'];

const customModuleNameMappers = {};
const extraJestConfig = {};

if (USE_VUE_3) {
  global.console.log('Using Vue.js 3');

  setupFilesAfterEnv.unshift('<rootDir>/tests/jest_setup_vue3_compat.js');
  Object.assign(customModuleNameMappers, {
    '^vue$': '@vue/compat',
    '^@vue/test-utils$': '@vue/test-utils-vue3',
  });
  Object.assign(extraJestConfig, {
    globals: {
      'vue-jest': {
        compilerOptions: {
          compatConfig: {
            MODE: 2,
          },
        },
      },
    },
  });
}

const transformIgnoreNodeModules = [
  'bootstrap-vue',
  '@storybook/.*\\.vue',
  '@gitlab/svgs',
  'gridstack',
  'lodash-es',
  '@adobe/leonardo-contrast-colors',
  'chroma-js',
  'apca-w3',
  'colorparsley',
];

module.exports = {
  ...extraJestConfig,
  verbose: true,
  moduleFileExtensions: ['js', 'json', 'vue'],
  moduleNameMapper: {
    '^~helpers/(.*)$': '<rootDir>/tests/__helpers__/$1',
    '^~/(.*)$': '<rootDir>/src/$1',
    '^@khulnasoft/ui$': '<rootDir>/index.js',
    '^@khulnasoft/ui/(.*)$': '<rootDir>/$1',
    '^@gitlab/svgs/dist/icons\\.json$': '<rootDir>/tests/mocks/khulnasoftSvgsIcons.json',
    '^@gitlab/svgs/dist/illustrations\\.json$': '<rootDir>/tests/mocks/khulnasoftSvgsIllustrations.json',
    '\\.(svg|html|md|png)$': '<rootDir>/tests/mocks/assetMock.js',
    '\\.(css|scss|less)$': 'identity-obj-proxy',
    ...customModuleNameMappers,
  },
  modulePathIgnorePatterns: ['cypress/integration', '.cypress_cache'],
  testPathIgnorePatterns: ['/node_modules/'],
  transform: {
    '^.+\\.m?js$': 'babel-jest',
    '.*\\.(vue)$': JEST_VUE_TRANSFORMER,
    '\\.(svg|html|md|png)$': '<rootDir>/tests/transformers/file_transformer.js',
  },
  transformIgnorePatterns: [`node_modules/(?!(${transformIgnoreNodeModules.join('|')}))`],
  snapshotSerializers: [
    '<rootDir>/tests/html_string_serializer.js',
    '<rootDir>/tests/clean_html_element_serializer.js',
  ],
  setupFilesAfterEnv,
  reporters,
  testEnvironment: '<rootDir>/tests/environment.js',
  testEnvironmentOptions: {
    url: TEST_HOST,
  },
  testRunner: 'jest-circus/runner',
  snapshotFormat: {
    printBasicPrototype: true,
  },
};
