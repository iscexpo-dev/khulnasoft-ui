<script>
import GlBaseAnimatedIcon from './base_animated_icon.vue';

export default {
  name: 'GlAnimatedSmileIcon',
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
    <g class="gl-animated-smile-eyes">
      <circle cy="7" cx="6" r="0.5" />
      <circle cy="7" cx="10" r="0.5" />
    </g>
    <path
      class="gl-animated-smile-big-smile"
      d="M8 12C9.65685 12 11 10.6569 11 9H5C5 10.6569 6.34315 12 8 12Z"
      fill="currentColor"
    />
    <path
      class="gl-animated-smile-slight-smile"
      d="M6.3 10C6.46667 10.3333 7 11 8 11C9 11 9.53333 10.3333 9.7 10"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-linecap="round"
    />
    <circle cx="8" cy="8" r="7.25" stroke="currentColor" stroke-width="1.5" />
  </svg>
</template>
