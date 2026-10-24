<script>
import { BDropdownHeader } from '../../../vendor/bootstrap-vue/src/components/dropdown/dropdown-header';

export default {
  name: 'GlDropdownHeader',
  components: {
    BDropdownHeader,
  },
  inheritAttrs: false,
};
</script>

<template>
  <b-dropdown-header class="gl-dropdown-section-header" v-bind="$attrs" v-on="$listeners">
    <slot></slot>
  </b-dropdown-header>
</template>
