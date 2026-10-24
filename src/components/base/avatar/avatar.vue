<script>
import { isNumber } from 'lodash-es';
import { avatarShapeOptions, avatarSizeOptions } from '../../../utils/constants';
import { getAvatarChar } from '../../../utils/string_utils';
import { avatarSizeValidator } from './utils';

const IDENTICON_BG_COUNT = 7;

export default {
  name: 'GlAvatar',
  props: {
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
     * Alt text for the img tag.
     */
    alt: {
      type: String,
      required: false,
      default: 'avatar',
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
  data() {
    return {
      imageLoadError: false,
    };
  },
  computed: {
    sizeClasses() {
      if (isNumber(this.size)) {
        // eslint-disable-next-line @khulnasoft/tailwind-no-interpolation -- Not a CSS utility
        return `gl-avatar-s${this.size}`;
      }

      const { default: defaultSize, ...nonDefaultSizes } = this.size;

      return [
        // eslint-disable-next-line @khulnasoft/tailwind-no-interpolation -- Not a CSS utility
        `gl-avatar-s${defaultSize || avatarSizeOptions[1]}`,
        ...Object.entries(nonDefaultSizes).map(
          // eslint-disable-next-line @khulnasoft/tailwind-no-interpolation -- Not a CSS utility
          ([breakpoint, size]) => `gl-${breakpoint}-avatar-s${size}`,
        ),
      ];
    },
    isCircle() {
      return this.shape === avatarShapeOptions.circle;
    },
    identiconBackgroundClass() {
      /*
       * Gets a number between 1-7 depending on the 'entityId'.
       * Gets the remainder after dividing the 'entityId' by the number of available backgrounds.
       */
      const type = (this.entityId % IDENTICON_BG_COUNT) + 1;
      // eslint-disable-next-line @khulnasoft/tailwind-no-interpolation -- Not a CSS utility
      return `gl-avatar-identicon-bg${type}`;
    },
    identiconText() {
      return getAvatarChar(this.entityName);
    },
    showImage() {
      // Don't show when image is not present
      if (!this.src) {
        return false;
      }
      // Don't show when fallbackOnError is true and there was failure to load image
      if (this.src && this.fallbackOnError && this.imageLoadError) {
        return false;
      }
      return true;
    },
  },
  watch: {
    src(newSrc, oldSrc) {
      if (newSrc !== oldSrc) this.imageLoadError = false;
    },
  },
  methods: {
    handleLoadError(event) {
      this.imageLoadError = true;
      this.$emit('load-error', event);
    },
  },
};
</script>
<template>
  <img
    v-if="showImage"
    :src="src"
    :alt="alt"
    :class="['gl-avatar', { 'gl-avatar-circle': isCircle }, sizeClasses]"
    @error="handleLoadError"
    v-on="$listeners"
  />
  <div
    v-else
    :class="[
      'gl-avatar gl-avatar-identicon',
      { 'gl-avatar-circle': isCircle },
      sizeClasses,
      identiconBackgroundClass,
    ]"
    aria-hidden="true"
    v-on="$listeners"
  >
    {{ identiconText }}
  </div>
</template>
