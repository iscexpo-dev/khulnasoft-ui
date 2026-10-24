<script>
import GlBaseAnimatedIcon from './base_animated_icon.vue';

export default {
  name: 'GlAnimatedSidebarIcon',
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
    <rect
      x="1.75"
      y="1.75"
      width="12.5"
      height="12.5"
      rx="1.25"
      stroke="currentColor"
      stroke-width="1.5"
    />
    <path
      class="gl-animated-sidebar-line"
      d="M5.25 2V14"
      stroke="currentColor"
      stroke-width="1.5"
    />
  </svg>
</template>
