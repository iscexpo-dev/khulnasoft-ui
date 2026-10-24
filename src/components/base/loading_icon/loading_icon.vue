<script>
const sizes = [
  'sm', // -> 16px
  'md', // -> 24px
  'lg', // -> 32px
  'xl', // -> 64px
];
const colors = {
  dark: 'dark',
  light: 'light',
};
const defaultColor = colors.dark;

export default {
  name: 'GlLoadingIcon',
  props: {
    /**
     * Accessible label for screen readers.
     */
    label: {
      type: String,
      required: false,
      default: 'Loading',
    },
    /**
     * Size of the loading icon. Options: 'sm' (16px), 'md' (24px), 'lg' (32px), 'xl' (64px).
     */
    size: {
      type: String,
      required: false,
      default: 'sm',
      validator(value) {
        return sizes.indexOf(value) !== -1;
      },
    },
    /**
     * Color variant of the loading icon. Options: 'dark', 'light'.
     */
    color: {
      type: String,
      required: false,
      default: defaultColor,
      validator(value) {
        return Object.keys(colors).includes(value);
      },
    },
    /**
     * Visual variant of the loading icon. Options: 'spinner', 'dots'.
     */
    variant: {
      type: String,
      required: false,
      default: 'spinner',
      validator(value) {
        return ['spinner', 'dots'].includes(value);
      },
    },
    /**
     * When true, wraps the loading icon in a span instead of a div for inline display.
     */
    inline: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  computed: {
    rootElementType() {
      return this.inline ? 'span' : 'div';
    },
    spinnerCssClasses() {
      const baseCssClass = 'gl-spinner';

      return [
        baseCssClass,
        `${baseCssClass}-${colors[this.color]}`,
        `${baseCssClass}-${this.size}`,
      ];
    },
    dotsCssClasses() {
      const baseCssClass = 'gl-dots-loader';

      return [
        baseCssClass,
        `${baseCssClass}-${colors[this.color]}`,
        `${baseCssClass}-${this.size}`,
      ];
    },
  },
};
</script>
<template>
  <component
    :is="rootElementType"
    v-if="variant === 'spinner'"
    :aria-label="label"
    class="gl-spinner-container"
    role="status"
  >
    <span class="!gl-align-text-bottom" :class="spinnerCssClasses"></span>
  </component>
  <component :is="rootElementType" v-else :class="dotsCssClasses" role="status" :aria-label="label">
    <span></span>
  </component>
</template>
