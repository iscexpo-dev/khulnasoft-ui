<script>
import GlButton from '../../button/button.vue';
import { GlTooltipDirective } from '../../../../directives/tooltip/tooltip';
import { translate } from '../../../../utils/i18n';
import GlFormInput from '../form_input/form_input.vue';

export default {
  name: 'GlFormPasswordInput',
  components: {
    GlButton,
    GlFormInput,
  },
  directives: {
    GlTooltip: GlTooltipDirective,
  },
  inheritAttrs: false,
  props: {
    /**
     * The input's value. Bound to the inner input and supports `v-model`.
     * @model
     */
    value: {
      type: String,
      required: false,
      default: '',
    },
    /**
     * Whether the value is revealed (unmasked) on initial render.
     */
    initialVisibility: {
      type: Boolean,
      required: false,
      default: false,
    },
    /**
     * Accessible label and tooltip for the toggle button while the value is masked.
     */
    revealLabel: {
      type: String,
      required: false,
      default: () => translate('GlFormPasswordInput.revealLabel', 'Reveal password'),
    },
    /**
     * Accessible label and tooltip for the toggle button while the value is revealed.
     */
    hideLabel: {
      type: String,
      required: false,
      default: () => translate('GlFormPasswordInput.hideLabel', 'Hide password'),
    },
    /**
     * Disables the field and its toggle. Neither is in the tab order and the
     * value is not submitted with the form.
     *
     * To prevent edits while keeping the value readable, copyable and
     * submitted, pass `readonly` instead. It reaches the input untouched and
     * leaves the toggle usable, since revealing a value is a read.
     */
    disabled: {
      type: Boolean,
      required: false,
      default: false,
    },
    /**
     * CSS class(es) applied to the inner input element, not the wrapper.
     * Use it for hooks or styles that must target the input itself, since a
     * `class` passed to this component lands on the wrapper under Vue 2.
     */
    inputClass: {
      type: [String, Array, Object],
      required: false,
      default: '',
    },
  },
  data() {
    return {
      isMasked: !this.initialVisibility,
    };
  },
  computed: {
    type() {
      return this.isMasked ? 'password' : 'text';
    },
    toggleLabel() {
      return this.isMasked ? this.revealLabel : this.hideLabel;
    },
    toggleIcon() {
      return this.isMasked ? 'eye' : 'eye-slash';
    },
  },
  methods: {
    toggleVisibility() {
      this.isMasked = !this.isMasked;
      /**
       * Emitted when the reveal/hide button is clicked.
       *
       * @event visibility-change
       * @property {boolean} visible Whether the value is now revealed.
       */
      this.$emit('visibility-change', !this.isMasked);
    },
  },
};
</script>

<template>
  <div class="gl-form-password-input">
    <gl-form-input
      v-bind="$attrs"
      class="gl-form-password-input-field"
      :class="inputClass"
      :value="value"
      :type="type"
      :disabled="disabled"
      v-on="$listeners"
    />
    <gl-button
      v-gl-tooltip="toggleLabel"
      class="gl-form-password-input-toggle"
      category="tertiary"
      size="small"
      :aria-label="toggleLabel"
      :icon="toggleIcon"
      :disabled="disabled"
      @click="toggleVisibility"
    />
  </div>
</template>
