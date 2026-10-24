<script>
import { merge, truncate } from 'lodash-es';
import { grid, dataZoomAdjustments, mergeSeriesToOptions } from '../../../utils/charts/config';
import { CHART_DEFAULT_SERIES_STACK, HEIGHT_AUTO_CLASSES } from '../../../utils/charts/constants';
import { colorFromDefaultPalette } from '../../../utils/charts/theme';
import { engineeringNotation } from '../../../utils/number_utils';
import { hexToRgba } from '../../../utils/utils';
import Chart from '../chart/chart.vue';
import ChartTooltip from '../shared/tooltip/tooltip.vue';
import { stackedPresentationOptions } from '../../../utils/constants';

/**
 * `nameGap` in charts/config is set to 50 but it is not
 * used for bar charts as the axes are flipped. That is why
 * we're explicitly setting it here
 */
const DEFAULT_NAME_GAP = 50;

/**
 * This is the magic number at which the y-axis name
 * and y-axis labels don't overlap
 * @Number
 */
const AXIS_LABEL_LENGTH = 7;

/**
 * Because the axes are reversed in bar charts defaultChartOptions
 * xAxis and yAxis needs to be handled specifically.
 */
const defaultOptions = {
  grid,
  xAxis: {
    nameLocation: 'center',
    axisLabel: {
      formatter: (num) => engineeringNotation(num, 2),
    },
  },
  yAxis: {
    nameGap: DEFAULT_NAME_GAP,
    boundaryGap: true,
    nameLocation: 'center',
    splitLine: {
      show: false,
    },
    axisLabel: {
      interval: 0,
      formatter: (str) =>
        truncate(str, {
          length: AXIS_LABEL_LENGTH,
          separator: '...',
        }),
    },
  },
  legend: {
    show: false,
  },
};

export default {
  name: 'GlBarChart',
  components: {
    Chart,
    ChartTooltip,
  },
  inheritAttrs: false,
  props: {
    /**
     * The chart data series to render.
     */
    data: {
      type: Object,
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
     * Type of the X axis (e.g., 'category', 'value').
     */
    xAxisType: {
      type: String,
      required: false,
      default: 'value',
    },
    /**
     * Sets the chart's height in pixels. Set to `"auto"` to use the height of the container.
     */
    height: {
      type: [Number, String],
      required: false,
      default: null,
    },
    /**
     * Controls how multiple series data are displayed in the chart –
     * `stacked` stacks series horizontally, and
     * `tiled` displays series as grouped bars.
     */
    presentation: {
      type: String,
      required: false,
      default: stackedPresentationOptions.stacked,
      validator: (value) => Object.values(stackedPresentationOptions).includes(value),
    },
  },
  data() {
    return {
      chart: null,
    };
  },
  computed: {
    series() {
      return Object.keys(this.data).map((key, index) => {
        const barColor = colorFromDefaultPalette(index);

        return {
          name: key,
          data: this.data[key],
          type: 'bar',
          stack:
            this.presentation === stackedPresentationOptions.tiled
              ? null
              : CHART_DEFAULT_SERIES_STACK,
          itemStyle: {
            color: hexToRgba(barColor, 0.2),
            borderColor: barColor,
            borderWidth: 1,
          },
          emphasis: {
            itemStyle: {
              color: hexToRgba(barColor, 0.4),
            },
          },
          barMaxWidth: '50%',
        };
      });
    },
    options() {
      const mergedOptions = merge(
        {},
        defaultOptions,
        {
          xAxis: {
            axisLine: {
              show: false,
            },
            name: this.xAxisTitle,
            type: this.xAxisType,
          },
          yAxis: {
            name: this.yAxisTitle,
            type: 'category',
            axisTick: {
              show: true,
            },
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
    onCreated(chart) {
      this.chart = chart;
      this.$emit('created', chart);
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
      v-if="chart"
      :chart="chart"
      :use-default-tooltip-formatter="true"
      dimension-axis="yAxis"
    >
      <template v-if="$scopedSlots['tooltip-title']" #title="scope">
        <slot name="tooltip-title" v-bind="scope"></slot>
      </template>
      <template v-if="$scopedSlots['tooltip-content']" #default="scope">
        <slot name="tooltip-content" v-bind="scope"></slot>
      </template>
      <template v-if="$scopedSlots['tooltip-value']" #tooltip-value="scope">
        <slot name="tooltip-value" v-bind="scope"></slot>
      </template>
    </chart-tooltip>
  </div>
</template>
