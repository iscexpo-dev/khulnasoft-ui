<script>
import { merge, isNil } from 'lodash-es';
import { graphic } from 'echarts';
import { GlResizeObserverDirective } from '../../../directives/resize_observer/resize_observer';
import {
  defaultChartOptions,
  mergeSeriesToOptions,
  symbolSize,
} from '../../../utils/charts/config';
import { HEIGHT_AUTO_HORIZONTAL_LAYOUT_CLASSES } from '../../../utils/charts/constants';
import Chart from '../chart/chart.vue';
import ChartTooltip from '../shared/tooltip/tooltip.vue';

// the padding is needed so the mark points don't overflow when visible
const gridPadding = symbolSize / 2;

const generateGradient = (colors) => {
  return new graphic.LinearGradient(
    0,
    0,
    0,
    1,
    colors.map((color, index) => {
      const offset = index / (colors.length - 1);
      return { offset, color };
    }),
  );
};

export default {
  name: 'GlSparklineChart',
  components: { Chart, ChartTooltip },
  directives: {
    resizeObserver: GlResizeObserverDirective,
  },
  props: {
    /**
     * The data that is used to plot the chart.
     */
    data: {
      type: Array,
      required: true,
    },
    /**
     * Controls the label that is shown within the chart's tooltip. Use it to describe your data.
     */
    tooltipLabel: {
      type: String,
      required: false,
      default: '',
    },
    /**
     * Sets the chart's height in pixels. Set to `"auto"` to use the height of the container.
     */
    height: {
      type: [Number, String],
      required: false,
      default: 50,
    },
    /**
     * If enabled will show the value of the latest "y" data-point on the side right of the chart.
     */
    showLastYValue: {
      type: Boolean,
      required: false,
      default: true,
    },
    /**
     * Sets a colour gradient for the sparkline
     */
    gradient: {
      type: Array,
      required: false,
      default: () => [],
    },
    /**
     * The smoothness of the line, valued from 0 to 1. A smaller value makes it less smooth.
     */
    smooth: {
      type: Number,
      required: false,
      default: 0,
      validator: (x) => x >= 0 && x <= 1,
    },
    /**
     * Whether to connect the line across null points.
     */
    connectNulls: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  data() {
    return {
      chartInstance: null,
      tooltip: {
        show: false,
        title: '',
        content: '',
        position: {
          left: '0',
          top: '0',
        },
      },
    };
  },
  computed: {
    options() {
      const sparkLineChartOptions = {
        grid: {
          top: gridPadding,
          bottom: gridPadding,
          left: gridPadding,
          right: gridPadding,
        },
        xAxis: {
          type: 'category',
          show: false,
          axisLabel: {
            show: true,
          },
          axisPointer: {
            show: true,
            type: 'none',
            label: {
              formatter: this.generateTooltip,
            },
          },
        },
        yAxis: {
          type: 'value',
          show: false,
          min: 'datamin',
        },
      };
      const mergedOptions = merge({}, defaultChartOptions, sparkLineChartOptions);
      return mergeSeriesToOptions(mergedOptions, this.series);
    },
    willShowLastYValue() {
      return this.showLastYValue && this.data.length;
    },
    series() {
      const { data, smooth, itemStyle, willShowLastYValue, connectNulls } = this;
      const markPoint = willShowLastYValue
        ? {
            symbol: 'circle',
            cursor: 'auto',
            animation: false,
            symbolSize,
            data: [
              {
                xAxis: data.length - 1,
                yAxis: data[data.length - 1][1],
              },
            ],
          }
        : undefined;
      return {
        type: 'line',
        symbol: 'circle',
        animation: true,
        cursor: 'auto',
        symbolSize,
        markPoint,
        data,
        smooth,
        itemStyle,
        lineStyle: { cap: 'round' },
        connectNulls,
      };
    },
    itemStyle() {
      if (this.applyGradient) {
        return { color: generateGradient(this.gradient) };
      }
      if (this.gradient.length) {
        // If the gradient cannot be used, then apply
        // the first colour to the entire line.
        return { color: this.gradient[0] };
      }
      return {};
    },
    applyGradient() {
      if (this.gradient.length && this.data.length) {
        // Applying a gradient a constant line will cause it to not render,
        // so skip the gradient if all values are equal.
        const [, firstValue] = this.data[0];
        return this.data.some(([, value]) => firstValue !== value);
      }

      return false;
    },
    lastYValue() {
      if (!this.willShowLastYValue) return undefined;

      const latestEntry = this.data.slice(-1)[0];

      return latestEntry[1];
    },
    autoHeight() {
      return this.height === 'auto';
    },
  },
  methods: {
    onChartCreated(chartInstance) {
      this.chartInstance = chartInstance;
      this.tooltip.show = false;

      /**
       * Emitted when the chart is created.
       * The payload contains the echarts instance.
       * @event chart-created
       * @type {object}
       */
      this.$emit('chart-created', chartInstance);
    },
    handleResize() {
      this.chartInstance.resize();
    },
    isNilOrBlank(text) {
      return isNil(text) || (typeof text === 'string' && text.trim() === '');
    },
    setTooltipPosition(data) {
      const [left, top] = this.chartInstance.convertToPixel('grid', data);
      this.tooltip.position = {
        left: `${left}px`,
        top: `${top}px`,
      };
    },
    // This function is called any time the axis pointer is changed (the black bubble showing which
    // point on the line is selected). Note that it will not trigger if the axis pointer is removed,
    // only when it changes from one point to another or is shown for the first time.
    generateTooltip({ seriesData = [] }) {
      this.tooltip.show = false;

      // seriesData is an array of nearby data point coordinates
      // seriesData[0] is the nearest point at which the tooltip is displayed
      // https://echarts.apache.org/en/option.html#xAxis.axisPointer.label.formatter
      const [firstEntry = {}] = seriesData;
      const { data } = firstEntry;
      if (!data) return;

      const [title, content] = data;
      if (this.isNilOrBlank(title) || this.isNilOrBlank(content)) return;

      this.tooltip.title = title;
      this.tooltip.content = content;
      this.setTooltipPosition(data);
      this.tooltip.show = null;
    },
  },
  HEIGHT_AUTO_HORIZONTAL_LAYOUT_CLASSES,
};
</script>

<template>
  <div
    v-resize-observer="handleResize"
    class="gl-flex gl-items-center"
    :class="{ 'gl-h-full': autoHeight }"
  >
    <slot name="default"></slot>
    <div
      data-testid="chart-container"
      class="gl-relative gl-grow"
      :class="{ [$options.HEIGHT_AUTO_HORIZONTAL_LAYOUT_CLASSES]: autoHeight }"
    >
      <chart
        v-bind="$attrs"
        :class="{ 'gl-grow': autoHeight }"
        :height="height"
        :options="options"
        @created="onChartCreated"
        v-on="$listeners"
      />
      <chart-tooltip
        v-if="chartInstance"
        :show="tooltip.show"
        :chart="chartInstance"
        :top="tooltip.position.top"
        :left="tooltip.position.left"
        placement="top"
      >
        <template #title>
          <div data-testid="tooltip-title" class="gl-whitespace-nowrap">
            {{ tooltip.title }}
          </div>
        </template>
        <template #default>
          <div class="gl-flex" data-testid="tooltip-content">
            <span v-if="tooltipLabel" class="gl-mr-auto gl-pr-6">{{ tooltipLabel }}</span>
            <strong>{{ tooltip.content }}</strong>
          </div>
        </template>
      </chart-tooltip>
    </div>
    <span
      v-if="showLastYValue"
      class="gl-ml-5 gl-inline-flex gl-justify-center"
      data-testid="last-y-value"
    >
      {{ lastYValue }}
    </span>
  </div>
</template>
