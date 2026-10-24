<script>
import { uniqueId, isBoolean, omit, pick } from 'lodash-es';
import { looseEqual } from '../../../../utils/equality_utils';
import { SafeHtmlDirective as SafeHtml } from '../../../../directives/safe_html/safe_html';
import { normalizeOptions } from '../../../../utils/form_options_utils';
import GlFormRadio from '../form_radio/form_radio.vue';

// Attributes to pass down to checks/radios instead of applying them to the group
const PASS_DOWN_ATTRS = ['aria-describedby', 'aria-labelledby'];

export default {
  name: 'GlFormRadioGroup',
  components: {
    GlFormRadio,
  },
  directives: {
    SafeHtml,
  },
  provide() {
    return {
      getRadioGroup: () => this,
    };
  },
  inheritAttrs: false,
  model: {
    prop: 'checked',
    event: 'input',
  },
  props: {
    /**
     * Used to set the `id` attribute on the rendered content, and used as the base to generate any additional element IDs as needed.
     */
    id: {
      type: String,
      required: false,
      default: undefined,
    },
    /**
     * The current value of the radio.
     */
    checked: {
      // `checked` prop can be any type
      type: undefined,
      required: false,
      default: null,
    },
    /**
     * Array of items to render in the component
     */
    options: {
      type: Array,
      required: false,
      default: () => [],
    },
    /**
     * When set to `true`, disables the component's functionality and places it in a disabled state.
     */
    disabled: {
      type: Boolean,
      required: false,
      default: false,
    },
    /**
     * Sets the value of the `name` attribute on the form control.
     */
    name: {
      type: String,
      required: false,
      default: undefined,
    },
    /**
     * Adds the `required` attribute to the form control.
     */
    required: {
      type: Boolean,
      required: false,
      default: false,
    },
    /**
     * Controls the validation state appearance of the component. `true` for valid, `false` for invalid, or `null` for no validation state.
     */
    state: {
      type: Boolean,
      required: false,
      default: null,
    },
    /**
     * Optional value to set for the 'aria-invalid' attribute. Supported values are 'true' and 'false'. If not set, the 'state' prop will dictate the value
     */
    ariaInvalid: {
      type: [Boolean, String],
      required: false,
      default: false,
    },
  },
  data() {
    return {
      internalId: this.id ? this.id : uniqueId('khulnasoft_ui_radio_group_'),
      localChecked: this.checked,
    };
  },
  computed: {
    formOptions() {
      return normalizeOptions(this.options);
    },
    computedState() {
      return isBoolean(this.state) ? this.state : null;
    },
    computedAriaInvalid() {
      const { ariaInvalid } = this;
      if (ariaInvalid === true || ariaInvalid === 'true' || ariaInvalid === '') {
        return 'true';
      }
      return this.computedState === false ? 'true' : ariaInvalid;
    },
    computedAttrs() {
      return {
        ...omit(this.$attrs, PASS_DOWN_ATTRS),
        id: this.internalId,
        'aria-invalid': this.computedAriaInvalid,
        'aria-required': this.required || null,
      };
    },
    passDownAttrs() {
      return pick(this.$attrs, PASS_DOWN_ATTRS);
    },
    groupName() {
      // Radios tied to the same model must have the same name, especially for
      // ARIA accessibility. This is accessed from the child GlFormRadios.
      return this.name || this.internalId;
    },
  },
  watch: {
    checked(newValue) {
      if (!looseEqual(newValue, this.localChecked)) {
        this.localChecked = newValue;
      }
    },
    localChecked(newValue, oldValue) {
      if (!looseEqual(newValue, oldValue)) {
        /**
         * Emitted when the selected value is changed.
         *
         * @event input
         */
        this.$emit('input', newValue);
      }
    },
  },
};
</script>
<template>
  <div
    v-bind="computedAttrs"
    role="radiogroup"
    tabindex="-1"
    class="gl-form-radio-group gl-outline-none"
  >
    <!-- @slot Slot for GlFormRadios that will appear before radios generated from options prop -->
    <slot name="first"></slot>
    <gl-form-radio
      v-for="(option, idx) in formOptions"
      v-bind="passDownAttrs"
      :key="idx"
      :value="option.value"
      :disabled="option.disabled"
    >
      <span v-if="option.html" v-safe-html="option.html"></span>
      <span v-else>{{ option.text }}</span>
    </gl-form-radio>
    <!-- @slot Slot for GlFormRadios that will appear after radios generated from options prop -->
    <slot></slot>
  </div>
</template>
