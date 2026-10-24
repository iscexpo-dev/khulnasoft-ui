import { buttonSizeOptions } from '../../utils/constants';

export const ButtonMixin = {
  computed: {
    buttonSize() {
      return buttonSizeOptions[this.size];
    },
  },
};
