<script>
import { merge } from 'lodash-es';
import {
  defaultChartOptions,
  dataZoomAdjustments,
  mergeSeriesToOptions,
} from '../../../utils/charts/config';
import { colorFromDefaultPalette } from '../../../utils/charts/theme';
import { HEIGHT_AUTO_CLASSES } from '../../../utils/charts/constants';
import TooltipDefaultFormat from '../shared/tooltip/tooltip_default_format/tooltip_default_format.vue';
import Chart from '../chart/chart.vue';
import ChartTooltip from '../shared/tooltip/tooltip.vue';

export default {
  name: 'GlDiscreteScatterChart',
  components: {
    Chart,
    ChartTooltip,
    TooltipDefaultFormat,
  },
  inheritAttrs: false,
  props: {
    /**
     * The chart data series to render.
     */
    data: {
      type: Array,
      required: true,
    },
    /**
     * Additional ECharts option overrides.
     */
    option: {
      type: Object,
      required: false,
      default: () => ({}),
    },
    /**
     * Title text for the Y axis.
     */
    yAxisTitle: {
      type: String,
      required: true,
    },
    /**
     * Title text for the X axis.
     */
    xAxisTitle: {
      type: String,
      required: true,
    },
    /**
     * Size of the scatter symbols.
     */
    symbolSize: {
      type: Number,
      required: false,
      default: 8,
    },
    /**
     * Custom function to format tooltip text.
     */
    formatTooltipText: {
      type: Function,
      required: false,
      default: null,
    },
    /**
     * When true, disables the tooltip.
     */
    disableTooltip: {
      type: Boolean,
      required: false,
      default: false,
    },
    /**
     * Sets the chart's height in pixels. Set to `"auto"` to use the height of the container.
     */
    height: {
      type: [Number, String],
      required: false,
      default: null,
    },
  },
  data() {
    return {
      chart: null,
      tooltipTitle: '',
      tooltipContent: {},
      tooltipPosition: {
        left: '0',
        top: '0',
      },
      selectedFormatTooltipText: this.formatTooltipText || this.defaultFormatTooltipText,
    };
  },
  computed: {
    series() {
      return this.data.map((series, index) => {
        const defaultColor = colorFromDefaultPalette(index);
        const getColor = (type) =>
          series[type] && series[type].color ? series[type].color : defaultColor;

        return merge(
          {
            symbolSize: this.symbolSize,
            lineStyle: {
              color: getColor('lineStyle'),
            },
            itemStyle: {
              color: getColor('itemStyle'),
            },
          },
          series,
        );
      });
    },
    options() {
      const mergedOptions = merge(
        {},
        defaultChartOptions,
        {
          tooltip: this.disableTooltip
            ? undefined
            : {
                formatter: this.onLabelChange,
              },
          xAxis: {
            type: 'category',
            name: this.xAxisTitle,
            axisTick: {
              alignWithLabel: true,
              show: true,
              lineStyle: {
                color: 'var(--gl-chart-axis-line-color)',
              },
            },
            axisLabel: {
              margin: 20,
              verticalAlign: 'bottom',
            },
          },
          yAxis: {
            type: 'value',
            name: this.yAxisTitle,
          },
        },
        this.option,
        dataZoomAdjustments(this.option.dataZoom),
      );
      // All chart options can be merged but series
      // needs to be handled specially
      return mergeSeriesToOptions(mergedOptions, this.series);
    },
    autoHeight() {
      return this.height === 'auto';
    },
  },
  methods: {
    defaultFormatTooltipText(params) {
      const data = this.getChartData(params);
      const [title, content] = data;
      this.tooltipTitle = title;
      const seriesName = this.yAxisTitle;
      const tooltipContent = {
        [seriesName]: {
          value: content,
          color: '',
        },
      };
      this.$set(this, 'tooltipContent', tooltipContent);
    },
    onCreated(chart) {
      this.chart = chart;
      this.$emit('created', chart);
    },
    onLabelChange(params) {
      this.selectedFormatTooltipText(params);

      const data = this.getChartData(params);

      if (data.length) {
        const [left, top] = this.chart.convertToPixel('grid', data);

        this.tooltipPosition = {
          left: `${left}px`,
          top: `${top}px`,
        };
      }
    },
    getChartData({ data }) {
      const chartData = data?.value || data;
      return Array.isArray(chartData) ? chartData : [];
    },
  },
  HEIGHT_AUTO_CLASSES,
};
</script>
<template>
  <div class="gl-relative" :class="{ [$options.HEIGHT_AUTO_CLASSES]: autoHeight }">
    <chart
      v-bind="$attrs"
      :class="{ 'gl-grow': autoHeight }"
      :height="height"
      :options="options"
      v-on="$listeners"
      @created="onCreated"
    />
    <chart-tooltip
      v-if="!disableTooltip && chart"
      :chart="chart"
      :top="tooltipPosition.top"
      :left="tooltipPosition.left"
    >
      <template #title>
        <slot name="tooltip-title">{{ tooltipTitle }} ({{ xAxisTitle }})</slot>
      </template>

      <slot name="tooltip-content">
        <tooltip-default-format :tooltip-content="tooltipContent" />
      </slot>
    </chart-tooltip>
  </div>
</template>
