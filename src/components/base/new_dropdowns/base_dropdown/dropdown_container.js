/* eslint-disable import-x/no-default-export */
import { MountingPortal } from 'portal-vue';
import { POSITION_ABSOLUTE, POSITION_FIXED } from '../constants';

export default {
  props: {
    /**
     * Strategy to be applied by computePosition. If this is set to fixed, the dropdown's position
     * needs to be set to fixed in CSS as well.
     * https://floating-ui.com/docs/computePosition#strategy
     */
    positioningStrategy: {
      type: String,
      required: false,
      default: POSITION_ABSOLUTE,
      validator: (strategy) => [POSITION_ABSOLUTE, POSITION_FIXED].includes(strategy),
    },
  },
  render(createElement) {
    if (this.positioningStrategy === POSITION_FIXED) {
      return createElement(
        MountingPortal,
        {
          props: {
            mountTo: 'body',
            append: true,
          },
        },
        [this.$scopedSlots.default()],
      );
    }
    return this.$scopedSlots.default();
  },
};
