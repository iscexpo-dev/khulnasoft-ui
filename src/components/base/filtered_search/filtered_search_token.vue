<script>
import { cloneDeep, isEqual } from 'lodash-es';
import GlToken from '../token/token.vue';
import { stopEvent } from '../../../utils/utils';
import GlFilteredSearchTokenSegment from './filtered_search_token_segment.vue';
import { createTerm, tokenToOption, TOKEN_CLOSE_SELECTOR } from './filtered_search_utils';

const SEGMENT_TITLE = 'TYPE';
const SEGMENT_OPERATOR = 'OPERATOR';
const SEGMENT_DATA = 'DATA';

const DEFAULT_OPERATORS = [
  { value: '=', description: 'is', default: true },
  { value: '!=', description: 'is not' },
];

export default {
  name: 'GlFilteredSearchToken',
  components: {
    GlToken,
    GlFilteredSearchTokenSegment,
  },
  inheritAttrs: false,
  props: {
    /**
     * Array of available token definitions.
     */
    availableTokens: {
      type: Array,
      required: false,
      default: () => [],
    },
    /**
     * Token configuration with available operators and options.
     */
    config: {
      type: Object,
      required: false,
      default: () => ({}),
    },
    /**
     * Determines if the token is being edited or not.
     */
    active: {
      type: Boolean,
      required: false,
      default: false,
    },
    /**
     * Array of pre-selected multi-select values.
     */
    multiSelectValues: {
      type: Array,
      required: false,
      default: () => [],
    },
    /**
     * Current token value.
     */
    value: {
      type: Object,
      required: false,
      default: () => ({ operator: '', data: '' }),
    },
    /**
     * Display operators' descriptions instead of their values (e.g., "is" instead of "=").
     */
    showFriendlyText: {
      type: Boolean,
      required: false,
      default: false,
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
    /**
     * Attributes to bind to the input element of the data segment.
     */
    dataSegmentInputAttributes: {
      type: Object,
      required: false,
      default: () => ({}),
    },
  },
  data() {
    return {
      activeSegment: null,
      tokenValue: cloneDeep(this.value),
      intendedCursorPosition: this.cursorPosition,
    };
  },

  computed: {
    operators() {
      return this.config.operators || DEFAULT_OPERATORS;
    },

    tokenEmpty() {
      return this.tokenValue.data?.length === 0;
    },

    hasDataOrDataSegmentIsCurrentlyActive() {
      const hasData = !this.tokenEmpty;
      return hasData || this.isSegmentActive(SEGMENT_DATA);
    },

    availableTokensWithSelf() {
      return [this.config, ...this.availableTokens.filter((token) => token !== this.config)].map(
        // eslint-disable-next-line unicorn/no-array-callback-reference
        tokenToOption,
      );
    },

    operatorDescription() {
      const operator = this.operators.find((op) => op.value === this.tokenValue.operator);
      return this.showFriendlyText ? operator?.description : operator?.value;
    },

    eventListeners() {
      return this.viewOnly
        ? {}
        : { mousedown: this.stopMousedownOnCloseButton, close: this.destroyByClose };
    },
  },
  segments: {
    SEGMENT_TITLE,
    SEGMENT_DATA,
    SEGMENT_OPERATOR,
  },
  watch: {
    tokenValue: {
      deep: true,
      handler(newValue) {
        /**
         * Emitted when the token changes its value.
         *
         * @event input
         * @type {object} dataObj Object containing the update value.
         */
        this.$emit('input', newValue);
      },
    },

    value: {
      handler(newValue, oldValue) {
        if (isEqual(newValue?.data, oldValue?.data) && newValue?.operator === oldValue?.operator) {
          return;
        }

        this.tokenValue = cloneDeep(newValue);
      },
    },

    active: {
      immediate: true,
      handler(tokenIsActive) {
        if (tokenIsActive) {
          this.intendedCursorPosition = this.cursorPosition;
          if (!this.activeSegment) {
            this.activateSegment(this.tokenEmpty ? SEGMENT_OPERATOR : SEGMENT_DATA);
          }
        } else {
          this.activeSegment = null;

          // restore multi select values if we have them
          // otherwise destroy the token
          if (this.config.multiSelect) {
            this.$emit('input', { ...this.tokenValue, data: this.multiSelectValues || '' });
          }

          if (this.tokenEmpty && this.multiSelectValues.length === 0) {
            /**
             * Emitted when token is about to be destroyed.
             *
             * @event destroy
             */
            this.$emit('destroy');
          }
        }
      },
    },
  },

  created() {
    if (!('operator' in this.tokenValue)) {
      if (this.operators.length === 1) {
        const operator = this.operators[0].value;
        this.$emit('input', { ...this.tokenValue, operator });
        this.activeSegment = SEGMENT_DATA;
      } else {
        this.$emit('input', { ...this.tokenValue, operator: '' });
      }
    }
  },

  methods: {
    activateSegment(segment) {
      if (this.viewOnly) return;

      this.activeSegment = segment;

      if (!this.active) {
        /**
         * Emitted when this term token is clicked.
         *
         * @event activate
         */
        this.$emit('activate');
      }
    },

    getAdditionalSegmentClasses(segment) {
      if (this.viewOnly) {
        return 'gl-cursor-text';
      }
      return { 'gl-cursor-pointer': !this.isSegmentActive(segment) };
    },

    isSegmentActive(segment) {
      return this.active && this.activeSegment === segment;
    },

    replaceWithTermIfEmpty() {
      if (this.tokenValue.operator === '' && this.tokenEmpty) {
        /**
         * Emitted when this token is converted to another type
         * @property {object} token Replacement token configuration
         */
        this.$emit('replace', createTerm(this.config.title));
      }
    },

    async replaceToken(newType) {
      const newTokenConfig = this.availableTokens.find(({ type }) => type === newType);

      if (newTokenConfig === this.config) {
        await this.$nextTick();
        /**
         * Emitted when this term token will lose its focus.
         *
         * @event deactivate
         */
        this.$emit('deactivate');
        return;
      }

      if (newTokenConfig) {
        const isCompatible =
          this.config.dataType && this.config.dataType === newTokenConfig.dataType;
        this.$emit('replace', {
          type: newTokenConfig.type,
          value: isCompatible ? this.tokenValue : { data: '' },
        });
      }
    },

    handleOperatorKeydown(evt, { inputValue, suggestedValue, applySuggestion }) {
      const { key } = evt;
      if (key === ' ' || key === 'Spacebar') {
        applySuggestion(suggestedValue);
        return;
      }

      const potentialValue = `${inputValue}${key}`;
      if (
        key.length === 1 &&
        !this.operators.find(({ value }) => value.startsWith(potentialValue))
      ) {
        if (this.tokenEmpty) {
          applySuggestion(suggestedValue);
        } else {
          evt.preventDefault();
        }
      }
    },

    activateDataSegment() {
      if (this.config.multiSelect) {
        this.$emit('input', { ...this.tokenValue, data: '' });
      }
      this.activateSegment(this.$options.segments.SEGMENT_DATA);
    },

    activatePreviousOperatorSegment() {
      this.activateSegment(this.$options.segments.SEGMENT_OPERATOR);
      this.intendedCursorPosition = 'end';
    },

    activatePreviousTitleSegment() {
      this.activateSegment(this.$options.segments.SEGMENT_TITLE);
      this.intendedCursorPosition = 'end';
    },

    activateNextDataSegment() {
      this.activateDataSegment();
      this.intendedCursorPosition = 'start';
    },

    activateNextOperatorSegment() {
      this.activateSegment(this.$options.segments.SEGMENT_OPERATOR);
      this.intendedCursorPosition = 'start';
    },

    handleComplete(value) {
      /**
       * Emitted when the token entry has been completed.
       *
       * @event complete
       */
      this.$emit('complete', value);
    },

    stopMousedownOnCloseButton(event) {
      if (event.target.closest(TOKEN_CLOSE_SELECTOR)) {
        stopEvent(event);
      }
    },

    destroyByClose() {
      this.$emit('destroy');
    },
  },
};
</script>

<template>
  <div
    class="gl-filtered-search-token"
    :class="{
      'gl-filtered-search-token-active': active,
      'gl-filtered-search-token-hover': !viewOnly,
      'gl-cursor-default': viewOnly,
    }"
    data-testid="filtered-search-token"
  >
    <!--
      Emitted when the token is submitted.
      @event submit
    -->

    <gl-filtered-search-token-segment
      key="title-segment"
      :value="config.segmentTitle || config.title"
      :active="isSegmentActive($options.segments.SEGMENT_TITLE)"
      :cursor-position="intendedCursorPosition"
      :options="availableTokensWithSelf"
      :view-only="viewOnly"
      @activate="activateSegment($options.segments.SEGMENT_TITLE)"
      @deactivate="$emit('deactivate')"
      @complete="replaceToken"
      @backspace="$emit('destroy')"
      @submit="$emit('submit')"
      @previous="$emit('previous')"
      @next="activateNextOperatorSegment"
    >
      <template #view="{ inputValue }">
        <gl-token
          class="gl-filtered-search-token-type"
          :class="getAdditionalSegmentClasses($options.segments.SEGMENT_TITLE)"
          view-only
        >
          {{ inputValue }}
        </gl-token>
      </template>
    </gl-filtered-search-token-segment>

    <gl-filtered-search-token-segment
      key="operator-segment"
      v-model="tokenValue.operator"
      :active="isSegmentActive($options.segments.SEGMENT_OPERATOR)"
      :cursor-position="intendedCursorPosition"
      :options="operators"
      option-text-field="value"
      :custom-input-keydown-handler="handleOperatorKeydown"
      :view-only="viewOnly"
      @activate="activateSegment($options.segments.SEGMENT_OPERATOR)"
      @backspace="replaceWithTermIfEmpty"
      @complete="activateSegment($options.segments.SEGMENT_DATA)"
      @deactivate="$emit('deactivate')"
      @previous="activatePreviousTitleSegment"
      @next="activateNextDataSegment"
    >
      <template #view>
        <gl-token
          class="gl-filtered-search-token-operator"
          variant="search-value"
          :class="getAdditionalSegmentClasses($options.segments.SEGMENT_OPERATOR)"
          view-only
        >
          {{ operatorDescription }}
        </gl-token>
      </template>

      <template #option="{ option }">
        <div class="gl-flex">
          {{ showFriendlyText ? option.description : option.value }}
          <span v-if="option.description" class="gl-filtered-search-token-operator-description">
            {{ showFriendlyText ? option.value : option.description }}
          </span>
        </div>
      </template>
    </gl-filtered-search-token-segment>

    <!--
      Emitted when a suggestion has been selected.
      @event select
      @type {string} value The value of the selected suggestion.
    -->

    <!--
      Emitted when Space is pressed in-between term text.
      Not emitted when termsAsTokens is true.
      @event split
      @property {array} newTokens Token configurations
    -->

    <gl-filtered-search-token-segment
      v-if="hasDataOrDataSegmentIsCurrentlyActive"
      key="data-segment"
      v-model="tokenValue.data"
      :active="isSegmentActive($options.segments.SEGMENT_DATA)"
      :cursor-position="intendedCursorPosition"
      :multi-select="config.multiSelect"
      :options="config.options"
      :view-only="viewOnly"
      :search-input-attributes="dataSegmentInputAttributes"
      @activate="activateDataSegment"
      @backspace="activateSegment($options.segments.SEGMENT_OPERATOR)"
      @complete="handleComplete"
      @select="$emit('select', $event)"
      @submit="$emit('submit')"
      @deactivate="$emit('deactivate')"
      @split="$emit('split', $event)"
      @previous="activatePreviousOperatorSegment"
      @next="$emit('next')"
    >
      <template #before-input="scope">
        <slot name="before-data-segment-input" v-bind="scope"></slot>
      </template>

      <template #input="scope">
        <slot name="data-segment-input" v-bind="scope"></slot>
      </template>

      <template #suggestions>
        <!-- @slot The suggestions (implemented with GlFilteredSearchSuggestion). -->

        <slot name="suggestions"></slot>
      </template>

      <template #view="{ inputValue }">
        <!-- @slot Used to customize how the token is rendered. -->

        <slot
          name="view-token"
          v-bind="{
            inputValue,
            listeners: eventListeners,
            cssClasses: {
              'gl-filtered-search-token-data': true,
              ...getAdditionalSegmentClasses($options.segments.SEGMENT_DATA),
            },
          }"
        >
          <gl-token
            class="gl-filtered-search-token-data"
            variant="search-value"
            :class="getAdditionalSegmentClasses($options.segments.SEGMENT_DATA)"
            :view-only="viewOnly"
            v-on="eventListeners"
          >
            <span class="gl-filtered-search-token-data-content">
              <!--
              @slot Template for token value in inactive state
              @binding {array} suggestions Slot for rendering autocomplete suggestions when no options are provided.
              -->

              <slot name="view" v-bind="{ inputValue }">{{ inputValue }}</slot>
            </span>
          </gl-token>
        </slot>
      </template>
    </gl-filtered-search-token-segment>
  </div>
</template>
