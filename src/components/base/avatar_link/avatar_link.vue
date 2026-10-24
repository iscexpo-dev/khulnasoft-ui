<script>
import GlLink from '../link/link.vue';

export default {
  name: 'GlAvatarLink',
  components: {
    GlLink,
  },
};
</script>
<template>
  <gl-link class="gl-avatar-link" v-bind="$attrs" variant="meta" v-on="$listeners">
    <slot></slot>
  </gl-link>
</template>
