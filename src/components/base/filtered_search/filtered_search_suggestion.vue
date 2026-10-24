<script>
import GlIcon from '../icon/icon.vue';

export default {
  name: 'GlFilteredSearchSuggestion',
  components: {
    GlIcon,
  },
  inject: ['filteredSearchSuggestionListInstance'],
  inheritAttrs: false,
  props: {
    /**
     * Value that will be emitted if this suggestion is selected.
     */
    iconName: {
      type: String,
      required: false,
      default: '',
    },
    /**
     * The value of the suggestion item.
     */
    value: {
      required: true,
      validator: () => true,
    },
  },
  emits: ['suggestion'],
  computed: {
    isActive() {
      return this.filteredSearchSuggestionListInstance.activeItem === this;
    },
  },
  watch: {
    isActive(newValue) {
      if (newValue) {
        window.requestAnimationFrame(() => {
          this.$el?.scrollIntoView({ block: 'nearest', inline: 'end' });
        });
      }
    },
  },
  created() {
    this.filteredSearchSuggestionListInstance.register(this);
  },
  beforeDestroy() {
    this.filteredSearchSuggestionListInstance.unregister(this);
  },
  methods: {
    emitValue() {
      // We use href argument for gl-dropdown-item to use <a> instead of <button>
      // due to https://bugs.webkit.org/show_bug.cgi?id=22261
      this.filteredSearchSuggestionListInstance.$emit('suggestion', this.value);
    },
  },
};
</script>

<template>
  <li
    class="gl-dropdown-item gl-filtered-search-suggestion"
    :class="{ 'gl-filtered-search-suggestion-active': isActive }"
  >
    <button
      data-testid="filtered-search-suggestion"
      tabindex="-1"
      class="dropdown-item"
      @mousedown.prevent="emitValue"
    >
      <gl-icon
        v-if="iconName"
        :name="iconName"
        class="gl-dropdown-item-icon gl-fill-icon-default"
      />
      <div class="gl-dropdown-item-text-wrapper">
        <p class="gl-dropdown-item-text-primary">
          <!-- @slot The suggestion content. -->
          <slot></slot>
        </p>
      </div>
    </button>
  </li>
</template>
