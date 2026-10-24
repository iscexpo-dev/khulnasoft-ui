# Settings

> BootstrapVue provides a few options for customizing component default values, and more.

## Configuring defaults

BootstrapVue is pre-configured for the default Bootstrap v4.x configuration. It assumes the
breakpoints are the standard breakpoint names of `xs`, `sm`, `md`, `lg`, and `xl`. Also various
BootstrapVue components have props with default variants and text content.

BootstrapVue provides several methods for changing the default configuration.

Note that it is not possible to change the defaults when using BootstrapVue via a `<script>` tag.

### Default configuration

Default breakpoint names are stored in the `breakpoints` property and all other shared component
configurations (like `formControls`) are listed below.

Component specific defaults are keyed by their `PascalCase` name with the props as `camelCase`
properties.

```json
{
  // Breakpoint configuration
  "breakpoints": ["xs", "sm", "md", "lg", "xl"],

  // Shared component configuration
  "formControls": {
    "disabled": undefined,
    "required": false,
    "form": undefined,
    "autofocus": false,
    "plain": false,
    "size": undefined
  },
  "formOptionControls": {
    "options": [],
    "valueField": "value",
    "textField": "text",
    "htmlField": "html",
    "disabledField": "disabled"
  },
  "formRadioCheckGroups": {
    "validated": false,
    "ariaInvalid": false,
    "stacked": false,
    "buttons": false,
    "buttonVariant": undefined,
    "plain": false
  },
  "formRadioCheckControls": {
    "value": undefined,
    "checked": undefined,
    "inline": false,
    "button": false,
    "buttonVariant": undefined,
    "ariaLabel": undefined,
    "ariaLabelledby": undefined,
    "plain": false
  },
  "formState": {
    "state": null
  },
  "formTextControls": {
    "value": "",
    "ariaInvalid": false,
    "readonly": false,
    "plaintext": false,
    "autocomplete": undefined,
    "placeholder": undefined,
    "formatter": undefined,
    "lazyFormatter": false,
    "trim": false,
    "number": false,
    "lazy": false,
    "debounce": 0
  },

  // Component configuration
  "BButton": {
    "variant": "primary"
    // ...
  }
  // ...
}
```

### Setting new configuration values

When you `Vue.use(BootstrapVue)`, you can optionally pass a configuration object which specifies new
values to replace the default values. For example if you wish to define new breakpoint names (which
will generate appropriate properties on components such as `<b-col>` and `<b-form-group>`), so that
the new breakpoints are `['aa', 'bb', 'cc', 'dd']` then `<b-col>` will now have `bb`, `cc`, and `dd`
props instead of `sm`, `md`, `lg` and `xl` props (similar for the `label-cols-{breakpoint}` and
`label-align-{breakpoint}` props on `<b-form-group>`):

```js
import BootstrapVue from 'bootstrap-vue'

Vue.use(BootstrapVue, {
  breakpoints: [`xs`, 'sm', 'md', 'lg', 'xl', 'xxl']
})
```

Or if changing the default variants for `<b-button>` and `<b-alert>`:

```js
import BootstrapVue from 'bootstrap-vue'

Vue.use(BootstrapVue, {
  BButton: { variant: 'primary' }
})
```

The values provided as the config option to `Vue.use` will be merged with the default values.

**Note:** When defining custom breakpoints, keep the names short (2 to 3 characters). At least two
breakpoint names must be defined. The breakpoint names **must** match the breakpoint names defined
in your custom Bootstrap SCSS. Breakpoint names must not conflict with non-breakpoint prop names
used on various components (i.e. avoid `to`, `col`, etc.)

### Setting the config via Nuxt.js module

Refer to the [Getting Started](/docs/#nuxtjs-module) documentation for information on passing the
config object to the BootstrapVue Nuxt.js module.

## Disabling console warnings

BootstrapVue will warn (via `console.warn()`) when you try and use a deprecated prop, or pass an
invalid value to certain props. These warnings are provided to help you ensure that your application
is using the correct props and values.

BootstrapVue automatically disables warnings in production mode (`NODE_ENV=production`). If you want
to disable the warnings in other scenarios (not recommended), you can do so by setting the following
process environment variable:

<!-- eslint-disable no-unused-vars -->

```js
process.env.BOOTSTRAP_VUE_NO_WARN = true
```

By ignoring warnings, you may find that your project fails/breaks when using future releases of
BootstrapVue where deprecated props have been removed.

**Warnings should be corrected before moving your project into production!**
