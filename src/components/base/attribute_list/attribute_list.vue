<script>
import GlIcon from '../icon/icon.vue';

export default {
  name: 'GlAttributeList',
  components: {
    GlIcon,
  },
  props: {
    /**
     * Array of items to display. Each item should have `label`, `text`, and optionally `icon` properties.
     */
    items: {
      type: Array,
      required: false,
      default: () => [],
      validator: (items) => {
        return items.every(
          (item) => item && typeof item.label === 'string' && typeof item.text === 'string',
        );
      },
    },
    /**
     * CSS classes on attribute list item label contents
     */
    labelClass: {
      type: String,
      required: false,
      default: '',
    },
    /**
     * CSS classes on attribute list item description contents
     */
    descriptionClass: {
      type: String,
      required: false,
      default: '',
    },
    /**
     * Layout of label and text: 'horizontal' for line or 'vertical' for stacked
     */
    layout: {
      type: String,
      default: 'horizontal',
      required: false,
      validator: (value) => ['horizontal', 'vertical'].includes(value),
    },
  },
  computed: {
    layoutClass() {
      return {
        'gl-attribute-list-horizontal-items': this.layout === 'horizontal',
        'gl-attribute-list-vertical-items': this.layout === 'vertical',
      };
    },
    rowCount() {
      // Calculate rows needed when there is enough space for 2 column layout
      const rows = Math.ceil(this.items.length / 2);
      return {
        '--attribute-list-row-count': rows,
      };
    },
  },
};
</script>

<template>
  <dl
    class="gl-attribute-list"
    :class="layoutClass"
    :style="rowCount"
    data-testid="gl-attribute-list"
  >
    <div
      v-for="(item, index) in items"
      :key="index"
      class="gl-attribute-list-item"
      data-testid="gl-attribute-list-item"
    >
      <dt
        class="gl-attribute-list-item-label"
        :class="labelClass"
        data-testid="gl-attribute-list-item-label"
      >
        <slot name="label" :item="item" :index="index">
          <gl-icon
            v-if="item.icon"
            class="gl-attribute-list-item-label-icon"
            :name="item.icon"
            variant="strong"
          />
          <span>{{ item.label }}</span>
        </slot>
      </dt>
      <dd
        class="gl-attribute-list-item-description"
        :class="descriptionClass"
        data-testid="gl-attribute-list-item-description"
      >
        <slot name="description" :item="item" :index="index">
          {{ item.text }}
        </slot>
      </dd>
    </div>
  </dl>
</template>
