<script>
import { debounce } from 'lodash-es';

export default {
  name: 'GlFormCharacterCount',
  props: {
    /**
     * Input value
     */
    value: {
      type: String,
      required: false,
      default: '',
    },
    /**
     * Character count limit for the input.
     */
    limit: {
      type: Number,
      required: true,
    },
    /**
     * id attribute for the character count text. Input should have `:aria-describedby="countTextId"`
     */
    countTextId: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      remainingCount: this.initialRemainingCount(),
      remainingCountSrOnly: this.initialRemainingCount(),
    };
  },
  computed: {
    isOverLimit() {
      return this.remainingCount < 0;
    },
    isOverLimitSrOnly() {
      return this.remainingCountSrOnly < 0;
    },
    countTextClass() {
      return this.isOverLimit ? 'gl-text-danger' : 'gl-text-subtle';
    },
  },
  watch: {
    value(newValue) {
      this.remainingCount = this.limit - this.valueLength(newValue);
      this.debouncedUpdateRemainingCountSrOnly(newValue);
    },
  },
  created() {
    // Debounce updating the remaining character count for a second so
    // screen readers announce the remaining text after the text in the textarea.
    this.debouncedUpdateRemainingCountSrOnly = debounce(this.updateRemainingCountSrOnly, 1000);
  },
  methods: {
    valueLength(value) {
      return value?.length || 0;
    },
    updateRemainingCountSrOnly(newValue) {
      this.remainingCountSrOnly = this.limit - this.valueLength(newValue);
    },
    initialRemainingCount() {
      return this.limit - this.valueLength(this.value);
    },
  },
};
</script>

<template>
  <div>
    <small :class="['form-text', countTextClass]" aria-hidden="true">
      <!--
      @slot Internationalized over limit text. Example: `<template #over-limit-text="{ count }">{{ n__('%d character over limit.', '%d characters over limit.', count) }}</template>`
      @binding {number} count
      -->
      <slot v-if="isOverLimit" name="over-limit-text" :count="Math.abs(remainingCount)"></slot>
      <!--
      @slot Internationalized character count text. Example: `<template #remaining-count-text="{ count }">{{ n__('%d character remaining.', '%d characters remaining.', count) }}</template>`
      @binding {number} count
      -->

      <slot v-else name="remaining-count-text" :count="remainingCount"></slot>
    </small>
    <div :id="countTextId" class="gl-sr-only" aria-live="polite" data-testid="count-text-sr-only">
      <slot
        v-if="isOverLimitSrOnly"
        name="over-limit-text"
        :count="Math.abs(remainingCountSrOnly)"
      ></slot>

      <slot v-else name="remaining-count-text" :count="remainingCountSrOnly"></slot>
    </div>
  </div>
</template>
