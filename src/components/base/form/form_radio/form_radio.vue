<script>
import { isBoolean, uniqueId } from 'lodash-es';
import { looseEqual } from '../../../../utils/equality_utils';

export default {
  name: 'GlFormRadio',
  inject: {
    getRadioGroup: {
      default: () => () => null,
    },
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
     * The current value of the radio. When bound to multiple radios, this is the value of the currently selected radio.
     */
    checked: {
      // `checked` prop can be any type
      type: undefined,
      required: false,
      default: null,
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
     * Value returned when this radio is selected.
     */
    value: {
      // `value` prop can be any type
      type: undefined,
      required: false,
      default: true,
    },
  },
  data() {
    const group = this.getRadioGroup();
    return {
      internalId: this.id ? this.id : uniqueId('khulnasoft_ui_radio_'),
      localChecked: group ? group.checked : this.checked,
    };
  },
  computed: {
    computedLocalChecked: {
      get() {
        return this.isGroup ? this.group.localChecked : this.localChecked;
      },
      set(value) {
        if (this.isGroup) {
          this.group.localChecked = value;
        } else {
          this.localChecked = value;
        }
      },
    },
    group() {
      return this.getRadioGroup();
    },
    isGroup() {
      // Is this radio a child of radio-group?
      return Boolean(this.group);
    },
    computedState() {
      if (this.isGroup) return this.group.computedState;
      return isBoolean(this.state) ? this.state : null;
    },
    stateClass() {
      if (this.computedState === true) return 'is-valid';
      if (this.computedState === false) return 'is-invalid';
      return null;
    },
    computedAriaInvalid() {
      return this.computedState === false ? 'true' : null;
    },
    isChecked() {
      return looseEqual(this.computedLocalChecked, this.value);
    },
    isDisabled() {
      // Child can be disabled while parent isn't, but is always disabled if group is
      return this.isGroup ? this.group.disabled || this.disabled : this.disabled;
    },
    isRequired() {
      // Required only works when a name is provided for the input(s)
      // Child can only be required when parent is
      // Groups will always have a name (either user supplied or auto generated)
      return this.computedName && (this.isGroup ? this.group.required : this.required);
    },
    computedName() {
      // Group name preferred over local name
      return (this.isGroup ? this.group.groupName : this.name) || null;
    },
    computedAttrs() {
      const { isDisabled: disabled, isRequired: required, value, isChecked: checked } = this;

      return {
        ...this.$attrs,
        id: this.internalId,
        name: this.computedName,
        disabled,
        required,
        value,
        checked,
        'aria-required': required || null,
        'aria-invalid': this.computedAriaInvalid,
      };
    },
  },
  watch: {
    checked(...args) {
      this.checkedWatcher(...args);
    },
    computedLocalChecked(...args) {
      this.computedLocalCheckedWatcher(...args);
    },
  },
  methods: {
    checkedWatcher(newValue) {
      if (!looseEqual(newValue, this.computedLocalChecked)) {
        this.computedLocalChecked = newValue;
      }
    },
    computedLocalCheckedWatcher(newValue, oldValue) {
      if (!looseEqual(newValue, oldValue)) {
        /**
         * Emitted when the selected value is changed
         *
         * @event input
         * @type {boolean} current selected value of radio group
         */
        this.$emit('input', newValue);
      }
    },
    async handleChange() {
      const { value } = this;

      // Update `computedLocalChecked`
      this.computedLocalChecked = value;

      // Fire events in a `$nextTick()` to ensure the `v-model` is updated
      await this.$nextTick();
      /**
       * Emitted when the selected value is changed due to user interaction
       *
       * @event change
       * @type {boolean} current selected value of radio group
       */
      this.$emit('change', value);

      // If this is a child of a group, we emit a change event on it as well
      if (this.isGroup) {
        /**
         * Emitted when the selected value is changed due to user interaction
         *
         * @event change
         * @type {boolean} current selected value of radio group
         */
        this.group.$emit('change', value);
      }
    },
    focus() {
      if (!this.disabled) {
        this.$refs.input?.focus();
      }
    },
    blur() {
      if (!this.disabled) {
        this.$refs.input?.blur();
      }
    },
  },
};
</script>

<template>
  <div class="gl-form-radio custom-radio custom-control">
    <input
      ref="input"
      key="input"
      v-bind="computedAttrs"
      type="radio"
      class="custom-control-input"
      :class="stateClass"
      @change="handleChange"
    />
    <label :for="internalId" class="custom-control-label">
      <!-- @slot Content to use for the label -->
      <slot></slot>
      <p v-if="Boolean($scopedSlots.help)" class="help-text">
        <!-- @slot Content provided here will be shown beneath the radio. Typically used for help or descriptive text. -->
        <slot name="help"></slot>
      </p>
    </label>
  </div>
</template>
