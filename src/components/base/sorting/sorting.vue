<script>
import { uniqueId } from 'lodash-es';
import { GlTooltipDirective } from '../../../directives/tooltip/tooltip';
import GlButton from '../button/button.vue';
import GlButtonGroup from '../button_group/button_group.vue';
import GlCollapsibleListbox from '../new_dropdowns/listbox/listbox.vue';
import { isOption } from '../new_dropdowns/listbox/utils';
import { translate } from '../../../utils/i18n';

export default {
  name: 'GlSorting',
  components: {
    GlButton,
    GlButtonGroup,
    GlCollapsibleListbox,
  },
  directives: {
    GlTooltip: GlTooltipDirective,
  },
  props: {
    /**
     * Text to place in the toggle button.
     */
    text: {
      type: String,
      required: false,
      default: '',
    },
    /**
     * Sort options to display in the dropdown.
     *
     * Each option is `{ value, text }`. Set `directionToggleDisabled: true` on
     * an option that has no ascending/descending meaning (e.g. "Most relevant")
     * to disable the sort direction toggle whenever that option is selected.
     */
    sortOptions: {
      type: Array,
      required: false,
      default: () => [],
      // eslint-disable-next-line unicorn/no-array-callback-reference
      validator: (sortOptions) => sortOptions.every(isOption),
    },
    /**
     * The value of the item currently selected in the dropdown.
     * Only to be used with the `sortOptions` prop.
     */
    sortBy: {
      type: [String, Number],
      required: false,
      default: null,
    },
    /**
     * Determines the current sort order icon displayed.
     */
    isAscending: {
      type: Boolean,
      required: false,
      default: false,
    },
    /**
     * The text for the tooltip and aria-label of the sort direction toggle
     * button instead of the defaults for ascending/descending.
     */
    sortDirectionToolTip: {
      type: String,
      required: false,
      default: null,
    },
    /**
     * Additional class(es) to apply to the root element of the GlCollapsibleListbox.
     */
    dropdownClass: {
      type: String,
      required: false,
      default: '',
    },
    /**
     * Additional class(es) to apply to the dropdown toggle.
     */
    dropdownToggleClass: {
      type: String,
      required: false,
      default: '',
    },
    /**
     * Additional class(es) to apply to the sort direction toggle button.
     */
    sortDirectionToggleClass: {
      type: String,
      required: false,
      default: '',
    },
    /**
     * Render the dropdown toggle button as a block element
     */
    block: {
      type: Boolean,
      required: false,
      default: true,
    },
    /**
     * Disables the entire sorting control (both the sort-by dropdown and the
     * sort direction toggle) while keeping it visible.
     */
    disabled: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  data() {
    return {
      sortingListboxId: uniqueId('sorting-listbox-'),
      toggleId: uniqueId('sorting-toggle-'),
    };
  },
  computed: {
    unavailableLabel() {
      return translate('GlSorting.sortingUnavailable', 'Sorting is unavailable');
    },
    sortingListboxLabel() {
      if (this.disabled) {
        return this.unavailableLabel;
      }

      return translate('GlSorting.sortByLabel', 'Sort by:');
    },
    localSortDirection() {
      return this.isAscending ? 'sort-lowest' : 'sort-highest';
    },
    selectedSortOption() {
      return this.sortOptions.find((option) => option.value === this.sortBy);
    },
    selectedSortText() {
      return this.selectedSortOption?.text ?? '';
    },
    isDirectionToggleDisabled() {
      return this.disabled || Boolean(this.selectedSortOption?.directionToggleDisabled);
    },
    sortDirectionText() {
      if (this.sortDirectionToolTip && !this.disabled) return this.sortDirectionToolTip;

      if (this.isDirectionToggleDisabled) {
        return this.selectedSortText
          ? translate(
              'GlSorting.sortDirectionUnavailableFor',
              'Sorting is unavailable for %{sortField}',
              { sortField: this.selectedSortText },
            )
          : this.unavailableLabel;
      }

      return this.isAscending
        ? translate('GlSorting.sortAscending', 'Sort direction: ascending')
        : translate('GlSorting.sortDescending', 'Sort direction: descending');
    },
  },
  watch: {
    disabled(isDisabled) {
      if (isDisabled) this.$refs.listbox.close();
    },
  },
  methods: {
    toggleSortDirection() {
      if (this.isDirectionToggleDisabled) return;

      const newDirection = !this.isAscending;

      /**
       * Emitted when the sort direction button is clicked.
       *
       * The event's payload will be true if the direction has been changed to
       * ascending, or false if descending.
       *
       * @property {boolean} isAscending
       */
      this.$emit('sort-direction-change', newDirection);
    },
    onSortByChanged(event) {
      if (this.disabled) return;

      /**
       * Emitted when the sort field is changed.
       *
       * The event's payload is the value of the selected sort field.
       *
       * Only emitted when using the `sortOptions` prop.
       *
       * @property {string|number} value
       */
      this.$emit('sort-by-change', event);
    },
  },
};
</script>

<template>
  <gl-button-group class="gl-sorting gl-flex">
    <gl-collapsible-listbox
      ref="listbox"
      :toggle-text="text"
      :items="sortOptions"
      :selected="sortBy"
      :toggle-class="dropdownToggleClass"
      class="gl-w-full"
      :class="dropdownClass"
      placement="bottom-end"
      :block="block"
      :disabled="disabled"
      :toggle-id="toggleId"
      :toggle-aria-labelled-by="`${sortingListboxId} ${toggleId}`"
      @select="onSortByChanged"
    />
    <span :id="sortingListboxId" class="gl-sr-only">{{ sortingListboxLabel }}</span>
    <gl-button
      v-gl-tooltip
      :title="sortDirectionText"
      :icon="localSortDirection"
      :aria-label="sortDirectionText"
      :disabled="isDirectionToggleDisabled"
      :accessible-disabled="isDirectionToggleDisabled"
      :class="['sorting-direction-button', sortDirectionToggleClass]"
      @click="toggleSortDirection"
    />
  </gl-button-group>
</template>
