# Accessibility testing

Storybook is integrated with `storybook/addon-a11y` based on
[axe](https://github.com/dequelabs/axe-core) to report failures.
We use the [Storybook Test Runner](https://github.com/storybookjs/test-runner)
addon to run accessibility tests based on [storybook](https://github.com/storybookjs/storybook) stories.
These tests run alongside [visual regressions testing](./visual_testing.md).

When component or dependency updates result in an accessibility violation, accessibility tests fail.

To inspect the violations causing the pipeline to fail, browse the failing `visual` job's artifacts.

## Viewing and fixing accessibility violations

* During development:
  * Start Storybook on `http://localhost:9001`.
    This can be done by running the following command:

    ```shell
    yarn storybook
    ```

  * Use the accessibility panel in Storybook to identify and fix violations.
  * This provides immediate feedback without waiting for CI jobs.
* In CI pipeline:
  * Accessibility tests will run as part of the CI process.
  * Check the CI job output for any reported violations.
* Fixing violations:
  * Address each violation reported by the test runner.
  * Refer to the Storybook accessibility panel for detailed information on each issue.
  * Update the component/story code to resolve the violation.
  * Re-run the tests to confirm the fix.

### Handling new violations

As `axe-core` (the underlying accessibility testing engine) is updated, new violations may be detected.
To handle these:

* Review the new violations in the test output or Storybook Accessibility panel.
* Assess each violation for validity and impact.
* Create issues for legitimate violations that need addressing.
  Add the `component:<component-name>` & `accessibility` labels to the issue.
* Update tests if necessary, using the `getA11yParameters.skipRules` option
  judiciously for false positives or non-applicable rules.
* Alternatively, use `getA11yParameters.temporarySkipRules` to skip rules
  temporarily until issue is resolved.

#### Finding rule IDs for violations

To identify the rule ID of a failing accessibility violation:

1. In the Storybook accessibility panel:
   * Click on the violation to expand its details
   * Click the "More info" link
   * This will open the Deque University documentation page (`https://dequeuniversity.com/rules/axe/...`)

2. On the Deque University page:
   * Locate the rule ID under the main heading (h1)
   * Use this ID when configuring rule exceptions in your story parameters

This rule ID can be used in component or story-level configurations to customize accessibility
testing behavior, as shown in the configuration examples above.

### Excluding stories from accessibility testing

Excluding a story from [visual regression testing](./visual_testing.md#excluding-stories-from-visual-testing)
using `skip-visual-tests` also excludes it from accessbility tests.

## Configuring the addon

The test runner also lets us fine-tune the [addon configuration](https://storybook.js.org/docs/writing-tests/accessibility-testing#configure)
or override axe ruleset at [global](https://storybook.js.org/docs/writing-tests/accessibility-testing#global-a11y-configuration),
[component](https://storybook.js.org/docs/writing-tests/accessibility-testing#component-level-a11y-configuration)
or [story](https://storybook.js.org/docs/writing-tests/accessibility-testing#story-level-a11y-configuration)
level.
