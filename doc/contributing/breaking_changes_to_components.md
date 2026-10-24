# Introducing and rolling out breaking changes to components

[Feature flagging component changes](./feature_flagging_component_changes.md) is the preferred
approach for rolling out a change to a component. The `GlDeprecatedFoo` process below has not been
used in a while. Use it for changes that break the component's API, such as renamed props or
removed slots, which a config-backed prop and feature flag can't gate.

There is currently no standard approach for rolling out breaking changes in
KhulnaSoft UI components to projects that consume them. Various approaches have
been tried in the past, and some have worked better than others. Whatever the
approach is, it can get tricky when a component is used in many places in
a large codebase, like KhulnaSoft.

Here is an outline of an approach that has worked reasonably well. Suppose the
component to receive the breaking changes is called `GlFoo`:

1. Introduce a minor version change to KhulnaSoft UI that simply re-exports the
   given component, say `GlFoo`, under an _additional_ name,
   `GlDeprecatedFoo`. The same `GlFoo` export is still available.

   For example, in [`index.js`](../../index.js):

   ```diff
   - export { default as GlFoo } from './src/components/base/foo/foo.vue';
   + export { default as GlFoo, default as GlDeprecatedFoo } from './src/components/base/foo/foo.vue';
   ```

1. Open [integration MRs] with projects that consume KhulnaSoft UI (e.g., KhulnaSoft)
   that bump `@khulnasoft/ui` to the new _minor_ version, and change all existing
   imports of `GlFoo` to `GlDeprecatedFoo`, but _alias it back_ to `GlFoo`.

   For example:

   ```diff
   - import { GlFoo } from '@khulnasoft/ui';
   + import { GlDeprecatedFoo as GlFoo } from '@khulnasoft/ui';
   ```

   This keeps the diff small and easy to review, since templates don't need to
   change, and no visual or behavioral changes need to be verified. It also
   reduces the amount of work that needs to be done in later steps.
1. Duplicate the existing `GlFoo` implementation, naming one copy
   `GlDeprecatedFoo`, and export it as `GlDeprecatedFoo`. This copy should
   receive _no further changes_.
1. Implement the breaking changes on the copy exported as `GlFoo`, and release
   this in a new _major_ version.
1. Open [integration MRs] with projects that consume KhulnaSoft UI (e.g., KhulnaSoft)
   that bump `@khulnasoft/ui` to the new _major_ version, and fix any additional
   new uses of `GlFoo` to import `GlDeprecatedFoo` instead. The amount of these
   should be significantly reduced thanks to step 2.
1. Open an epic to iteratively upgrade each use of `GlDeprecatedFoo` to the new
   `GlFoo`. There is a [script] that helps automate some of this.
1. Once all uses have been upgraded in the consuming projects, completely
   remove `GlDeprecatedFoo` from KhulnaSoft UI and release it as another major
   version, since it's another breaking change.
1. A final set of [integration MRs] can now be opened which bump `@khulnasoft/ui`
   to the new _major_ version, and any new uses of `GlDeprecatedFoo` (but
   hopefully there are none) can be upgraded to `GlFoo`.

Note that if `GlFoo` were only used once or twice in consuming projects, some
of the steps in this process would be unnecessary overhead; it might be easier
to immediately upgrade those uses to the new implementation in the same
integration MR that bumps `@khulnasoft/ui` to the new major version.

Remember to ensure the major version number of KhulnaSoft UI is incremented with
any breaking changes.

[integration MRs]: ./khulnasoft_integration_test.md#testing-your-changes-using-a-remote-development-package
[script]: https://khulnasoft.com/khulnasoft-org/frontend/playground/create-migrate-deprecated-component-issues

## Testing breaking changes with duo-ui integration

When making breaking changes, it's important to test them against the duo-ui project.
We have a CI pipeline setup that automatically tests integration with duo-ui on every MR.
Here's how it works:

1. Every MR automatically runs a `ui:duo_job` that tests integration with duo-ui
2. By default, if the duo-ui integration fails, it will fail the entire pipeline
3. If you need to make breaking changes that will temporarily break duo-ui, you can:
   - Add the `duo-ui-allowed-to-fail` label to your MR
   - This will allow the duo-ui integration to fail without failing the pipeline
4. Once your breaking changes are merged, create a follow-up MR in duo-ui to fix the integration
