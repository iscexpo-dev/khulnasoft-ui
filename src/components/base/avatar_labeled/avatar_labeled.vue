<script>
import GlAvatar from '../avatar/avatar.vue';
import GlLink from '../link/link.vue';
import { avatarShapeOptions, avatarSizeOptions } from '../../../utils/constants';
import { avatarSizeValidator } from '../avatar/utils';

export default {
  name: 'GlAvatarLabeled',
  components: {
    GlAvatar,
    GlLink,
  },
  inheritAttrs: false,
  props: {
    /**
     * Label displayed to the right of the avatar.
     */
    label: {
      type: String,
      required: true,
    },
    /**
     * Sub-label displayed below the label when inlineLabels is false.
     * Displayed to the right of label when inlineLabels is true.
     */
    subLabel: {
      type: String,
      required: false,
      default: '',
    },
    /**
     * Link for the label.
     */
    labelLink: {
      type: String,
      required: false,
      default: '',
    },
    /**
     * Attributes to pass to the label link.
     */
    labelLinkAttrs: {
      type: Object,
      required: false,
      default() {
        return {};
      },
    },
    /**
     * Link for the sub-label.
     */
    subLabelLink: {
      type: String,
      required: false,
      default: '',
    },
    /**
     * Display label and sub-label inline.
     */
    inlineLabels: {
      type: Boolean,
      required: false,
      default: false,
    },
    /**
     * ID of the entity, used to generate a unique placeholder avatar.
     */
    entityId: {
      type: Number,
      required: false,
      default: 0,
    },
    /**
     * Name of the entity, used to generate a unique placeholder avatar.
     */
    entityName: {
      type: String,
      required: false,
      default: '',
    },
    /**
     * Avatar image src.
     */
    src: {
      type: String,
      required: false,
      default: '',
    },
    /**
     * Show fallback identicon when image fails to load
     */
    fallbackOnError: {
      type: Boolean,
      required: false,
      default: false,
    },
    /**
     * Size of the avatar.
     * Available sizes are 96, 64, 48, 32, 24, 16.
     */
    size: {
      type: [Number, Object],
      required: false,
      default: avatarSizeOptions[1],
      validator: avatarSizeValidator,
    },
    /**
     * Shape of the avatar.
     * Available shapes are `circle` and `rect`.
     */
    shape: {
      type: String,
      required: false,
      default: avatarShapeOptions.circle,
    },
  },
  computed: {
    hasLabelLink() {
      return Boolean(this.labelLink);
    },
    hasSubLabelLink() {
      return Boolean(this.subLabelLink);
    },
    avatarListeners() {
      if (this.hasLabelLink) {
        return {
          ...this.$listeners,
          click: this.onAvatarClick,
        };
      }

      return this.$listeners;
    },
    avatarCssClasses() {
      return {
        'gl-cursor-pointer': this.hasLabelLink,
      };
    },
    avatarRowLayoutClass() {
      return {
        'inline-labels': this.inlineLabels,
      };
    },
    avatarPropsAndAttrs() {
      return {
        ...this.$attrs,
        entityId: this.entityId,
        entityName: this.entityName,
        src: this.src,
        fallbackOnError: this.fallbackOnError,
        size: this.size,
        shape: this.shape,
      };
    },
  },
  methods: {
    onAvatarClick() {
      this.$refs.labelLink.$el.click();
    },
  },
};
</script>
<template>
  <div class="gl-avatar-labeled">
    <gl-avatar v-bind="avatarPropsAndAttrs" :class="avatarCssClasses" alt v-on="avatarListeners" />
    <div class="gl-avatar-labeled-labels !gl-text-left" :class="avatarRowLayoutClass">
      <div class="-gl-mx-1 -gl-my-1 gl-flex gl-flex-wrap gl-items-center !gl-text-left">
        <gl-link
          v-if="hasLabelLink"
          v-bind="labelLinkAttrs"
          ref="labelLink"
          :href="labelLink"
          class="gl-avatar-link"
          variant="meta"
          @click="$emit('label-link-click', $event)"
        >
          <span class="gl-avatar-labeled-label">{{ label }}</span>
        </gl-link>
        <span v-else class="gl-avatar-labeled-label">{{ label }}</span>
        <!-- @slot Metadata to add to the avatar. Generally used for badges or user status emoji. -->
        <slot name="meta"></slot>
      </div>
      <gl-link v-if="hasSubLabelLink" :href="subLabelLink" class="gl-avatar-link" variant="meta">
        <span class="gl-avatar-labeled-sublabel">{{ subLabel }}</span>
      </gl-link>
      <span v-else class="gl-avatar-labeled-sublabel">{{ subLabel }}</span>
      <!-- @slot Add additional information below the avatar label. -->
      <slot></slot>
    </div>
  </div>
</template>
