<script>
import { translate } from '../../../utils/i18n';
import GlButton from '../../base/button/button.vue';

export default {
  name: 'CloseButton',
  components: {
    GlButton,
  },
  props: {
    /**
     * The aria-label for the close button.
     */
    label: {
      type: String,
      required: false,
      default: () => translate('CloseButton.title', 'Close'),
    },
  },
};
</script>

<template>
  <gl-button
    category="tertiary"
    size="small"
    icon="close"
    :aria-label="label"
    v-bind="$attrs"
    v-on="$listeners"
  />
</template>
