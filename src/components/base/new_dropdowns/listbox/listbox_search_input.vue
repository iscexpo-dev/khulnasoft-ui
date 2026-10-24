<script>
import GlClearIconButton from '../../../shared_components/clear_icon_button/clear_icon_button.vue';
import GlIcon from '../../icon/icon.vue';

export default {
  name: 'GlListboxSearchInput',
  components: {
    GlClearIconButton,
    GlIcon,
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
     * Search input placeholder text and aria-label
     */
    placeholder: {
      type: String,
      required: false,
      default: 'Search',
    },
  },
  computed: {
    hasValue() {
      return Boolean(this.value.length);
    },
    inputListeners() {
      return {
        ...this.$listeners,
        input: (event) => {
          this.$emit('input', event.target.value);
        },
      };
    },
  },
  methods: {
    clearInput() {
      this.$emit('input', '');
      this.focusInput();
    },
    focusInput() {
      this.$refs.input.focus();
    },
  },
};
</script>

<template>
  <div class="gl-listbox-search">
    <gl-icon name="search-sm" :size="12" class="gl-listbox-search-icon" />
    <input
      ref="input"
      type="search"
      :value="value"
      class="gl-listbox-search-input"
      :aria-label="placeholder"
      :placeholder="placeholder"
      v-bind="$attrs"
      v-on="inputListeners"
    />
    <gl-clear-icon-button
      v-if="hasValue"
      class="gl-listbox-search-clear-button"
      @click.stop="clearInput"
    />
  </div>
</template>
