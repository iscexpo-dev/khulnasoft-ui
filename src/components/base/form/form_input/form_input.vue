<script>
import { isObject, uniqueId, isBoolean, toInteger, toString } from 'lodash-es';

import { toFloat } from '../../../../utils/number_utils';
import { isVisible, stopEvent } from '../../../../utils/utils';
import { formInputWidths } from '../../../../utils/constants';

// Valid supported input types
const TYPES = [
  'text',
  'password',
  'email',
  'number',
  'url',
  'tel',
  'search',
  'range',
  'color',
  'date',
  'time',
  'datetime',
  'datetime-local',
  'month',
  'week',
];

const MODEL_PROP = 'value';
const MODEL_EVENT = 'input';

export default {
  name: 'GlFormInput',
  model: {
    prop: MODEL_PROP,
    event: MODEL_EVENT,
  },
  props: {
    /**
     * The current value of the input. Result will always be a string, except when the `number` prop is used
     */
    value: {
      type: [Number, String],
      required: false,
      default: '',
    },
    /**
     * The type of input to render.
     */
    type: {
      type: String,
      required: false,
      default: 'text',
      validator: (value) => TYPES.includes(value),
    },
    /**
     * Maximum width of the input
     */
    width: {
      type: [String, Object],
      required: false,
      default: null,
      validator: (value) => {
        const widths = isObject(value) ? Object.values(value) : [value];

        return widths.every((width) => Object.values(formInputWidths).includes(width));
      },
    },
    /**
     * Used to set the `id` attribute on the rendered content, and used as the base to generate any additional element IDs as needed
     */
    id: {
      type: String,
      required: false,
      default: undefined,
    },
    /**
     * When set to `true`, attempts to auto-focus the control when it is mounted, or re-activated when in a keep-alive. Does not set the `autofocus` attribute on the control
     */
    autofocus: {
      type: Boolean,
      required: false,
      default: false,
    },
    /**
     * When set to `true`, disables the component's functionality and places it in a disabled state
     */
    disabled: {
      type: Boolean,
      required: false,
      default: false,
    },
    /**
     * ID of the form that the form control belongs to. Sets the `form` attribute on the control
     */
    form: {
      type: String,
      required: false,
      default: undefined,
    },
    /**
     * Sets the value of the `name` attribute on the form control
     */
    name: {
      type: String,
      required: false,
      default: undefined,
    },
    /**
     * Adds the `required` attribute to the form control
     */
    required: {
      type: Boolean,
      required: false,
      default: false,
    },
    /**
     * Controls the validation state appearance of the component. `true` for valid, `false` for invalid, or `null` for no validation state
     */
    state: {
      type: Boolean,
      required: false,
      default: null,
    },
    /**
     * Sets the `placeholder` attribute value on the form control
     */
    placeholder: {
      type: String,
      required: false,
      default: undefined,
    },
    /**
     * Optional value to set for the 'aria-invalid' attribute. Supported values are 'true' and 'false'. If not set, the 'state' prop will dictate the value
     */
    ariaInvalid: {
      type: [Boolean, String],
      required: false,
      default: false,
    },
    /**
     * Sets the 'autocomplete' attribute value on the form control
     */
    autocomplete: {
      type: String,
      required: false,
      default: undefined,
    },
    /**
     * When set to a number of milliseconds greater than zero, will debounce the user input. Has no effect if prop 'lazy' is set
     */
    debounce: {
      type: [Number, String],
      required: false,
      default: undefined,
    },
    /**
     * Reference to a function for formatting the input
     */
    formatter: {
      type: Function,
      required: false,
      default: undefined,
    },
    /**
     * When set, updates the v-model on 'change'/'blur' events instead of 'input'. Emulates the Vue '.lazy' v-model modifier
     */
    lazy: {
      type: Boolean,
      required: false,
      default: false,
    },
    /**
     * When set, the input is formatted on blur instead of each keystroke (if there is a formatter specified)
     */
    lazyFormatter: {
      type: Boolean,
      required: false,
      default: false,
    },
    /**
     * When set attempts to convert the input value to a native number. Emulates the Vue '.number' v-model modifier
     */
    number: {
      type: Boolean,
      required: false,
      default: false,
    },
    /**
     * Set the form control as readonly and renders the control to look like plain text (no borders)
     */
    plaintext: {
      type: Boolean,
      required: false,
      default: false,
    },
    /**
     * Sets the `readonly` attribute on the form control
     */
    readonly: {
      type: Boolean,
      required: false,
      default: false,
    },
    /**
     * When set, trims any leading and trailing white space from the input value. Emulates the Vue '.trim' v-model modifier
     */
    trim: {
      type: Boolean,
      required: false,
      default: false,
    },
    /**
     * The ID of the associated datalist element or component
     */
    list: {
      type: String,
      required: false,
      default: undefined,
    },
    /**
     * Value to set in the 'max' attribute on the input. Used by number-like inputs
     */
    max: {
      type: [Number, String],
      required: false,
      default: undefined,
    },
    /**
     * Value to set in the 'min' attribute on the input. Used by number-like inputs
     */
    min: {
      type: [Number, String],
      required: false,
      default: undefined,
    },
    /**
     * Value to set in the 'step' attribute on the input. Used by number-like inputs
     */
    step: {
      type: [Number, String],
      required: false,
      default: undefined,
    },
  },
  data() {
    return {
      localValue: toString(this.value),
      vModelValue: this.modifyValue(this.value),
      localId: null,
    };
  },
  computed: {
    computedId() {
      return this.id || this.localId;
    },
    localType() {
      // We only allow certain types
      const { type } = this;
      return TYPES.includes(type) ? type : 'text';
    },
    computedAriaInvalid() {
      const { ariaInvalid } = this;
      if (ariaInvalid === true || ariaInvalid === 'true' || ariaInvalid === '') {
        return 'true';
      }
      return this.computedState === false ? 'true' : ariaInvalid;
    },
    computedAttrs() {
      const { localType: type, name, form, disabled, placeholder, required, min, max, step } = this;

      return {
        id: this.computedId,
        name,
        form,
        type,
        disabled,
        placeholder,
        required,
        autocomplete: this.autocomplete || null,
        readonly: this.readonly || this.plaintext,
        min,
        max,
        step,
        list: type !== 'password' ? this.list : null,
        'aria-required': required ? 'true' : null,
        'aria-invalid': this.computedAriaInvalid,
      };
    },
    computedState() {
      // If not a boolean, ensure that value is null
      return isBoolean(this.state) ? this.state : null;
    },
    stateClass() {
      if (this.computedState === true) return 'is-valid';
      if (this.computedState === false) return 'is-invalid';
      return null;
    },
    widthClasses() {
      if (this.width === null) {
        return [];
      }

      if (isObject(this.width)) {
        const { default: defaultWidth, ...nonDefaultWidths } = this.width;

        return [
          // eslint-disable-next-line @khulnasoft/tailwind-no-interpolation -- Not a CSS utility
          ...(defaultWidth ? [`gl-form-input-${defaultWidth}`] : []),
          ...Object.entries(nonDefaultWidths).map(
            // eslint-disable-next-line @khulnasoft/tailwind-no-interpolation -- Not a CSS utility
            ([breakpoint, width]) => `gl-${breakpoint}-form-input-${width}`,
          ),
        ];
      }

      // eslint-disable-next-line @khulnasoft/tailwind-no-interpolation -- Not a CSS utility
      return [`gl-form-input-${this.width}`];
    },
    computedClass() {
      const { plaintext, type } = this;
      const isRange = type === 'range';
      const isColor = type === 'color';

      return [
        ...this.widthClasses,
        {
          // Range input needs class `custom-range`
          'custom-range': isRange,
          // `plaintext` not supported by `type="range"` or `type="color"`
          'form-control-plaintext': plaintext && !isRange && !isColor,
          // `form-control` not used by `type="range"` or `plaintext`
          // Always used by `type="color"`
          'form-control': isColor || (!plaintext && !isRange),
        },
        this.stateClass,
      ];
    },
    computedListeners() {
      return {
        ...this.$listeners,
        input: this.onInput,
        change: this.onChange,
        blur: this.onBlur,
      };
    },
    computedDebounce() {
      // Ensure we have a positive number equal to or greater than 0
      return Math.max(toInteger(this.debounce), 0);
    },
    hasFormatter() {
      return typeof this.formatter === 'function';
    },
    noWheel() {
      return this.type === 'number';
    },
  },
  watch: {
    value(newValue) {
      const stringifyValue = toString(newValue);
      const modifiedValue = this.modifyValue(newValue);
      if (stringifyValue !== this.localValue || modifiedValue !== this.vModelValue) {
        // Clear any pending debounce timeout, as we are overwriting the user input
        this.clearDebounce();
        // Update the local values
        this.localValue = stringifyValue;
        this.vModelValue = modifiedValue;
      }
    },
    noWheel(newValue) {
      this.setWheelStopper(newValue);
    },
  },
  created() {
    // Create private non-reactive props
    this.$_inputDebounceTimer = null;
  },
  async mounted() {
    this.setWheelStopper(this.noWheel);
    this.handleAutofocus();
    await this.$nextTick();
    // Update DOM with auto-generated ID after mount
    // to prevent SSR hydration errors
    this.localId = uniqueId('gl-form-input-');
  },
  deactivated() {
    // Turn off listeners when keep-alive component deactivated
    this.setWheelStopper(false);
  },
  activated() {
    // Turn on listeners (if no-wheel) when keep-alive component activated
    this.setWheelStopper(this.noWheel);
    this.handleAutofocus();
  },
  beforeDestroy() {
    this.setWheelStopper(false);
    this.clearDebounce();
  },
  methods: {
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
    clearDebounce() {
      clearTimeout(this.$_inputDebounceTimer);
      this.$_inputDebounceTimer = null;
    },
    formatValue(value, event, force = false) {
      let newValue = toString(value);
      if (this.hasFormatter && (!this.lazyFormatter || force)) {
        newValue = this.formatter(value, event);
      }
      return newValue;
    },
    modifyValue(value) {
      let newValue = toString(value);
      // Emulate `.trim` modifier behaviour
      if (this.trim) {
        newValue = newValue.trim();
      }
      // Emulate `.number` modifier behaviour
      if (this.number) {
        newValue = toFloat(newValue, newValue);
      }
      return newValue;
    },
    updateValue(value, force = false) {
      const { lazy } = this;
      if (lazy && !force) {
        return;
      }
      // Make sure to always clear the debounce when `updateValue()`
      // is called, even when the v-model hasn't changed
      this.clearDebounce();
      // Define the shared update logic in a method to be able to use
      // it for immediate and debounced value changes
      const doUpdate = () => {
        const newValue = this.modifyValue(value);
        if (newValue !== this.vModelValue) {
          this.vModelValue = newValue;
          this.$emit(MODEL_EVENT, newValue);
        } else if (this.hasFormatter) {
          // When the `vModelValue` hasn't changed but the actual input value
          // is out of sync, make sure to change it to the given one
          // Usually caused by browser autocomplete and how it triggers the
          // change or input event, or depending on the formatter function
          // https://github.com/bootstrap-vue/bootstrap-vue/issues/2657
          // https://github.com/bootstrap-vue/bootstrap-vue/issues/3498
          const $input = this.$refs.input;
          if ($input && newValue !== $input.value) {
            $input.value = newValue;
          }
        }
      };
      // Only debounce the value update when a value greater than `0`
      // is set and we are not in lazy mode or this is a forced update
      if (this.computedDebounce > 0 && !lazy && !force) {
        this.$_inputDebounceTimer = setTimeout(doUpdate, this.computedDebounce);
      } else {
        // Immediately update the v-model
        doUpdate();
      }
    },
    onInput(event) {
      const { value } = event.target;
      const formattedValue = this.formatValue(value, event);
      // Exit when the `formatter` function strictly returned `false`
      // or prevented the input event
      if (formattedValue === false || event.defaultPrevented) {
        stopEvent(event, { propagation: false });
        return;
      }
      this.localValue = formattedValue;
      this.updateValue(formattedValue);
      /**
       * The `input` and `update` events are swapped
       * see https://github.com/khulnasoft/khulnasoft-ui/-/merge_requests/1628
       */
      this.$emit('update', formattedValue);
    },
    onChange(event) {
      const { value } = event.target;
      const formattedValue = this.formatValue(value, event);
      // Exit when the `formatter` function strictly returned `false`
      // or prevented the input event
      if (formattedValue === false || event.defaultPrevented) {
        stopEvent(event, { propagation: false });
        return;
      }
      this.localValue = formattedValue;
      this.updateValue(formattedValue, true);
      this.$emit('change', formattedValue);
    },
    onBlur(event) {
      // Apply the `localValue` on blur to prevent cursor jumps
      // on mobile browsers (e.g. caused by autocomplete)
      const { value } = event.target;
      const formattedValue = this.formatValue(value, event, true);
      if (formattedValue !== false) {
        // We need to use the modified value here to apply the
        // `.trim` and `.number` modifiers properly
        this.localValue = toString(this.modifyValue(formattedValue));
        // We pass the formatted value here since the `updateValue` method
        // handles the modifiers itself
        this.updateValue(formattedValue, true);
      }
      // Emit native blur event
      this.$emit('blur', event);
    },
    setWheelStopper(on) {
      const { input } = this.$refs;
      // We use native events, so that we don't interfere with propagation
      if (on) {
        input.addEventListener('focus', this.onWheelFocus);
        input.addEventListener('blur', this.onWheelBlur);
      } else {
        input.removeEventListener('focus', this.onWheelFocus);
        input.removeEventListener('blur', this.onWheelBlur);
        document.removeEventListener('wheel', this.stopWheel);
      }
    },
    onWheelFocus() {
      document.addEventListener('wheel', this.stopWheel);
    },
    onWheelBlur() {
      document.removeEventListener('wheel', this.stopWheel);
    },
    stopWheel(event) {
      stopEvent(event, { propagation: false });
      this.blur();
    },
    async handleAutofocus() {
      await this.$nextTick();
      window.requestAnimationFrame(() => {
        if (this.autofocus && isVisible(this.$refs.input)) this.focus();
      });
    },
    select(...args) {
      // For external handler that may want a select() method
      this.$refs.input.select(args);
    },
    setSelectionRange(...args) {
      // For external handler that may want a setSelectionRange(a,b,c) method
      this.$refs.input.setSelectionRange(args);
    },
    setRangeText(...args) {
      // For external handler that may want a setRangeText(a,b,c) method
      this.$refs.input.setRangeText(args);
    },
    setCustomValidity(...args) {
      // For external handler that may want a setCustomValidity(...) method
      return this.$refs.input.setCustomValidity(args);
    },
    checkValidity(...args) {
      // For external handler that may want a checkValidity(...) method
      return this.$refs.input.checkValidity(args);
    },
    reportValidity(...args) {
      // For external handler that may want a reportValidity(...) method
      return this.$refs.input.reportValidity(args);
    },
  },
};
</script>

<template>
  <input
    ref="input"
    :value="localValue"
    class="gl-form-input"
    :class="computedClass"
    v-bind="computedAttrs"
    v-on="computedListeners"
  />
</template>
