import { tooltipActionEvents } from '../../utils/constants';

// eslint-disable-next-line import-x/no-default-export
export default (tooltipRefName) => ({
  mounted() {
    /**
     * Pass through the events to programmatically open, close, enable
     * and disable a tooltip or a popover.
     *
     * References
     * https://bootstrap-vue.org/docs/components/popover#programmatically-show-and-hide-popover
     * https://bootstrap-vue.org/docs/components/tooltip#programmatically-show-and-hide-tooltip
     */
    tooltipActionEvents.forEach((event) =>
      this.$on(event, () => this.$refs[tooltipRefName][event]()),
    );
  },
  beforeDestroy() {
    tooltipActionEvents.forEach((event) => this.$off(event));
  },
});
