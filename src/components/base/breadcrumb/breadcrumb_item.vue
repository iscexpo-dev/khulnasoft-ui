<script>
import GlLink from '../link/link.vue';
import { breadCrumbSizeOptions, linkVariantUnstyled } from '../../../utils/constants';

export default {
  name: 'GlBreadcrumbItem',
  components: {
    GlLink,
  },
  inheritAttrs: false,
  props: {
    /**
     * The text content to display in the breadcrumb item.
     */
    text: {
      type: String,
      required: false,
      default: null,
    },
    /**
     * Vue Router location object or path string for navigation.
     */
    to: {
      type: [String, Object],
      required: false,
      default: null,
    },
    /**
     * URL for the breadcrumb link when not using Vue Router.
     */
    href: {
      type: String,
      required: false,
      default: null,
    },
    /**
     * Indicates the current page within the breadcrumb trail for accessibility.
     */
    ariaCurrent: {
      type: [String, Boolean],
      required: false,
      default: false,
      validator(value) {
        return [false, 'page'].indexOf(value) !== -1;
      },
    },
    /**
     * The size variant of the breadcrumb item.
     */
    size: {
      type: String,
      required: false,
      default: breadCrumbSizeOptions.sm,
      validator: (value) => Object.keys(breadCrumbSizeOptions).includes(value),
    },
  },
  computed: {
    itemClass() {
      // eslint-disable-next-line @khulnasoft/tailwind-no-interpolation
      return ['gl-breadcrumb-item', `gl-breadcrumb-item-${this.size}`];
    },
  },
  linkVariantUnstyled,
};
</script>

<template>
  <li :class="itemClass">
    <gl-link
      :href="href"
      :to="to"
      :aria-current="ariaCurrent"
      :variant="$options.linkVariantUnstyled"
    >
      <slot>{{ text }}</slot>
    </gl-link>
  </li>
</template>
