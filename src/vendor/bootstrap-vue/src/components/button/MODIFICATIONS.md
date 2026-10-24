# Modifications to Vendored Code

**Library**: BootstrapVue  
**Version**: 2.23.1 **Link:** https://bootstrap-vue.org **Source:**
https://github.com/bootstrap-vue/bootstrap-vue **Copyright:** (c) 2016-2024 BootstrapVue
**License:** (c)
[2016-2024 BootstrapVue](https://github.com/bootstrap-vue/bootstrap-vue/blob/master/LICENSE)

This file documents modifications made to the original BootstrapVue component files.

## Removed unnecessary properties

The following properties have been removed as they are no longer supported in our implementation:

- `pill`
- `squared`

## Vue 3: props are not rendered as attributes

In Vue 3 (`@vue/compat`), the `data` of a functional component also holds its props. These
components passed `data` to `mergeData()` for their root element, so their props rendered as
attributes, such as `tooltip="true"`. They now omit their own props from `data` first.

- `button.js`: Omits its props from `data`.
