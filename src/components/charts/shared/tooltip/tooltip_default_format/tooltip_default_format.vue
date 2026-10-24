<script>
import SeriesLabel from '../../../series_label/series_label.vue';

export default {
  name: 'TooltipDefaultFormat',
  components: {
    SeriesLabel,
  },
  props: {
    /**
     * The tooltip content object to format.
     */
    tooltipContent: {
      type: Object,
      required: true,
    },
  },
};
</script>
<template>
  <div>
    <div
      v-for="(value, label) in tooltipContent"
      :key="`${label}${value.value}`"
      class="gl-charts-tooltip-default-format-series"
    >
      <series-label :color="value.color" class="gl-charts-tooltip-default-format-series-label">
        {{ label }}
      </series-label>
      <div class="gl-charts-tooltip-default-format-series-value">
        <slot name="tooltip-value" :value="value.value">{{ value.value }}</slot>
      </div>
    </div>
  </div>
</template>
