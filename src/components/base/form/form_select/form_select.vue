<script>
import { isObject, uniqueId, isPlainObject, isBoolean, isUndefined, isNull, get } from 'lodash-es';
import { formInputWidths } from '../../../../utils/constants';
import { isVisible } from '../../../../utils/utils';
import { SafeHtmlDirective as SafeHtml } from '../../../../directives/safe_html/safe_html';

export default {
  name: 'GlFormSelect',
  directives: {
    SafeHtml,
  },
  inheritAttrs: false,
  props: {
    /**
     * Current value of the select. Should be set to an array when the 'multiple' prop is set
     */
    value: {
      // Value can be any type!
      type: undefined,
      required: false,
      default: undefined,
    },
    /**
     * Array of items to render in the component
     */
    options: {
      type: [Array, Object],
      required: false,
      default: undefined,
    },
    /**
     * When set to a number larger than 0, will set the number of display option rows. Note not all browser will respect this setting
     * @deprecated Only useful with `multiple`, which is also deprecated.
     */
    selectSize: {
      type: Number,
      required: false,
      default: 0,
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
     * Render the form control in plain mode, rather than custom styled mode
     * @deprecated Use a native <select> element instead.
     */
    plain: {
      type: Boolean,
      required: false,
      default: false,
    },
    /**
     * Set the size of the component's appearance. 'sm', 'md' (default), or 'lg'
     * @deprecated Has no effect. Use the `width` prop instead.
     */
    size: {
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
     * Controls the validation state appearance of the component. `true` for valid, `false` for invalid, or `null` for no validation state
     */
    state: {
      // Tri-state prop: true, false, null (or undefined)
      type: Boolean,
      required: false,
      default: null,
    },
    /**
     * Field name in the `options` array that should be used for the value
     */
    valueField: {
      type: String,
      required: false,
      default: 'value',
    },
    /**
     * The key to use from the option object to get the label
     */
    labelField: {
      type: String,
      required: false,
      default: 'label',
    },
    /**
     * The key to use from the option object to get the options
     */
    optionsField: {
      type: String,
      required: false,
      default: 'options',
    },
    /**
     * Field name in the `options` array that should be used for the text label
     */
    textField: {
      type: String,
      required: false,
      default: 'text',
    },
    /**
     * Field name in the `options` array that should be used for the disabled state
     */
    disabledField: {
      type: String,
      required: false,
      default: 'disabled',
    },
    /**
     * Field name in the `options` array that should be used for the html label instead of text field
     * @deprecated Using the `.html` field (whatever its name) is potentially unsafe.
     */
    htmlField: {
      type: String,
      required: false,
      default: 'html',
    },
    /**
     * When set, allows multiple options to be selected (multi-select)
     * @deprecated Use GlCollapsibleListbox instead.
     */
    multiple: {
      type: Boolean,
      required: false,
      default: false,
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
     * Maximum width of the Select
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
     * Additional CSS class(es) to apply to the select element.
     */
    selectClass: {
      type: [String, Object, Array],
      required: false,
      default: '',
    },
  },
  data() {
    return {
      localValue: this.value,
      localId: null,
    };
  },
  computed: {
    computedId() {
      return this.id || this.localId;
    },
    computedSelectSize() {
      // Custom selects with a size of zero causes the arrows to be hidden,
      // so dont render the size attribute in this case
      return !this.plain && this.selectSize === 0 ? null : this.selectSize;
    },
    computedAriaInvalid() {
      const { ariaInvalid } = this;
      if (ariaInvalid === true || ariaInvalid === 'true' || ariaInvalid === '') {
        return 'true';
      }
      return this.computedState === false ? 'true' : ariaInvalid;
    },
    computedState() {
      // If not a boolean, ensure that value is null
      return isBoolean(this.state) ? this.state : null;
    },
    cssClasses() {
      if (this.width === null) {
        return [];
      }

      if (isObject(this.width)) {
        const { default: defaultWidth, ...nonDefaultWidths } = this.width;

        return [
          // eslint-disable-next-line @khulnasoft/tailwind-no-interpolation -- Not a CSS utility
          ...(defaultWidth ? [`gl-form-select-${defaultWidth}`] : []),
          ...Object.entries(nonDefaultWidths).map(
            // eslint-disable-next-line @khulnasoft/tailwind-no-interpolation -- Not a CSS utility
            ([breakpoint, width]) => `gl-${breakpoint}-form-select-${width}`,
          ),
        ];
      }

      // eslint-disable-next-line @khulnasoft/tailwind-no-interpolation -- Not a CSS utility
      return [`gl-form-select-${this.width}`];
    },
    stateClass() {
      if (this.computedState === true) return 'is-valid';
      if (this.computedState === false) return 'is-invalid';
      return null;
    },
    inputClass() {
      return [
        'gl-form-select',
        this.plain ? 'form-control' : 'custom-select',
        this.size && this.plain ? `form-control-${this.size}` : null,
        this.size && !this.plain ? `custom-select-${this.size}` : null,
        this.stateClass,
        this.selectClass,
      ];
    },
    normalizedOptions() {
      return this.normalizeOptions(this.options);
    },
  },
  watch: {
    value(newValue) {
      this.localValue = newValue;
    },
    localValue(newValue) {
      /**
       * Emitted when the select value changes
       *
       * @event input
       * @type {any}
       */
      this.$emit('input', newValue);
    },
  },
  activated() {
    this.handleAutofocus();
  },
  async mounted() {
    this.handleAutofocus();
    await this.$nextTick();
    // Update DOM with auto-generated ID after mount
    // to prevent SSR hydration errors
    this.localId = uniqueId('gl-form-select-');
  },
  methods: {
    focus() {
      this.$refs.select?.focus();
    },
    blur() {
      this.$refs.select?.blur();
    },
    normalizeOptions(options) {
      // Normalize the given options array
      if (Array.isArray(options)) return options.map((option) => this.normalizeOption(option));

      if (isPlainObject(options)) {
        if (process.env.NODE_ENV !== 'production') {
          // Deprecate the object options format
          // eslint-disable-next-line no-console
          console.warn(
            '[@khulnasoft/ui] GlFormSelect - Setting prop "options" to an object is deprecated. Use the array format instead.',
          );
        }

        // Normalize a `options` object to an array of options
        return Object.keys(options).map((key) => this.normalizeOption(options[key] || {}, key));
      }

      // If not an array or object, return an empty array
      return [];
    },
    normalizeOption(option, key = null) {
      // When the option is an object, normalize it
      if (isPlainObject(option)) {
        const value = get(option, this.valueField);
        const text = get(option, this.textField);
        const options = get(option, this.optionsField, null);
        // When it has options, create an <optgroup> object
        if (!isNull(options)) {
          return {
            label: String(get(option, this.labelField) || text),
            options: this.normalizeOptions(options),
          };
        }
        // Otherwise create an <option> object
        return {
          value: isUndefined(value) ? key || text : value,
          text: String(isUndefined(text) ? key : text),
          html: get(option, this.htmlField),
          disabled: Boolean(get(option, this.disabledField)),
        };
      }
      // Otherwise create an <option> object from the given value
      return {
        value: key || option,
        text: String(option),
        disabled: false,
      };
    },
    isOptionGroup(option) {
      return Array.isArray(option.options);
    },
    async onChange(event) {
      const { target } = event;
      const selectedValue = Array.from(target.options)
        .filter((option) => option.selected)
        // NOTE: the _value property is set up by both Vue 2 and 3 explicitly for the
        // purpose of handling non-string values on form elements.
        //
        // See:
        // - https://github.com/vuejs/vue/blob/v2.7.16/src/platforms/web/runtime/modules/dom-props.ts#L42-L44
        // - https://github.com/vuejs/vue/blob/v2.7.16/test/unit/modules/vdom/modules/dom-props.spec.ts#L38
        // - https://github.com/vuejs/core/blob/v3.4.27/packages/runtime-dom/src/modules/props.ts#L48-L50
        // - https://github.com/vuejs/core/blob/v3.4.27/packages/runtime-dom/__tests__/patchProps.spec.ts#L25
        // eslint-disable-next-line no-underscore-dangle
        .map((option) => ('_value' in option ? option._value : option.value));

      this.localValue = target.multiple ? selectedValue : selectedValue[0];

      await this.$nextTick();
      /**
       * Emitted when the select value changes via user interaction
       *
       * @event change
       * @type {any}
       */
      this.$emit('change', this.localValue);
    },
    async handleAutofocus() {
      await this.$nextTick();
      window.requestAnimationFrame(() => {
        if (this.autofocus && isVisible(this.$refs.select)) this.focus();
      });
    },
  },
};
</script>
<template>
  <span class="gl-form-select-wrapper" :class="cssClasses">
    <select
      :id="computedId"
      ref="select"
      v-model="localValue"
      :aria-invalid="computedAriaInvalid"
      :aria-required="required ? 'true' : null"
      :class="inputClass"
      :disabled="disabled"
      :form="form"
      :multiple="multiple"
      :name="name"
      :required="required"
      :size="computedSelectSize"
      v-bind="$attrs"
      @change="onChange"
    >
      <!-- @slot Slot to place options or option groups above options provided via the 'options' prop -->
      <slot name="first"></slot>

      <template v-for="(option, index) of normalizedOptions">
        <template v-if="isOptionGroup(option)">
          <optgroup :key="index" :label="option.label">
            <template v-for="(childOption, childIndex) of option.options">
              <option
                v-if="childOption.html"
                :key="`${childIndex}-html`"
                v-safe-html="childOption.html"
                :value="childOption.value"
                :disabled="childOption.disabled"
              ></option>
              <option
                v-else
                :key="childIndex"
                :value="childOption.value"
                :disabled="childOption.disabled"
              >
                {{ childOption.text }}
              </option>
            </template>
          </optgroup>
        </template>

        <template v-else>
          <option
            v-if="option.html"
            :key="`${index}-html`"
            v-safe-html="option.html"
            :value="option.value"
            :disabled="option.disabled"
          ></option>
          <option v-else :key="index" :value="option.value" :disabled="option.disabled">
            {{ option.text }}
          </option>
        </template>
      </template>

      <!-- @slot Content to place in the form select after 'options' prop options -->
      <slot></slot>
    </select>
  </span>
</template>
