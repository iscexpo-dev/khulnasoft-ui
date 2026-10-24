<script>
import { animatedIconVariantOptions } from '../../../utils/constants';

export default {
  name: 'GlBaseAnimatedIcon',
  props: {
    /**
     * Accessible icon name used by screen readers and other assistive technologies.
     * Provide when icon is not merely decorative
     */
    ariaLabel: {
      type: String,
      required: false,
      default: undefined,
    },
    /**
     * Icon variant
     */
    variant: {
      type: String,
      required: false,
      default: 'current',
      validator: (value) => Object.keys(animatedIconVariantOptions).includes(value),
    },
    /**
     * Controls the animated state of the icon.
     */
    isOn: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  computed: {
    iconStateClass() {
      return this.isOn
        ? 'gl-animated-icon gl-animated-icon-on'
        : 'gl-animated-icon gl-animated-icon-off';
    },
    iconVariantClass() {
      return this.variant ? animatedIconVariantOptions[this.variant] : '';
    },
  },
};
</script>
<template>
  <svg
    :class="[iconStateClass, iconVariantClass]"
    :aria-label="ariaLabel"
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  />
</template>
