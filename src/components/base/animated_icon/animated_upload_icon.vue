<script>
import GlBaseAnimatedIcon from './base_animated_icon.vue';

export default {
  name: 'GlAnimatedUploadIcon',
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
      class="gl-animated-upload-base"
      d="M14.25 9.75V13C14.25 13.6904 13.6904 14.25 13 14.25L3 14.25C2.30964 14.25 1.75 13.6904 1.75 13L1.75 9.75"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-linecap="round"
    />
    <path
      class="gl-animated-upload-line"
      d="M8 11.25V2.5"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-linecap="round"
    />
    <path
      class="gl-animated-upload-arrow"
      d="M11.25 5.31066L8 2.06066L4.75 5.31066"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-linecap="round"
    />
  </svg>
</template>
