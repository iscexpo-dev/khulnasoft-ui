<script>
import GlBaseAnimatedIcon from './base_animated_icon.vue';

export default {
  name: 'GlAnimatedTodoIcon',
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
      class="gl-animated-todo-box"
      d="M14.25 6.75L14.25 13C14.25 13.6904 13.6904 14.25 13 14.25L3 14.25C2.30964 14.25 1.75 13.6904 1.75 13L1.75 3C1.75 2.30964 2.30964 1.75 3 1.75L13.25 1.75"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-linecap="round"
    />
    <path
      class="gl-animated-todo-plus-line"
      d="M10.75 3L15.25 3"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-linecap="round"
    />
    <path
      class="gl-animated-todo-plus-line"
      d="M13 5.25L13 0.75"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-linecap="round"
    />
    <path
      class="gl-animated-todo-check"
      d="M6.75 7.76299L9.15312 10.2469L15.25 4.15"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
</template>
