<script>
import { markRaw } from 'vue';
import * as echarts from 'echarts';
import { merge } from 'lodash-es';
import {
  defaultHeight,
  defaultWidth,
  validRenderers,
  toolboxHeight,
} from '../../../utils/charts/config';
import { createTheme, themeName } from '../../../utils/charts/theme';
import { resolveCssValues } from '../../../utils/charts/css_values';
import { onColorModeChange } from '../../../utils/charts/color_mode';
import { GlResizeObserverDirective } from '../../../directives/resize_observer/resize_observer';
import { debounceByAnimationFrame } from '../../../utils/utils';

/**
 * Allowed values by eCharts
 * https://echarts.apache.org/en/api.html#echartsInstance.resize
 */
const sizeValidator = (size) => Number.isFinite(size) || size === 'auto' || size == null;

export default {
  name: 'GlChart',
  directives: {
    resizeObserver: GlResizeObserverDirective,
  },
  props: {
    /**
     * The ECharts configuration object.
     * https://echarts.apache.org/en/option.html#title
     */
    options: {
      type: Object,
      required: true,
    },
    /**
     * Width of the chart in pixels. Set to "auto" to use the width of the container.
     */
    width: {
      type: [Number, String],
      required: false,
      default: null,
      validator: sizeValidator,
    },
    /**
     * Height of the chart in pixels. Set to "auto" to use the height of the container.
     */
    height: {
      type: [Number, String],
      required: false,
      default: null,
      validator: sizeValidator,
    },
    /**
     * An ECharts group id. Used to connect multiple charts.
     * https://echarts.apache.org/en/api.html#echarts.connect
     */
    groupId: {
      type: String,
      required: false,
      default: '',
    },
    /**
     * How the chart should be rendered. Valid options are 'canvas' or 'svg'.
     * https://echarts.apache.org/handbook/en/best-practices/canvas-vs-svg/
     */
    renderer: {
      type: String,
      required: false,
      default: 'svg',
      validator(renderer) {
        return validRenderers.includes(renderer);
      },
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
     * A name for the chart that screen readers announce. It is added as a hidden title, which
     * ECharts reads into the description it generates. Ignored when `options` sets a title.
     */
    accessibleTitle: {
      type: String,
      required: false,
      default: '',
    },
  },
  data() {
    return {
      chart: null,
      debouncedHandleResize: debounceByAnimationFrame(this.handleResize),
    };
  },
  computed: {
    modifiedOptions() {
      let options = { ...this.options };

      // Enable aria by default
      if (options.aria?.enabled === undefined) {
        options = merge({}, options, { aria: { enabled: true } });
      }

      if (this.accessibleTitle && !options.title) {
        options = merge({}, options, { title: { text: this.accessibleTitle, show: false } });
      }

      // Add space at the top to fit the toolbox
      if (options.toolbox?.show === true) {
        const top = (options.grid?.top || 0) + toolboxHeight;
        options = merge({}, options, { grid: { top } });
      }

      return options;
    },
  },
  watch: {
    options() {
      if (this.chart) {
        this.draw();
      }
    },
    accessibleTitle() {
      if (this.chart) {
        this.draw();
      }
    },
    width() {
      this.setChartSize();
    },
    height() {
      this.setChartSize();
    },
  },
  created() {
    echarts.registerTheme(themeName, createTheme(this.options));
  },
  async mounted() {
    await this.$nextTick();

    this.initChart();
    this.observeColorMode();
  },
  beforeDestroy() {
    if (!this.chart) return;

    this.chart.off('click', this.handleClick);
    this.unsubscribeColorMode?.();
  },
  methods: {
    initChart() {
      // Consumers store the emitted instance in data() and GlChartLegend compares it with
      // echarts.getInstanceByDom(), so Vue 3 must not proxy it.
      this.chart = markRaw(
        echarts.init(this.$refs.chart, this.theme(), {
          renderer: this.renderer,
          width: defaultWidth,
          height: defaultHeight,
        }),
      );

      if (this.groupId.length) {
        this.chart.group = this.groupId;
        echarts.connect(this.groupId);
      }

      this.chart.on('click', this.handleClick);
      /**
       * Emitted after calling `echarts.init`
       */
      this.$emit('created', this.chart);
      this.draw();
      this.setChartSize();
    },
    /**
     * The SVG renderer consumes the registered theme as-is, leaving its `var(--token)` colours for
     * the browser to resolve. Canvas cannot, so it gets a copy resolved against this element.
     */
    theme() {
      if (this.renderer !== 'canvas') {
        return themeName;
      }

      return resolveCssValues(createTheme(this.options), this.$refs.chart);
    },
    /**
     * Rebuilding the chart discards its interaction state, so the legend selection and zoom range
     * are carried over. Only these stateful fields are copied: the full option from getOption()
     * holds colours resolved against the old colour mode.
     */
    preservedState() {
      const { legend = [], dataZoom = [] } = this.chart.getOption();
      return {
        legend: legend.map(({ selected }) => ({ selected })),
        dataZoom: dataZoom.map(({ start, end }) => ({ start, end })),
      };
    },
    /**
     * Colours resolved for canvas are frozen at init, so the chart has to be rebuilt when the
     * colour mode changes. SVG re-resolves on its own and needs no subscription.
     */
    observeColorMode() {
      if (this.renderer !== 'canvas') {
        return;
      }

      this.unsubscribeColorMode = onColorModeChange(this.$refs.chart, () => {
        const state = this.preservedState();
        this.chart.dispose();
        this.initChart();
        this.chart.setOption(state);
      });
    },
    draw() {
      this.chart.setOption(this.modifiedOptions);
      /**
       * Emitted after calling `echarts.setOption`
       */
      this.$emit('updated', this.chart);
    },
    setChartSize() {
      this.chart.resize({
        width: this.width || 'auto',
        height: this.height || defaultHeight,
      });
    },
    handleClick(params) {
      /**
       * Emitted when clicked on a data item in the chart (e.g., a bar/column).
       *
       * @property {object} chart The chart instance
       * @property {object} params A params object, see also https://echarts.apache.org/en/api.html#events.Mouse%20events
       */
      this.$emit('chart-item-clicked', { chart: this.chart, params });
    },
    handleResize() {
      this.chart.resize();
    },
  },
};
</script>

<template>
  <div ref="chart" v-resize-observer:[responsive]="debouncedHandleResize"></div>
</template>
