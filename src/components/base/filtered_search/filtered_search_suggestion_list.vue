<script>
import { stepIndexAndWrap, FILTERED_SEARCH_SUGGESTIONS_CLASS } from './filtered_search_utils';

const DEFER_TO_INITIAL_VALUE = -1;
const NO_ACTIVE_ITEM = -2;

export default {
  name: 'GlFilteredSearchSuggestionList',
  inject: ['suggestionsListClass', 'termsAsTokens'],
  provide() {
    return {
      filteredSearchSuggestionListInstance: this,
    };
  },
  props: {
    /**
     * Value to be initially selected in list.
     */
    initialValue: {
      required: false,
      validator: () => true,
      default: null,
    },
  },

  data() {
    return {
      activeIdx: DEFER_TO_INITIAL_VALUE,
      registeredItems: [],
    };
  },

  computed: {
    initialActiveIdx() {
      return this.registeredItems.findIndex((item) =>
        this.valuesMatch(item.value, this.initialValue),
      );
    },
    initialActiveItem() {
      return this.registeredItems[this.initialActiveIdx];
    },
    activeItem() {
      if (!this.termsAsTokens() && this.activeIdx === NO_ACTIVE_ITEM) return null;
      if (this.activeIdx === DEFER_TO_INITIAL_VALUE) return this.initialActiveItem;
      return this.registeredItems[this.activeIdx];
    },
    listClasses() {
      return [this.suggestionsListClass(), `dropdown-menu ${FILTERED_SEARCH_SUGGESTIONS_CLASS}`];
    },
  },

  watch: {
    initialValue() {
      this.activeIdx = DEFER_TO_INITIAL_VALUE;
    },
  },

  methods: {
    valuesMatch(firstValue, secondValue) {
      if (firstValue == null || secondValue == null) return false;

      return typeof firstValue === 'string' && typeof secondValue === 'string'
        ? firstValue.toLowerCase() === secondValue.toLowerCase()
        : firstValue === secondValue;
    },
    register(item) {
      this.registeredItems.push(item);
    },
    unregister(item) {
      const idx = this.registeredItems.indexOf(item);
      if (idx !== -1) {
        this.registeredItems.splice(idx, 1);
        if (idx === this.activeIdx) {
          this.activeIdx = DEFER_TO_INITIAL_VALUE;
        }
      }
    },
    nextItem() {
      if (this.termsAsTokens()) {
        this.stepItem(1);
      } else {
        this.stepItem(1, this.registeredItems.length - 1);
      }
    },
    prevItem() {
      if (this.termsAsTokens()) {
        this.stepItem(-1);
      } else {
        this.stepItem(-1, 0);
      }
    },
    stepItem(direction, endIdx) {
      if (
        !this.termsAsTokens() &&
        (this.activeIdx === endIdx ||
          (this.activeIdx === DEFER_TO_INITIAL_VALUE && this.initialActiveIdx === endIdx))
      ) {
        // The user wants to move past the end of the list, so ensure nothing is selected.
        this.activeIdx = NO_ACTIVE_ITEM;
        this.$refs.top.scrollIntoView();
      } else {
        const index =
          this.activeIdx === DEFER_TO_INITIAL_VALUE
            ? // Currently active item is set by initialValue (i.e., text input matching),
              // so step relative to that.
              this.initialActiveIdx
            : // Otherwise, step relative to the explicitly (via up/down arrows) activated item.
              this.activeIdx;
        this.activeIdx = stepIndexAndWrap(index, direction, this.registeredItems.length);
      }
    },
    getValue() {
      return this.activeItem ? this.activeItem.value : null;
    },
  },
};
</script>
<template>
  <ul :class="listClasses">
    <!-- Sentinel used by stepItem() to reset scroll position; not a real suggestion. -->
    <li ref="top" aria-hidden="true" role="presentation"></li>
    <!-- @slot The suggestions (implemented with GlFilteredSearchSuggestion). -->
    <slot></slot>
  </ul>
</template>
