<script>
import * as echarts from 'echarts';
import { uid, debounceByAnimationFrame } from '../../../../utils/utils';
import GlPopover from '../../../base/popover/popover.vue';
import { popoverPlacements } from '../../../../utils/constants';
import { TOOLTIP_LEFT_OFFSET, TOOLTIP_TOP_OFFSET } from '../../../../utils/charts/constants';
import {
  getTooltipTitle,
  getTooltipContent,
  getTooltipAxisConfig,
  getTooltipParams,
} from '../../../../utils/charts/config';

import TooltipDefaultFormat from './tooltip_default_format/tooltip_default_format.vue';

export default {
  name: 'GlChartTooltip',
  components: {
    GlPopover,
    TooltipDefaultFormat,
  },
  inheritAttrs: false,
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
     * Unique identifier for the tooltip.
     */
    id: {
      type: String,
      required: false,
      default: () => uid(),
    },
    /**
     * Position of the popover respective to the chart.
     * Sets the `top` style property.
     */
    top: {
      type: String,
      required: false,
      default: null,
    },
    /**
     * Position of the popover respective to the chart.
     * Sets the `bottom` style property.
     */
    bottom: {
      type: String,
      required: false,
      default: null,
    },
    /**
     * Position of the popover respective to the chart.
     * Sets the `left` style property.
     */
    left: {
      type: String,
      required: false,
      default: null,
    },
    /**
     * Position of the popover respective to the chart.
     * Sets the `right` style property.
     */
    right: {
      type: String,
      required: false,
      default: null,
    },
    /**
     * Set to `true` to show, set to `false` to not show.
     * Set to `null` to show only when the mouse is in the chart.
     */
    show: {
      type: Boolean,
      required: false,
      default: null,
    },
    /**
     * Popover placement
     */
    placement: {
      type: String,
      required: false,
      default: popoverPlacements.right,
    },
    /**
     * Distance between the popover and the pointer when
     * no position is defined
     */
    xOffset: {
      type: Number,
      required: false,
      default: TOOLTIP_LEFT_OFFSET,
      validator(value) {
        // popover target must have a size of at least 1
        return value >= 1;
      },
    },
    /**
     * Distance between the popover and the pointer when
     * no position is defined
     */
    yOffset: {
      type: Number,
      required: false,
      default: TOOLTIP_TOP_OFFSET,
      validator(value) {
        // popover target must have a size of at least 1
        return value >= 1;
      },
    },

    /**
     * Set to true to use the default tooltip formatter.
     */
    useDefaultTooltipFormatter: {
      type: Boolean,
      required: false,
      default: false,
    },
    /**
     * Set to true to enable click-to-pin functionality.
     * When enabled, clicking on a chart point will keep the tooltip open, so the user can interact with the tooltip's content.
     * The tooltip will unpin when clicking again on the chart and not on the tooltip.
     */
    clickToPin: {
      type: Boolean,
      required: false,
      default: false,
    },
    /**
     * Specifies which axis contains the dimensional data used in the tooltip.
     * When `xAxis`, x-axis value becomes the tooltip's title and
     * y-axis values become the tooltip's values.
     * When `yAxis`, roles are reversed.
     */
    dimensionAxis: {
      type: String,
      required: false,
      default: 'xAxis',
      validator(value) {
        return value === 'xAxis' || value === 'yAxis';
      },
    },
  },
  data() {
    return {
      pointerCoords: null,
      isPointerInChart: false,
      pinnedPosition: null,

      debouncedMouseHandler: debounceByAnimationFrame(this.mouseHandler),

      title: null,
      content: {},
      params: null,
    };
  },
  computed: {
    targetId() {
      // if multiple tooltips are used in a chart component,
      // `this.id` can be used to uniquely identify them
      return `${this.chart.getDom().getAttribute('_echarts_instance_')}-tooltip-${this.id}`;
    },
    targetStyle() {
      // the target is a rectangular space between cursor and popover
      return {
        marginTop: `${-this.yOffset}px`,
        height: `${this.yOffset * 2}px`,

        marginLeft: `${-this.xOffset}px`,
        width: `${this.xOffset * 2}px`,

        pointerEvents: this.isPinned ? 'auto' : 'none',

        ...this.tooltipPosition,
      };
    },
    fixedPosition() {
      const { top, left, bottom, right } = this;
      if (top || left || bottom || right) {
        return { top, left, bottom, right };
      }
      return null;
    },
    tooltipPosition() {
      if (this.fixedPosition) {
        return this.fixedPosition;
      }
      if (this.pinnedPosition) {
        return this.pinnedPosition;
      }
      return this.pointerPosition;
    },
    shouldShowPopover() {
      if (this.show !== null) {
        return this.show;
      }
      return this.isPinned || this.isPointerInChart;
    },
    isPinned() {
      return this.pinnedPosition !== null;
    },
    pointerPosition() {
      if (!this.pointerCoords) {
        return null;
      }

      return {
        left: `${this.pointerCoords.x}px`,
        top: `${this.pointerCoords.y}px`,
      };
    },
  },
  created() {
    this.chart.getZr().on('mousemove', this.debouncedMouseHandler);
    this.chart.getZr().on('mouseout', this.debouncedMouseHandler);

    if (this.clickToPin) {
      document.addEventListener('keydown', this.keyDownHandler);
      this.chart.getZr().on('click', this.clickHandler);
    }

    if (this.useDefaultTooltipFormatter) {
      this.chart.setOption({
        [this.dimensionAxis]: {
          axisPointer: {
            show: true,
            label: {
              formatter: (params) => {
                const options = this.chart.getOption();

                const { dimensionIndex, metricIndex, valueAxis } = getTooltipAxisConfig(
                  this.dimensionAxis,
                );

                const titleAxisName = options[this.dimensionAxis]?.[0]?.name;
                const valueAxisName = options[valueAxis]?.[0]?.name;

                this.title = getTooltipTitle(params, titleAxisName, dimensionIndex);
                this.content = getTooltipContent(params, valueAxisName, metricIndex);
                this.params = getTooltipParams(params, options);
              },
            },
          },
        },
      });
    }
  },
  beforeDestroy() {
    this.chart.getZr().off('mousemove', this.debouncedMouseHandler);
    this.chart.getZr().off('mouseout', this.debouncedMouseHandler);

    if (this.clickToPin) {
      this.chart.getZr().off('click', this.clickHandler);
      document.removeEventListener('keydown', this.keyDownHandler);
    }
  },
  methods: {
    getEventCoordsWithinChart({ event }) {
      const { zrX, zrY } = event;
      const x = Math.round(zrX);
      const y = Math.round(zrY);

      if (!Number.isFinite(x) || !Number.isFinite(y)) {
        return null;
      }

      if (!this.chart.containPixel('grid', [x, y])) {
        return null;
      }

      return { x, y };
    },
    mouseHandler(event) {
      const coords = this.getEventCoordsWithinChart(event);
      if (!coords) {
        this.isPointerInChart = false;
        return;
      }

      this.pointerCoords = coords;
      this.isPointerInChart = true;
    },
    clickHandler(event) {
      if (!this.getEventCoordsWithinChart(event)) {
        return;
      }

      if (!this.isPinned) {
        this.pinTooltip();
      } else {
        this.unpinTooltip(event.event);
      }
    },
    pinTooltip() {
      this.pinnedPosition = this.pointerPosition;

      // prevents any axis pointers from being moved to a new position, they should also be pinned
      this.chart.setOption({
        tooltip: {
          triggerOn: 'none',
        },
      });
    },
    unpinTooltip() {
      this.pinnedPosition = null;

      // restores the axis pointers to be unpinned and be triggered by mousemove
      this.chart.setOption({
        tooltip: {
          triggerOn: 'mousemove',
          show: false,
        },
      });

      // shows the tooltip and axis pointer at the position of the click
      this.chart.dispatchAction({
        type: 'showTip',
        x: this.pointerCoords.x,
        y: this.pointerCoords.y,
      });
    },
    keyDownHandler(event) {
      if (event.key === 'Escape' && this.isPinned) {
        this.unpinTooltip();
      }
    },
  },
};
</script>

<template>
  <div v-if="chart">
    <div :id="targetId" :style="targetStyle" class="gl-chart-tooltip"></div>
    <!--
      Is shown using `show` property directly so
      `triggers` are set to an empty string
    -->
    <gl-popover
      v-bind="$attrs"
      :show="shouldShowPopover"
      :target="targetId"
      :container="targetId"
      :placement="placement"
      triggers=""
    >
      <template #title>
        <!--
          @slot Tooltip title
          @binding {string} title - Default title
          @binding {object} params
        -->
        <slot name="title" v-bind="{ title, params }">{{ title }}</slot>
      </template>
      <!--
        @slot Tooltip content
        @binding {object} content - Key-value pairs of series information
        @binding {object} params - Full list of params from `onLabelChange`. Can be null before tooltip is shown
       -->
      <slot v-bind="{ content, params }">
        <tooltip-default-format :tooltip-content="content">
          <template v-if="$scopedSlots['tooltip-value']" #tooltip-value="scope">
            <!-- @slot Tooltip value formatter -->
            <slot name="tooltip-value" v-bind="scope"></slot>
          </template>
        </tooltip-default-format>
      </slot>
    </gl-popover>
  </div>
</template>
