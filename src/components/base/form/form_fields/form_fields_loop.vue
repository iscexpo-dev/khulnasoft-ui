<script>
import Vue from 'vue';

export default {
  name: 'GlFormFieldsLoop',
  props: {
    /**
     * Field configurations to render in a loop.
     */
    fields: {
      type: Object,
      required: true,
    },
  },
  render(createElement) {
    const { Fragment } = Vue;

    // Vue 3, key goes on `Fragment` (<template> element)
    if (Fragment) {
      return createElement(
        'div',
        Object.entries(this.fields).map(([fieldName, field]) =>
          createElement(
            Fragment,
            { key: field.id },
            this.$scopedSlots.default({
              fieldName,
              field,
            }),
          ),
        ),
      );
    }

    // Vue 2, key goes on element (rendered via default slot)
    return createElement(
      'div',
      Object.entries(this.fields).map(([fieldName, field]) =>
        this.$scopedSlots.default({
          fieldName,
          field,
        }),
      ),
    );
  },
};
</script>
