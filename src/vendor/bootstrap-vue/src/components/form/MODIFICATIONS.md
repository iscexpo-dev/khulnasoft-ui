# Modifications to Vendored Code

**Library**: BootstrapVue  
**Version**: 2.23.1 **Link:** https://bootstrap-vue.org **Source:**
https://github.com/bootstrap-vue/bootstrap-vue **Copyright:** (c) 2016-2024 BootstrapVue
**License:** (c)
[2016-2024 BootstrapVue](https://github.com/bootstrap-vue/bootstrap-vue/blob/master/LICENSE)

This file documents modifications made to the original BootstrapVue component files.

## Vue 3: props are not rendered as attributes

In Vue 3 (`@vue/compat`), the `data` of a functional component also holds its props. These
components passed `data` to `mergeData()` for their root element, so their props rendered as
attributes, such as `tooltip="true"`. They now omit their own props from `data` first.

- `form.js`: Omits its props from `data`.
- `form-invalid-feedback.js`: Omits its props from `data`.
- `form-valid-feedback.js`: Omits its props from `data`.
