<script>
import { translate } from '../../../utils/i18n';
import { progressBarVariantOptions } from '../../../utils/constants';
import { toFloat } from '../../../utils/number_utils';

const backgroundClasses = {
  [progressBarVariantOptions.primary]: 'gl-progress-bar-primary',
  [progressBarVariantOptions.success]: 'gl-progress-bar-success',
  [progressBarVariantOptions.danger]: 'gl-progress-bar-danger',
  [progressBarVariantOptions.warning]: 'gl-progress-bar-warning',
};

export default {
  name: 'GlProgressBar',
  props: {
    /**
     * Accessible label for the progress bar. Used for the aria-label attribute.
     */
    ariaLabel: {
      type: String,
      required: false,
      default: translate('GlProgressBar.ariaLabel', 'Progress bar'),
    },
    /**
     * Current progress value. Should be between 0 and the max value.
     */
    value: {
      type: [Number, String],
      required: false,
      default: 0,
    },
    /**
     * Visual variant of the progress bar.
     */
    variant: {
      type: String,
      required: false,
      default: 'primary',
      validator: (value) => Object.keys(progressBarVariantOptions).includes(value),
    },
    /**
     * Maximum value for the progress bar. The value prop is calculated as a percentage of this.
     */
    max: {
      type: [Number, String],
      required: false,
      default: 100,
    },
    /**
     * Custom height for the progress bar (e.g., '8px', '1rem').
     */
    height: {
      type: String,
      required: false,
      default: null,
    },
  },
  computed: {
    progressHeight() {
      return { height: this.height };
    },
    computedValue() {
      return toFloat(this.value, 0);
    },
    computedMax() {
      const max = toFloat(this.max, 100);
      return max > 0 ? max : 100;
    },
    progressBarStyles() {
      return {
        transform: `scaleX(${this.computedValue / this.computedMax})`,
      };
    },
    classes() {
      return ['gl-progress', backgroundClasses[this.variant]];
    },
  },
};
</script>

<template>
  <div class="gl-progress-bar progress" :style="progressHeight">
    <div
      :class="classes"
      :style="progressBarStyles"
      role="progressbar"
      :aria-label="ariaLabel"
      aria-valuemin="0"
      :aria-valuemax="String(computedMax)"
      :aria-valuenow="computedValue"
    ></div>
  </div>
</template>
