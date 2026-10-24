<script>
import { merge } from 'lodash-es';
import { getTooltipTitle, getTooltipContent } from '../../../utils/charts/config';
import { HEIGHT_AUTO_CLASSES } from '../../../utils/charts/constants';
import {
  heatmapHues,
  heatmapHuesDark,
  heatmapSurface,
  heatmapSurfaceDark,
} from '../../../utils/charts/theme';
import { isDarkMode, onColorModeChange } from '../../../utils/charts/color_mode';
import { engineeringNotation } from '../../../utils/number_utils';
import TooltipDefaultFormat from '../shared/tooltip/tooltip_default_format/tooltip_default_format.vue';
import Chart from '../chart/chart.vue';
import ChartLegend from '../legend/legend.vue';
import ChartTooltip from '../shared/tooltip/tooltip.vue';

const defaultOptions = {
  visualMap: {
    show: false,
  },
  series: {
    type: 'heatmap',
  },
};

/*
 * The series is an array of arrays containing [x, y, value]
 * x and y are position, value determines the color
 * We want the min and max from value field to make the range of colors
 */
function getRange(series) {
  return series.reduce(
    (acc, curr) => {
      const value = curr[2] || 0;
      if (value < acc.min) acc.min = value;
      if (value > acc.max) acc.max = value;
      return acc;
    },
    { min: 0, max: 0 },
  );
}

export default {
  name: 'GlHeatmap',
  components: {
    Chart,
    ChartLegend,
    ChartTooltip,
    TooltipDefaultFormat,
  },
  props: {
    /**
     * Additional ECharts option overrides.
     */
    option: {
      type: Object,
      required: false,
      default: () => ({}),
    },
    /**
     * The heatmap data series to render.
     */
    dataSeries: {
      type: Array,
      required: true,
    },
    /**
     * Labels for the X axis categories.
     */
    xAxisLabels: {
      type: Array,
      required: false,
      default: () => [],
    },
    /**
     * Labels for the Y axis categories.
     */
    yAxisLabels: {
      type: Array,
      required: false,
      default: () => [],
    },
    /**
     * Name/label for the X axis.
     */
    xAxisName: {
      type: String,
      required: false,
      default: '',
    },
    /**
     * Name/label for the Y axis.
     */
    yAxisName: {
      type: String,
      required: false,
      default: '',
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
     * Custom text for the average value in the legend.
     */
    legendAverageText: {
      type: String,
      required: false,
      default: 'Avg',
    },
    /**
     * Custom text for the maximum value in the legend.
     */
    legendMaxText: {
      type: String,
      required: false,
      default: 'Max',
    },
    /**
     * When true, the chart automatically resizes to fit its container.
     */
    responsive: {
      type: Boolean,
      required: false,
      default: true,
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
     * When true, enables the tooltip on hover.
     */
    showTooltip: {
      type: Boolean,
      default: true,
      required: false,
    },
  },
  data() {
    return {
      chart: null,
      tooltip: {
        title: '',
        content: {},
        left: '0',
        top: '0',
      },
      selectedFormatTooltipText: this.formatTooltipText || this.defaultFormatTooltipText,
      // ECharts interpolates the visualMap stops numerically, so these colours cannot be CSS
      // custom properties and have to be picked for the current colour mode instead. Resolved on
      // mount, because the mode depends on where this chart sits in the document.
      isDark: false,
    };
  },
  computed: {
    hues() {
      return this.isDark ? heatmapHuesDark : heatmapHues;
    },
    surface() {
      return this.isDark ? heatmapSurfaceDark : heatmapSurface;
    },
    computedOptions() {
      const { min, max } = getRange(this.dataSeries);
      return merge(
        {},
        defaultOptions,
        {
          series: {
            data: this.dataSeries,
            z: 2,
          },
          grid: {
            left: '64px',
            right: '32px',
            show: true,
            borderWidth: 0,
            backgroundColor: this.surface.plate,
          },
          visualMap: {
            min,
            max,
            inRange: {
              color: this.hues,
            },
          },
          xAxis: {
            data: this.xAxisLabels,
            z: 3,
            axisTick: false,
            axisLabel: {
              margin: 2,
            },
            name: this.xAxisName,
            nameGap: 16,
            nameLocation: 'middle',
            nameTextStyle: {
              verticalAlign: 'middle',
            },
            offset: 0,
            splitLine: {
              show: true,
              interval: 0,
              lineStyle: {
                color: this.surface.separator,
                width: 2,
              },
            },
            axisPointer: {
              show: true,
              label: {
                formatter: this.onLabelChange,
              },
            },
          },
          yAxis: {
            data: this.yAxisLabels,
            z: 3,
            type: 'category',
            axisTick: false,
            axisLabel: {
              margin: 8,
            },
            name: this.yAxisName,
            nameLocation: 'center',
            nameGap: 50,
            nameRotate: 90,
            splitLine: {
              show: true,
              interval: 0,
              lineStyle: {
                color: this.surface.separator,
                width: 2,
              },
            },
          },
        },
        this.option,
      );
    },
    legendStyle() {
      return { paddingLeft: this.computedOptions.grid.left, marginTop: '-32px' };
    },
    compiledOptions() {
      return this.chart ? this.chart.getOption() : null;
    },
    seriesInfo() {
      const { min, max } = getRange(this.dataSeries);
      const step = (max - min) / this.hues.length;

      return this.hues.map((color, index) => {
        const lowerBound = engineeringNotation(min + step * index);
        const upperBound = engineeringNotation(min + step * (index + 1));

        return {
          name: `${lowerBound} - ${upperBound}`,
          color,
          type: 'solid',
        };
      });
    },
    autoHeight() {
      return this.height === 'auto';
    },
  },
  mounted() {
    this.isDark = isDarkMode(this.$el);
    this.unsubscribeColorMode = onColorModeChange(this.$el, (isDark) => {
      this.isDark = isDark;
    });
  },
  beforeDestroy() {
    this.unsubscribeColorMode?.();
  },
  methods: {
    defaultFormatTooltipText(params) {
      this.tooltip.title = getTooltipTitle(params, this.computedOptions.xAxis.name);
      this.tooltip.content = getTooltipContent(params, this.computedOptions.yAxis.name);
    },
    onCreated(chart) {
      this.chart = chart;
      this.$emit('created', chart);
    },
    onLabelChange(params) {
      this.selectedFormatTooltipText(params);
      const { seriesData = [] } = params;
      if (seriesData.length && seriesData[0].value) {
        const { seriesId, value } = seriesData[0];
        const [left, top] = this.chart.convertToPixel({ seriesId }, value);

        this.tooltip = {
          ...this.tooltip,
          left: `${left}px`,
          top: `${top}px`,
        };
      }
    },
  },
  HEIGHT_AUTO_CLASSES,
};
</script>

<template>
  <div class="gl-heatmap" :class="{ [$options.HEIGHT_AUTO_CLASSES]: autoHeight }">
    <chart
      v-bind="$attrs"
      :class="{ 'gl-grow': autoHeight }"
      :height="height"
      :options="computedOptions"
      @created="onCreated"
      v-on="$listeners"
    />
    <chart-tooltip
      v-if="chart"
      :chart="chart"
      :top="tooltip.top"
      :left="tooltip.left"
      :show="showTooltip"
    >
      <template #title>
        <slot v-if="formatTooltipText" name="tooltip-title"></slot>
        <div v-else>{{ tooltip.title }}</div>
      </template>
      <slot v-if="formatTooltipText" name="tooltip-content"></slot>
      <tooltip-default-format v-else :tooltip-content="tooltip.content" />
    </chart-tooltip>
    <chart-legend
      v-if="compiledOptions"
      :chart="chart"
      :series-info="seriesInfo"
      :style="legendStyle"
      :text-style="compiledOptions.textStyle"
      :max-text="legendMaxText"
      :average-text="legendAverageText"
    />
  </div>
</template>
