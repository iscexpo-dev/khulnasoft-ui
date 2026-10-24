# KhulnaSoft UI CSS

KhulnaSoft UI provides component styles and a Pajamas-compliant Tailwind CSS preset.

## Quick Start

The fastest way to get KhulnaSoft UI components to render properly in your project is to import the main
CSS bundle along with the internally-used CSS utilities:

```css
@import '@khulnasoft/ui/dist/index.css';
@import '@khulnasoft/ui/dist/tailwind.css';
```

> **Note:** If you wish to setup Tailwind CSS in your project, you _should not_ import the
> `@khulnasoft/ui/dist/tailwind.css` stylesheet as that might result in duplicated CSS utilities being
> included in your app. Instead, you should configure Tailwind to parse KhulnaSoft UI's files along with
> your project's. See [Tailwind CSS](#tailwind-css) below.

## Usage with a SCSS preprocessor

If you use a SCSS preprocessor, you may include the base SCSS file instead of `index.css`:

```scss
@import '@khulnasoft/ui/src/scss/khulnasoft_ui';
```

In addition to component styling, this provides various functions, variables and mixins.

### Overriding variables

Variables are imported as part of the [base SCSS file](#usage-with-a-scss-preprocessor).

To use a variable without including KhulnaSoft UI components’ styles, import the variable file and its
functions directly:

```scss
@import '@khulnasoft/ui/src/scss/functions';
@import '@khulnasoft/ui/src/scss/variables';

.my-class {
  margin: $gl-spacing-scale-5;
}
```

To view a complete list of variables, see [variables.scss](/src/scss/variables.scss).

## Tailwind CSS

As of 16.9, we have started migrating KhulnaSoft UI CSS utilities to [Tailwind CSS](https://tailwindcss.com/).
Projects that consume `@khulnasoft/ui` and that wish to use its Pajamas-compliant Tailwind preset should
therefore set Tailwind CSS up on their end by following the relevant installation [instructions](https://tailwindcss.com/docs/installation).

Because some KhulnaSoft UI components use utility classes internally, you must configure the `content` option
to scan `@khulnasoft/ui`'s own compiled bundles:

```js
const tailwindDefaults = require('@khulnasoft/ui/tailwind.defaults.js');

/** @type {import('tailwindcss').Config} */
module.exports = {
  // Consume KhulnaSoft UI's Pajamas-compliant preset
  presets: [tailwindDefaults],
  content: [
    // The consumer scans its own frontend assets
    './{ee,}/app/assets/javascripts/**/*.{vue,js}',

    // The consumer should also scan some backend resources if they might contain utility classes
    './{ee,}/app/helpers/**/*.rb',
    './{ee,}/app/components/**/*.{haml,rb}',
    './{ee,}/app/views/**/*.haml',

    // Scan KhulnaSoft UI's own assets
    './node_modules/@khulnasoft/ui/dist/**/*.js',
  ],
};
```

## How does KhulnaSoft UI interact with KhulnaSoft CSS?

Refer to the [relevant docs](./debugging-khulnasoft-ui-with-khulnasoft-css.md) to learn how KhulnaSoft UI and
KhulnaSoft styles interact with each other.
