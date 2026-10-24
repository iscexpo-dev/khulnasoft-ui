<script>
import { BDropdownDivider } from '../../../vendor/bootstrap-vue/src/components/dropdown/dropdown-divider';

export default {
  name: 'GlDropdownDivider',
  components: {
    BDropdownDivider,
  },
  inheritAttrs: false,
};
</script>

<template>
  <b-dropdown-divider class="gl-dropdown-divider" v-bind="$attrs" v-on="$listeners" />
</template>
