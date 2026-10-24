The `GlMarkdown` component styles markdown-generated HTML following the Pajamas Documentation Markdown
[styling specifications](https://www.figma.com/file/qEddyqCrI7kPSBjGmwkZzQ/Pajamas-UI-Kit---Beta?node-id=542%3A2).

## Usage

You can use the `GlMarkdown` component in two ways.

### Vue component

```html
<script>
import { GlMarkdown } from '@khulnasoft/ui';

export default {
  components: {
    GlMarkdown,
  }
}
</script>
<template>
  <gl-markdown>
    <!-- All the content inside gl-markdown will inherit the documentation markdown styles -->
  </gl-markdown>
</template>
```

### `gl-markdown` class selector

Follow the [KhulnaSoft UI CSS guidelines](https://github.com/khulnasoft/khulnasoft-ui/-/blob/main/doc/css.md)
to include KhulnaSoft UI CSS in your application. Afterwards, you can apply the `gl-markdown` class
selector to the root element that contains the markdown-generated HTML.

```html
<body class="gl-markdown">
  <!-- All the content inside body.gl-markdown will inherit the documentation markdown styles -->
</body>
```

### Compact markdown

Set the `compact` property to true in `GlMarkdown` to apply the compact markdown styles.

```html
<gl-markdown compact></gl-compact>
```

You can also append the `gl-compact-markdown` class selector after `gl-markdown` in markdown-generated
HTML.

```html
<body class="gl-markdown gl-compact-markdown">
</body>
```

<!--
## Browser compatibility

If the component requires any polyfill or fallback on certain browsers, describe those requirements
here.
-->

<!--
## Edge cases

If the component has some known limitations, describe them here.
-->

<!--
## Deprecation warning

If and when this component introduced API changes that would require deprecating old APIs, describe
the changes here, and provide a migration paths to the new API.
-->
