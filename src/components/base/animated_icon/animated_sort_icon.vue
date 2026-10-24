<script>
import GlBaseAnimatedIcon from './base_animated_icon.vue';

export default {
  name: 'GlAnimatedSortIcon',
  extends: GlBaseAnimatedIcon,
};
</script>
<template>
  <svg
    :class="[iconStateClass, iconVariantClass]"
    class="gl-animated-sort-icon"
    :aria-label="ariaLabel"
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      class="gl-animated-sort-arrow-left"
      d="M3 1.06065L0.75 3.31065"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-linecap="round"
    />
    <path
      class="gl-animated-sort-arrow-right"
      d="M5.25 3.31065L3 1.06065"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-linecap="round"
    />
    <path
      class="gl-animated-sort-long-line-on"
      d="M8.75 2.75L15.25 2.75"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-linecap="round"
    />
    <path
      class="gl-animated-sort-medium-line-on"
      d="M8.75 6L13.25 6"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-linecap="round"
    />
    <path
      class="gl-animated-sort-short-line-on"
      d="M8.75 9.25L10.25 9.25"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-linecap="round"
    />
    <path
      class="gl-animated-sort-long-line-off"
      d="M8.75 13.25L15.25 13.25"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-linecap="round"
    />
    <path
      class="gl-animated-sort-medium-line-off"
      d="M8.75 10L13.25 10"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-linecap="round"
    />
    <path
      class="gl-animated-sort-short-line-off"
      d="M8.75 6.75L10.25 6.75"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-linecap="round"
    />
    <path
      class="gl-animated-sort-line"
      d="M3 13.2506L3 4.0006"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-linecap="round"
    />
  </svg>
</template>
