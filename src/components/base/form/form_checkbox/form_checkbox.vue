<script>
import { uniqueId, isBoolean } from 'lodash-es';
import { looseEqual, looseIndexOf } from '../../../../utils/equality_utils';

export default {
  name: 'GlFormCheckbox',
  inject: {
    getCheckboxGroup: {
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
     * The current value of the checkbox(es). Must be an array when there are multiple checkboxes bound to the same v-model.
     */
    checked: {
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
     * Sets the value of `aria-label` attribute on the rendered element.
     */
    ariaLabel: {
      type: String,
      required: false,
      default: undefined,
    },
    /**
     * The ID of the element that provides a label for this component. Used as the value for the `aria-labelledby` attribute.
     */
    ariaLabelledby: {
      type: String,
      required: false,
      default: undefined,
    },
    /**
     * Renders the checkbox in an indeterminate state. Syncable via the .sync modifier.
     */
    indeterminate: {
      type: Boolean,
      required: false,
      default: false,
    },
    /**
     * Value returned when this checkbox is checked.
     */
    value: {
      // `value` prop can be any type
      type: undefined,
      required: false,
      default: true,
    },
    /**
     * Value returned when this checkbox is unchecked. Note not applicable when multiple checkboxes bound to the same v-model array.
     */
    uncheckedValue: {
      // `uncheckedValue` prop can be any type
      type: undefined,
      required: false,
      default: false,
    },
  },
  data() {
    const group = this.getCheckboxGroup();
    return {
      internalId: this.id ? this.id : uniqueId('khulnasoft_ui_checkbox_'),
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
      return this.getCheckboxGroup();
    },
    isGroup() {
      // Is this check a child of check-group?
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
      const { value, computedLocalChecked: checked } = this;
      return Array.isArray(checked)
        ? looseIndexOf(checked, value) > -1
        : looseEqual(checked, value);
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
        'aria-label': this.ariaLabel || null,
        'aria-labelledby': this.ariaLabelledby || null,
      };
    },
  },
  watch: {
    checked(...args) {
      this.checkedWatcher(...args);
    },
    indeterminate(newValue, oldValue) {
      if (!looseEqual(newValue, oldValue)) {
        this.setIndeterminate(newValue);
      }
    },
    computedLocalChecked(...args) {
      this.computedLocalCheckedWatcher(...args);
    },
  },
  mounted() {
    // Set initial indeterminate state
    this.setIndeterminate(this.indeterminate);
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
         * Emitted when checked state is changed.
         *
         * @event input
         */
        this.$emit('input', newValue);

        const { input } = this.$refs;
        if (input) {
          this.$emit('update:indeterminate', input.indeterminate);
        }
      }
    },
    async handleChange({ target: { checked, indeterminate } }) {
      const { value, uncheckedValue } = this;

      // Update `computedLocalChecked`
      let localChecked = this.computedLocalChecked;
      if (Array.isArray(localChecked)) {
        const index = looseIndexOf(localChecked, value);
        if (checked && index < 0) {
          // Add value to array
          localChecked = localChecked.concat(value);
        } else if (!checked && index > -1) {
          // Remove value from array
          localChecked = localChecked.slice(0, index).concat(localChecked.slice(index + 1));
        }
      } else {
        localChecked = checked ? value : uncheckedValue;
      }
      this.computedLocalChecked = localChecked;

      // Fire events in a `$nextTick()` to ensure the `v-model` is updated
      await this.$nextTick();
      /**
       * Emitted when selected value(s) is changed due to user interaction.
       *
       * @event change
       */
      this.$emit('change', localChecked);

      // If this is a child of a group, we emit a change event on it as well
      if (this.isGroup) {
        /**
         * Emitted when selected value(s) is changed due to user interaction.
         *
         * @event change
         */
        this.group.$emit('change', localChecked);
      }

      this.$emit('indeterminate', indeterminate);
    },
    setIndeterminate(state) {
      // Indeterminate only supported in single checkbox mode
      const computedState = Array.isArray(this.computedLocalChecked) ? false : state;

      const { input } = this.$refs;
      if (input) {
        input.indeterminate = computedState;
        // Emit update event to prop
        this.$emit('update:indeterminate', computedState);
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
  <div class="gl-form-checkbox custom-checkbox custom-control">
    <input
      ref="input"
      key="input"
      v-bind="computedAttrs"
      type="checkbox"
      class="custom-control-input"
      :class="stateClass"
      @change="handleChange"
    />
    <label :for="internalId" class="custom-control-label">
      <!-- @slot The checkbox content to display. -->
      <slot></slot>
      <p v-if="Boolean($scopedSlots.help)" class="help-text">
        <!-- @slot The help text to display. -->
        <slot name="help"></slot>
      </p>
    </label>
  </div>
</template>
