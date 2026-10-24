<script>
import { clamp, uniqueId, isEqual } from 'lodash-es';
import { stopEvent, logWarning } from '../../../../utils/utils';
import {
  GL_DROPDOWN_SHOWN,
  GL_DROPDOWN_HIDDEN,
  ENTER,
  HOME,
  END,
  ARROW_DOWN,
  ARROW_UP,
  GL_DROPDOWN_CONTENTS_CLASS,
  GL_DROPDOWN_FOCUS_CONTENT,
  POSITION_ABSOLUTE,
  POSITION_FIXED,
} from '../constants';
import {
  buttonCategoryOptions,
  buttonSizeOptions,
  dropdownPlacements,
  dropdownVariantOptions,
} from '../../../../utils/constants';
import GlButton from '../../button/button.vue';
import GlLoadingIcon from '../../loading_icon/loading_icon.vue';
import GlIntersectionObserver from '../../../utilities/intersection_observer/intersection_observer.vue';
import GlSearchBoxByType from '../../search_box_by_type/search_box_by_type.vue';
import GlBaseDropdown from '../base_dropdown/base_dropdown.vue';
import { translate, translatePlural } from '../../../../utils/i18n';
import GlListboxItem from './listbox_item.vue';
import GlListboxSearchInput from './listbox_search_input.vue';
import GlListboxGroup from './listbox_group.vue';
import { isOption, itemsValidator, flattenedOptions } from './utils';

export const ITEM_SELECTOR = '[role="option"]';
export const ITEM_NULL_KEY = Symbol('null-key');
const HEADER_ITEMS_BORDER_CLASSES = [
  'gl-border-b-1',
  'gl-border-b-solid',
  'gl-border-b-dropdown-divider',
];
const GROUP_TOP_BORDER_CLASSES = [
  'gl-border-t-1',
  'gl-border-t-solid',
  'gl-border-t-dropdown-divider',
  'gl-pt-1',
  'gl-mt-2',
];
export const SEARCH_INPUT_SELECTOR = '.gl-listbox-search-input';

export default {
  name: 'GlCollapsibleListbox',
  HEADER_ITEMS_BORDER_CLASSES,
  events: {
    GL_DROPDOWN_SHOWN,
    GL_DROPDOWN_HIDDEN,
    GL_DROPDOWN_FOCUS_CONTENT,
  },
  components: {
    GlBaseDropdown,
    GlListboxItem,
    GlListboxGroup,
    GlButton,
    GlSearchBoxByType,
    GlListboxSearchInput,
    GlLoadingIcon,
    GlIntersectionObserver,
  },
  inject: {
    getFormGroupInstance: {
      default: () => () => {},
    },
  },
  model: {
    prop: 'selected',
    event: 'select',
  },
  props: {
    /**
     * Items to display in the dropdown
     */
    items: {
      type: Array,
      required: false,
      default: () => [],
      validator: itemsValidator,
    },
    /**
     * Array of selected items values for multi-select and selected item value for single-select
     */
    selected: {
      type: [Array, String, Number, null],
      required: false,
      default: () => [],
    },
    /**
     * Allow multi-selection
     */
    multiple: {
      type: Boolean,
      required: false,
      default: false,
    },
    /**
     * Toggle button text
     */
    toggleText: {
      type: String,
      required: false,
      default: '',
    },
    /**
     * Toggle text to be read by screen readers only
     */
    textSrOnly: {
      type: Boolean,
      required: false,
      default: false,
    },
    /** The header text */
    headerText: {
      type: String,
      required: false,
      default: '',
    },
    /**
     * Styling option - dropdown's toggle category
     */
    category: {
      type: String,
      required: false,
      default: buttonCategoryOptions.primary,
      validator: (value) => value in buttonCategoryOptions,
    },
    /**
     * Styling option - dropdown's toggle variant
     */
    variant: {
      type: String,
      required: false,
      default: dropdownVariantOptions.default,
      validator: (value) => value in dropdownVariantOptions,
    },
    /**
     * The size of the dropdown toggle
     */
    size: {
      type: String,
      required: false,
      default: 'medium',
      validator: (value) => value in buttonSizeOptions,
    },
    /**
     * Icon name that will be rendered in the toggle button
     */
    icon: {
      type: String,
      required: false,
      default: '',
    },
    /**
     * Set to "true" to disable the dropdown
     */
    disabled: {
      type: Boolean,
      required: false,
      default: false,
    },
    /**
     * Controls the validation state appearance of the component. `true` for valid, `false` for invalid, or `null` for no validation state
     */
    state: {
      type: Boolean,
      required: false,
      default: null,
    },
    /**
     * Set to "true" when dropdown content (items) is loading
     * It will render a small loader in the dropdown toggle and make it disabled
     */
    loading: {
      type: Boolean,
      required: false,
      default: false,
    },
    /**
     * Additional CSS classes to customize toggle appearance
     */
    toggleClass: {
      type: [String, Array, Object],
      required: false,
      default: null,
    },
    /**
     * Set to "true" to hide the caret
     */
    noCaret: {
      type: Boolean,
      required: false,
      default: false,
    },
    /**
     * Align listbox menu with respect to the toggle button
     */
    placement: {
      type: String,
      required: false,
      default: 'bottom-start',
      validator: (value) => Object.keys(dropdownPlacements).includes(value),
    },
    /**
     * Center selected item checkmark
     */
    isCheckCentered: {
      type: Boolean,
      required: false,
      default: false,
    },
    /**
     * The `id` attribute value for the toggle button
     */
    toggleId: {
      type: String,
      required: false,
      default: null,
    },
    /**
     * The `aria-labelledby` attribute value for the toggle button
     * Provide the string of IDs seperated by space
     */
    toggleAriaLabelledBy: {
      type: String,
      required: false,
      default: null,
    },
    /**
     * The `aria-labelledby` attribute value for the list of options
     * Provide the string of IDs seperated by space
     */
    listAriaLabelledBy: {
      type: String,
      required: false,
      default: null,
    },
    /**
     * Enable search
     */
    searchable: {
      type: Boolean,
      required: false,
      default: false,
    },
    /**
     * Set to "true" when items search is in progress.
     * It will display loading icon below the search input
     */
    searching: {
      type: Boolean,
      required: false,
      default: false,
    },
    /**
     * Enables infinite scroll.
     * When set to `true`, the `@bottom-reached` event will be fired when
     * the bottom of the listbox is scrolled to.
     * Does not support groups.
     */
    infiniteScroll: {
      type: Boolean,
      required: false,
      default: false,
    },
    /**
     * This prop is used for infinite scroll.
     * It represents the total number of items that exist,
     * even if they have not yet been loaded.
     * Do not set this prop if the total number of items is unknown.
     */
    totalItems: {
      type: Number,
      required: false,
      default: null,
    },
    /**
     * This prop is used for infinite scroll.
     * Set to `true` when more items are being loaded.
     */
    infiniteScrollLoading: {
      type: Boolean,
      required: false,
      default: false,
    },
    /**
     * Message to be displayed when filtering produced no results
     */
    noResultsText: {
      type: String,
      required: false,
      default: 'No results found',
    },
    /**
     * Search input placeholder text and aria-label
     */
    searchPlaceholder: {
      type: String,
      required: false,
      default: 'Search',
    },
    /**
     * The reset button's label, to be rendered in the header. If this is omitted, the button is not
     * rendered.
     * The reset button requires a header to be set, so this prop should be used in conjunction with
     * headerText.
     */
    resetButtonLabel: {
      type: String,
      required: false,
      default: '',
    },
    /**
     * The select all button's label, to be rendered in the header. If this is omitted, the button is not
     * rendered.
     * The select all button requires a header to be set, so this prop should be used in conjunction with
     * headerText.
     */
    showSelectAllButtonLabel: {
      type: String,
      required: false,
      default: '',
    },
    /**
     * Render the toggle button as a block element
     */
    block: {
      type: Boolean,
      required: false,
      default: false,
    },
    /**
     * Custom offset to be applied to Floating UI's offset middleware.
     * https://floating-ui.com/docs/offset
     */
    dropdownOffset: {
      type: [Number, Object],
      required: false,
      default: undefined,
    },
    /**
     * Lets the dropdown extend to match its content's width, up to a maximum width
     * defined by the `$gl-new-dropdown-max-width` variable.
     */
    fluidWidth: {
      type: Boolean,
      required: false,
      default: false,
    },
    /**
     * Allows the dropdown panel to match the width of the trigger element
     */
    panelMatchTriggerWidth: {
      type: Boolean,
      required: false,
      default: false,
    },
    /**
     * Strategy to be applied by computePosition. If the dropdown's container is too short for it to
     * fit in, setting this to fixed will let it position itself above its container.
     * https://floating-ui.com/docs/computePosition#strategy
     */
    positioningStrategy: {
      type: String,
      required: false,
      default: POSITION_ABSOLUTE,
      validator: (strategy) => [POSITION_ABSOLUTE, POSITION_FIXED].includes(strategy),
    },
    /**
     * Opens dropdown on render
     */
    startOpened: {
      type: Boolean,
      required: false,
      default: false,
    },
    /**
     * Screen-reader-only label for results count.
     */
    srOnlyResultsLabel: {
      type: Function,
      required: false,
      default: translatePlural(
        'GlCollapsibleListbox.srOnlyResultsLabel',
        '%d result',
        '%d results',
      ),
    },
  },
  data() {
    return {
      selectedValues: [],
      listboxId: uniqueId('listbox-'),
      searchInputId: uniqueId('listbox-search-input-'),
      nextFocusedItemIndex: null,
      searchStr: '',
      topBoundaryVisible: true,
      bottomBoundaryVisible: true,
      activeItemId: null,
      itemIds: new Map(),
    };
  },
  computed: {
    /**
     * Determines the `aria-labelledby` attribute value for the listbox by
     * evaluating a series of conditions in priority order. The returned ID
     * references the element that best describes the listbox content, with
     * preference given to headers in searchable lists, followed by search
     * input, form labels, and finally fallback options.
     */
    listboxAriaLabelledByID() {
      // Listbox is labelled by closest heading, creating a meaningful relationship
      if (this.headerId && this.searchable) return `${this.headerId}`;

      // Listbox is labelled by the search input with role="combobox"
      if (this.searchable) return this.searchInputId;

      // Listbox is labelledy by the text inside an externally labelled button
      if (this.isInFormGroup) return this.listboxIdComputed;

      // Fallback. Return a header ID or the toggle button ID.
      return this.listAriaLabelledBy || this.headerId || this.toggleIdComputed;
    },
    isInFormGroup() {
      return Boolean(this.getFormGroupInstance());
    },
    toggleIdComputed() {
      return this.toggleId || uniqueId('dropdown-toggle-btn-');
    },
    // Generate a custom listbox ID when inside GlFormGroup
    listboxIdComputed() {
      if (this.isInFormGroup) {
        if (this.listAriaLabelledBy) {
          return this.listAriaLabelledBy;
        }
        if (this.toggleId) {
          return `${this.toggleId}-span`;
        }
        return uniqueId('dropdown-toggle-span-');
      }
      return undefined;
    },
    listboxTag() {
      if (!this.hasItems || isOption(this.items[0])) return 'ul';
      return 'div';
    },
    listboxClasses() {
      return {
        'top-scrim-visible': !this.topBoundaryVisible,
        'bottom-scrim-visible': !this.bottomBoundaryVisible,
        [GL_DROPDOWN_CONTENTS_CLASS]: true,
      };
    },
    itemTag() {
      return this.listboxTag === 'ul' ? 'li' : 'div';
    },
    flattenedOptions() {
      return flattenedOptions(this.items);
    },
    searchHasOptions() {
      return this.flattenedOptions.length > 0 && this.searchStr;
    },
    hasItems() {
      return this.items.length > 0;
    },
    listboxToggleText() {
      if (!this.toggleText) {
        if (!this.multiple && this.selectedValues.length) {
          return this.flattenedOptions.find(({ value }) => value === this.selectedValues[0])?.text;
        }
        return '';
      }

      return this.toggleText;
    },
    selectedIndices() {
      return this.selectedValues
        .map((selected) => this.flattenedOptions.findIndex(({ value }) => value === selected))
        .filter((index) => index !== -1)
        .sort();
    },
    showList() {
      return this.flattenedOptions.length && !this.searching;
    },
    showNoResultsText() {
      return !this.flattenedOptions.length && !this.searching;
    },
    announceSRSearchResults() {
      return this.searchable && !this.showNoResultsText;
    },
    headerId() {
      return this.headerText && uniqueId('listbox-header-');
    },
    showResetButton() {
      if (!this.resetButtonLabel) {
        return false;
      }

      /**
       * if dropdown has no items
       * reset all should be hidden
       */
      if (!this.hasItems) {
        return false;
      }

      // hide if no selection
      if (!this.selected || this.selected.length === 0) {
        return false;
      }

      // only show reset button if show all button is not there
      return !this.showSelectAllButton;
    },
    showSelectAllButton() {
      if (!this.showSelectAllButtonLabel) {
        return false;
      }

      if (!this.multiple) {
        return false;
      }

      /**
       * if dropdown has no items
       * select all should be hidden
       */
      if (!this.hasItems) {
        return false;
      }

      return this.selected.length !== this.flattenedOptions.length;
    },
    showIntersectionObserver() {
      return this.infiniteScroll && !this.infiniteScrollLoading && !this.loading && !this.searching;
    },
    isBusy() {
      return this.infiniteScrollLoading || this.loading || this.searching;
    },
    hasCustomToggle() {
      return Boolean(this.$scopedSlots.toggle);
    },
    hasSelection() {
      return Boolean(this.selectedValues.length);
    },
    toggleButtonClasses() {
      const toggleClasses = [this.toggleClass];

      if (!this.hasSelection) {
        toggleClasses.push('!gl-text-subtle');
      }
      return toggleClasses;
    },
    hasHeader() {
      return this.headerText || this.searchable;
    },
    hasFooter() {
      return Boolean(this.$scopedSlots.footer);
    },
    loadingAnnouncementText() {
      if (this.infiniteScrollLoading) {
        return translate(
          'GlCollapsibleListbox.loadingAnnouncementText.loadingMoreItems',
          'Loading more items',
        );
      }
      if (this.searching) {
        return translate('GlCollapsibleListbox.loadingAnnouncementText.searching', 'Searching');
      }
      if (this.loading) {
        return translate(
          'GlCollapsibleListbox.loadingAnnouncementText.loadingItems',
          'Loading items',
        );
      }
      return '';
    },
  },
  watch: {
    selected: {
      immediate: true,
      handler(newSelected, oldSelected) {
        if (Array.isArray(newSelected)) {
          if (process.env.NODE_ENV !== 'production' && !this.multiple && newSelected.length) {
            throw new Error('To allow multi-selection, please, set "multiple" property to "true"');
          }
          this.selectedValues = [...newSelected];
        } else {
          this.selectedValues = [newSelected];
        }

        if (
          // Do not emit change event immediately on watcher creation.
          oldSelected !== undefined &&
          !isEqual(newSelected, oldSelected)
        ) {
          /**
           * Emitted when the selected prop value changes
           *
           * @event change
           */
          this.$emit('change');
        }
      },
    },
    items: {
      async handler() {
        await this.$nextTick();
        /* Every time the list of items changes (on search),
         * the observed elements are recreated, thus we need to start obesrving them again */
        this.observeScroll();

        /**
         * Every time the list of items changes, and there is a search string,
         * we want to visually highlight the first enabled item
         */
        if (this.searchHasOptions) {
          this.nextFocusedItemIndex = this.getFirstEnabledIndex();
        } else {
          this.nextFocusedItemIndex = null;
        }
      },
    },
    ...(process.env.NODE_ENV !== 'production'
      ? {
          resetButtonLabel: {
            immediate: true,
            handler(newResetButtonLabel) {
              if (newResetButtonLabel && !this.headerText) {
                throw new Error(
                  'The reset button cannot be rendered without a header. Either provide a header via the headerText prop, or do not provide the resetButtonLabel prop.',
                );
              }
            },
          },
          showSelectAllButtonLabel: {
            immediate: true,
            handler(showSelectAllButtonLabel) {
              if (showSelectAllButtonLabel && !this.headerText) {
                throw new Error(
                  'The select all button cannot be rendered without a header. Either provide a header via the headerText prop, or do not provide the showSelectAllButtonLabel prop.',
                );
              }
            },
          },
          infiniteScroll: {
            immediate: true,
            handler(newValue) {
              if (newValue && this.items.some((item) => !isOption(item))) {
                logWarning(
                  'When using grouped options infinite scroll can only be used on the last group.',
                  { name: 'GlCollapsibleListbox' },
                );
              }
            },
          },
        }
      : {}),
  },
  mounted() {
    if (this.startOpened) {
      this.open();
    }
    this.observeScroll();
  },
  beforeDestroy() {
    this.scrollObserver?.disconnect();
  },
  methods: {
    onFocusContent(event) {
      event.preventDefault();
      this.open();
    },
    open() {
      this.$refs.baseDropdown.open();
    },
    close() {
      this.$refs.baseDropdown.close();
    },
    groupClasses(index) {
      return index === 0 ? null : GROUP_TOP_BORDER_CLASSES;
    },
    onShow() {
      if (this.searchable) {
        this.focusSearchInput();

        /**
         * If the search string is not empty, highlight the first enabled item
         */
        if (this.searchHasOptions) {
          const firstEnabledIndex = this.getFirstEnabledIndex();
          this.nextFocusedItemIndex = firstEnabledIndex;
          // Set activeItemId for the first enabled item
          const firstItem = this.flattenedOptions[firstEnabledIndex];
          this.activeItemId = this.generateItemId(firstItem);
        }
      } else {
        const selectedIndex = this.selectedIndices[0];
        const initialIndex =
          selectedIndex !== undefined && !this.flattenedOptions[selectedIndex]?.disabled
            ? selectedIndex
            : this.getFirstEnabledIndex();
        this.focusItem(initialIndex, this.getFocusableListItemElements());
      }
      /**
       * Emitted when dropdown is shown
       *
       * @event shown
       */
      this.$emit(GL_DROPDOWN_SHOWN);
    },
    onHide(event) {
      /**
       * Emitted when dropdown is hidden
       *
       * @event hidden
       */
      this.$emit(GL_DROPDOWN_HIDDEN);
      this.nextFocusedItemIndex = null;
      // Emit native blur event for form validation in FormGroup
      this.$emit('blur', event);
    },
    getNextIndex(currentIndex, keyCode, totalLength) {
      const direction = keyCode === ARROW_UP ? -1 : 1;
      let nextIndex = currentIndex;

      for (let i = 0; i < totalLength; i += 1) {
        nextIndex += direction;
        if (nextIndex < 0) nextIndex = totalLength - 1;
        if (nextIndex >= totalLength) nextIndex = 0;

        if (!this.flattenedOptions[nextIndex]?.disabled) {
          return nextIndex;
        }
      }

      return currentIndex;
    },
    getFirstEnabledIndex() {
      return this.flattenedOptions.findIndex((item) => !item.disabled);
    },
    getLastEnabledIndex() {
      return this.flattenedOptions.findLastIndex((item) => !item.disabled);
    },
    handleListNavigation(keyCode, elements) {
      const currentIndex = this.nextFocusedItemIndex ?? -1;
      const nextIndex = this.getNextIndex(currentIndex, keyCode, elements.length);
      this.focusItem(nextIndex, elements, this.searchable);
    },
    onKeydown(event) {
      const { code, target } = event;
      const elements = this.getFocusableListItemElements();

      if (elements.length < 1) return;

      const isSearchInput = target.matches(SEARCH_INPUT_SELECTOR);
      let stop = true;

      switch (code) {
        case HOME:
          // Jump to first enabled item if searchable or not in search input
          if (this.searchable || !isSearchInput) {
            this.focusItem(this.getFirstEnabledIndex(), elements, this.searchable);
          }
          break;

        case END:
          // Jump to last enabled item if searchable or not in search input
          if (this.searchable || !isSearchInput) {
            this.focusItem(this.getLastEnabledIndex(), elements, this.searchable);
          }
          break;

        case ARROW_UP:
          // Let default behavior work for non-searchable input
          if (isSearchInput && !this.searchable) {
            return;
          }
          this.handleListNavigation(ARROW_UP, elements);
          break;

        case ARROW_DOWN:
          // Focus first enabled item from search input, otherwise navigate down
          if (isSearchInput && !this.searchable) {
            this.focusItem(this.getFirstEnabledIndex(), elements);
          } else {
            this.handleListNavigation(ARROW_DOWN, elements);
          }
          break;

        case ENTER:
          if (isSearchInput) {
            // Toggle selection of highlighted item if one exists and is not disabled
            if (elements.length > 0 && this.nextFocusedItemIndex !== null) {
              const highlightedItem = this.flattenedOptions[this.nextFocusedItemIndex];
              if (!highlightedItem?.disabled) {
                this.onSelect(highlightedItem, !this.isSelected(highlightedItem));
              }
            }
          } else {
            stop = false;
          }
          break;

        default:
          // Allow default behavior for unhandled keys
          stop = false;
          break;
      }

      // Prevent default behavior for handled keys
      if (stop) {
        stopEvent(event);
      }
    },
    getFocusableListItemElements() {
      const items = this.$refs.list?.querySelectorAll(ITEM_SELECTOR);
      return Array.from(items || []);
    },
    focusNextItem(event, elements, offset) {
      const { target } = event;
      const currentIndex = elements.indexOf(target);
      const nextIndex = clamp(currentIndex + offset, 0, elements.length - 1);

      this.focusItem(nextIndex, elements);
    },
    async focusItem(index, elements, keepSearchFocused = false) {
      this.nextFocusedItemIndex = index;

      // Always update the activeItemId when focus changes
      const item = this.flattenedOptions[index];
      if (item) {
        this.activeItemId = this.generateItemId(item);
      } else {
        this.activeItemId = null;
      }

      // If we're not keeping the search focused, focus the item
      if (!keepSearchFocused) {
        elements[index]?.focus();
      }

      await this.$nextTick();
      this.scrollActiveItemIntoView();
    },
    focusSearchInput() {
      this.$refs.searchBox.focusInput();
    },
    onSelect(item, isSelected) {
      if (this.multiple) {
        this.onMultiSelect(item.value, isSelected);
      } else {
        this.onSingleSelect(item.value, isSelected);
      }
    },
    isHighlighted(item) {
      return this.nextFocusedItemIndex === this.flattenedOptions.indexOf(item);
    },
    isSelected(item) {
      return this.selectedValues.some((value) => value === item.value);
    },
    isFocused(item) {
      return this.nextFocusedItemIndex === this.flattenedOptions.indexOf(item);
    },
    isDisabled(item) {
      return item.disabled;
    },
    onSingleSelect(value, isSelected) {
      if (isSelected) {
        /**
         * Emitted when selection is changed
         *
         * @event select
         */
        this.$emit('select', value);
      }
      this.closeAndFocus();
    },
    onMultiSelect(value, isSelected) {
      if (isSelected) {
        this.$emit('select', [...this.selectedValues, value]);
      } else {
        this.$emit(
          'select',
          this.selectedValues.filter((selectedValue) => selectedValue !== value),
        );
      }
    },
    search(searchTerm) {
      /**
       * Emitted when the search query string is changed
       *
       * @event search
       * @type {string}
       */
      this.$emit('search', searchTerm);
    },
    onResetButtonClicked() {
      /**
       * Emitted when the reset button is clicked
       *
       * @event reset
       */
      this.$emit('reset');
    },
    onSelectAllButtonClicked() {
      /**
       * Emitted when the select all button is clicked
       *
       * @event select-all
       */
      this.$emit('select-all');
    },
    closeAndFocus() {
      this.$refs.baseDropdown.closeAndFocus();
    },
    onIntersectionObserverAppear() {
      /**
       * Emitted when bottom of listbox has been scrolled to.
       * Used for infinite scroll.
       *
       * @event bottom-reached
       */
      this.$emit('bottom-reached');
    },
    listboxItemKey(item) {
      if (item.value === null) {
        return ITEM_NULL_KEY;
      }
      return item.value;
    },
    listboxItemMoreItemsAriaAttributes(index) {
      if (this.totalItems === null) {
        return {};
      }

      return {
        'aria-setsize': this.totalItems,
        'aria-posinset': index + 1,
      };
    },
    observeScroll() {
      const root = this.$refs.list;

      const options = {
        rootMargin: '8px',
        root,
        threshold: 1.0,
      };

      this.scrollObserver?.disconnect();

      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          this[entry.target?.$__visibilityProp] = entry.isIntersecting;
        });
      }, options);

      const topBoundary = this.$refs['top-boundary'];
      const bottomBoundary = this.$refs['bottom-boundary'];
      if (topBoundary) {
        topBoundary.$__visibilityProp = 'topBoundaryVisible';
        observer.observe(topBoundary);
      }
      if (bottomBoundary) {
        bottomBoundary.$__visibilityProp = 'bottomBoundaryVisible';
        observer.observe(bottomBoundary);
      }
      this.scrollObserver = observer;
    },
    isOption,
    generateItemId(item) {
      const key = item.value === null ? ITEM_NULL_KEY : item.value;
      if (!this.itemIds.has(key)) {
        this.itemIds.set(key, uniqueId('listbox-item-'));
      }
      return this.itemIds.get(key);
    },
    scrollActiveItemIntoView() {
      const listContainer = this.$refs.list;
      if (!this.activeItemId || !this.searchable || !listContainer) return;

      const activeElement = document.getElementById(this.activeItemId);
      if (!activeElement) return;

      const containerRect = listContainer.getBoundingClientRect();
      const itemRect = activeElement.getBoundingClientRect();
      const itemTop = activeElement.offsetTop;
      const padding = 30;

      // If item is above the visible area
      if (itemRect.top < containerRect.top) {
        listContainer.scrollTo({
          top: itemTop - padding,
          behavior: 'smooth',
        });
      }

      // If item is below the visible area
      else if (itemRect.bottom > containerRect.bottom) {
        listContainer.scrollTo({
          top: itemTop - containerRect.height + activeElement.offsetHeight + padding,
          behavior: 'smooth',
        });
      }
    },
  },
};
</script>

<template>
  <gl-base-dropdown
    ref="baseDropdown"
    aria-haspopup="listbox"
    :active-item-id="activeItemId"
    :aria-labelledby="toggleAriaLabelledBy"
    :block="block"
    :has-searchable-listbox="searchable"
    :has-external-label="isInFormGroup"
    :listbox-id="listboxIdComputed"
    :state="state"
    :toggle-id="toggleIdComputed"
    :toggle-text="listboxToggleText"
    :toggle-class="toggleButtonClasses"
    :text-sr-only="textSrOnly"
    :category="category"
    :variant="variant"
    :size="size"
    :icon="icon"
    :disabled="disabled"
    :loading="loading"
    :no-caret="noCaret"
    :placement="placement"
    :offset="dropdownOffset"
    :fluid-width="fluidWidth"
    :panel-match-trigger-width="panelMatchTriggerWidth"
    :positioning-strategy="positioningStrategy"
    @[$options.events.GL_DROPDOWN_FOCUS_CONTENT]="onFocusContent"
    @[$options.events.GL_DROPDOWN_SHOWN]="onShow"
    @[$options.events.GL_DROPDOWN_HIDDEN]="onHide"
  >
    <template v-if="hasCustomToggle" #toggle="slotProps">
      <!-- @slot Custom toggle content -->
      <slot name="toggle" v-bind="slotProps"></slot>
    </template>

    <template #default="{ visible }">
      <div
        v-if="headerText"
        class="gl-flex gl-min-h-8 gl-shrink-0 gl-items-center gl-px-4 gl-py-3"
        :class="$options.HEADER_ITEMS_BORDER_CLASSES"
      >
        <div
          :id="headerId"
          class="gl-grow gl-pr-2 gl-text-sm gl-font-bold gl-text-strong"
          data-testid="listbox-header-text"
        >
          {{ headerText }}
        </div>
        <gl-button
          v-if="showResetButton"
          category="tertiary"
          class="!gl-m-0 !gl-w-auto gl-max-w-1/2 gl-flex-shrink-0 gl-text-ellipsis !gl-px-2 !gl-text-sm focus-visible:!gl-focus-inset"
          size="small"
          data-testid="listbox-reset-button"
          @click="onResetButtonClicked"
        >
          {{ resetButtonLabel }}
        </gl-button>
        <gl-button
          v-if="showSelectAllButton"
          category="tertiary"
          class="!gl-m-0 !gl-w-auto gl-max-w-1/2 gl-flex-shrink-0 gl-text-ellipsis !gl-px-2 !gl-text-sm focus-visible:!gl-focus-inset"
          size="small"
          data-testid="listbox-select-all-button"
          @click="onSelectAllButtonClicked"
        >
          {{ showSelectAllButtonLabel }}
        </gl-button>
      </div>

      <div v-if="searchable" class="gl-shrink-0" :class="$options.HEADER_ITEMS_BORDER_CLASSES">
        <gl-listbox-search-input
          :id="searchInputId"
          ref="searchBox"
          v-model="searchStr"
          data-testid="listbox-search-input"
          role="combobox"
          :aria-expanded="String(visible)"
          :aria-controls="listboxId"
          :aria-activedescendant="activeItemId"
          aria-haspopup="listbox"
          :placeholder="searchPlaceholder"
          :class="{ 'gl-listbox-topmost': !headerText }"
          @input="search"
          @keydown.enter.prevent
          @keydown="onKeydown"
        />
        <gl-loading-icon
          v-if="searching"
          data-testid="listbox-search-loader"
          size="md"
          class="gl-my-3"
        />
      </div>

      <component
        :is="listboxTag"
        v-if="showList"
        :id="listboxId"
        ref="list"
        :aria-busy="isBusy"
        :aria-labelledby="listboxAriaLabelledByID"
        :aria-multiselectable="multiple ? 'true' : undefined"
        role="listbox"
        class="gl-new-dropdown-contents gl-new-dropdown-contents-with-scrim-overlay"
        :class="listboxClasses"
        tabindex="0"
        @keydown="onKeydown"
      >
        <component
          :is="itemTag"
          class="top-scrim-wrapper"
          aria-hidden="true"
          data-testid="top-scrim"
        >
          <div
            class="top-scrim"
            :class="{ 'top-scrim-light': !hasHeader, 'top-scrim-dark': hasHeader }"
          ></div>
        </component>
        <component :is="itemTag" ref="top-boundary" aria-hidden="true" />
        <template v-for="(item, index) in items">
          <template v-if="isOption(item)">
            <gl-listbox-item
              :id="generateItemId(item)"
              :key="listboxItemKey(item)"
              :data-testid="`listbox-item-${item.value}`"
              :is-highlighted="isHighlighted(item)"
              :is-selected="isSelected(item)"
              :is-focused="isFocused(item)"
              :is-check-centered="isCheckCentered"
              :is-disabled="isDisabled(item)"
              v-bind="listboxItemMoreItemsAriaAttributes(index)"
              @select="onSelect(item, $event)"
            >
              <!-- @slot Custom template of the listbox item -->
              <slot name="list-item" :item="item">
                {{ item.text }}
              </slot>
            </gl-listbox-item>
          </template>

          <template v-else>
            <gl-listbox-group
              :key="item.text"
              :name="item.text"
              :text-sr-only="item.textSrOnly"
              :class="groupClasses(index)"
            >
              <template v-if="$scopedSlots['group-label']" #group-label>
                <!-- @slot Custom template for group names -->
                <slot name="group-label" :group="item"></slot>
              </template>

              <gl-listbox-item
                v-for="option in item.options"
                :id="generateItemId(option)"
                :key="listboxItemKey(option)"
                :data-testid="`listbox-item-${option.value}`"
                :is-highlighted="isHighlighted(option)"
                :is-selected="isSelected(option)"
                :is-focused="isFocused(option)"
                :is-check-centered="isCheckCentered"
                :is-disabled="isDisabled(option)"
                @select="onSelect(option, $event)"
              >
                <!-- @slot Custom template of the listbox item -->
                <slot name="list-item" :item="option">
                  {{ option.text }}
                </slot>
              </gl-listbox-item>
            </gl-listbox-group>
          </template>
        </template>
        <component :is="itemTag" v-if="infiniteScrollLoading">
          <gl-loading-icon data-testid="listbox-infinite-scroll-loader" size="md" class="gl-my-3" />
        </component>
        <gl-intersection-observer
          v-if="showIntersectionObserver"
          @appear="onIntersectionObserverAppear"
        />
        <component :is="itemTag" ref="bottom-boundary" aria-hidden="true" />
        <component
          :is="itemTag"
          class="bottom-scrim-wrapper"
          aria-hidden="true"
          data-testid="bottom-scrim"
        >
          <div class="bottom-scrim" :class="{ '!gl-rounded-none': hasFooter }"></div>
        </component>
      </component>
      <span
        v-if="announceSRSearchResults"
        data-testid="listbox-number-of-results"
        class="gl-sr-only"
        aria-live="assertive"
      >
        <!-- @slot Text read by screen reader announcing a number of search results -->
        <slot name="search-summary-sr-only">
          {{ srOnlyResultsLabel(flattenedOptions.length) }}
        </slot>
      </span>
      <span
        v-if="isBusy"
        class="gl-sr-only"
        aria-live="polite"
        data-testid="listbox-loading-announcement"
      >
        {{ loadingAnnouncementText }}
      </span>

      <div
        v-else-if="showNoResultsText"
        aria-live="assertive"
        class="gl-py-3 gl-pl-7 gl-pr-5 gl-text-base gl-text-subtle"
        data-testid="listbox-no-results-text"
      >
        {{ noResultsText }}
      </div>

      <!-- @slot Content to display in dropdown footer -->
      <slot name="footer"></slot>
    </template>
  </gl-base-dropdown>
</template>
