<script>
import { uniqueId } from 'lodash-es';

import GlDropdownItem from '../../dropdown/dropdown_item.vue';
import GlDropdownDivider from '../../dropdown/dropdown_divider.vue';
import GlFormGroup from '../form_group/form_group.vue';
import GlFormInput from '../form_input/form_input.vue';

export default {
  name: 'GlFormCombobox',
  components: {
    GlDropdownItem,
    GlDropdownDivider,
    GlFormGroup,
    GlFormInput,
  },
  model: {
    prop: 'value',
    event: 'input',
  },
  props: {
    /**
     * Text for the combobox label.
     */
    labelText: {
      type: String,
      required: true,
    },
    /**
     * When true, visually hides the label while keeping it accessible to screen readers.
     */
    labelSrOnly: {
      type: Boolean,
      required: false,
      default: false,
    },
    /**
     * Array of tokens displayed in the combobox.
     */
    tokenList: {
      type: Array,
      required: true,
    },
    /**
     * List of action functions to display at the bottom of the dropdown
     */
    actionList: {
      type: Array,
      required: false,
      default: () => [],
    },
    /**
     * The current value of the combobox.
     */
    value: {
      type: [String, Object],
      required: true,
    },
    /**
     * The attribute name used to match values against options.
     */
    matchValueToAttr: {
      type: String,
      required: false,
      default: undefined,
    },
    /**
     * When true, automatically focuses the combobox on mount.
     */
    autofocus: {
      type: Boolean,
      required: false,
      default: false,
    },
    /**
     * Placeholder text for input field
     */
    placeholder: {
      type: String,
      required: false,
      default: undefined,
    },
  },
  data() {
    return {
      results: [],
      arrowCounter: -1,
      userDismissedResults: false,
      suggestionsId: uniqueId('token-suggestions-'),
      inputId: uniqueId('token-input-'),
      dropdownItemComponent: GlDropdownItem,
    };
  },
  computed: {
    isExpanded() {
      return this.showSuggestions && !this.userDismissedResults;
    },
    showAutocomplete() {
      return this.showSuggestions ? 'off' : 'on';
    },
    showSuggestions() {
      return this.value.length > 0 && this.allItems.length > 0;
    },
    displayedValue() {
      return this.matchValueToAttr && this.value[this.matchValueToAttr]
        ? this.value[this.matchValueToAttr]
        : this.value;
    },
    resultsLength() {
      return this.results.length;
    },
    allItems() {
      return [...this.results, ...this.actionList];
    },
  },
  watch: {
    tokenList(newList) {
      if (newList.length) {
        this.openSuggestions(newList);
      } else {
        this.results = [];
        this.arrowCounter = -1;
      }
    },
  },
  mounted() {
    document.addEventListener('click', this.handleClickOutside);
  },
  destroyed() {
    document.removeEventListener('click', this.handleClickOutside);
  },
  methods: {
    closeSuggestions() {
      this.results = [];
      this.arrowCounter = -1;
      this.userDismissedResults = true;
    },
    handleClickOutside(event) {
      if (!this.$el.contains(event.target)) {
        this.closeSuggestions();
      }
    },
    focusItem(index) {
      this.$refs.suggestionsMenu
        .querySelectorAll('.gl-dropdown-item')
        [index]?.querySelector('button')
        .focus();
    },
    onArrowDown(e) {
      e.preventDefault();
      let newCount = this.arrowCounter + 1;

      if (newCount >= this.allItems.length) {
        newCount = 0;
      }

      this.arrowCounter = newCount;
      this.focusItem(newCount);
    },
    onArrowUp(e) {
      e.preventDefault();
      let newCount = this.arrowCounter - 1;

      if (newCount < 0) {
        newCount = this.allItems.length - 1;
      }

      this.arrowCounter = newCount;
      this.focusItem(newCount);
    },
    onArrowLeft() {
      // don't prevent default, we want the cursor to move
      this.$refs.input.focus();
    },
    onArrowRight() {
      // don't prevent default, we want the cursor to move
      this.$refs.input.focus();
    },
    onEsc() {
      if (!this.showSuggestions) {
        this.$emit('input', '');
      }
      this.closeSuggestions();
    },
    onEntry(value) {
      this.$emit('input', value);
      this.userDismissedResults = false;

      // short circuit so that we don't false match on empty string
      if (value.length < 1) {
        this.closeSuggestions();
        return;
      }

      const filteredTokens = this.tokenList.filter((token) => {
        if (this.matchValueToAttr) {
          return token[this.matchValueToAttr].toLowerCase().includes(value.toLowerCase());
        }
        return token.toLowerCase().includes(value.toLowerCase());
      });

      if (filteredTokens.length) {
        this.openSuggestions(filteredTokens);
      } else {
        this.results = [];
        this.arrowCounter = -1;
      }
    },
    openSuggestions(filteredResults) {
      this.results = filteredResults;
    },
    selectToken(value) {
      this.$emit('input', value);
      this.closeSuggestions();
      /**
       * Emitted when a value is selected.
       * @event value-selected
       */
      this.$emit('value-selected', value);
    },
    selectAction(value) {
      value.fn();
      this.$emit('input', this.value);
      this.closeSuggestions();
    },
    resetCounter() {
      this.arrowCounter = -1;
    },
  },
};
</script>

<template>
  <div class="gl-form-combobox dropdown">
    <gl-form-group :label="labelText" :label-for="inputId" :label-sr-only="labelSrOnly">
      <gl-form-input
        :id="inputId"
        ref="input"
        :value="displayedValue"
        type="text"
        role="combobox"
        :aria-expanded="String(isExpanded)"
        :aria-controls="suggestionsId"
        :aria-owns="isExpanded ? suggestionsId : null"
        aria-autocomplete="list"
        aria-haspopup="listbox"
        :aria-activedescendant="
          arrowCounter >= 0 ? `${suggestionsId}-option-${arrowCounter}` : undefined
        "
        :autofocus="autofocus"
        :placeholder="placeholder"
        @input="onEntry"
        @focus="resetCounter"
        @keydown.down="onArrowDown"
        @keydown.up="onArrowUp"
        @keydown.left="onArrowLeft"
        @keydown.right="onArrowRight"
        @keydown.esc.stop="onEsc"
        @keydown.tab="closeSuggestions"
      />
    </gl-form-group>

    <div
      v-show="isExpanded"
      :id="suggestionsId"
      ref="suggestionsMenu"
      data-testid="combobox-dropdown"
      role="listbox"
      class="gl-form-combobox-inner -gl-mt-3 gl-mb-0 gl-flex gl-w-full gl-list-none gl-flex-col gl-bg-dropdown gl-pl-0 gl-drop-shadow-md"
      @keydown.down="onArrowDown"
      @keydown.up="onArrowUp"
      @keydown.left="onArrowLeft"
      @keydown.right="onArrowRight"
      @keydown.esc.stop="onEsc"
    >
      <div class="gl-overflow-y-auto">
        <gl-dropdown-item
          v-for="(result, i) in results"
          :id="`${suggestionsId}-option-${i}`"
          ref="results"
          :key="i"
          :active="i === arrowCounter"
          tabindex="-1"
          role="option"
          data-testid="combobox-result"
          @click="selectToken(result)"
          @keydown.enter.native="selectToken(result)"
        >
          <!-- @slot The suggestion result item to display. -->
          <slot name="result" :item="result">{{ result }}</slot>
        </gl-dropdown-item>
      </div>

      <gl-dropdown-divider v-if="resultsLength > 0 && actionList.length > 0" aria-hidden="true" />

      <div>
        <gl-dropdown-item
          v-for="(action, i) in actionList"
          :id="`${suggestionsId}-option-${i + resultsLength}`"
          :key="i + resultsLength"
          :active="i + resultsLength === arrowCounter"
          tabindex="-1"
          role="option"
          data-testid="combobox-action"
          @click="selectAction(action)"
          @keydown.enter.native="selectAction(action)"
          @keydown.left="onArrowLeft"
          @keydown.right="onArrowRight"
        >
          <!-- @slot The action item to display. -->
          <slot name="action" :item="action">{{ action.label }}</slot>
        </gl-dropdown-item>
      </div>
    </div>
  </div>
</template>
