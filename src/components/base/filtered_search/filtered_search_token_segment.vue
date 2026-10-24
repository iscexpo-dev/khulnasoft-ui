<script>
import { last } from 'lodash-es';
import { Portal } from 'portal-vue';
import { LEFT_MOUSE_BUTTON } from '../../../utils/constants';
import GlFilteredSearchSuggestion from './filtered_search_suggestion.vue';
import GlFilteredSearchSuggestionList from './filtered_search_suggestion_list.vue';
import {
  splitOnQuotes,
  wrapTokenInQuotes,
  match,
  TERM_TOKEN_TYPE,
  FILTERED_SEARCH_SUGGESTIONS_CLASS,
} from './filtered_search_utils';

// We need some helpers to ensure @vue/compat compatibility
// @vue/compat will render comment nodes for v-if and comments in HTML
// Also it makes use of fragments - both comments and nodes are Symbols.
// In Vue3 all of them (Comment, Fragment) are exposed as named exports on vue module
// However we want to maintain compatibility with Vue2, so taking this hacky approach
// relying on Symbol.toString()

// I'm keeping this directly here instead of helper to increase probability of
// fixing ASAP and because I don't want this helper to be reused
// FIXME: replace with Symbols when we will switch to Vue3

const isVue3Comment = (vnode) => vnode?.type?.toString?.() === 'Symbol(Comment)';
const isVue3Fragment = (vnode) => vnode?.type?.toString?.() === 'Symbol(Fragment)';

const isVNodeEmpty = (vnode) => {
  if (isVue3Fragment(vnode)) {
    // vnode.children might be an array or single node in edge cases
    return Array.isArray(vnode.children)
      ? // eslint-disable-next-line unicorn/no-array-callback-reference
        vnode.children.every(isVNodeEmpty)
      : isVNodeEmpty(vnode.children);
  }

  if (isVue3Comment(vnode)) {
    return true;
  }

  return false;
};

const isSlotNotEmpty = (slot) => {
  if (!slot) {
    return false;
  }

  const vnodes = typeof slot === 'function' ? slot() : slot;
  // eslint-disable-next-line unicorn/no-array-callback-reference
  return !(Array.isArray(vnodes) ? vnodes.every(isVNodeEmpty) : isVNodeEmpty(vnodes));
};

export default {
  name: 'GlFilteredSearchTokenSegment',
  components: {
    Portal,
    GlFilteredSearchSuggestionList,
    GlFilteredSearchSuggestion,
  },
  inject: ['portalName', 'alignSuggestions', 'termsAsTokens'],
  inheritAttrs: false,
  props: {
    /**
     * If this token segment is currently being edited.
     */
    active: {
      type: Boolean,
      required: false,
      default: false,
    },
    /**
     * Whether this segment represents a search term.
     */
    isTerm: {
      type: Boolean,
      required: false,
      default: false,
    },
    /**
     * Label text for the segment.
     */
    label: {
      type: String,
      required: false,
      default: 'Search',
    },
    /**
     * When true, enables multi-select mode.
     */
    multiSelect: {
      type: Boolean,
      required: false,
      default: false,
    },
    /**
     * Array of selectable options.
     */
    options: {
      type: Array,
      required: false,
      default: () => null,
    },
    /**
     * The field name used for option display text.
     */
    optionTextField: {
      type: String,
      required: false,
      default: 'title',
    },
    /**
     * Custom keydown event handler function.
     */
    customInputKeydownHandler: {
      type: Function,
      required: false,
      default: () => () => false,
    },
    /**
     * Current term value
     */
    value: {
      required: true,
      validator: () => true,
    },
    /**
     * HTML attributes to add to the search input
     */
    searchInputAttributes: {
      type: Object,
      required: false,
      default: () => ({}),
    },
    /**
     * If this is the last token
     */
    isLastToken: {
      type: Boolean,
      required: false,
      default: false,
    },
    /**
     * The current value of the segment.
     */
    currentValue: {
      type: Array,
      required: false,
      default: () => [],
    },
    /**
     * Position of the cursor in the input.
     */
    cursorPosition: {
      type: String,
      required: false,
      default: 'end',
      validator: (value) => ['start', 'end'].includes(value),
    },
    /**
     * When true, renders in a non-interactive view-only mode.
     */
    viewOnly: {
      type: Boolean,
      required: false,
      default: false,
    },
  },

  data() {
    return {
      fallbackValue: this.value,
    };
  },

  computed: {
    hasTermSuggestion() {
      if (!this.termsAsTokens()) return false;
      if (!this.options) return false;

      return this.options.some(({ value }) => value === TERM_TOKEN_TYPE);
    },

    matchingOption() {
      return this.options?.find((o) => o.value === this.value);
    },

    nonMultipleValue() {
      return Array.isArray(this.value) ? last(this.value) : this.value;
    },

    inputValue: {
      get() {
        if (this.isTerm) {
          return this.nonMultipleValue;
        }

        return this.matchingOption
          ? this.matchingOption[this.optionTextField]
          : this.nonMultipleValue;
      },

      set(inputValue) {
        /**
         * Emitted when this token segment's value changes.
         *
         * @type {object} option The current option.
         */
        this.$emit('input', inputValue);
      },
    },

    hasOptionsOrSuggestions() {
      return this.options?.length || isSlotNotEmpty(this.$slots.suggestions);
    },

    defaultSuggestedValue() {
      if (!this.options) {
        return this.nonMultipleValue;
      }
      if (this.value) {
        const option =
          this.getMatchingOptionForInputValue(this.inputValue) ||
          this.getMatchingOptionForInputValue(this.inputValue, { loose: true });

        if (option) return option.value;
        if (this.hasTermSuggestion) return TERM_TOKEN_TYPE;
        return null;
      }

      const defaultOption = this.options.find((op) => op.default);

      if (defaultOption) {
        return defaultOption.value;
      }

      return this.isTerm ? undefined : this.options[0]?.value;
    },
    containerAttributes() {
      return (
        this.isLastToken &&
        !this.active &&
        this.currentValue.length > 1 &&
        this.searchInputAttributes
      );
    },
  },

  watch: {
    active: {
      immediate: true,
      handler(newValue) {
        if (newValue) {
          this.activate();
        } else {
          this.deactivate();
        }
      },
    },

    inputValue(newValue) {
      if (this.termsAsTokens()) return;

      if (this.multiSelect) return;

      /**
       * This is a temporary workaround to implement the same behaviour
       * implemented in https://github.com/khulnasoft/khulnasoft-ui/-/issues/2381
       * for tokens with `terms-as-tokens=false` and `multi-select=false`.
       *
       * We're aiming to remove this temporary fix when
       * https://khulnasoft.com/groups/khulnasoft-org/-/epics/15948 gets completed, as
       * that refactoring will use the `@input` handler on the GlFilteredSearch
       * component to handle tokens instead of doing workarounds.
       */
      if (typeof newValue !== 'string') return;

      const hasUnclosedQuote = newValue.split('"').length % 2 === 0;
      if (newValue.indexOf(' ') === -1 || hasUnclosedQuote) {
        return;
      }

      const [firstWord, ...otherWords] = splitOnQuotes(newValue).filter(
        (w, idx, arr) => Boolean(w) || idx === arr.length - 1,
      );
      this.$emit('input', firstWord);

      if (otherWords.length) {
        /**
         * Emitted when Space appears in token segment value
         * @property {array|string} newStrings New strings to be converted into term tokens
         */
        this.$emit('split', otherWords);
      }
    },
  },

  methods: {
    emitIfInactive(e) {
      if (e.button === LEFT_MOUSE_BUTTON && !this.active) {
        /**
         * Emitted on mousedown event on the main component.
         */
        this.$emit('activate');
        e.preventDefault();
      }
    },

    getMatchingOptionForInputValue(inputValue, { loose } = { loose: false }) {
      return this.options?.find((option) =>
        loose
          ? match(option[this.optionTextField], inputValue)
          : option[this.optionTextField] === inputValue,
      );
    },

    async activate() {
      this.fallbackValue = this.value;

      await this.$nextTick();
      const { input } = this.$refs;
      if (input) {
        input.focus();
        input.scrollIntoView({ block: 'nearest', inline: 'end' });
        this.alignSuggestions(input);
        if (this.cursorPosition === 'start') {
          input?.setSelectionRange(0, 0);
        }
      }
    },

    deactivate() {
      if (!this.options || this.isTerm) {
        return;
      }

      if (this.matchingOption?.value !== this.value) {
        this.$emit('input', this.fallbackValue);
      }
    },

    applySuggestion(suggestedValue) {
      const formattedSuggestedValue = this.termsAsTokens()
        ? suggestedValue
        : wrapTokenInQuotes(suggestedValue);

      /**
       * Emitted when autocomplete entry is selected.
       *
       * @type {string} value The selected value.
       */
      this.$emit('select', formattedSuggestedValue);

      if (!this.multiSelect) {
        this.$emit(
          'input',
          formattedSuggestedValue === TERM_TOKEN_TYPE ? this.inputValue : formattedSuggestedValue,
        );
        this.$emit('complete', formattedSuggestedValue);
      }
    },

    showHeader(option) {
      return option.value?.toString().startsWith('gl-filtered-search-suggestion-group-');
    },

    handleInputKeydown(e) {
      const { key } = e;
      const { suggestions, input } = this.$refs;
      const suggestedValue = suggestions?.getValue();

      const handlers = {
        ArrowLeft: () => {
          if (input.selectionStart === 0) {
            e.preventDefault();
            this.$emit('previous');
          }
        },
        ArrowRight: () => {
          if (input.selectionEnd === this.inputValue.length) {
            e.preventDefault();
            this.$emit('next');
          }
        },
        Backspace: () => {
          if (this.inputValue === '') {
            e.preventDefault();
            /**
             * Emitted when Backspace is pressed and the value is empty
             */
            this.$emit('backspace');
          }
        },
        Enter: () => {
          e.preventDefault();
          if (suggestedValue != null) {
            this.applySuggestion(suggestedValue);
          } else {
            /**
             * Emitted when Enter is pressed and no suggestion is selected
             */
            this.$emit('submit');
          }
        },
        ':': () => {
          if (suggestedValue != null) {
            e.preventDefault();
            this.applySuggestion(suggestedValue);
          }
        },
        Escape: () => {
          e.preventDefault();
          /**
           * Emitted when suggestion is selected from the suggestion list
           */
          this.$emit('complete');
        },
      };

      const suggestionsHandlers = {
        ArrowDown: () => suggestions.nextItem(),
        Down: () => suggestions.nextItem(),
        ArrowUp: () => suggestions.prevItem(),
        Up: () => suggestions.prevItem(),
      };

      if (this.hasOptionsOrSuggestions) {
        Object.assign(handlers, suggestionsHandlers);
      }

      if (Object.keys(handlers).includes(key)) {
        handlers[key]();
        return;
      }

      this.customInputKeydownHandler(e, {
        suggestedValue,
        inputValue: this.inputValue,
        applySuggestion: (v) => this.applySuggestion(v),
      });
    },

    handleBlur(e) {
      // Keep focus on input when blur event is on same element
      // (e.g. scrollbar in filtered search suggestions list)
      if (e.relatedTarget?.classList?.contains(FILTERED_SEARCH_SUGGESTIONS_CLASS)) {
        this.$refs.input?.focus();
        return;
      }

      if (this.multiSelect) {
        this.$emit('complete');
      } else if (this.active) {
        /**
         * Emitted when this term token will lose its focus.
         */
        this.$emit('deactivate');
      }
    },
  },
};
</script>

<template>
  <div
    v-bind="containerAttributes"
    class="gl-filtered-search-token-segment"
    :class="{
      'gl-filtered-search-token-segment-active': active,
      '!gl-cursor-text': viewOnly,
    }"
    data-testid="filtered-search-token-segment"
    v-on="viewOnly ? {} : { mousedown: emitIfInactive }"
  >
    <template v-if="active">
      <slot name="before-input" v-bind="{ submitValue: applySuggestion }"></slot>
      <slot name="input" v-bind="{ submitValue: applySuggestion }">
        <input
          ref="input"
          v-bind="searchInputAttributes"
          v-model="inputValue"
          class="gl-filtered-search-token-segment-input"
          :class="{ 'gl-filtered-search-token-segment-input-disabled': viewOnly }"
          data-testid="filtered-search-token-segment-input"
          :aria-label="label"
          :disabled="viewOnly"
          @keydown="handleInputKeydown"
          @blur="handleBlur"
        />
      </slot>
      <portal :key="`operator-${_uid}`" :to="portalName">
        <gl-filtered-search-suggestion-list
          v-if="hasOptionsOrSuggestions"
          :key="`operator-${_uid}`"
          ref="suggestions"
          role="list"
          tabindex="-1"
          data-testid="filtered-search-suggestion-list"
          :initial-value="defaultSuggestedValue"
          @suggestion="applySuggestion"
        >
          <template v-if="options">
            <template v-for="(option, idx) in options">
              <template v-if="showHeader(option)">
                <li v-if="idx > 0" :key="`separator-${idx}`">
                  <hr class="gl-border-t -gl-mx-2 gl-my-2" />
                </li>
                <li
                  :key="`header-${idx}`"
                  role="presentation"
                  data-testid="filtered-search-section-header"
                  class="gl-mx-0 gl-pb-2 gl-pl-5 gl-pt-3 gl-text-sm gl-font-bold gl-text-strong"
                >
                  {{ option.title }}
                </li>
              </template>
              <gl-filtered-search-suggestion
                v-else
                :key="`${option.value}-${idx}`"
                :value="option.value"
                :icon-name="option.icon"
              >
                <slot name="option" v-bind="{ option }">
                  <template v-if="option.component">
                    <component :is="option.component" :option="option" />
                  </template>
                  <template v-else>
                    {{ option[optionTextField] }}
                  </template>
                </slot>
              </gl-filtered-search-suggestion>
            </template>
          </template>

          <slot v-else name="suggestions"></slot>
        </gl-filtered-search-suggestion-list>
      </portal>
    </template>

    <slot v-else name="view" v-bind="{ label, inputValue }">{{ inputValue }}</slot>
  </div>
</template>
