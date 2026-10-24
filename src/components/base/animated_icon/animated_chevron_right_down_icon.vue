<script>
import GlBaseAnimatedIcon from './base_animated_icon.vue';

export default {
  name: 'GlAnimatedChevronRightDownIcon',
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
      class="gl-animated-chevron-right-down-arrow"
      d="M6.75 4.75L10 8L6.75 11.25"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
</template>
