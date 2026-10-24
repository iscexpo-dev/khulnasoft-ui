<script>
import GlClearIconButton from '../../shared_components/clear_icon_button/clear_icon_button.vue';
import GlFormInput from '../form/form_input/form_input.vue';
import GlIcon from '../icon/icon.vue';
import GlLoadingIcon from '../loading_icon/loading_icon.vue';
import { translate } from '../../../utils/i18n';

export default {
  name: 'GlSearchBoxByType',
  components: {
    GlClearIconButton,
    GlIcon,
    GlFormInput,
    GlLoadingIcon,
  },
  inheritAttrs: false,
  model: {
    prop: 'value',
    event: 'input',
  },
  props: {
    /**
     * If provided, used as value of search input
     */
    value: {
      type: String,
      required: false,
      default: '',
    },
    /**
     * Whether to render the search box without borders
     */
    borderless: {
      type: Boolean,
      required: false,
      default: false,
    },
    /**
     * Title text for the clear button
     */
    clearButtonTitle: {
      type: String,
      required: false,
      default: () => translate('GlSearchBoxByType.clearButtonTitle', 'Clear'),
    },
    /**
     * If provided and true, disables the input and controls
     */
    disabled: {
      type: Boolean,
      required: false,
      default: false,
    },
    /**
     * Puts search box into loading state, rendering spinner
     */
    isLoading: {
      type: Boolean,
      required: false,
      default: false,
    },
    /**
     * Container for tooltip. Valid values: DOM node, selector string or `false` for default
     */
    tooltipContainer: {
      required: false,
      default: false,
      validator: (value) =>
        value === false || typeof value === 'string' || value instanceof HTMLElement,
    },
  },
  computed: {
    inputAttributes() {
      const attributes = {
        type: 'search',
        placeholder: translate('GlSearchBoxByType.input.placeholder', 'Search'),
        ...this.$attrs,
      };

      if (!attributes['aria-label']) {
        attributes['aria-label'] = attributes.placeholder;
      }

      return attributes;
    },
    hasValue() {
      return Boolean(this.value.length);
    },
    inputListeners() {
      return {
        ...this.$listeners,
        input: this.onInput,
        focusin: this.onFocusin,
        focusout: this.onFocusout,
      };
    },
    showClearButton() {
      return this.hasValue && !this.disabled;
    },
  },
  methods: {
    isInputOrClearButton(element) {
      return element === this.$refs.input?.$el || element === this.$refs.clearButton?.$el;
    },
    clearInput() {
      this.onInput('');
      this.focusInput();
    },
    focusInput() {
      this.$refs.input.$el.focus();
    },
    onInput(value) {
      /**
       * Emitted when the input value changes or gets cleared.
       * @event input
       */
      this.$emit('input', value);
    },
    onFocusout(event) {
      const { relatedTarget } = event;

      if (this.isInputOrClearButton(relatedTarget)) {
        return;
      }

      /**
       * Emitted when focus leaves the search box (input and clear button).
       * @event focusout
       */
      this.$emit('focusout', event);
    },
    onFocusin(event) {
      const { relatedTarget } = event;

      if (this.isInputOrClearButton(relatedTarget)) {
        return;
      }

      /**
       * Emitted when focus enters the search box (input or clear button).
       * @event focusin
       */
      this.$emit('focusin', event);
    },
  },
};
</script>

<template>
  <div class="gl-search-box-by-type">
    <gl-icon name="search" class="gl-search-box-by-type-search-icon" variant="subtle" />
    <gl-form-input
      ref="input"
      :value="value"
      :disabled="disabled"
      :class="{
        'gl-search-box-by-type-input': !borderless,
        'gl-search-box-by-type-input-borderless': borderless,
      }"
      v-bind="inputAttributes"
      v-on="inputListeners"
    />
    <div v-if="isLoading || showClearButton" class="gl-search-box-by-type-right-icons">
      <gl-loading-icon v-if="isLoading" class="gl-search-box-by-type-loading-icon" />
      <gl-clear-icon-button
        v-if="showClearButton"
        ref="clearButton"
        :title="clearButtonTitle"
        :tooltip-container="tooltipContainer"
        class="gl-search-box-by-type-clear gl-clear-icon-button"
        @click.stop="clearInput"
        @focusin="onFocusin"
        @focusout="onFocusout"
      />
    </div>
  </div>
</template>
