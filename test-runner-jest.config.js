/* eslint-disable unicorn/filename-case */

const { getJestConfig } = require('@storybook/test-runner');

const testRunnerConfig = getJestConfig();

/**
 * @type {import('@jest/types').Config.InitialOptions}
 */
module.exports = {
  // The default Jest configuration comes from @storybook/test-runner
  ...testRunnerConfig,
  testSequencer: '<rootDir>/tests/retry_sequencer.js',
  // @storybook/test-runner [sets rootDir][storybook1] to the
  // [nearest directory containing `.git`][storybook2]. This is different to
  // how [Jest defines rootDir by default][jest], which is the directory
  // containing your Jest config file or the package.json or the pwd if no
  // package.json is found.
  //
  // So, while Jest's default would be fine, because @storybook/test-runner
  // sets rootDir with a different strategy, we need to override it.
  //
  // [storybook1]: https://github.com/storybookjs/test-runner/blob/v0.19.1/src/config/jest-playwright.ts#L78
  // [storybook2]: https://github.com/storybookjs/storybook/blob/7.6.20/code/lib/core-common/src/utils/paths.ts#L4-L10
  // [jest]: https://github.com/jestjs/jest/blob/v29.7.0/docs/Configuration.md#rootdir-string
  rootDir: __dirname,
  // Run two workers in parallel per shard. The CI runner (saas-linux-small-amd64)
  // has 2 vCPUs and 8 GB RAM, so we get one Playwright Firefox worker per CPU
  // without exhausting memory. Combined with `parallel: 2` in .khulnasoft-ci.yml,
  // this yields 4 simultaneous workers across the suite.
  maxWorkers: 2,
};
