# Modifications to Vendored Code

**Library**: BootstrapVue  
**Version**: 2.23.1 **Link:** https://bootstrap-vue.org **Source:**
https://github.com/bootstrap-vue/bootstrap-vue **Copyright:** (c) 2016-2024 BootstrapVue
**License:** (c)
[2016-2024 BootstrapVue](https://github.com/bootstrap-vue/bootstrap-vue/blob/master/LICENSE)

This file documents modifications made to the original BootstrapVue component files.

## Removed unnecessary properties

The following properties have been removed as they are no longer supported in our implementation:

- `headerBgVariant`
- `headerBorderVariant`
- `headerTextVariant`
- `headerCloseVariant`
- `bodyBgVariant`
- `bodyTextVariant`
- `footerBgVariant`
- `footerBorderVariant`
- `footerTextVariant`

These properties were removed to streamline the component for our use case, as they are no longer
necessary in our project. The following files have been modified from the original:

- `modal.js`: Removed unnecessary properties.
- `package.json`: Removed unnecessary properties.
- `README.md`: Removed unnecessary properties.

## Modal manager is a plain object

- `helpers/modal-manager.js`: The modal manager is a plain object, not a Vue instance. No template
  or computed reads its state, so it needs no reactivity. `registerModal` and `unregisterModal` run
  the side effects that its watchers ran before. Before, importing `@khulnasoft/ui` created a Vue
  instance with `new`, and that instance watched an array that it mutated. Under `@vue/compat`, this
  logged the `GLOBAL_MOUNT` and `WATCH_ARRAY` deprecations.
