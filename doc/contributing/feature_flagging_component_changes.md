# Feature flagging component changes

When a change to a KhulnaSoft UI component alters behavior for every consumer (a new default, changed
markup, an accessibility change), gate it behind a KhulnaSoft feature flag instead of shipping it to
all of KhulnaSoft.com on the next `@khulnasoft/ui` release. This guide covers the design-system-specific
wiring that makes the change opt-in.

- **Covered here:** the wiring in both repositories, testing the flagged behavior, and verifying
  the flag is active.
- **Not covered:** the rollout process itself (flag issue, chatops commands, incremental rollout,
  cleanup policy). Follow the
  [KhulnaSoft feature flags development documentation](https://docs.khulnasoft.com/development/feature_flags/).
- **Prerequisite:** your `@khulnasoft/ui` change must be consumable in KhulnaSoft first. See
  [Testing KhulnaSoft UI changes in KhulnaSoft](./khulnasoft_integration_test.md).

In this guide, "this repository" is the design.khulnasoft.com monorepo (`@khulnasoft/ui` source in
`packages/khulnasoft-ui/`) and "the KhulnaSoft repository" is
[`khulnasoft-org/khulnasoft`](https://khulnasoft.com/khulnasoft-org/khulnasoft). Paths are relative to those roots.

## When to use this pattern

Use it when **all** of the following are true:

- The change affects a shared component's default behavior or output.
- You need to switch the new behavior on or off for every call site at runtime, without editing
  them.
- You want to validate the change on KhulnaSoft.com before making it the default.

The pattern gives you both levers. The `accessible_disabled_button` rollout was built so that a
single call site can opt in through the prop (step 2), while the flag flips every other call site
at once. A bare prop changes nothing until each call site adopts it, so skip the flag when
per-call-site adoption is enough. For changes that break the component's API (renamed props,
removed slots), follow
[Introducing and rolling out breaking changes to components](./breaking_changes_to_components.md)
instead.

## Wiring map

The mechanism has two halves: a config switch in `@khulnasoft/ui`, and a KhulnaSoft feature flag that
drives it. Five files carry the wiring; specs, stories, docs, and a changeset (covered in the
steps) come on top. `accessibleDisabledButton` is the worked example throughout; substitute your
own flag name.

Naming follows from the flag: choose a snake_case feature flag name
(`accessible_disabled_button`). The config option must be its camelCase form
(`accessibleDisabledButton`), which is also what Rails pushes to `gon`. The prop name is your
choice; the example drops words the component name already implies (`accessibleDisabled` on
`GlButton`).

| #   | Repository            | File                                                                               | Change                                                 |
| --- | --------------------- | ---------------------------------------------------------------------------------- | ------------------------------------------------------ |
| 1   | this repository       | `packages/khulnasoft-ui/src/config.js`                                             | Add a boolean option to `setConfigs`, default `false`  |
| 2   | this repository       | the component, e.g. `packages/khulnasoft-ui/src/components/base/button/button.vue` | Add a prop whose default reads the config value        |
| 3   | KhulnaSoft repository | `config/feature_flags/<type>/<flag_name>.yml`                                      | Feature flag definition                                |
| 4   | KhulnaSoft repository | `lib/khulnasoft/gon_helper.rb`                                                     | Push the flag state to the frontend via `gon`          |
| 5   | KhulnaSoft repository | `app/assets/javascripts/commons/khulnasoft_ui.js`                                  | Read `gon.features` and pass the value to `setConfigs` |

The worked example, end to end:
[design.khulnasoft.com!5912](https://github.com/khulnasoft/khulnasoft-ui/pull/5912)
implements steps 1 and 2,
[khulnasoft-org/khulnasoft!236906](https://github.com/khulnasoft/khulnasoft/pull/236906) wires
steps 3 to 5, and
[khulnasoft-org/khulnasoft#600158](https://github.com/khulnasoft/khulnasoft/issues/600158) is the
rollout issue that tracks the flag from there.

## Step 1: Add an opt-in config flag in KhulnaSoft UI

In this repository, add a boolean option to `setConfigs` in
[`packages/khulnasoft-ui/src/config.js`](../../src/config.js), defaulting to `false` (the old
behavior) and stored on the affected component's config object:

```js
// packages/khulnasoft-ui/src/config.js
const setConfigs = ({
  translations,
  firstDayOfWeek,
  accessibleDisabledButton = false,
} = {}) => {
  // ...
  if (typeof accessibleDisabledButton === "boolean") {
    Object.assign(glButtonConfig, {
      accessibleDisabledButton,
    });
  }
};
```

If the component has no config object yet, create and export one in the same file (for example,
`export const glBadgeConfig = {};` for `GlBadge`). The component imports it from `src/config.js`
directly; no `index.js` export is needed.

Mark the flag as temporary in a comment that describes the end state (flag removed, new behavior
the default), so the eventual cleanup is unambiguous. Document the new option in the `setConfigs`
options table in `contents/contribute/internationalization.md`, which lists every option.

## Step 2: Expose the switch as a prop with a config-backed default

Implement the new behavior in the component alongside the old one; the flag only chooses between
the two, so both paths must exist. Select them with a prop whose default reads the config value:

```js
// packages/khulnasoft-ui/src/components/base/button/button.vue
import { glButtonConfig } from '../../../config';

props: {
  accessibleDisabled: {
    type: Boolean,
    required: false,
    default: () => glButtonConfig.accessibleDisabledButton,
  },
},
```

### Why a prop instead of reading the config

Do not read the config object directly in the render logic. The prop shape matters for two
reasons:

1. **Tests and Storybook cannot use `setConfigs`.** The config module locks after the first
   `setConfigs` call, which `packages/khulnasoft-ui/tests/jest_setup.js` (and, for Storybook,
   `packages/khulnasoft-ui/.storybook/preview.js`) makes with all flags off, so any later
   `setConfigs(...)` silently no-ops. Tests opt in via `propsData: { accessibleDisabled: true }`;
   expose the prop as a story arg when the flagged state needs Storybook coverage.
1. **Call sites get an escape hatch.** A single instance can set `accessible-disabled` directly
   to opt in or out, independently of the global flag.

### When the change doesn't fit the simple shape

- **The changed markup lives in a shared child component.** For example, `GlAlert`'s dismiss
  button renders through `CloseButton`, which several other components also use. Keep the
  config-backed prop on the flagged component and thread a plain boolean prop into the child;
  giving the child its own config-backed default would flip every consumer of the child at once.
- **The change is a new default value** (a label, a class) rather than new markup. Still add one
  boolean and derive the new value from it; do not add a config option per value. If the value is
  a user-facing string, add its translation key per [Translations](./translation.md).

### Specs, snapshots, and the changeset

Add specs that set the prop and assert the new behavior. Leave the existing default-behavior
specs untouched; they guard the unflagged path every consumer gets until the flag flips. If a
touched component has committed snapshots, they pin the old markup; add flagged-path coverage
rather than regenerating them. Finally, [add a changeset](../../../../doc/changesets.md)
(typically a `minor` bump); the prop and config option are observable in the published package.

## Step 3: Drive the config flag from a KhulnaSoft feature flag

Three files in the KhulnaSoft repository connect a Rails feature flag to the config option from
step 1.

First, create the feature flag definition per the
[canonical feature flag documentation](https://docs.khulnasoft.com/development/feature_flags/), for
example `config/feature_flags/khulnasoft_com_derisk/accessible_disabled_button.yml`. The `<type>`
directory must match the `type:` argument in the next snippet.

Second, push the flag state to the frontend in `lib/khulnasoft/gon_helper.rb`:

```ruby
# khulnasoft-org/khulnasoft: lib/khulnasoft/gon_helper.rb
push_frontend_feature_flag(:accessible_disabled_button, current_user, type: :khulnasoft_com_derisk)
```

Third, read it and pass it to `setConfigs` (imported as `applyKhulnaSoftUIConfig`) in
`app/assets/javascripts/commons/khulnasoft_ui.js`:

```js
// khulnasoft-org/khulnasoft: app/assets/javascripts/commons/khulnasoft_ui.js
applyKhulnaSoftUIConfig({
  firstDayOfWeek: gon.first_day_of_week,
  accessibleDisabledButton: Boolean(gon?.features?.accessibleDisabledButton),
  // ...
});
```

Rails camelizes the snake_case flag name when pushing to `gon`: `accessible_disabled_button`
becomes `gon.features.accessibleDisabledButton`. Grepping JavaScript for the snake_case name
finds nothing; that does not mean the wiring is broken.

Expect a fourth file in practice: KhulnaSoft's RSpec suite runs with all feature flags enabled by
default, so a markup-changing flag flips backend feature specs the moment the flag definition
merges, before any rollout. If the new markup breaks test matchers (Capybara's `disabled:`
matcher did here), stub the flag off suite-wide in `spec/spec_helper.rb` with
`stub_feature_flags(accessible_disabled_button: false)` and a comment linking the rollout issue,
as [khulnasoft-org/khulnasoft!236906](https://github.com/khulnasoft/khulnasoft/pull/236906) does.

## Verifying the flag is active

Before trusting what you see on KhulnaSoft.com, confirm all three of the following. Each one was a
real failure mode during the `accessible_disabled_button` rollout.

1. **The flag is enabled for the right actor type.**
   `push_frontend_feature_flag(..., current_user, ...)` evaluates against the current user, so
   enabling the flag for a project or group actor (`--project=...`) has no effect on the UI. The
   levers that work: `--user=...`, `--feature-group=khulnasoft_team_members`, and the `--actors`
   percentage (rolls out by user).
1. **The page was loaded after the flag was toggled.** `gon` bakes the value in at render time;
   an already-open page keeps the old value. Hard refresh (or open a fresh session) as a user the
   flag is enabled for.
1. **The rendered markup actually changed.** Inspect the live DOM for the new output (here:
   `aria-disabled="true"` present, native `disabled` absent). Editing attributes in devtools
   proves nothing; `gon.features` in the browser console shows what the page rendered with.

Also plan for:

- **QA/E2E breakage.** If the change alters attributes test helpers rely on (Capybara's
  `disabled?` only checks the native `disabled` attribute), update the QA page objects before
  enabling the flag broadly. See
  [khulnasoft-org/khulnasoft!241899](https://github.com/khulnasoft/khulnasoft/pull/241899).
- **Compound components.** Components built on the changed one (here: button groups, segmented
  controls) inherit the behavior automatically; include them in the test plan.

## Cleaning up

Once the change is validated and stable, make the new behavior the default and remove the flag,
in this order:

1. In this repository: make the new behavior the component's default and remove the temporary
   option from `setConfigs`. Decide whether the prop from step 2 stays as a permanent opt-out;
   removing it is a breaking change for any call site that set it.
1. In the KhulnaSoft repository, after the `@khulnasoft/ui` release containing that change is bumped in:
   remove the flag references (`lib/khulnasoft/gon_helper.rb`,
   `app/assets/javascripts/commons/khulnasoft_ui.js`, any specs stubbing the flag) and delete the
   feature flag YAML definition. Removing this wiring before the bump lands would drop the option
   back to its `false` default and silently revert every user to the old behavior.
1. Follow the cleanup steps in the
   [canonical feature flag documentation](https://docs.khulnasoft.com/development/feature_flags/)
   (`feature delete` across environments, close the rollout issue).
