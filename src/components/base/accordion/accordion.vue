<script>
export default {
  name: 'GlAccordion',
  provide() {
    return {
      defaultHeaderLevel: this.headerLevel,
      autoCollapse: this.autoCollapse,
    };
  },
  props: {
    /**
     * When true, will have the effect of closing other accordion items when one accordion item is visible.
     */
    autoCollapse: {
      type: Boolean,
      required: false,
      default: false,
    },
    /**
     * The header tag used in the accordion (h1/h2/h3/h4/h5/h6). This overrides the value provided by GlAccordion. For accessibility this should be set to an appropriate value in the context where the accordion is used.
     */
    headerLevel: {
      type: Number,
      required: true,
      validator(value) {
        return value > 0 && value <= 6;
      },
    },
  },
};
</script>

<template>
  <div>
    <!-- @slot `GLAccordionItem`s list -->
    <slot></slot>
  </div>
</template>
