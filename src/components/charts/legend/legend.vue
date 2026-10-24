<script>
import * as echarts from 'echarts';
import { defaultFontSize } from '../../../utils/charts/config';
import { defaultFontFamily } from '../../../utils/charts/theme';
import {
  LEGEND_LAYOUT_INLINE,
  LEGEND_LAYOUT_TABLE,
  LEGEND_AVERAGE_TEXT,
  LEGEND_CURRENT_TEXT,
  LEGEND_MIN_TEXT,
  LEGEND_MAX_TEXT,
} from '../../../utils/charts/constants';
import { average, engineeringNotation } from '../../../utils/number_utils';
import GlTruncate from '../../utilities/truncate/truncate.vue';
import GlChartSeriesLabel from '../series_label/series_label.vue';

export default {
  name: 'GlChartLegend',
  components: {
    GlChartSeriesLabel,
    GlTruncate,
  },
  props: {
    /**
     * Reference to the ECharts instance.
     */
    chart: {
      type: Object,
      required: true,
      validator(chart) {
        return Object.is(chart, echarts.getInstanceByDom(chart.getDom()));
      },
    },
    /**
     * Array of series information for the legend.
     */
    seriesInfo: {
      type: Array,
      required: true,
      validator(seriesInfo) {
        return seriesInfo.every((series) => series.type && series.name && series.color);
      },
    },
    /**
     * Text style configuration for the legend labels.
     */
    textStyle: {
      type: Object,
      required: false,
      default: () => ({}),
    },
    /**
     * Text for data average (overridden by prop if needed for internationalization)
     */
    averageText: {
      type: String,
      required: false,
      default: LEGEND_AVERAGE_TEXT,
    },
    /**
     * Custom text for the current value label.
     */
    currentText: {
      type: String,
      required: false,
      default: LEGEND_CURRENT_TEXT,
    },
    /**
     * Custom text for the minimum value label.
     */
    minText: {
      type: String,
      required: false,
      default: LEGEND_MIN_TEXT,
    },
    /**
     * Text for max amount (overridden by prop if needed for internationalization)
     */
    maxText: {
      type: String,
      required: false,
      default: LEGEND_MAX_TEXT,
    },
    /**
     * Sets the display layout
     */
    layout: {
      type: String,
      required: false,
      default: LEGEND_LAYOUT_INLINE,
      validator(layout) {
        return [LEGEND_LAYOUT_INLINE, LEGEND_LAYOUT_TABLE].indexOf(layout) !== -1;
      },
    },
  },
  data() {
    return {
      disabledSeries: {},
      lastActiveSeriesLabel: null,
      shouldApplyFadeClass: false,
    };
  },
  computed: {
    fontStyle() {
      return {
        fontFamily: this.textStyle.fontFamily || defaultFontFamily,
        fontSize: `${this.textStyle.fontSize || defaultFontSize}px`,
      };
    },
    hasOneSeriesElement() {
      return this.seriesInfo.length === 1;
    },
  },
  watch: {
    /**
     * When the canvas renderer rebuilds the chart on a colour-mode change it disposes the old
     * ECharts instance and creates a new one. The parent emits `created` with the new instance and
     * updates this prop, so we must rebind our persistent listener to the new instance.
     */
    chart(newChart, oldChart) {
      oldChart.off('legendselectchanged', this.suppressLastActiveSeriesLabelToggle);
      newChart.on('legendselectchanged', this.suppressLastActiveSeriesLabelToggle);
    },
  },
  created() {
    this.chart.on('legendselectchanged', this.suppressLastActiveSeriesLabelToggle);
  },
  mounted() {
    this.applyFadeClass();
  },
  async updated() {
    await this.$nextTick();
    this.applyFadeClass();
  },
  beforeDestroy() {
    this.chart.off('legendselectchanged', this.suppressLastActiveSeriesLabelToggle);
  },
  methods: {
    sanitizeSeriesData(seriesData) {
      return seriesData?.filter((d) => !Number.isNaN(d)) ?? [];
    },
    seriesAverage(seriesData) {
      const sanitized = this.sanitizeSeriesData(seriesData);
      return engineeringNotation(average(...sanitized));
    },
    seriesMax(seriesData) {
      const sanitized = this.sanitizeSeriesData(seriesData);
      return engineeringNotation(Math.max(...sanitized));
    },
    seriesMin(seriesData) {
      const sanitized = this.sanitizeSeriesData(seriesData);
      return engineeringNotation(Math.min(...sanitized));
    },
    seriesLast(seriesData) {
      const sanitized = this.sanitizeSeriesData(seriesData);
      return engineeringNotation(sanitized[sanitized.length - 1]);
    },
    seriesNameIsLong(seriesName) {
      return seriesName.length > 120;
    },
    handleClick({ name, disabled }, key) {
      if (this.hasOneSeriesElement || this.isToggleDisabled(name, disabled)) return;

      this.chart.dispatchAction({ type: 'legendToggleSelect', name });
      this.disabledSeries = { ...this.disabledSeries, [key]: !this.disabledSeries[key] };
    },
    handleMouseEnter(name) {
      this.chart.dispatchAction({ type: 'highlight', seriesName: name });
    },
    handleMouseLeave(name) {
      this.chart.dispatchAction({ type: 'downplay', seriesName: name });
    },
    getColor(color, key) {
      return this.disabledSeries[key] ? 'var(--gl-chart-axis-line-color)' : color;
    },
    suppressLastActiveSeriesLabelToggle({ selected }) {
      const selectedSeriesLabels = Object.entries(selected).filter(([, isSelected]) =>
        Boolean(isSelected),
      );

      this.lastActiveSeriesLabel = null;

      if (selectedSeriesLabels.length === 1) {
        const [lastActiveSeriesLabelName] = selectedSeriesLabels[0];

        this.lastActiveSeriesLabel = lastActiveSeriesLabelName;
      }
    },
    /**
     * Disables toggling legend if it is the last active one or if its data series
     * has a disabled property set to true
     * @param {String} name Series name
     * @param {Boolean} isDisabled Value of the series element's disabled property
     * @returns {boolean}
     */
    isToggleDisabled(name, isDisabled) {
      return name === this.lastActiveSeriesLabel || isDisabled;
    },
    applyFadeClass() {
      if (this.$refs.inlineLegendEl) {
        const { scrollHeight, clientHeight } = this.$refs.inlineLegendEl;
        this.shouldApplyFadeClass = scrollHeight > clientHeight;
      }
    },
  },
  legendLayoutTypes: {
    LEGEND_LAYOUT_INLINE,
    LEGEND_LAYOUT_TABLE,
  },
};
</script>

<template>
  <div class="gl-legend" data-testid="gl-chart-legend">
    <template v-if="layout === $options.legendLayoutTypes.LEGEND_LAYOUT_INLINE">
      <div
        ref="inlineLegendEl"
        class="gl-legend-inline"
        :class="{ 'gl-legend-b-fade': shouldApplyFadeClass }"
      >
        <button
          v-for="(series, key) in seriesInfo"
          :key="key"
          type="button"
          :class="{
            'gl-text-subtle': disabledSeries[key],
            'gl-text-strong': !disabledSeries[key],
            'gl-w-full': seriesNameIsLong(series.name),
            'hover:!gl-cursor-not-allowed':
              hasOneSeriesElement || isToggleDisabled(series.name, series.disabled),
          }"
          class="gl-legend-inline-series"
          :style="fontStyle"
          :aria-pressed="String(!disabledSeries[key])"
          :aria-disabled="hasOneSeriesElement || isToggleDisabled(series.name, series.disabled)"
          @click="handleClick(series, key)"
          @mouseenter="handleMouseEnter(series.name)"
          @mouseleave="handleMouseLeave(series.name)"
        >
          <gl-chart-series-label
            :color="getColor(series.color, key)"
            :type="series.type"
            class="gl-legend-inline-series-label"
            :class="{ 'gl-w-3/4': seriesNameIsLong(series.name) }"
          >
            <gl-truncate class="gl-font-bold" :text="series.name" />
          </gl-chart-series-label>
          <span
            v-if="series.data && series.data.length"
            :class="{ 'gl-whitespace-nowrap': seriesNameIsLong(series.name) }"
          >
            {{ averageText }}: {{ seriesAverage(series.data) }} · {{ maxText }}:
            {{ seriesMax(series.data) }}
          </span>
        </button>
      </div>
    </template>

    <template v-if="layout === $options.legendLayoutTypes.LEGEND_LAYOUT_TABLE">
      <div class="gl-legend-tabular gl-legend-b-fade" :style="fontStyle">
        <header class="gl-legend-tabular-header">
          <div class="gl-legend-tabular-header-cell">{{ minText }}</div>
          <div class="gl-legend-tabular-header-cell">{{ maxText }}</div>
          <div class="gl-legend-tabular-header-cell">{{ averageText }}</div>
          <div class="gl-legend-tabular-header-cell">{{ currentText }}</div>
        </header>
        <section class="gl-legend-tabular-body">
          <button
            v-for="(series, key) in seriesInfo"
            :key="key"
            type="button"
            :class="{
              'gl-text-subtle': disabledSeries[key],
              'gl-text-strong': !disabledSeries[key],
              'hover:!gl-cursor-not-allowed':
                hasOneSeriesElement || isToggleDisabled(series.name, series.disabled),
            }"
            class="gl-legend-tabular-row"
            :style="fontStyle"
            :aria-pressed="String(!disabledSeries[key])"
            :aria-disabled="hasOneSeriesElement || isToggleDisabled(series.name, series.disabled)"
            @click="handleClick(series, key)"
            @mouseenter="handleMouseEnter(series.name)"
            @mouseleave="handleMouseLeave(series.name)"
          >
            <div class="gl-legend-tabular-title-cell">
              <gl-chart-series-label
                :color="getColor(series.color, key)"
                :style="fontStyle"
                :type="series.type"
              >
                <gl-truncate class="gl-font-bold" :text="series.name" />
              </gl-chart-series-label>
            </div>

            <template v-if="sanitizeSeriesData(series.data).length">
              <div class="gl-legend-tabular-details-cell">{{ seriesMin(series.data) }}</div>
              <div class="gl-legend-tabular-details-cell">{{ seriesMax(series.data) }}</div>
              <div class="gl-legend-tabular-details-cell">{{ seriesAverage(series.data) }}</div>
              <div class="gl-legend-tabular-details-cell">{{ seriesLast(series.data) }}</div>
            </template>
            <template v-else>
              <div class="gl-legend-tabular-details-cell">-</div>
              <div class="gl-legend-tabular-details-cell">-</div>
              <div class="gl-legend-tabular-details-cell">-</div>
              <div class="gl-legend-tabular-details-cell">-</div>
            </template>
          </button>
        </section>
      </div>
    </template>
  </div>
</template>
