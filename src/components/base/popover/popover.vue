<script>
import { BPopover } from '../../../vendor/bootstrap-vue/src/components/popover/popover';
import tooltipMixin from '../../mixins/tooltip_mixin';
import CloseButton from '../../shared_components/close_button/close_button.vue';
import { popoverPlacements } from '../../../utils/constants';

const popoverRefName = 'bPopover';

export default {
  name: 'GlPopover',
  components: {
    BPopover,
    CloseButton,
  },
  mixins: [tooltipMixin(popoverRefName)],
  inheritAttrs: false,
  props: {
    /**
     * Additional CSS class(es) to apply to the popover.
     */
    cssClasses: {
      type: [Array, String, Object],
      required: false,
      default: '',
    },
    /**
     * Space-separated triggers for the popover.
     *
     * @values click, hover, focus, manual
     */
    triggers: {
      type: String,
      required: false,
      default: 'hover focus',
    },
    /**
     * Title text to display in the popover header.
     */
    title: {
      type: String,
      required: false,
      default: '',
    },
    /**
     * When true, displays a close button in the popover header.
     */
    showCloseButton: {
      type: Boolean,
      required: false,
      default: false,
    },
    /**
     * Placement of the popover relative to the target element.
     */
    placement: {
      type: String,
      required: false,
      default: popoverPlacements.top,
    },
    /**
     * Padding (in pixels) between the popover and the viewport boundary.
     */
    boundaryPadding: {
      type: [Number, String],
      required: false,
      default: 5,
    },
  },
  computed: {
    hasTitle() {
      return this.$scopedSlots.title || this.title;
    },
    customClass() {
      return [
        'gl-popover',
        this.hasTitle && 'has-title',
        this.showCloseButton && 'has-close-button',
        ...this.normalizedCssClasses(this.cssClasses),
      ]
        .filter(Boolean)
        .join(' ');
    },
    shouldShowTitle() {
      return this.hasTitle || this.showCloseButton;
    },
  },
  methods: {
    /**
     * `cssClasses can be a string, an array, or an object. This method normalizes it to an array
     */
    normalizedCssClasses(cssClasses) {
      if (Array.isArray(cssClasses)) {
        return cssClasses;
      }

      if (typeof cssClasses === 'string') {
        return cssClasses.trim() ? cssClasses.trim().split(/\s+/) : [];
      }

      if (cssClasses && typeof cssClasses === 'object') {
        return Object.keys(cssClasses).filter((key) => cssClasses[key]);
      }

      return [];
    },
    closePopover(e) {
      this.$refs[popoverRefName].close();
      /**
       * Emitted when the close button is clicked (requires showCloseButton to be `true`).
       */
      this.$emit('close-button-clicked', e);
    },
  },
  popoverRefName,
};
</script>

<template>
  <b-popover
    :ref="$options.popoverRefName"
    :custom-class="customClass"
    :triggers="triggers"
    :title="title"
    :placement="placement"
    :boundary-padding="boundaryPadding"
    v-bind="$attrs"
    v-on="$listeners"
  >
    <template v-if="shouldShowTitle" #title>
      <!-- @slot Custom content for the popover title -->
      <slot name="title">
        {{ title }}
      </slot>
      <div v-if="showCloseButton" class="-gl-mr-3 -gl-mt-2 gl-ml-3 gl-h-0">
        <close-button
          :class="{ 'gl-float-right gl-mt-2': !hasTitle }"
          data-testid="close-button"
          @click="closePopover"
        />
      </div>
    </template>
    <template v-if="$scopedSlots.default" #default>
      <!-- @slot Main content of the popover body-->
      <slot></slot>
    </template>
  </b-popover>
</template>
