<script>
import { uniqueId, isBoolean, toInteger, toString } from "lodash-es";
import { toFloat } from "../../../../utils/number_utils";
import { isVisible, stopEvent } from "../../../../utils/utils";
import GlFormCharacterCount from "../form_character_count/form_character_count.vue";
import { GlVisibleDirective } from "./visible";

export default {
  name: "GlFormTextarea",
  components: {
    GlFormCharacterCount,
  },
  directives: {
    GlVisible: GlVisibleDirective,
  },
  inheritAttrs: false,
  model: {
    prop: "value",
    event: "input",
  },
  props: {
    /**
     * The current value of the textarea.
     */
    value: {
      type: String,
      required: false,
      default: "",
    },
    /**
     * When true, prevents the textarea from being resized by the user (hides the resize handle).
     */
    noResize: {
      type: Boolean,
      required: false,
      default: true,
    },
    /**
     * When true, emits a submit event when Ctrl+Enter or Cmd+Enter is pressed.
     */
    submitOnEnter: {
      type: Boolean,
      required: false,
      default: false,
    },
    /**
     * Max character count for the textarea.
     */
    characterCountLimit: {
      type: Number,
      required: false,
      default: null,
    },
    /**
     * Additional CSS class(es) to apply to the textarea element.
     */
    textareaClasses: {
      type: [String, Object, Array],
      required: false,
      default: null,
    },
    /**
     * Number of visible text rows in the textarea.
     */
    rows: {
      type: [Number, String],
      required: false,
      default: 4,
    },
    /**
     * Used to set the `id` attribute on the rendered content.
     */
    id: {
      type: String,
      required: false,
      default: undefined,
    },
    /**
     * When set to `true`, attempts to auto-focus the control when it is mounted.
     */
    autofocus: {
      type: Boolean,
      required: false,
      default: false,
    },
    /**
     * When set to `true`, disables the component's functionality.
     */
    disabled: {
      type: Boolean,
      required: false,
      default: false,
    },
    /**
     * ID of the form that the form control belongs to. Sets the `form` attribute on the control.
     */
    form: {
      type: String,
      required: false,
      default: undefined,
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
     * Controls the validation state appearance of the component.
     * `true` for valid, `false` for invalid, or `null` for no validation state.
     */
    state: {
      type: Boolean,
      required: false,
      default: null,
    },
    /**
     * Optional value to set for the 'aria-invalid' attribute.
     */
    ariaInvalid: {
      type: [Boolean, String],
      required: false,
      default: false,
    },
    /**
     * Sets the 'autocomplete' attribute value on the form control.
     */
    autocomplete: {
      type: String,
      required: false,
      default: undefined,
    },
    /**
     * When set to a number of milliseconds greater than zero, will debounce the user input.
     */
    debounce: {
      type: [Number, String],
      required: false,
      default: 0,
    },
    /**
     * Reference to a function for formatting the input.
     */
    formatter: {
      type: Function,
      required: false,
      default: undefined,
    },
    /**
     * Sets the `placeholder` attribute value on the form control.
     */
    placeholder: {
      type: String,
      required: false,
      default: undefined,
    },
    /**
     * Sets the `readonly` attribute on the form control.
     */
    readonly: {
      type: Boolean,
      required: false,
      default: false,
    },
    /**
     * Set the size of the component's appearance. 'sm' or 'lg'. Defaults to medium size when omitted.
     */
    size: {
      type: String,
      required: false,
      default: undefined,
    },
    /**
     * The maximum number of rows to show. When set, enables auto-height.
     */
    maxRows: {
      type: [Number, String],
      required: false,
      default: undefined,
    },
  },
  data() {
    return {
      localValue: toString(this.value),
      vModelValue: this.value,
      localId: null,
      heightInPx: null,
      characterCountTextId: uniqueId("form-textarea-character-count-"),
    };
  },
  computed: {
    computedId() {
      return this.id || this.localId;
    },
    computedState() {
      return isBoolean(this.state) ? this.state : null;
    },
    stateClass() {
      if (this.computedState === true) return "is-valid";
      if (this.computedState === false) return "is-invalid";
      return null;
    },
    computedAriaInvalid() {
      const { ariaInvalid } = this;
      if (
        ariaInvalid === true ||
        ariaInvalid === "true" ||
        ariaInvalid === ""
      ) {
        return "true";
      }
      return this.computedState === false ? "true" : ariaInvalid;
    },
    sizeClass() {
      return this.size ? `form-control-${this.size}` : null;
    },
    computedDebounce() {
      return Math.max(toInteger(this.debounce), 0);
    },
    hasFormatter() {
      return typeof this.formatter === "function";
    },
    computedMinRows() {
      // Ensure rows is at least 2 and positive (2 is the native textarea value)
      // A value of 1 can cause issues in some browsers, and most browsers
      // only support 2 as the smallest value
      return Math.max(toInteger(this.rows), 2);
    },
    computedMaxRows() {
      return Math.max(this.computedMinRows, toInteger(this.maxRows));
    },
    computedRows() {
      // This is used to set the attribute 'rows' on the textarea
      // If auto-height is enabled, then we return `null` as we use CSS to control height
      return this.computedMinRows === this.computedMaxRows
        ? this.computedMinRows
        : null;
    },
    computedStyle() {
      const styles = {
        // Setting `noResize` to true will disable the ability for the user to
        // manually resize the textarea. We also disable when in auto height mode
        resize: !this.computedRows || this.noResize ? "none" : null,
      };
      if (!this.computedRows) {
        // Conditionally set the computed CSS height when auto rows/height is enabled
        // We avoid setting the style to `null`, which can override user manual resize handle
        styles.height = this.heightInPx;
        // We always add a vertical scrollbar to the textarea when auto-height is
        // enabled so that the computed height calculation returns a stable value
        styles.overflowY = "scroll";
      }
      return styles;
    },
    computedAttrs() {
      const { disabled, required, readonly } = this;

      return {
        ...this.$attrs,
        id: this.computedId,
        name: this.name || null,
        form: this.form || null,
        disabled,
        placeholder: this.placeholder || null,
        required,
        autocomplete: this.autocomplete || null,
        readonly,
        rows: this.computedRows,
        "aria-required": required ? "true" : null,
        "aria-invalid": this.computedAriaInvalid,
      };
    },
    computedClass() {
      return [
        "gl-form-input",
        "gl-form-textarea",
        "form-control",
        this.textareaClasses,
        this.sizeClass,
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
    keypressEvent() {
      return this.submitOnEnter ? "keyup" : null;
    },
    showCharacterCount() {
      return this.characterCountLimit !== null;
    },
  },
  watch: {
    value(newValue) {
      const stringifyValue = toString(newValue);
      if (stringifyValue !== this.localValue || newValue !== this.vModelValue) {
        this.clearDebounce();
        this.localValue = stringifyValue;
        this.vModelValue = newValue;
      }
    },
    localValue() {
      this.setHeight();
    },
  },
  created() {
    this.$_inputDebounceTimer = null;
  },
  async mounted() {
    this.handleAutofocus();
    await this.$nextTick();
    this.localId = uniqueId("gl-form-textarea-");
  },
  beforeDestroy() {
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
    formatValue(value, event) {
      let newValue = toString(value);
      if (this.hasFormatter) {
        newValue = this.formatter(newValue, event);
      }
      return newValue;
    },
    updateValue(value, force = false) {
      this.clearDebounce();

      const doUpdate = () => {
        if (value !== this.vModelValue) {
          this.vModelValue = value;
          /**
           * Triggered by user interaction.
           * Emitted after any formatting (not including 'trim' or 'number' props).
           * Useful for getting the currently entered value when the 'debounce'is set.
           *
           * @event input
           */
          this.$emit("input", value);
        } else if (this.hasFormatter) {
          const { input } = this.$refs;
          if (input && value !== input.value) {
            input.value = value;
          }
        }
      };

      if (this.computedDebounce > 0 && !force) {
        this.$_inputDebounceTimer = setTimeout(doUpdate, this.computedDebounce);
      } else {
        doUpdate();
      }
    },
    onInput(event) {
      const { value } = event.target;
      const formattedValue = this.formatValue(value, event);
      if (formattedValue === false || event.defaultPrevented) {
        stopEvent(event, { propagation: false });
        return;
      }
      this.localValue = formattedValue;
      this.updateValue(formattedValue);
      /**
       * The `input` and `update` events are swapped
       * see https://github.com/khulnasoft/khulnasoft-ui/pull/1628
       *
       * @event update
       */
      this.$emit("update", formattedValue);
    },
    onChange(event) {
      const { value } = event.target;
      const formattedValue = this.formatValue(value, event);
      if (formattedValue === false || event.defaultPrevented) {
        stopEvent(event, { propagation: false });
        return;
      }
      this.localValue = formattedValue;
      this.updateValue(formattedValue, true);
      /**
       * Change event triggered by user interaction.
       * Emitted after any formatting (not including 'trim' or 'number' props)
       * and after the v-model is updated. The `input` and `update` events are swapped
       * see https://github.com/khulnasoft/khulnasoft-ui/pull/1628
       *
       * @event change
       */
      this.$emit("change", formattedValue);
    },
    onBlur(event) {
      const { value } = event.target;
      const formattedValue = this.formatValue(value, event);
      if (formattedValue !== false) {
        this.localValue = toString(formattedValue);
        this.updateValue(formattedValue, true);
      }
      /**
       * Emitted after the textarea loses focus
       *
       * @event blur
       */
      this.$emit("blur", event);
    },
    async handleAutofocus() {
      await this.$nextTick();
      window.requestAnimationFrame(() => {
        if (this.autofocus && isVisible(this.$refs.input)) {
          this.focus();
        }
      });
    },
    handleKeyPress(e) {
      if (this.submitOnEnter && e.keyCode === 13 && (e.metaKey || e.ctrlKey)) {
        /**
         * Emitted after enter is pressed in textarea
         *
         * @event submit
         */
        this.$emit("submit");
      }
    },
    async setHeight() {
      await this.$nextTick();
      window.requestAnimationFrame(() => {
        this.heightInPx = this.computeHeight();
      });
    },
    computeHeight() {
      if (this.computedRows !== null) {
        return null;
      }

      const el = this.$refs.input;

      if (!el || !isVisible(el)) {
        return null;
      }

      const computedStyle = getComputedStyle(el);
      const lineHeight = toFloat(computedStyle.lineHeight, 1);
      const border =
        toFloat(computedStyle.borderTopWidth, 0) +
        toFloat(computedStyle.borderBottomWidth, 0);
      const padding =
        toFloat(computedStyle.paddingTop, 0) +
        toFloat(computedStyle.paddingBottom, 0);
      const offset = border + padding;
      const minHeight = lineHeight * this.computedMinRows + offset;

      const oldHeight = el.style.height || computedStyle.height;
      el.style.height = "auto";
      const { scrollHeight } = el;
      el.style.height = oldHeight;

      const contentRows = Math.max((scrollHeight - padding) / lineHeight, 2);
      const rows = Math.min(
        Math.max(contentRows, this.computedMinRows),
        this.computedMaxRows
      );
      const height = Math.max(Math.ceil(rows * lineHeight + offset), minHeight);

      return `${height}px`;
    },
    select(...args) {
      this.$refs.input.select(...args);
    },
    setSelectionRange(...args) {
      this.$refs.input.setSelectionRange(...args);
    },
    setRangeText(...args) {
      this.$refs.input.setRangeText(...args);
    },
    setCustomValidity(...args) {
      return this.$refs.input.setCustomValidity(...args);
    },
    checkValidity(...args) {
      return this.$refs.input.checkValidity(...args);
    },
    reportValidity(...args) {
      return this.$refs.input.reportValidity(...args);
    },
  },
};
</script>

<template>
  <div v-if="showCharacterCount">
    <textarea
      ref="input"
      v-gl-visible="setHeight"
      :value="localValue"
      :class="computedClass"
      :style="computedStyle"
      v-bind="computedAttrs"
      :aria-describedby="characterCountTextId"
      v-on="computedListeners"
      @keyup.enter="handleKeyPress"
    ></textarea>
    <gl-form-character-count
      :value="value"
      :limit="characterCountLimit"
      :count-text-id="characterCountTextId"
    >
      <template #over-limit-text="{ count }">
        <!--
        @slot Internationalized over character count text.
        Example:
        ```
        <template #character-count-over-limit-text="{ count }">
          {{ n__('%d character over limit.', '%d characters over limit.', count) }}
        </template>
        ```
        @binding {number} count
        -->
        <slot name="character-count-over-limit-text" :count="count"></slot>
      </template>

      <template #remaining-count-text="{ count }">
        <!--
        @slot Internationalized character count text.
        Example:
        ```
        <template #remaining-character-count-text="{ count }">
          {{ n__('%d character remaining.', '%d characters remaining.', count) }}
        </template>
        ```
        @binding {number} count
        -->

        <slot name="remaining-character-count-text" :count="count"></slot
      ></template>
    </gl-form-character-count>
  </div>
  <textarea
    v-else
    ref="input"
    v-gl-visible="setHeight"
    :value="localValue"
    :class="computedClass"
    :style="computedStyle"
    v-bind="computedAttrs"
    v-on="computedListeners"
    @keyup.enter="handleKeyPress"
  ></textarea>
</template>
