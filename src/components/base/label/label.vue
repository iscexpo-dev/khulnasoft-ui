<script>
import { labelColorOptions } from '../../../utils/constants';
import { colorFromBackground } from '../../../utils/utils';
import { translate } from '../../../utils/i18n';
import GlButton from '../button/button.vue';
import GlIcon from '../icon/icon.vue';
import GlLink from '../link/link.vue';
import GlTooltip from '../tooltip/tooltip.vue';

export default {
  name: 'GlLabel',
  components: {
    GlButton,
    GlIcon,
    GlLink,
    GlTooltip,
  },
  props: {
    /**
     * Background color of the label in hex, rgb, or rgba format
     */
    backgroundColor: {
      type: String,
      required: true,
      validator: (value) => /^(#|rgb|rgba)/.test(value),
    },
    /**
     * Title text of the label
     */
    title: {
      type: String,
      required: true,
      default: '',
    },
    /**
     * Description text shown in tooltip
     */
    description: {
      type: String,
      required: false,
      default: '',
    },
    /**
     * Placement of the tooltip
     */
    tooltipPlacement: {
      type: String,
      required: false,
      default: 'top',
    },
    /**
     * Target URL for the label link
     */
    target: {
      type: String,
      required: false,
      default: '',
    },
    /**
     * Whether the label is scoped (uses :: separator)
     */
    scoped: {
      type: Boolean,
      required: false,
      default: false,
    },
    /**
     * Whether to show the close button
     */
    showCloseButton: {
      type: Boolean,
      required: false,
      default: false,
    },
    /**
     * Whether the label is disabled
     */
    disabled: {
      type: Boolean,
      required: false,
      default: false,
    },
    /**
     * Additional text shown in a muted footer line of the tooltip (e.g. "Archived")
     */
    footer: {
      type: String,
      required: false,
      default: '',
    },
  },
  computed: {
    removeButtonAriaLabel() {
      return translate('GlLabel.removeButtonAriaLabel', 'Remove label - %{label}', {
        label: this.title,
      });
    },
    cssClasses() {
      const textColorVariant = colorFromBackground(this.backgroundColor);
      return {
        'gl-label-scoped': this.scoped,
        'gl-label-text-dark': textColorVariant === labelColorOptions.dark,
        'gl-label-text-light': textColorVariant === labelColorOptions.light,
      };
    },
    cssVariables() {
      return {
        '--label-background-color': this.backgroundColor,
        '--label-inset-border': `inset 0 0 0 2px ${this.backgroundColor}`,
      };
    },
    splitScopedLabelIndex() {
      return this.title.lastIndexOf('::');
    },
    scopedKey() {
      return this.scoped ? this.title.slice(0, this.splitScopedLabelIndex) : this.title;
    },
    scopedValue() {
      return this.title.slice(this.splitScopedLabelIndex + 2);
    },
    labelComponent() {
      return this.target ? GlLink : 'span';
    },
    tooltipTarget() {
      return this.target ? this.$refs.labelTitle.$el : this.$refs.labelTitle;
    },
  },
  methods: {
    onClick(e) {
      /**
       * Emitted when the label is clicked.
       * @event click
       */
      this.$emit('click', e);
    },
    onClose(e) {
      /**
       * Emitted when the close button is clicked.
       * @event close
       */
      this.$emit('close', e);
    },
  },
};
</script>

<template>
  <span class="gl-label" :class="cssClasses" :style="cssVariables" v-bind="$attrs" @click="onClick">
    <component
      :is="labelComponent"
      ref="labelTitle"
      :href="target || null"
      class="gl-label-link"
      :class="{ 'gl-label-link-underline': target }"
      tabindex="0"
    >
      <span class="gl-label-text">
        {{ scopedKey }}
      </span>
      <span v-if="scoped && scopedValue" class="gl-label-text-scoped">
        {{ scopedValue }}
      </span>
    </component>
    <gl-button
      v-if="showCloseButton"
      class="gl-label-close !gl-p-0"
      category="tertiary"
      size="small"
      variant="reset"
      :aria-label="removeButtonAriaLabel"
      :disabled="disabled"
      @click="onClose"
    >
      <gl-icon name="close-xs" :size="12" />
    </gl-button>
    <gl-tooltip
      v-if="description || footer"
      :target="() => tooltipTarget"
      :placement="tooltipPlacement"
      boundary="viewport"
    >
      <span v-if="scoped" class="gl-label-tooltip-title">Scoped label</span>
      {{ description }}
      <span v-if="footer" class="gl-block gl-text-subtle">{{ footer }}</span>
    </gl-tooltip>
  </span>
</template>
