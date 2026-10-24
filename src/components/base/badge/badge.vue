<script>
import GlLink from '../link/link.vue';
import {
  badgeVariantOptions,
  badgeIconSizeOptions,
  linkVariantUnstyled,
} from '../../../utils/constants';
import GlIcon from '../icon/icon.vue';
import { logWarning } from '../../../utils/utils';

const variantClass = {
  [badgeVariantOptions.neutral]: 'badge-neutral',
  [badgeVariantOptions.info]: 'badge-info',
  [badgeVariantOptions.success]: 'badge-success',
  [badgeVariantOptions.warning]: 'badge-warning',
  [badgeVariantOptions.danger]: 'badge-danger',
  [badgeVariantOptions.tier]: 'badge-tier',
};

export default {
  name: 'GlBadge',
  components: {
    GlLink,
    GlIcon,
  },
  props: {
    /**
     * The variant of the badge.
     */
    variant: {
      type: String,
      default: badgeVariantOptions.neutral,
      validator(value) {
        return badgeVariantOptions[value] !== undefined;
      },
      required: false,
    },
    /**
     * The icon to show next to the text
     */
    icon: {
      type: String,
      required: false,
      default: null,
    },
    /**
     * The size of the icon 16 or 12
     */
    iconSize: {
      type: String,
      default: 'md',
      validator: (value) => Object.keys(badgeIconSizeOptions).includes(value),
      required: false,
    },
    /**
     * Optically aligns circular icons with the badge.
     */
    iconOpticallyAligned: {
      type: Boolean,
      default: false,
      required: false,
    },
    /**
     * Custom tag to use (unless `href` is defined)
     */
    tag: {
      type: String,
      required: false,
      default: 'span',
    },
    /**
     * Creates the badge as link (ignores `tag` property)
     */
    href: {
      type: String,
      required: false,
      default: undefined,
    },
    /**
     * Sets the `rel` attributes, when `href` is defined
     */
    rel: {
      type: String,
      required: false,
      default: null,
    },
    /**
     * Sets the `target`, when `href` is defined
     */
    target: {
      type: String,
      required: false,
      default: '_self',
    },
    /**
     * Adds the `active` class, when `href` is defined
     */
    active: {
      type: Boolean,
      required: false,
      default: false,
    },
    /**
     * Disables the link, when `href` is defined
     */
    disabled: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  computed: {
    hasContent() {
      return Boolean(this.$scopedSlots.default);
    },
    hasIconOnly() {
      return Boolean(this.icon) && !this.hasContent;
    },
    isCircularIcon() {
      return this.iconOpticallyAligned || ['issue-open-m', 'issue-close'].includes(this.icon);
    },
    role() {
      return this.hasIconOnly ? 'img' : undefined;
    },
    iconSizeComputed() {
      return badgeIconSizeOptions[this.iconSize];
    },
    isLink() {
      return Boolean(this.href);
    },
    computedTag() {
      return this.isLink ? GlLink : this.tag;
    },
    computedProps() {
      if (!this.isLink) return {};

      const { href, rel, target, active, disabled } = this;
      return { href, rel, target, active, disabled, variant: linkVariantUnstyled };
    },
    classes() {
      return [
        'gl-badge',
        'badge',
        'badge-pill',
        variantClass[this.variant],
        { '!gl-px-2': !this.hasContent },
      ];
    },
  },
  mounted() {
    if (this.hasIconOnly && !this.$attrs['aria-label']) {
      logWarning(
        'Icon-only badges require an aria-label for accessibility. The label should describe the metadata (e.g., "Due date", "Open issue"), not the icon name. See https://design.khulnasoft.com/components/badge#using-icon-only-badges',
        { name: 'GlBadge', element: this.$el },
      );
    }
  },
};
</script>

<template>
  <component
    :is="computedTag"
    v-bind="computedProps"
    :class="classes"
    :role="role"
    v-on="$listeners"
  >
    <gl-icon
      v-if="icon"
      class="gl-badge-icon"
      :size="iconSizeComputed"
      :class="{ '-gl-ml-2': isCircularIcon && hasContent }"
      :name="icon"
    />
    <span v-if="hasContent" class="gl-badge-content">
      <slot></slot>
    </span>
  </component>
</template>
