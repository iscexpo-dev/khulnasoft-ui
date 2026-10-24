<script>
import { translate } from '../../../utils/i18n';
import { buttonSizeOptions } from '../../../utils/constants';
import GlButton from '../button/button.vue';

export default {
  name: 'GlColorModeToggle',
  components: {
    GlButton,
  },
  props: {
    /**
     * Whether dark mode is currently active.
     */
    isDarkMode: {
      type: Boolean,
      required: false,
      default: false,
    },
    /**
     * Specify the size of the button.
     */
    size: {
      type: String,
      required: false,
      default: 'medium',
      validator: (value) => Object.keys(buttonSizeOptions).includes(value),
    },
    /**
     * The label when in dark mode. Screen-reader only.
     */
    darkLabel: {
      type: String,
      required: false,
      default: () => translate('GlColorModeToggle.darkLabel', 'Dark mode'),
    },
    /**
     * The label when in light mode. Screen-reader only.
     */
    lightLabel: {
      type: String,
      required: false,
      default: () => translate('GlColorModeToggle.lightLabel', 'Light mode'),
    },
  },
  computed: {
    ariaLabel() {
      return this.isDarkMode ? this.darkLabel : this.lightLabel;
    },
    iconName() {
      return this.isDarkMode ? 'moon' : 'sun';
    },
  },
  methods: {
    /**
     * Emitted when the toggle button is clicked.
     *
     * @event toggle
     */
    handleClick() {
      this.$emit('toggle');
    },
  },
};
</script>

<template>
  <gl-button
    :aria-label="ariaLabel"
    class="btn-icon"
    category="tertiary"
    :size="size"
    :icon="iconName"
    @click="handleClick"
  />
</template>
