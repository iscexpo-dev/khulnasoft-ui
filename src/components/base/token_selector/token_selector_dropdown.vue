<script>
import { uniqueId } from 'lodash-es';
import GlDropdownItem from '../dropdown/dropdown_item.vue';
import { tokensValidator } from './helpers';

export default {
  name: 'GlTokenSelectorDropdown',
  components: { GlDropdownItem },
  props: {
    /**
     * When true, shows the dropdown.
     */
    show: {
      type: Boolean,
      required: true,
    },
    /**
     * Additional CSS classes for the dropdown menu.
     */
    menuClass: {
      type: [String, Array, Object],
      required: false,
      default: '',
    },
    /**
     * When true, shows a loading state in the dropdown.
     */
    loading: {
      type: Boolean,
      required: false,
      default: false,
    },
    /**
     * Array of items to display in the dropdown.
     */
    dropdownItems: {
      type: Array,
      // All items need to have an `id` key
      validator: tokensValidator,
      required: true,
    },
    /**
     * Current text in the search input.
     */
    inputText: {
      type: String,
      required: true,
    },
    /**
     * When true, allows user-defined tokens to be added.
     */
    userDefinedTokenCanBeAdded: {
      type: Boolean,
      required: true,
    },
    /**
     * Unique identifier for the component.
     */
    componentId: {
      type: String,
      required: true,
    },
    /**
     * Function to register event handlers for the dropdown.
     */
    registerDropdownEventHandlers: {
      type: Function,
      required: true,
    },
    /**
     * Function to register reset of focused dropdown item.
     */
    registerResetFocusedDropdownItem: {
      type: Function,
      required: true,
    },
  },
  data() {
    return {
      focusedDropdownItemIndex: 0,
    };
  },
  computed: {
    userDefinedToken() {
      return {
        id: uniqueId('user-defined-token'),
        name: this.inputText,
      };
    },
    dropdownLength() {
      // Adds an additional dropdown item for the 'Add ... dropdown' item
      return this.userDefinedTokenCanBeAdded
        ? this.dropdownItems.length
        : this.dropdownItems.length - 1;
    },
    focusedLastDropdownItem() {
      return this.focusedDropdownItemIndex === this.dropdownLength;
    },
    focusedUserDefinedToken() {
      // User defined tokens are always the last in the list
      return this.userDefinedTokenCanBeAdded && this.focusedLastDropdownItem;
    },
    focusedDropdownItem() {
      if (this.focusedUserDefinedToken) {
        return this.userDefinedToken;
      }

      return this.dropdownItems[this.focusedDropdownItemIndex];
    },
  },
  watch: {
    focusedDropdownItem(newValue, oldValue) {
      if (newValue?.id !== oldValue?.id) {
        this.$emit('input', newValue);

        if (!newValue) {
          return;
        }

        const dropdownItemRef = this.getDropdownItemRef(newValue);
        if (dropdownItemRef?.$el) {
          dropdownItemRef.$el.scrollIntoView({ block: 'nearest', inline: 'end' });
        }
      }
    },
  },
  created() {
    this.registerDropdownEventHandlers({
      handleUpArrow: this.handleUpArrow,
      handleDownArrow: this.handleDownArrow,
      handleHomeKey: this.handleHomeKey,
      handleEndKey: this.handleEndKey,
    });

    this.registerResetFocusedDropdownItem(this.resetFocusedDropdownItem);
    this.$emit('input', this.focusedDropdownItem);
  },
  methods: {
    handleDropdownItemClick(dropdownItem) {
      this.$emit('dropdown-item-click', dropdownItem);
    },
    handleMousedown(dropdownItem) {
      // `event.relatedTarget` returns `null` on Safari because buttons are not focused on click (https://developer.mozilla.org/en-US/docs/Web/HTML/Element/button#Clicking_and_focus)
      // Because of this we need to manually focus on the button. We do this in `mousedown` because it is fired before the `blur` event
      const dropdownItemRef = this.getDropdownItemRef(dropdownItem);

      if (dropdownItemRef?.$el) {
        dropdownItemRef.$el.querySelector('button').focus();
      }
    },
    handleUpArrow() {
      if (!this.show) {
        return;
      }

      // First dropdown item has been reached
      if (this.focusedDropdownItemIndex === 0) {
        return;
      }

      this.focusPrevDropdownItem();
    },
    handleDownArrow() {
      if (!this.show) {
        this.$emit('show');

        return;
      }

      // Last dropdown item has been reached
      if (this.focusedLastDropdownItem) {
        return;
      }

      this.focusNextDropdownItem();
    },
    handleHomeKey(event) {
      event.preventDefault();

      this.focusFirstDropdownItem();
    },
    handleEndKey(event) {
      event.preventDefault();

      this.focusLastDropdownItem();
    },
    focusLastDropdownItem() {
      this.focusedDropdownItemIndex = this.dropdownLength;
    },
    focusFirstDropdownItem() {
      this.focusedDropdownItemIndex = 0;
    },
    focusNextDropdownItem() {
      this.focusedDropdownItemIndex += 1;
    },
    focusPrevDropdownItem() {
      this.focusedDropdownItemIndex -= 1;
    },
    resetFocusedDropdownItem() {
      this.focusedDropdownItemIndex = 0;
    },
    dropdownItemIsFocused(dropdownItem) {
      if (!this.focusedDropdownItem) {
        return false;
      }

      return dropdownItem.id === this.focusedDropdownItem.id;
    },
    getDropdownItemRef(dropdownItem) {
      if (this.focusedUserDefinedToken) {
        return this.$refs[this.userDefinedToken.id];
      }

      return this.$refs.dropdownItems?.find(
        (ref) => ref.$attrs['data-dropdown-item-id'] === dropdownItem.id,
      );
    },
    dropdownItemIdAttribute(dropdownItem) {
      return dropdownItem ? `${this.componentId}-dropdown-item-${dropdownItem.id}` : null;
    },
  },
};
</script>

<template>
  <div class="dropdown b-dropdown gl-dropdown gl-relative" :class="{ show }">
    <ul
      :id="componentId"
      ref="dropdownMenu"
      role="listbox"
      class="dropdown-menu gl-absolute"
      :class="[{ show }, menuClass]"
    >
      <gl-dropdown-item v-if="loading" role="option" disabled>
        <slot name="loading-content">Searching...</slot>
      </gl-dropdown-item>

      <gl-dropdown-item
        v-for="dropdownItem in dropdownItems"
        :id="dropdownItemIdAttribute(dropdownItem)"
        ref="dropdownItems"
        :key="dropdownItem.id"
        :data-dropdown-item-id="dropdownItem.id"
        :active="dropdownItemIsFocused(dropdownItem)"
        :aria-selected="dropdownItemIsFocused(dropdownItem).toString()"
        active-class="is-focused"
        role="option"
        tabindex="-1"
        @click="handleDropdownItemClick(dropdownItem)"
      >
        <div class="-gl-mx-4 -gl-my-3 gl-px-4 gl-py-3" @mousedown="handleMousedown(dropdownItem)">
          <slot name="dropdown-item-content" :dropdown-item="dropdownItem">
            {{ dropdownItem.name }}
          </slot>
        </div>
      </gl-dropdown-item>

      <gl-dropdown-item
        v-if="userDefinedTokenCanBeAdded"
        :id="dropdownItemIdAttribute(userDefinedToken)"
        :ref="userDefinedToken.id"
        :data-dropdown-item-id="userDefinedToken.id"
        :active="dropdownItemIsFocused(userDefinedToken)"
        active-class="is-focused"
        role="option"
        tabindex="-1"
        @click="handleDropdownItemClick(userDefinedToken)"
      >
        <div
          class="-gl-mx-4 -gl-my-3 gl-px-4 gl-py-3"
          @mousedown="handleMousedown(userDefinedToken)"
        >
          <slot name="user-defined-token-content" :input-text="inputText">
            Add "{{ inputText }}"
          </slot>
        </div>
      </gl-dropdown-item>

      <gl-dropdown-item v-else-if="!dropdownItems.length && !loading" role="option" disabled>
        <slot name="no-results-content">No matches found</slot>
      </gl-dropdown-item>

      <slot name="dropdown-footer"></slot>
    </ul>
  </div>
</template>
