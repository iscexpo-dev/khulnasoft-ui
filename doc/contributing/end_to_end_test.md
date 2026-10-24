# End to end testing

Complex components require integration tests. We use [Cypress](https://docs.cypress.io/) as an end
to end test framework to test components hierarchies and integrations with dependencies.

## Adding new tests

Tests should be added in the `cypress/e2e` folder when testing a component
in isolation through unit tests is not enough to provide thorough test coverage.

For every story within `src/components/**/*.stories.js`,
a corresponding axe accessibility check should be added.

## Running Cypress tests

Tests can be run locally by starting Storybook
on `http://localhost:9001` and opening the Cypress dashboard.
This can be done by running the following commands in separate shells:

```shell
yarn storybook
```

```shell
yarn run cypress open
```

To run tests as a headless browser, run the following command:

```shell
yarn test:integration
```

In both cases, the server needs to be running.

### Remarks

Note that we want to minimise the number of `it` blocks for [performance reasons](https://docs.cypress.io/guides/references/best-practices#Creating-Tiny-Tests-With-A-Single-Assertion).
