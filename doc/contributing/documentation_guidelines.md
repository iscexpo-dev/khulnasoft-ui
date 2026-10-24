# KhulnaSoft UI documentation guidelines

By KhulnaSoft's [Definition of Done](https://docs.khulnasoft.com/development/contributing/merge_request_workflow/#definition-of-done),
a feature isn't ready until the documentation is shipped. The KhulnaSoft UI project
follows the same principle.

Documentation for this project is developer-oriented and should convey the
information necessary to reuse components seamlessly.

When creating a new component, add hints wherever helpful, document it briefly but completely,
and don't leave any gaps so that other developers can reuse them as easily and quickly as possible.

Use the terminology as described below and include the minimum required content
for these docs.

Use the KhulnaSoft's [documentation style guidelines](https://docs.khulnasoft.com/development/documentation/styleguide/)
as the baseline for writing documentation.

For consistency and scalability, whenever a component is changed, it's imperative
that its documentation is updated along with the code.

## Reviews

The documentation review for the KhulnaSoft UI project is performed by the code
reviewer themselves. The [Technical Writer assigned to Development Guidelines](https://handbook.khulnasoft.com/handbook/product/ux/technical-writing/#assignments)
can be requested at any time for help, inputs, and feedback, but it isn't
required. To request their help, assign issues
and merge requests to them and don't hesitate to ping them on Slack if immediate attention is needed.

For updating these guidelines for KhulnaSoft UI's documentation, make sure to request the assigned
Technical Writer's review.

## Terminology

### Referring to KhulnaSoft UI

When referring to the KhulnaSoft UI project in your documentation changes, use the human-friendly
capitalized name: KhulnaSoft UI.

**Don't** use the project's slug (khulnasoft-ui, `khulnasoft-ui`).

When referring to KhulnaSoft UI's npm package, use the package's name with code formatting: `@khulnasoft/ui`.

### Referring to a component

When mentioning a component in the documentation, use its PascalCase name with the `Gl` prefix and
code formatted.

Good:

- `GlAvatar`
- `GlIntersectionObserver`

Bad:

- `gl-avatar`
- `Avatar`
- `<gl-intersection-observer>`

## Content

When documenting a new component, make sure to describe what the component is,
what it does, and how to reuse it. Exemplify its usage and link to existing
code when helpful.

Also, make sure to mention (if relevant):

- The component's purpose, which corresponds to the short description that's in [Pajamas' documentation](https://design.khulnasoft.com/components/).
- Usage information.
- Dos and don'ts.
- Props, slots, and events.
- Browser compatibility.
- Edge cases.
- Deprecation warnings.

Example of well-written documentation: [base alert default component](https://design.khulnasoft.com/storybook?path=/story/base-alert--default).

## Markdownlint

[`markdownlint`](https://github.com/DavidAnson/markdownlint) enforces consistent styles throughout
KhulnaSoft UI's documentation.
We use `markdownlint`'s default rules. Some of the rules are customized in
[`.markdownlint.yaml`](../../.markdownlint.yaml).
We recommend that you [configure your editor](https://docs.khulnasoft.com/development/documentation/testing/markdownlint/#configure-markdownlint-in-your-editor)
to report `markdownlint` violations.
