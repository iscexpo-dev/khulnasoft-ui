const { defineConfig } = require('cypress');

const STORYBOOK_HOST = process.env.STORYBOOK_HOST || 'localhost';
const STORYBOOK_PORT = process.env.STORYBOOK_PORT || 9001;

module.exports = defineConfig({
  defaultCommandTimeout: 10000,
  env: {
    // Use by the @cypress/grep package
    // https://github.com/cypress-io/cypress/tree/develop/npm/grep#pre-filter-specs-grepfilterspecs
    grepFilterSpecs: true,
    // Use by the @cypress/grep package
    // https://github.com/cypress-io/cypress/tree/develop/npm/grep#omit-filtered-tests-grepomitfiltered
    grepOmitFiltered: true,
  },
  e2e: {
    baseUrl: `http://${STORYBOOK_HOST}:${STORYBOOK_PORT}`,
  },
});
