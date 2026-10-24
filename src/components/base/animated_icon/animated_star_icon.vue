<script>
import GlBaseAnimatedIcon from './base_animated_icon.vue';

export default {
  name: 'GlAnimatedStarIcon',
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
      class="gl-animated-star-shape"
      d="M6.56177 5.79259L8 2.33467L9.43822 5.79259C9.58223 6.13883 9.90785 6.37539 10.2816 6.40536L14.0147 6.70464L11.1705 9.14103C10.8857 9.38498 10.7613 9.76775 10.8484 10.1325L11.7173 13.7754L8.52125 11.8232C8.20124 11.6278 7.79876 11.6278 7.47875 11.8232L4.28269 13.7754L5.15165 10.1325C5.23865 9.76776 5.11428 9.38498 4.82949 9.14103L1.98526 6.70464L5.71837 6.40536C6.09216 6.37539 6.41777 6.13882 6.56177 5.79259Z"
      fill="transparent"
      stroke="currentColor"
      stroke-width="1.5"
    />
  </svg>
</template>
