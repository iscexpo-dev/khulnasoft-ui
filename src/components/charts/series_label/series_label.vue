<script>
// eslint-disable-next-line max-params
const makePathRect = (startX, startY, width, height) =>
  `M${startX},${startY}H${startX + width}V${startY + height}H${startX}Z`;

export default {
  name: 'GlChartSeriesLabel',
  props: {
    /**
     * Color of the series label indicator.
     */
    color: {
      type: String,
      required: true,
    },
    /**
     * Type of the series label (e.g., 'line', 'bar').
     */
    type: {
      type: String,
      required: false,
      default: 'solid',
    },
  },
  data() {
    return {
      labelLineHeight: 0,
    };
  },
  computed: {
    pathContent() {
      const width = this.$options.svgWidth;
      const height = this.$options.svgHeight;

      if (this.type === 'dashed') {
        const dashWidth = Math.ceil(width / 3);
        const firstDash = makePathRect(0, 0, dashWidth, height);
        const secondDash = makePathRect(width - dashWidth, 0, dashWidth, height);

        return `${firstDash}${secondDash}`;
      }

      return makePathRect(0, 0, width, height);
    },
    svgStyles() {
      return {
        fill: this.color,
        transform: `translateY(${this.formatPixelDimension(this.svgYTranslationValue)})`,
        width: 'auto',
      };
    },
    svgYTranslationValue() {
      const value = this.labelLineHeight / 2 - this.$options.svgHeight / 2;
      return Math.round(value) || 0;
    },
  },
  mounted() {
    if (getComputedStyle && this.$refs.label) {
      const computedStyle = getComputedStyle(this.$refs.label);
      const lineHeight = computedStyle['line-height'].match(/(\d+)px/);
      if (lineHeight !== null) {
        this.labelLineHeight = parseFloat(lineHeight[1]);
      }
    }
  },
  methods: {
    formatPixelDimension(dimension) {
      return `${dimension}px`;
    },
  },
  svgWidth: 16,
  svgHeight: 4,
};
</script>

<template>
  <div class="gl-series-label-container">
    <div v-if="color.length" class="gl-series-label-color">
      <svg
        :style="svgStyles"
        :width="formatPixelDimension($options.svgWidth)"
        :height="formatPixelDimension($options.svgHeight)"
        aria-hidden="true"
      >
        <path :d="pathContent" />
      </svg>
    </div>
    <div ref="label" class="gl-series-label-text">
      <slot></slot>
    </div>
  </div>
</template>
