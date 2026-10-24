<script>
import { tokenVariants } from '../../../utils/constants';
import { translate } from '../../../utils/i18n';
import CloseButton from '../../shared_components/close_button/close_button.vue';

export default {
  name: 'GlToken',
  components: {
    CloseButton,
  },
  props: {
    /**
     * When true, hides the close button and makes the token non-removable.
     */
    viewOnly: {
      type: Boolean,
      required: false,
      default: false,
    },
    /**
     * Token visual variants: default, search-type, and search-value.
     */
    variant: {
      type: String,
      required: false,
      default: 'default',
      validator: (variant) => tokenVariants.includes(variant),
    },
    /**
     * The close button's label, it is used for the button's aria-label attribute.
     */
    removeLabel: {
      type: String,
      required: false,
      default: () => translate('GlToken.closeButtonTitle', 'Remove'),
    },
  },
  computed: {
    variantClass() {
      // eslint-disable-next-line @khulnasoft/tailwind-no-interpolation -- Not a CSS utility
      return `gl-token-${this.variant}-variant`;
    },
    viewOnlyClass() {
      return {
        'gl-token-view-only': this.viewOnly,
      };
    },
  },
  methods: {
    close($event) {
      /**
       * Emitted when x is clicked
       *
       * @event close
       */
      this.$emit('close', $event);
    },
  },
};
</script>

<template>
  <span :class="['gl-token', variantClass, viewOnlyClass]" v-on="$listeners">
    <span class="gl-token-content">
      <!-- @slot Content to display inside the token -->
      <slot></slot>
      <close-button v-if="!viewOnly" class="gl-token-close" :label="removeLabel" @click="close" />
    </span>
  </span>
</template>
