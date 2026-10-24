<script>
import { BTableLite } from '../../../vendor/bootstrap-vue/src/components/table/table-lite';

const { tableClass } = BTableLite.options.props;

export default {
  name: 'GlTableLite',
  components: {
    BTableLite,
  },
  inheritAttrs: false,
  props: {
    /**
     * Additional CSS classes to apply to the table element.
     */
    tableClass,
    /**
     * Array of items displayed in the table as rows.
     */
    items: {
      type: Array,
      required: false,
      default: () => [],
    },
    /**
     * Array of field definitions for table columns.
     */
    fields: {
      type: Array,
      required: false,
      default: null,
    },
    /**
     * When true, makes the table header sticky.
     */
    stickyHeader: {
      type: Boolean,
      default: false,
      required: false,
    },
  },
  computed: {
    stickyHeaderClass() {
      return this.stickyHeader ? 'gl-table--sticky-header' : null;
    },
    localTableClass() {
      return ['gl-table', this.tableClass, this.stickyHeaderClass];
    },
  },
};
</script>

<template>
  <b-table-lite
    :table-class="localTableClass"
    :fields="fields"
    :items="items"
    v-bind="$attrs"
    v-on="$listeners"
  >
    <template v-for="slot in Object.keys($scopedSlots)" #[slot]="scope">
      <!-- @slot See https://bootstrap-vue.org/docs/components/table#comp-ref-b-table-lite-slots for available slots. -->
      <slot :name="slot" v-bind="scope"></slot>
    </template>
  </b-table-lite>
</template>
