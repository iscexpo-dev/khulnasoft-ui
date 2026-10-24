<script>
export default {
  name: 'GlMarkdown',
  props: {
    /**
     * When true, renders the markdown in a compact style.
     */
    compact: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
};
</script>
<template>
  <div :class="['gl-markdown', { 'gl-compact-markdown': compact }]">
    <slot></slot>
  </div>
</template>
