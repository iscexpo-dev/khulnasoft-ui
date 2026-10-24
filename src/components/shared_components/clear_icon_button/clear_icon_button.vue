<script>
import { GlTooltipDirective } from '../../../directives/tooltip/tooltip';
import GlButton from '../../base/button/button.vue';
import { translate } from '../../../utils/i18n';

export default {
  name: 'ClearIconButton',
  components: {
    GlButton,
  },
  directives: {
    GlTooltip: GlTooltipDirective,
  },
  props: {
    /**
     * The title attribute for the clear button.
     */
    title: {
      type: String,
      required: false,
      default: () => translate('ClearIconButton.title', 'Clear'),
    },
    /**
     * Container element for the tooltip.
     */
    tooltipContainer: {
      required: false,
      default: false,
      validator: (value) =>
        value === false || typeof value === 'string' || value instanceof HTMLElement,
    },
  },
};
</script>

<template>
  <gl-button
    v-gl-tooltip.hover="{ container: tooltipContainer }"
    variant="default"
    category="tertiary"
    class="gl-clear-icon-button"
    size="small"
    name="clear"
    icon="clear"
    :title="title"
    :aria-label="title"
    v-on="$listeners"
  />
</template>
