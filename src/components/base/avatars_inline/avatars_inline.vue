<script>
import { truncate, get } from 'lodash-es';
import { avatarsInlineSizeOptions } from '../../../utils/constants';
import GlAvatar from '../avatar/avatar.vue';
import GlTooltip from '../tooltip/tooltip.vue';

export default {
  name: 'GlAvatarsInline',
  components: {
    GlAvatar,
    GlTooltip,
  },
  props: {
    /**
     * Array of avatar objects to display
     */
    avatars: {
      type: Array,
      required: true,
    },
    /**
     * Maximum number of avatars to display before collapsing
     */
    maxVisible: {
      type: Number,
      required: true,
    },
    /**
     * Size of each avatar in pixels
     */
    avatarSize: {
      type: Number,
      required: true,
      validator: (value) => avatarsInlineSizeOptions.includes(value),
    },
    /**
     * Whether to show the avatars in collapsed state
     */
    collapsed: {
      type: Boolean,
      required: false,
      default: false,
    },
    /**
     * Screen reader text for the collapsed avatars badge
     */
    badgeSrOnlyText: {
      type: String,
      required: true,
    },
    /**
     * Property name to extract tooltip text from each hidden avatar object
     */
    badgeTooltipProp: {
      type: String,
      required: false,
      default: '',
    },
    /**
     * Maximum number of characters to display in the badge tooltip
     */
    badgeTooltipMaxChars: {
      type: Number,
      required: false,
      default: null,
    },
  },
  computed: {
    hiddenAvatars() {
      return this.avatars.slice(this.maxVisible);
    },
    collapsable() {
      return this.hiddenAvatars.length > 0;
    },
    visibleAvatars() {
      return this.collapsed ? this.avatars.slice(0, this.maxVisible) : this.avatars;
    },
    badgeSize() {
      return (
        {
          16: 'sm',
          24: 'md',
          32: 'lg',
        }[this.avatarSize] || 'lg'
      );
    },
    rootClass() {
      // eslint-disable-next-line @khulnasoft/tailwind-no-interpolation
      return ['gl-avatars-inline', `gl-avatars-inline-${this.badgeSize}`];
    },
    badgeLabel() {
      return `+${this.hiddenAvatars.length}`;
    },
    badgeTooltipTitle() {
      if (!this.badgeTooltipProp) {
        return '';
      }

      const tooltipTitle = this.hiddenAvatars
        .map((avatar) => get(avatar, this.badgeTooltipProp, '').trim())
        .join(', ');

      // truncate will append '...'
      // we need to take these extra 3 characters into account in badgeTooltipMaxChars
      return this.badgeTooltipMaxChars
        ? truncate(tooltipTitle, { length: this.badgeTooltipMaxChars })
        : tooltipTitle;
    },
  },
};
</script>
<template>
  <div :class="rootClass">
    <div v-for="(avatar, index) in visibleAvatars" :key="index" class="gl-avatars-inline-child">
      <!-- @slot Custom avatar rendering. Provide avatar object as slot prop. -->
      <slot name="avatar" :avatar="avatar">
        <gl-avatar v-bind="avatar" :size="avatarSize" />
      </slot>
    </div>
    <div v-if="collapsed && collapsable" class="gl-avatars-inline-child">
      <gl-tooltip v-if="badgeTooltipProp" :target="() => $refs.badge">
        {{ badgeTooltipTitle }}
      </gl-tooltip>
      <span
        ref="badge"
        data-testid="collapsed-avatars-badge"
        :class="['gl-avatars-inline-badge', badgeSize]"
        aria-hidden="true"
      >
        {{ badgeLabel }}
      </span>
      <span data-testid="badge-sr-only-text" class="gl-sr-only">{{ badgeSrOnlyText }}</span>
    </div>
  </div>
</template>
