<script>
import GlBaseAnimatedIcon from './base_animated_icon.vue';

export default {
  name: 'GlAnimatedLoaderIcon',
  extends: GlBaseAnimatedIcon,
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
  >
    <circle
      class="gl-animated-loader-shape gl-animated-loader-shape-1"
      cx="8"
      cy="8"
      r="2"
      fill="currentColor"
      stroke-width="0"
    />
    <circle
      class="gl-animated-loader-shape gl-animated-loader-shape-2"
      cx="14"
      cy="8"
      r="2"
      fill="currentColor"
      stroke-width="0"
    />
    <circle
      class="gl-animated-loader-shape gl-animated-loader-shape-3"
      cx="2"
      cy="8"
      r="2"
      fill="currentColor"
      stroke-width="0"
    />
  </svg>
</template>
