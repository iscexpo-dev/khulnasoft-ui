<script>
export default {
  name: 'GlCard',
  props: {
    /**
     * Additional CSS class(es) to be applied to the header.
     */
    headerClass: {
      type: [String, Object, Array],
      required: false,
      default: '',
    },
    /**
     * Additional CSS class(es) to be applied to the body.
     */
    bodyClass: {
      type: [String, Object, Array],
      required: false,
      default: '',
    },
    /**
     * Additional CSS class(es) to be applied to the footer.
     */
    footerClass: {
      type: [String, Object, Array],
      required: false,
      default: '',
    },
  },
};
</script>

<template>
  <div class="gl-card">
    <div v-if="$scopedSlots.header" class="gl-card-header" :class="headerClass">
      <!-- @slot The card's header content. -->
      <slot name="header"></slot>
    </div>
    <div class="gl-card-body" :class="bodyClass">
      <!-- @slot The card's main content. -->
      <slot></slot>
    </div>
    <div v-if="$scopedSlots.footer" class="gl-card-footer" :class="footerClass">
      <!-- @slot The card's footer content. -->
      <slot name="footer"></slot>
    </div>
  </div>
</template>
