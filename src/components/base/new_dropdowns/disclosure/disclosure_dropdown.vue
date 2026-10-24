<script>
import { clamp, uniqueId } from "lodash-es";
import { stopEvent, filterVisible, logWarning } from "../../../../utils/utils";
import {
  GL_DROPDOWN_SHOWN,
  GL_DROPDOWN_HIDDEN,
  GL_DROPDOWN_BEFORE_CLOSE,
  GL_DROPDOWN_FOCUS_CONTENT,
  ENTER,
  SPACE,
  HOME,
  END,
  ARROW_DOWN,
  ARROW_UP,
  GL_DROPDOWN_CONTENTS_CLASS,
  POSITION_ABSOLUTE,
  POSITION_FIXED,
} from "../constants";
import {
  buttonCategoryOptions,
  buttonSizeOptions,
  dropdownPlacements,
  dropdownVariantOptions,
} from "../../../../utils/constants";
import GlBaseDropdown from "../base_dropdown/base_dropdown.vue";
import GlDisclosureDropdownItem, {
  ITEM_CLASS,
} from "./disclosure_dropdown_item.vue";
import GlDisclosureDropdownGroup from "./disclosure_dropdown_group.vue";
import {
  itemsValidator,
  isItem,
  hasOnlyListItems,
  doSomeItemsHaveIcon,
} from "./utils";

export const ITEM_SELECTOR = `.${ITEM_CLASS}`;

export default {
  name: "GlDisclosureDropdown",
  events: {
    GL_DROPDOWN_SHOWN,
    GL_DROPDOWN_HIDDEN,
    GL_DROPDOWN_BEFORE_CLOSE,
    GL_DROPDOWN_FOCUS_CONTENT,
  },
  components: {
    GlBaseDropdown,
    GlDisclosureDropdownItem,
    GlDisclosureDropdownGroup,
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
     * Toggle button text
     */
    toggleText: {
      type: String,
      required: false,
      default: "",
    },
    /**
     * Toggle text to be read by screen readers only
     */
    textSrOnly: {
      type: Boolean,
      required: false,
      default: false,
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
      default: "medium",
      validator: (value) => value in buttonSizeOptions,
    },
    /**
     * Icon name that will be rendered in the toggle button
     */
    icon: {
      type: String,
      required: false,
      default: "",
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
     * Set to "true" when dropdown content (items) is loading
     * It will render a small loader in the dropdown toggle and make it disabled
     */
    loading: {
      type: Boolean,
      required: false,
      default: false,
    },
    /**
     * Custom toggle id.
     * For instance, it can be referenced by tooltip or popover
     */
    toggleId: {
      type: String,
      required: false,
      default: () => uniqueId("dropdown-toggle-btn-"),
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
     * Align disclosure dropdown with respect to the toggle button
     */
    placement: {
      type: String,
      required: false,
      default: "bottom-start",
      validator: (value) => Object.keys(dropdownPlacements).includes(value),
    },
    /**
     * The `aria-labelledby` attribute value for the toggle button
     * Provide the string of ids seperated by space
     */
    toggleAriaLabelledBy: {
      type: String,
      required: false,
      default: null,
    },
    /**
     * The `aria-label` attribute value for the toggle button.
     * Use when there is no visible label element to reference with `toggleAriaLabelledBy`.
     * Do not provide both `toggleAriaLabel` and `toggleAriaLabelledBy`.
     * When both are present, `toggleAriaLabelledBy` takes precedence per the WAI-ARIA spec.
     */
    toggleAriaLabel: {
      type: String,
      required: false,
      default: null,
    },
    /**
     * The `aria-labelledby` attribute value for the list of options
     * Provide the string of ids seperated by space
     */
    listAriaLabelledBy: {
      type: String,
      required: false,
      default: null,
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
     * Close the dropdown on item click (action)
     */
    autoClose: {
      type: Boolean,
      required: false,
      default: true,
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
      validator: (strategy) =>
        [POSITION_ABSOLUTE, POSITION_FIXED].includes(strategy),
    },
    /**
     * Opens dropdown on render
     */
    startOpened: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  data() {
    return {
      disclosureId: uniqueId("disclosure-"),
      nextFocusedItemIndex: null,
    };
  },
  computed: {
    disclosureTag() {
      if (
        this.items?.length ||
        hasOnlyListItems(this.$scopedSlots.default || this.$slots.default)
      ) {
        return "ul";
      }
      return "div";
    },
    hasCustomToggle() {
      return Boolean(this.$scopedSlots.toggle);
    },
    siblingsHaveIcons() {
      return doSomeItemsHaveIcon(this.items);
    },
  },
  mounted() {
    if (this.toggleAriaLabel && this.toggleAriaLabelledBy) {
      logWarning(
        "Do not provide both `toggleAriaLabel` and `toggleAriaLabelledBy`. " +
          "When both are present, `toggleAriaLabelledBy` takes precedence and `toggleAriaLabel` is ignored. " +
          "See https://design.khulnasoft.com/components/dropdown-disclosure/#accessibility",
        {
          name: "GlDisclosureDropdown",
        }
      );
    }
    if (this.startOpened) {
      this.open();
    }
  },
  methods: {
    doSomeItemsHaveIcon,
    open() {
      this.$refs.baseDropdown.open();
    },
    close() {
      this.$refs.baseDropdown.close();
    },
    onShow() {
      /**
       * Emitted when dropdown is shown
       *
       * @event shown
       */
      this.$emit(GL_DROPDOWN_SHOWN);
    },
    onBeforeClose(event) {
      /**
       * Emitted when dropdown is about to be closed
       *
       * @event before-close
       */
      this.$emit(GL_DROPDOWN_BEFORE_CLOSE, event);
    },
    onHide() {
      /**
       * Emitted when dropdown is hidden
       *
       * @event hidden
       */
      this.$emit(GL_DROPDOWN_HIDDEN);
      this.nextFocusedItemIndex = null;
    },
    onKeydown(event) {
      const { code } = event;
      const elements = this.getFocusableListItemElements();

      if (elements.length < 1) return;

      let stop = true;

      if (code === HOME) {
        this.focusItem(0, elements);
      } else if (code === END) {
        this.focusItem(elements.length - 1, elements);
      } else if (code === ARROW_UP) {
        this.focusNextItem(event, elements, -1);
      } else if (code === ARROW_DOWN) {
        this.focusNextItem(event, elements, 1);
      } else if (code === ENTER || code === SPACE) {
        this.handleAutoClose(event);
      } else {
        stop = false;
      }

      if (stop) {
        stopEvent(event);
      }
    },
    getFocusableListItemElements() {
      const items = this.$refs.content?.querySelectorAll(ITEM_SELECTOR);
      return filterVisible(Array.from(items || []));
    },
    focusNextItem(event, elements, offset) {
      const { target } = event;
      const currentIndex = elements.indexOf(target);
      const nextIndex = clamp(currentIndex + offset, 0, elements.length - 1);

      this.focusItem(nextIndex, elements);
    },
    focusItem(index, elements) {
      this.nextFocusedItemIndex = index;

      elements[index]?.focus();
    },
    closeAndFocus() {
      this.$refs.baseDropdown.closeAndFocus();
    },
    focusToggle() {
      this.$refs.baseDropdown.focusToggle();
    },
    handleAction(action) {
      // See https://github.com/khulnasoft/khulnasoft-ui/pull/4376 for
      // detailed explanation why we need requestAnimationFrame
      window.requestAnimationFrame(() => {
        /**
         * Emitted when one of disclosure dropdown items is clicked
         *
         * @event action
         */
        this.$emit("action", action);
      });
    },
    handleAutoClose(e) {
      if (
        this.autoClose &&
        e.target.closest(ITEM_SELECTOR) &&
        // The ref is null when an item action destroys this component before the click bubbles here.
        // The method is optionally chained to accommodate specs that shallow mount without stubbing
        // `BaseDropdown`'s `containsElement`; KhulnaSoft has many such specs.
        this.$refs.baseDropdown?.containsElement?.(e.target)
      ) {
        this.closeAndFocus();
      }
    },
    isDisabled(item) {
      return item.disabled;
    },
    uniqueItemId() {
      return uniqueId(`disclosure-item-`);
    },
    isItem,
  },
  GL_DROPDOWN_CONTENTS_CLASS,
};
</script>

<template>
  <gl-base-dropdown
    ref="baseDropdown"
    :aria-labelledby="toggleAriaLabelledBy"
    :aria-label="toggleAriaLabelledBy ? undefined : toggleAriaLabel"
    :arrow-element="$refs.disclosureArrow"
    :toggle-id="toggleId"
    :toggle-text="toggleText"
    :toggle-class="toggleClass"
    :text-sr-only="textSrOnly"
    :category="category"
    :variant="variant"
    :size="size"
    :icon="icon"
    :disabled="disabled"
    :loading="loading"
    :no-caret="noCaret"
    :placement="placement"
    :block="block"
    :offset="dropdownOffset"
    :fluid-width="fluidWidth"
    :positioning-strategy="positioningStrategy"
    class="gl-disclosure-dropdown"
    is-disclosure
    @[$options.events.GL_DROPDOWN_SHOWN]="onShow"
    @[$options.events.GL_DROPDOWN_HIDDEN]="onHide"
    @[$options.events.GL_DROPDOWN_BEFORE_CLOSE]="onBeforeClose"
    @[$options.events.GL_DROPDOWN_FOCUS_CONTENT]="onKeydown"
  >
    <template v-if="hasCustomToggle" #toggle="slotProps">
      <!-- @slot Custom toggle content -->
      <slot name="toggle" v-bind="slotProps"></slot>
    </template>

    <!-- @slot Content to display in dropdown header -->
    <slot name="header"></slot>

    <component
      :is="disclosureTag"
      :id="disclosureId"
      ref="content"
      :aria-labelledby="listAriaLabelledBy || toggleId"
      data-testid="disclosure-content"
      :class="$options.GL_DROPDOWN_CONTENTS_CLASS"
      tabindex="-1"
      @keydown="onKeydown"
      @click="handleAutoClose"
    >
      <slot>
        <template v-for="(item, index) in items">
          <template v-if="isItem(item)">
            <!-- eslint-disable vue/valid-v-for -->
            <gl-disclosure-dropdown-item
              :key="uniqueItemId()"
              :siblings-have-icons="siblingsHaveIcons"
              :item="item"
              :disabled="isDisabled(item)"
              @action="handleAction"
            >
              <template v-if="'list-item' in $scopedSlots" #list-item>
                <!-- @slot Custom template of the disclosure dropdown item -->
                <slot name="list-item" :item="item"></slot>
              </template>
            </gl-disclosure-dropdown-item>
            <!-- eslint-enable vue/valid-v-for -->
          </template>

          <template v-else>
            <gl-disclosure-dropdown-group
              :key="item.name"
              :bordered="index !== 0"
              :group="item"
              @action="handleAction"
            >
              <template v-if="$scopedSlots['group-label']" #group-label>
                <!-- @slot Custom template for group names -->
                <slot name="group-label" :group="item"></slot>
              </template>

              <template v-if="$scopedSlots['list-item']" #default>
                <!-- eslint-disable vue/valid-v-for -->
                <gl-disclosure-dropdown-item
                  v-for="groupItem in item.items"
                  :key="uniqueItemId()"
                  :siblings-have-icons="doSomeItemsHaveIcon(item.items)"
                  :item="groupItem"
                  @action="handleAction"
                >
                  <template #list-item>
                    <!-- @slot Custom template of the disclosure dropdown item -->
                    <slot name="list-item" :item="groupItem"></slot>
                  </template>
                </gl-disclosure-dropdown-item>
                <!-- eslint-enable vue/valid-v-for -->
              </template>
            </gl-disclosure-dropdown-group>
          </template>
        </template>
      </slot>
    </component>

    <!-- @slot Content to display in dropdown footer -->
    <slot name="footer"></slot>
  </gl-base-dropdown>
</template>
