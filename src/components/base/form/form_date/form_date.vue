<script>
import { uniqueId } from 'lodash-es';
import GlFormInput from '../form_input/form_input.vue';

export default {
  name: 'GlFormDate',
  components: {
    GlFormInput,
  },
  inheritAttrs: false,
  model: {
    event: 'change',
    prop: 'value',
  },
  props: {
    /**
     * Unique identifier for the date input.
     */
    id: {
      type: String,
      required: false,
      default: null,
    },
    /**
     * Minimum allowed date value.
     */
    min: {
      type: String,
      required: false,
      default: null,
    },
    /**
     * Maximum allowed date value.
     */
    max: {
      type: String,
      required: false,
      default: null,
    },
    /**
     * Error message displayed when the value is below the minimum.
     */
    minInvalidFeedback: {
      type: String,
      required: false,
      default: 'Must be after minimum date.',
    },
    /**
     * Error message displayed when the value exceeds the maximum.
     */
    maxInvalidFeedback: {
      type: String,
      required: false,
      default: 'Must be before maximum date.',
    },
    /**
     * The current value of the date picker.
     */
    value: {
      type: String,
      required: false,
      default: null,
    },
  },
  data() {
    return {
      currentValue: this.value,
      inputId: this.id || uniqueId('form-date-'),
      invalidFeedbackId: uniqueId('form-date-invalid-feedback-'),
      outputId: uniqueId('form-date-output-'),
      valueAsDate: null,
    };
  },
  computed: {
    ariaDescribedBy() {
      return [this.valueAsDate && this.outputId, this.isInvalid && this.invalidFeedbackId].join(
        ' ',
      );
    },
    isLessThanMin() {
      return this.currentValue && this.min && this.currentValue < this.min;
    },
    isGreaterThanMax() {
      return this.currentValue && this.max && this.currentValue > this.max;
    },
    isInvalid() {
      return this.isLessThanMin || this.isGreaterThanMax;
    },
    outputValue() {
      if (!this.valueAsDate) return null;
      return new Intl.DateTimeFormat(undefined, { dateStyle: 'full' }).format(this.valueAsDate);
    },
    state() {
      return !this.isInvalid;
    },
  },
  watch: {
    value: {
      handler(newValue) {
        this.currentValue = newValue;
        this.updateValueAsDate();
      },
    },
  },
  async mounted() {
    await this.$nextTick();
    this.updateValueAsDate();
  },
  methods: {
    updateValueAsDate() {
      this.valueAsDate = this.$refs.input.$el.valueAsDate;
    },
    onChange($event) {
      /**
       * Emitted when date is changed.
       *
       * @event change
       */
      this.updateValueAsDate();
      this.$emit('change', $event);
    },
    onKeydown($event) {
      /**
       * Emitted when a key is pressed inside the date input.
       *
       * @event keydown
       */
      this.$emit('keydown', $event);
    },
    onFocus($event) {
      /**
       * Emitted when the date input receives focus.
       *
       * @event focus
       */
      this.$emit('focus', $event);
    },
    onBlur($event) {
      /**
       * Emitted when the date input loses focus.
       *
       * @event blur
       */
      this.$emit('blur', $event);
    },
  },
};
</script>
<template>
  <div class="gl-form-date">
    <gl-form-input
      :id="inputId"
      ref="input"
      v-model="currentValue"
      v-bind="$attrs"
      :aria-describedby="ariaDescribedBy"
      :min="min"
      :max="max"
      pattern="\d{4}-\d{2}-\d{2}"
      placeholder="yyyy-mm-dd"
      :state="state"
      type="date"
      @change="onChange"
      @keydown="onKeydown"
      @focus="onFocus"
      @blur="onBlur"
    />
    <output v-if="outputValue" :id="outputId" ref="output" :for="inputId" class="gl-sr-only">
      {{ outputValue }}
    </output>
    <div v-if="isInvalid" :id="invalidFeedbackId" ref="invalidFeedback" class="invalid-feedback">
      <template v-if="isLessThanMin">
        {{ minInvalidFeedback }}
      </template>
      <template v-if="isGreaterThanMax">
        {{ maxInvalidFeedback }}
      </template>
    </div>
  </div>
</template>
