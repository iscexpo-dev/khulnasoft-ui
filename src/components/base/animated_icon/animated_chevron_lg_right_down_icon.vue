<script>
import GlBaseAnimatedIcon from './base_animated_icon.vue';

export default {
  name: 'GlAnimatedChevronLgRightDownIcon',
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
    <path
      class="gl-animated-chevron-lg-right-down-arrow"
      d="M5.75 13.2537L11.0018 8.00183L5.75 2.75"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
</template>
