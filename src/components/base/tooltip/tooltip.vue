<script>
import { BTooltip } from '../../../vendor/bootstrap-vue/src/components/tooltip/tooltip';
import tooltipMixin from '../../mixins/tooltip_mixin';
import { getGlTooltipDefaultContainer } from '../../../directives/tooltip/container';

const tooltipRefName = 'bvTooltip';

export default {
  name: 'GlTooltip',
  components: {
    BTooltip,
  },
  mixins: [tooltipMixin(tooltipRefName)],
  inheritAttrs: false,
  tooltipRefName,
  getGlTooltipDefaultContainer,
};
</script>

<template>
  <b-tooltip
    :ref="$options.tooltipRefName"
    v-bind="$attrs"
    :container="$attrs.container || $options.getGlTooltipDefaultContainer()"
    v-on="$listeners"
  >
    <template v-if="$scopedSlots.default" #default>
      <!-- @slot Tooltip content -->
      <slot></slot>
    </template>
  </b-tooltip>
</template>
