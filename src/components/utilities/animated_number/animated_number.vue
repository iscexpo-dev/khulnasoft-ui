<script>
import { formatNumberToLocale } from '../../../utils/number_utils';

export default {
  name: 'AnimatedNumber',
  props: {
    /**
     * The numeric value to animate.
     */
    number: {
      type: Number,
      required: true,
    },
    /**
     * Controls how long it takes for the animation to complete.
     */
    duration: {
      type: Number,
      required: false,
      default: 2000,
    },
    /**
     * Controls the number of decimal places displayed in the output.
     */
    decimalPlaces: {
      type: Number,
      required: false,
      default: 0,
    },
    /**
     * When true, formats the number with digit group separators.
     */
    useDelimiters: {
      type: Boolean,
      required: false,
      default: false,
    },
    /**
     * When true, animates the number when the component is mounted.
     */
    animateOnMount: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  data() {
    return {
      displayNumber: 0,
      startTime: null,
    };
  },
  computed: {
    animatedNumber() {
      const number = this.displayNumber.toFixed(this.decimalPlaces);

      if (this.useDelimiters) {
        return formatNumberToLocale(number, { minimumFractionDigits: this.decimalPlaces });
      }

      return number;
    },
  },
  ready() {
    this.displayNumber = this.number ? this.number : 0;
  },
  watch: {
    number() {
      this.animate();
    },
  },
  mounted() {
    if (this.animateOnMount) {
      this.animate();
    } else {
      this.displayNumber = this.number;
    }
  },
  methods: {
    animate() {
      this.$emit('animating');
      window.requestAnimationFrame(this.count);
    },
    count(timestamp) {
      if (!this.startTime) {
        this.startTime = timestamp;
      }

      const progress = timestamp - this.startTime;

      if (progress < this.duration) {
        if (this.displayNumber !== this.number) {
          const change = (this.number - this.displayNumber) / (this.duration / 100);
          this.displayNumber += change;
        }
        window.requestAnimationFrame(this.count);
      } else {
        this.displayNumber = this.number; // Ensures that the final number is accurate.
        this.startTime = null;
        this.$emit('animated');
      }
    },
  },
};
</script>
<template>
  <span>{{ animatedNumber }}</span>
</template>
