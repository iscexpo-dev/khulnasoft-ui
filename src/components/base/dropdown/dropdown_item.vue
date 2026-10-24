<script>
import { BDropdownItem } from '../../../vendor/bootstrap-vue/src/components/dropdown/dropdown-item';
import { BDropdownItemButton } from '../../../vendor/bootstrap-vue/src/components/dropdown/dropdown-item-button';
import { variantCssColorMap } from '../../../utils/constants';
import GlAvatar from '../avatar/avatar.vue';
import GlButton from '../button/button.vue';
import GlIcon from '../icon/icon.vue';

export default {
  name: 'GlDropdownItem',
  components: {
    GlIcon,
    GlAvatar,
    GlButton,
  },
  inheritAttrs: false,
  props: {
    /**
     * URL for the avatar image to display
     */
    avatarUrl: {
      type: String,
      required: false,
      default: '',
    },
    /**
     * Color variant for the icon on the left side
     */
    iconColor: {
      type: String,
      required: false,
      default: '',
    },
    /**
     * Name of the icon to display on the left side
     */
    iconName: {
      type: String,
      required: false,
      default: '',
    },
    /**
     * Aria label for the right icon button
     */
    iconRightAriaLabel: {
      type: String,
      required: false,
      default: '',
    },
    /**
     * Name of the icon to display on the right side
     */
    iconRightName: {
      type: String,
      required: false,
      default: '',
    },
    /**
     * Whether the dropdown item is checked
     */
    isChecked: {
      type: Boolean,
      required: false,
      default: false,
    },
    /**
     * Whether to show a check icon for this item
     */
    isCheckItem: {
      type: Boolean,
      required: false,
      default: false,
    },
    /**
     * Whether to center the check icon vertically
     */
    isCheckCentered: {
      type: Boolean,
      required: false,
      default: false,
    },
    /**
     * Secondary text to display below the main content
     */
    secondaryText: {
      type: String,
      required: false,
      default: '',
    },
    /**
     * ARIA role for the dropdown item
     */
    role: {
      type: String,
      required: false,
      default: null,
    },
  },
  computed: {
    bootstrapComponent() {
      const { href, to } = this.$attrs;
      // Support 'href' and Vue Router's 'to'
      return href || to ? BDropdownItem : BDropdownItemButton;
    },
    bootstrapComponentProps() {
      const props = { ...this.$attrs };
      if (this.role) props.role = this.role;
      return props;
    },
    iconColorCss() {
      return variantCssColorMap[this.iconColor] || 'gl-fill-icon-default';
    },
    shouldShowCheckIcon() {
      return this.isChecked || this.isCheckItem;
    },
    checkedClasses() {
      if (this.isCheckCentered) {
        return '';
      }

      return 'gl-mt-3 gl-self-start';
    },
  },
  methods: {
    handleClickIconRight() {
      /**
       * Emitted when right icon is clicked.
       * @event handleClickIconRight
       */
      this.$emit('click-icon-right');
    },
  },
};
</script>

<template>
  <component
    :is="bootstrapComponent"
    class="gl-dropdown-item"
    v-bind="bootstrapComponentProps"
    v-on="$listeners"
  >
    <gl-icon
      v-if="shouldShowCheckIcon"
      name="check"
      data-testid="dropdown-item-checkbox"
      :class="['gl-dropdown-item-check-icon', { 'gl-invisible': !isChecked }, checkedClasses]"
    />
    <gl-icon v-if="iconName" :name="iconName" :class="['gl-dropdown-item-icon', iconColorCss]" />
    <gl-avatar v-if="avatarUrl" :size="32" :src="avatarUrl" />
    <div class="gl-dropdown-item-text-wrapper">
      <!-- @slot Main content of the dropdown item. -->
      <p class="gl-dropdown-item-text-primary"><slot></slot></p>
      <p v-if="secondaryText" class="gl-dropdown-item-text-secondary">{{ secondaryText }}</p>
    </div>
    <gl-button
      v-if="iconRightName"
      size="small"
      :icon="iconRightName"
      :aria-label="iconRightAriaLabel || iconRightName"
      @click.stop.prevent="handleClickIconRight"
    />
  </component>
</template>
