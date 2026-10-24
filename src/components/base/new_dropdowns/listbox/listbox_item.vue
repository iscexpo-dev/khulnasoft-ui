<script>
import GlIcon from '../../icon/icon.vue';
import { ENTER, SPACE } from '../constants';
import { stopEvent } from '../../../../utils/utils';

export default {
  name: 'GlListboxItem',
  components: {
    GlIcon,
  },
  props: {
    /**
     * When true, marks the item as selected.
     */
    isSelected: {
      type: Boolean,
      default: false,
      required: false,
    },
    /**
     * When true, marks the item as focused.
     */
    isFocused: {
      type: Boolean,
      default: false,
      required: false,
    },
    /**
     * When true, centers the check icon.
     */
    isCheckCentered: {
      type: Boolean,
      required: false,
      default: false,
    },
    /**
     * When true, highlights the item.
     */
    isHighlighted: {
      type: Boolean,
      default: false,
      required: false,
    },
    /**
     * When true, disables the item.
     */
    isDisabled: {
      type: Boolean,
      default: false,
      required: false,
    },
  },
  computed: {
    checkedClasses() {
      if (this.isCheckCentered) {
        return '';
      }

      return 'gl-mt-3 gl-self-start';
    },
  },
  methods: {
    onMousedown(event) {
      if (this.isDisabled) {
        stopEvent(event);
      }
    },
    toggleSelection() {
      if (this.isDisabled) return;
      this.$emit('select', !this.isSelected);
    },
    onKeydown(event) {
      const { code } = event;

      if (code === ENTER || code === SPACE) {
        stopEvent(event);
        this.toggleSelection();
      }
    },
  },
};
</script>

<template>
  <li
    :class="[
      'gl-new-dropdown-item',
      {
        'gl-new-dropdown-item-highlighted': isHighlighted,
        disabled: isDisabled,
      },
    ]"
    role="option"
    :tabindex="isFocused ? 0 : -1"
    :aria-selected="isSelected"
    :aria-disabled="isDisabled"
    @mousedown="onMousedown"
    @click="toggleSelection"
    @keydown="onKeydown"
  >
    <span class="gl-new-dropdown-item-content">
      <gl-icon
        name="check"
        data-testid="dropdown-item-checkbox"
        :class="[
          'gl-new-dropdown-item-check-icon',
          { 'gl-invisible': !isSelected },
          checkedClasses,
        ]"
      />
      <span class="gl-new-dropdown-item-text-wrapper">
        <slot></slot>
      </span>
    </span>
  </li>
</template>
