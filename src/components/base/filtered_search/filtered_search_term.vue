<script>
import GlToken from '../token/token.vue';
import { stopEvent } from '../../../utils/utils';
import GlFilteredSearchTokenSegment from './filtered_search_token_segment.vue';
import {
  INTENT_ACTIVATE_PREVIOUS,
  TERM_TOKEN_TYPE,
  TOKEN_CLOSE_SELECTOR,
  match,
  tokenToOption,
  termTokenDefinition,
} from './filtered_search_utils';

export default {
  name: 'GlFilteredSearchTerm',
  components: {
    GlFilteredSearchTokenSegment,
    GlToken,
  },
  inject: ['termsAsTokens'],
  inheritAttrs: false,
  props: {
    /**
     * Tokens available for this filtered search instance.
     */
    availableTokens: {
      type: Array,
      required: true,
    },
    /**
     * Determines if the term is being edited or not.
     */
    active: {
      type: Boolean,
      required: false,
      default: false,
    },
    /**
     * Current term value.
     */
    value: {
      type: Object,
      required: false,
      default: () => ({ data: '' }),
    },
    /**
     * Placeholder text for the search input.
     */
    placeholder: {
      type: String,
      required: false,
      default: '',
    },
    /**
     * HTML attributes to add to the search input.
     */
    searchInputAttributes: {
      type: Object,
      required: false,
      default: () => ({}),
    },
    /**
     * If this is the last token.
     */
    isLastToken: {
      type: Boolean,
      required: false,
      default: false,
    },
    /**
     * The current `value` (tokens) of the ancestor GlFilteredSearch component.
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
     * The title of the text search option. Ignored unless termsAsTokens is enabled.
     */
    searchTextOptionLabel: {
      type: String,
      required: false,
      default: termTokenDefinition.title,
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
  computed: {
    showInput() {
      return this.termsAsTokens() || Boolean(this.placeholder) || this.isLastToken;
    },
    showToken() {
      return this.termsAsTokens() && Boolean(this.value.data);
    },
    suggestedTokens() {
      if (this.viewOnly) {
        return [];
      }

      const tokens = this.availableTokens.filter((token) => {
        if (typeof token.match === 'function') {
          return token.match.call(null, {
            query: this.value.data,
            title: token.title,
            defaultMatcher: match,
          });
        }

        return match(token.title, this.value.data);
      });

      if (this.termsAsTokens() && this.value.data) {
        tokens.push({
          ...termTokenDefinition,
          title: this.searchTextOptionLabel,
        });
      }

      // eslint-disable-next-line unicorn/no-array-callback-reference
      return tokens.map(tokenToOption);
    },
    internalValue: {
      get() {
        return this.value.data;
      },
      set(data) {
        /**
         * Emitted when the token changes its value.
         *
         * @event input
         * @type {object} dataObj Object containing the update value.
         */
        this.$emit('input', { data });
      },
    },
    eventListeners() {
      return this.viewOnly
        ? {}
        : { mousedown: this.stopMousedownOnCloseButton, close: this.destroyByClose };
    },
  },
  methods: {
    onBackspace() {
      /**
       * Emitted when token value is empty and backspace is pressed.
       * Includes user intent to activate previous token.
       *
       * @event destroy
       * @type {object} details The user intent
       */
      this.$emit('destroy', { intent: INTENT_ACTIVATE_PREVIOUS });
    },
    stopMousedownOnCloseButton(event) {
      if (event.target.closest(TOKEN_CLOSE_SELECTOR)) {
        stopEvent(event);
      }
    },
    destroyByClose() {
      this.$emit('destroy');
    },
    onComplete(type) {
      if (type === TERM_TOKEN_TYPE) {
        // We've completed this term token
        this.$emit('complete');
      } else {
        // We're changing the current token type
        this.$emit('replace', { type });
      }
    },
  },
};
</script>

<template>
  <div class="gl-filtered-search-term gl-h-auto" data-testid="filtered-search-term">
    <!--
      Emitted when this term token is clicked.
      @event activate
    -->

    <!--
      Emitted when this term token will lose its focus.
      @event deactivate
    -->

    <!--
      Emitted when autocomplete entry is selected.
      @event replace
      @property {object} token Replacement token configuration.
    -->

    <!--
      Emitted when the token is submitted.
      @event submit
    -->

    <!--
      Emitted when Space is pressed in-between term text.
      Not emitted when termsAsTokens is true.
      @event split
      @property {array} newTokens Token configurations
    -->

    <gl-filtered-search-token-segment
      ref="segment"
      v-model="internalValue"
      is-term
      class="gl-filtered-search-term-token"
      :active="active"
      :cursor-position="cursorPosition"
      :search-input-attributes="searchInputAttributes"
      :is-last-token="isLastToken"
      :current-value="currentValue"
      :view-only="viewOnly"
      :options="suggestedTokens"
      @activate="$emit('activate')"
      @deactivate="$emit('deactivate')"
      @complete="onComplete"
      @backspace="onBackspace"
      @submit="$emit('submit')"
      @split="$emit('split', $event)"
      @previous="$emit('previous')"
      @next="$emit('next')"
    >
      <template #view="{ label }">
        <gl-token
          v-if="showToken"
          :class="{ 'gl-cursor-pointer': !viewOnly }"
          :view-only="viewOnly"
          v-on="eventListeners"
          >{{ value.data }}</gl-token
        >

        <input
          v-else-if="showInput"
          v-bind="searchInputAttributes"
          class="gl-filtered-search-term-input"
          :placeholder="placeholder"
          :aria-label="label"
          :readonly="viewOnly"
          :disabled="viewOnly"
          data-testid="filtered-search-term-input"
          @focusin="$emit('activate')"
        />

        <template v-else>{{ value.data }}</template>
      </template>
    </gl-filtered-search-token-segment>
  </div>
</template>
