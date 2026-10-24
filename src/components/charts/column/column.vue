<script>
import { merge } from 'lodash-es';
import {
  defaultChartOptions,
  grid,
  gridWithSecondaryYAxis,
  yAxis,
  dataZoomAdjustments,
  mergeSeriesToOptions,
  generateBarSeries,
  generateLineSeries,
} from '../../../utils/charts/config';
import {
  CHART_TYPE_BAR,
  CHART_TYPE_LINE,
  HEIGHT_AUTO_CLASSES,
  CHART_DEFAULT_SERIES_STACK,
  CHART_DEFAULT_SERIES_SECONDARY_STACK,
} from '../../../utils/charts/constants';
import { colorFromDefaultPalette } from '../../../utils/charts/theme';
import Chart from '../chart/chart.vue';
import ChartLegend from '../legend/legend.vue';
import ChartTooltip from '../shared/tooltip/tooltip.vue';

const yAxisDefaults = {
  ...yAxis,
  nameLocation: 'center',
  axisTick: {
    show: false,
  },
};

export default {
  name: 'GlColumnChart',
  components: {
    Chart,
    ChartLegend,
    ChartTooltip,
  },
  inheritAttrs: false,
  props: {
    /**
     * Array of bar series data.
     */
    bars: {
      type: Array,
      required: false,
      default: () => [],
    },
    /**
     * Array of line series data.
     */
    lines: {
      type: Array,
      required: false,
      default: () => [],
    },
    /**
     * Secondary data series for the chart.
     */
    secondaryData: {
      type: Array,
      required: false,
      default: () => [],
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
     * Title text for the secondary data axis.
     */
    secondaryDataTitle: {
      type: String,
      required: false,
      default: '',
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
      required: true,
      validator: (value) => ['value', 'category', 'time', 'log'].indexOf(value) !== -1,
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
    };
  },
  computed: {
    hasSecondaryAxis() {
      return Boolean(this.secondaryData.length);
    },
    barSeries() {
      return this.bars.map(({ name, data, stack = CHART_DEFAULT_SERIES_STACK }, index) => {
        const color = colorFromDefaultPalette(index);
        return generateBarSeries({ name, data, stack, color });
      });
    },
    lineSeries() {
      const offset = this.bars.length;
      return this.lines.map(({ name, data }, index) => {
        const color = colorFromDefaultPalette(offset + index);
        return generateLineSeries({ name, data, color });
      });
    },
    secondarySeries() {
      const offset = this.bars.length + this.lines.length;
      return this.secondaryData.map(
        ({ name, data, type, stack = CHART_DEFAULT_SERIES_SECONDARY_STACK }, index) => {
          const color = colorFromDefaultPalette(offset + index);
          return type === CHART_TYPE_LINE
            ? generateLineSeries({ color, name, data, yAxisIndex: 1 })
            : generateBarSeries({ color, name, data, yAxisIndex: 1, stack });
        },
      );
    },
    series() {
      return [...this.barSeries, ...this.lineSeries, ...this.secondarySeries];
    },
    /**
     * A legend is required by design whenever a chart shows more than one
     * series, regardless of whether those series share a y-axis or use the
     * secondary axis. Axes are deliberately not colour-matched to their
     * series: the data palette doesn't meet text contrast, and colour alone
     * can't carry the axis-to-series mapping (WCAG 1.4.1). Axes keep the
     * theme's axis text colour. See https://github.com/khulnasoft/khulnasoft-ui/-/work_items/3467
     */
    hasMultipleSeries() {
      return this.series.length > 1;
    },
    /**
     * Mirrors how bar/line/secondary series colors are derived above, so the
     * legend swatches always match the rendered series exactly.
     */
    seriesInfo() {
      const offsetLines = this.bars.length;
      const offsetSecondary = this.bars.length + this.lines.length;

      const barsInfo = this.bars.map(({ name }, index) => ({
        name,
        type: CHART_TYPE_BAR,
        color: colorFromDefaultPalette(index),
        yAxisIndex: 0,
      }));
      const linesInfo = this.lines.map(({ name }, index) => ({
        name,
        type: CHART_TYPE_LINE,
        color: colorFromDefaultPalette(offsetLines + index),
        yAxisIndex: 0,
      }));
      const secondaryInfo = this.secondaryData.map(({ name, type }, index) => ({
        name,
        type: type === CHART_TYPE_LINE ? CHART_TYPE_LINE : CHART_TYPE_BAR,
        color: colorFromDefaultPalette(offsetSecondary + index),
        yAxisIndex: 1,
      }));

      return [...barsInfo, ...linesInfo, ...secondaryInfo];
    },
    legendStyle() {
      return { paddingLeft: `${grid.left}px` };
    },
    options() {
      const yAxisPrimary = {
        ...yAxisDefaults,
        name: this.yAxisTitle,
      };

      const mergedOptions = merge(
        {},
        defaultChartOptions,
        {
          grid: this.hasSecondaryAxis ? gridWithSecondaryYAxis : grid,
          xAxis: {
            boundaryGap: true,
            axisLabel: {
              margin: 20,
              verticalAlign: 'bottom',
            },
            axisLine: {
              show: false,
            },
            axisPointer: {
              type: 'none',
            },
            name: this.xAxisTitle,
            type: this.xAxisType,
          },
          yAxis: this.hasSecondaryAxis
            ? [
                yAxisPrimary,
                {
                  ...yAxisDefaults,
                  name: this.secondaryDataTitle,
                  show: this.hasSecondaryAxis,
                },
              ]
            : yAxisPrimary,
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
      ref="dataTooltip"
      :chart="chart"
      :use-default-tooltip-formatter="true"
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
    <chart-legend
      v-if="chart && hasMultipleSeries"
      :chart="chart"
      :series-info="seriesInfo"
      :style="legendStyle"
    />
  </div>
</template>
