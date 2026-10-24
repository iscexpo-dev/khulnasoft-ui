<script>
import { uniqueId, isBoolean } from 'lodash-es';
import {
  arrow,
  computePosition,
  autoUpdate,
  offset,
  size,
  autoPlacement,
  shift,
} from '@floating-ui/dom';
import {
  buttonCategoryOptions,
  buttonSizeOptions,
  dropdownPlacements,
  dropdownAllowedAutoPlacements,
  dropdownVariantOptions,
} from '../../../../utils/constants';
import {
  GL_DROPDOWN_SHOWN,
  GL_DROPDOWN_HIDDEN,
  GL_DROPDOWN_BEFORE_CLOSE,
  GL_DROPDOWN_FOCUS_CONTENT,
  KEY_CODE_ESCAPE,
  ENTER,
  SPACE,
  ARROW_DOWN,
  GL_DROPDOWN_CONTENTS_CLASS,
  POSITION_ABSOLUTE,
  POSITION_FIXED,
} from '../constants';
import {
  logWarning,
  isElementTabbable,
  isElementFocusable,
  stopEvent,
} from '../../../../utils/utils';
import { OutsideDirective } from '../../../../directives/outside/outside';
import GlButton from '../../button/button.vue';
import GlIcon from '../../icon/icon.vue';
import DropdownContainer from './dropdown_container';
import { ARROW_X_MINIMUM, DEFAULT_OFFSET, FIXED_WIDTH_CLASS } from './constants';

const BASE_DROPDOWN_CLASS = 'gl-new-dropdown';
const DROPDOWN_CONTAINER_CLASS = 'gl-new-dropdown-container';

export default {
  name: 'BaseDropdown',
  components: {
    DropdownContainer,
    GlButton,
    GlIcon,
  },
  directives: { Outside: OutsideDirective },
  inject: {
    getFormGroupInstance: {
      default: () => () => {},
    },
  },
  props: {
    /**
     * Text displayed on the dropdown toggle button.
     */
    toggleText: {
      type: String,
      required: false,
      default: '',
    },
    /**
     * When true, visually hides the toggle text while keeping it accessible to screen readers.
     */
    textSrOnly: {
      type: Boolean,
      required: false,
      default: false,
    },
    /**
     * When true, renders the dropdown at 100% width of its parent container.
     */
    block: {
      type: Boolean,
      required: false,
      default: false,
    },
    /**
     * Visual category of the dropdown toggle button.
     */
    category: {
      type: String,
      required: false,
      default: buttonCategoryOptions.primary,
      validator: (value) => Object.keys(buttonCategoryOptions).includes(value),
    },
    /**
     * Visual variant of the dropdown toggle button.
     */
    variant: {
      type: String,
      required: false,
      default: dropdownVariantOptions.default,
      validator: (value) => Object.keys(dropdownVariantOptions).includes(value),
    },
    /**
     * Size of the dropdown toggle button.
     */
    size: {
      type: String,
      required: false,
      default: 'medium',
      validator: (value) => Object.keys(buttonSizeOptions).includes(value),
    },
    /**
     * Name of the icon to display in the toggle button.
     */
    icon: {
      type: String,
      required: false,
      default: '',
    },
    /**
     * When true, disables the dropdown.
     */
    disabled: {
      type: Boolean,
      required: false,
      default: false,
    },
    /**
     * When true, shows a loading state on the toggle button.
     */
    loading: {
      type: Boolean,
      required: false,
      default: false,
    },
    /**
     * Additional CSS classes to apply to the toggle element.
     */
    toggleClass: {
      type: [String, Array, Object],
      required: false,
      default: null,
    },
    /**
     * When true, hides the caret icon on the toggle button.
     */
    noCaret: {
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
     * Placement for the dropdown menu.
     */
    placement: {
      type: String,
      required: false,
      default: 'bottom-start',
      validator: (value) => {
        if (['left', 'center', 'right'].includes(value)) {
          logWarning(
            `"${value}" placement is deprecated. Use ${dropdownPlacements[value]} instead.`,
            { name: 'GlDisclosureDropdown/GlCollapsibleListbox' },
          );
        }

        return Object.keys(dropdownPlacements).includes(value);
      },
    },
    // ARIA props
    /**
     * ARIA haspopup attribute value for accessibility.
     */
    ariaHaspopup: {
      type: [String, Boolean],
      required: false,
      default: false,
      validator: (value) => {
        return ['menu', 'listbox', 'tree', 'grid', 'dialog', true, false].includes(value);
      },
    },
    /**
     * ID of the currently active item for accessibility.
     */
    activeItemId: {
      type: String,
      required: false,
      default: undefined,
    },
    /**
     * When true, indicates the dropdown has an external label for accessibility.
     */
    hasExternalLabel: {
      type: Boolean,
      required: false,
      default: false,
    },
    /**
     * When true, renders a searchable listbox.
     */
    hasSearchableListbox: {
      type: Boolean,
      required: false,
      default: false,
    },
    /**
     * When true, renders as a disclosure dropdown.
     */
    isDisclosure: {
      type: Boolean,
      required: false,
      default: false,
    },
    /**
     * Id that will be referenced by `aria-labelledby` attribute of the dropdown content`
     */
    toggleId: {
      type: String,
      required: true,
    },
    /**
     * Span Id that will be referenced by listbox `aria-labelledby` if there's an external label.
     * This prop will only be defined by `GlCollapsibleListbox` when `isInFormGroup` injected is true.
     */
    listboxId: {
      type: String,
      required: false,
      default: undefined,
    },
    /**
     * The `aria-labelledby` attribute value for the  toggle `button`
     */
    ariaLabelledby: {
      type: String,
      required: false,
      default: null,
    },
    /**
     * The `aria-label` attribute value for the toggle `button`.
     */
    ariaLabel: {
      type: String,
      required: false,
      default: null,
    },
    /**
     * Custom value to be passed to the offset middleware.
     * https://floating-ui.com/docs/offset
     */
    offset: {
      type: [Number, Object],
      required: false,
      default: () => ({ mainAxis: DEFAULT_OFFSET }),
    },
    /**
     * When true, allows the dropdown to take the full width available.
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
     * Strategy to be applied by computePosition. If this is set to fixed, the dropdown's position
     * needs to be set to fixed in CSS as well.
     * https://floating-ui.com/docs/computePosition#strategy
     */
    positioningStrategy: {
      type: String,
      required: false,
      default: POSITION_ABSOLUTE,
      validator: (strategy) => [POSITION_ABSOLUTE, POSITION_FIXED].includes(strategy),
    },
  },
  expose: ['open', 'close', 'closeAndFocus', 'focusToggle', 'containsElement'],
  BASE_DROPDOWN_CLASS,
  DROPDOWN_CONTAINER_CLASS,
  data() {
    return {
      openedYet: false,
      visible: false,
      baseDropdownId: uniqueId('base-dropdown-'),
    };
  },
  computed: {
    ariaActiveDescendant() {
      if (!this.isDisclosure && this.visible) return this.activeItemId;
      return undefined;
    },
    hasNoVisibleToggleText() {
      return !this.toggleText?.length || this.textSrOnly;
    },
    isIconOnly() {
      return Boolean(this.icon && this.hasNoVisibleToggleText);
    },
    isEllipsisButton() {
      return this.isIconOnly && this.icon === 'ellipsis_h';
    },
    isCaretOnly() {
      return !this.noCaret && !this.icon && this.hasNoVisibleToggleText;
    },
    computedState() {
      // If not a boolean, ensure that value is null
      return isBoolean(this.state) ? this.state : null;
    },
    stateClass() {
      if (this.computedState === true) return 'is-valid';
      if (this.computedState === false) return 'is-invalid';
      return null;
    },
    isDefaultToggle() {
      return !this.$scopedSlots.toggle;
    },
    isToggleCombobox() {
      if (this.hasSearchableListbox || this.isDisclosure) {
        return false;
      }
      return true;
    },
    isToggleLabelledExternally() {
      if (this.hasExternalLabel && this.toggleId) return true;
      return false;
    },
    computedToggleId() {
      if (this.isDisclosure) {
        return this.isDefaultToggle ? this.toggleId : undefined;
      }
      if (this.isToggleLabelledExternally) {
        return this.isDefaultToggle ? this.toggleId : undefined;
      }
      if (this.hasSearchableListbox) {
        return this.toggleId;
      }
      return undefined;
    },
    computedToggleInnerId() {
      if (this.isToggleCombobox && !this.isToggleLabelledExternally) {
        return this.toggleId;
      }
      if (this.isToggleCombobox && this.isToggleLabelledExternally) {
        return this.listboxId;
      }
      return undefined;
    },
    toggleAriaAttributes() {
      return {
        'aria-controls': this.baseDropdownId,
        'aria-expanded': String(this.visible),
        'aria-haspopup': this.ariaHaspopup,
        'aria-labelledby': this.toggleLabelledBy,
        'aria-label': this.ariaLabel || undefined,
        'aria-activedescendant': this.ariaActiveDescendant,
      };
    },
    toggleButtonClasses() {
      return [
        this.toggleClass,
        {
          'gl-new-dropdown-toggle': true,
          'button-ellipsis-horizontal': this.isEllipsisButton,
          'gl-new-dropdown-icon-only btn-icon': this.isIconOnly && !this.isEllipsisButton,
          'gl-new-dropdown-toggle-no-caret': this.noCaret,
          'gl-new-dropdown-caret-only btn-icon': this.isCaretOnly,
        },
        this.stateClass,
      ];
    },
    toggleButtonTextClasses() {
      return this.block ? 'gl-w-full' : '';
    },
    // Set the aria-labelledby property with one or more ID strings
    toggleLabelledBy() {
      const formGroupLabelId = this.getFormGroupInstance()?.labelId;

      if (this.isToggleCombobox) {
        // Comboboxes announce label and self value when aria-labelledby is label ID.
        // Tested with VoiceOver, NVDA, JAWS, Narrator and preferred browsers.
        if (this.ariaLabelledby) {
          return `${this.ariaLabelledby}`;
        }

        // Combobox inside GlFormGroup
        if (formGroupLabelId) {
          return `${formGroupLabelId} ${this.toggleId}`;
        }

        // Fallback calculated toggleId value
        return this.toggleId;
      }

      if (!this.isToggleCombobox) {
        // Disclosures or buttons with listbox require both IDs to announce correctly.
        // Tested with VoiceOver, NVDA, JAWS, Narrator and preferred browsers.
        if (this.ariaLabelledby) {
          return `${this.ariaLabelledby} ${this.toggleId}`;
        }

        // Disclosure or button with listbox inside GlFormGroup
        if (formGroupLabelId) {
          return `${formGroupLabelId} ${this.toggleId}`;
        }

        // Disclosures and buttons self-identify. aria-labelledby is not needed.
        return undefined;
      }

      return undefined;
    },
    toggleRole() {
      if (this.isToggleCombobox) {
        return 'combobox';
      }
      return undefined;
    },
    toggleAccessibilityAttributes() {
      return {
        ...this.toggleAriaAttributes,
        id: this.toggleId,
        role: this.toggleRole,
      };
    },
    toggleOptions() {
      if (this.isDefaultToggle) {
        return {
          is: GlButton,
          icon: this.icon,
          block: this.block,
          buttonTextClasses: this.toggleButtonTextClasses,
          category: this.category,
          variant: this.variant,
          size: this.size,
          disabled: this.disabled,
          loading: this.loading,
          class: this.toggleButtonClasses,
          role: this.toggleRole,
          ...this.toggleAriaAttributes,
          listeners: {
            keydown: (event) => this.onKeydown(event),
            click: (event) => this.toggle(event),
          },
        };
      }

      return {
        is: 'div',
        class: 'gl-new-dropdown-custom-toggle',
        listeners: {
          keydown: (event) => this.onKeydown(event),
          click: (event) => this.toggle(event),
        },
      };
    },
    toggleListeners() {
      return this.toggleOptions.listeners;
    },

    toggleAttributes() {
      const { listeners, is, ...attributes } = this.toggleOptions;
      return attributes;
    },
    toggleComponent() {
      return this.toggleOptions.is;
    },
    toggleElement() {
      return this.$refs.toggle.$el || this.$refs.toggle?.firstElementChild;
    },
    panelClasses() {
      return {
        '!gl-block': this.visible,
        [FIXED_WIDTH_CLASS]: !this.fluidWidth && !this.panelMatchTriggerWidth,
        'gl-new-dropdown-panel-fluid-width': this.fluidWidth && !this.panelMatchTriggerWidth,
        'gl-fixed': this.openedYet && this.isFixed,
        'gl-absolute': this.openedYet && !this.isFixed,
      };
    },
    isFixed() {
      return this.positioningStrategy === POSITION_FIXED;
    },
    floatingUIConfig() {
      const placement = dropdownPlacements[this.placement];
      const [, alignment] = placement.split('-');
      return {
        placement,
        strategy: this.positioningStrategy,
        middleware: [
          offset(this.offset),
          autoPlacement({
            alignment,
            allowedPlacements: dropdownAllowedAutoPlacements[this.placement],
          }),
          shift(),
          arrow({ element: this.$refs.dropdownArrow }),
          size({
            apply: ({ availableWidth, availableHeight, elements }) => {
              const contentsEl = elements.floating.querySelector(`.${GL_DROPDOWN_CONTENTS_CLASS}`);
              if (!contentsEl) return;

              const contentsAvailableHeight =
                availableHeight - (this.nonScrollableContentHeight ?? 0) - DEFAULT_OFFSET;

              const maxWidth = this.fluidWidth
                ? {
                    maxWidth: `${Math.max(0, availableWidth)}px`,
                  }
                : {};
              const triggerWidth = this.panelMatchTriggerWidth
                ? {
                    minWidth: `${this.toggleElement.getBoundingClientRect().width}px`,
                  }
                : {};

              Object.assign(
                contentsEl.style,
                {
                  maxHeight: `${Math.max(contentsAvailableHeight, 0)}px`,
                },
                maxWidth,
                triggerWidth,
              );
            },
          }),
        ],
      };
    },
  },
  mounted() {
    this.checkToggleFocusable();
  },
  beforeDestroy() {
    this.stopFloating();
  },
  methods: {
    checkToggleFocusable() {
      if (!isElementFocusable(this.toggleElement) && !isElementTabbable(this.toggleElement)) {
        logWarning(
          `Toggle is missing a 'tabindex' and cannot be focused.
          Use 'a' or 'button' element instead or make sure to add 'role="button"' along with 'tabindex' otherwise.`,
          {
            name: 'GlDisclosureDropdown/GlCollapsibleListbox',
            element: this.$el,
          },
        );
      }
    },
    getArrowOffsets(actualPlacement) {
      // Try to extract the base direction (top, bottom, left, right) from the placement
      const direction = actualPlacement?.split('-')[0];

      const offsetConfigs = {
        top: {
          staticSide: 'bottom',
          rotation: '225deg',
        },
        bottom: {
          staticSide: 'top',
          rotation: '45deg',
        },
        left: {
          staticSide: 'right',
          rotation: '135deg',
        },
        right: {
          staticSide: 'left',
          rotation: '315deg',
        },
      };

      return offsetConfigs[direction] || offsetConfigs.bottom;
    },

    async startFloating() {
      this.calculateNonScrollableAreaHeight();
      this.observer = new MutationObserver(this.calculateNonScrollableAreaHeight);
      this.observer.observe(this.$refs.content, { childList: true, subtree: true });

      this.stopAutoUpdate = autoUpdate(this.toggleElement, this.$refs.content, async () => {
        const result = await computePosition(
          this.toggleElement,
          this.$refs.content,
          this.floatingUIConfig,
        );

        /**
         * Due to the asynchronous nature of computePosition, it's technically possible for the
         * component to have been destroyed by the time the promise resolves. In such case, we exit
         * early to prevent a TypeError.
         */
        if (!this.$refs.content) return;

        const { x, y, middlewareData, placement } = result;

        // Get offsets based on actual placement, not requested placement
        const { rotation, staticSide } = this.getArrowOffsets(placement);

        // Assign dropdown window position
        Object.assign(this.$refs.content.style, {
          left: `${x}px`,
          top: `${y}px`,
        });

        // Assign arrow position
        if (middlewareData && middlewareData.arrow) {
          const { x: arrowX, y: arrowY } = middlewareData.arrow;

          /**
           * Clamp arrow X position to a minimum of 24px from the edge of the dropdown.
           * This prevents wide toggles from pushing the arrow to the very edge of the dropdown.
           */
          const toggleRect = this.toggleElement.getBoundingClientRect();
          const contentRect = this.$refs.content.getBoundingClientRect();
          const clampedArrowX =
            toggleRect.width > contentRect.width
              ? Math.min(Math.max(arrowX, ARROW_X_MINIMUM), contentRect.width - ARROW_X_MINIMUM)
              : arrowX;

          Object.assign(this.$refs.dropdownArrow.style, {
            left: arrowX != null ? `${clampedArrowX}px` : '',
            top: arrowY != null ? `${arrowY}px` : '',
            right: '',
            bottom: '',
            [staticSide]: '-4px',
            transform: `rotate(${rotation})`,
          });
        }
      });
    },
    stopFloating() {
      this.observer?.disconnect();
      this.stopAutoUpdate?.();
    },
    async toggle(event) {
      if (event && this.visible) {
        let prevented = false;
        this.$emit(GL_DROPDOWN_BEFORE_CLOSE, {
          originalEvent: event,
          preventDefault() {
            prevented = true;
          },
        });
        if (prevented) return false;
      }
      this.visible = !this.visible;

      if (this.visible) {
        // The dropdown needs to be actually visible before we compute its position with Floating UI.
        await this.$nextTick();
        this.openedYet = true;
        /**
         * We wait until the dropdown's position has been computed before emitting the `shown` event.
         * This ensures that, if the parent component attempts to focus an inner element, the dropdown
         * is already properly placed in the page. Otherwise, the page would scroll back to the top.
         */
        this.startFloating();

        this.$emit(GL_DROPDOWN_SHOWN);
      } else {
        this.stopFloating();
        this.$emit(GL_DROPDOWN_HIDDEN, event);
      }

      // this is to check whether `toggle` was prevented or not
      return true;
    },
    open() {
      if (this.visible) {
        return;
      }
      this.toggle();
    },
    close(event) {
      if (!this.visible) {
        return;
      }

      this.toggle(event);
    },
    clickedToggle(event) {
      return (
        this.$refs.toggle.contains?.(event.target) ||
        this.$refs.toggle.$el?.contains?.(event.target)
      );
    },
    handleClickOutside(event) {
      // Ignore "click outside" events if the toggle was clicked
      if (this.clickedToggle(event)) {
        return;
      }
      this.close(event);
    },
    /**
     * Closes the dropdown and returns the focus to the toggle unless it has has moved outside
     * of the dropdown, meaning that the consumer needed to put some other element in focus.
     *
     * @param {KeyboardEvent?} event The keyboard event that caused the dropdown to close.
     */
    async closeAndFocus(event) {
      if (!this.visible) {
        return;
      }

      const hadFocusWithin = this.$el.contains(document.activeElement);
      const hasToggled = await this.toggle(event);

      if (!hadFocusWithin) {
        return;
      }

      if (hasToggled) {
        this.focusToggle();
      }
    },
    focusToggle() {
      this.toggleElement.focus();
    },
    onKeydown(event) {
      const {
        keyCode,
        code,
        target: { tagName },
      } = event;

      // Use keyCode because @vue/test-utils doesn't correctly set the
      // `code` and `key` KeyboardEvent properties. This is only needed in this case because:
      //  - We are not using the @keydown.esc template syntax, which under Vue 2 checks against `keyCode` anyway.
      //  - The `.trigger('keydown.esc')` shorthand @vue/test-utils provides is useful.
      // See https://github.com/vuejs/vue-test-utils/issues/2096
      if (keyCode === KEY_CODE_ESCAPE && this.visible) {
        stopEvent(event);
        this.close();
        return;
      }

      let toggleOnEnter = true;
      let toggleOnSpace = true;

      if (tagName === 'BUTTON') {
        toggleOnEnter = false;
        toggleOnSpace = false;
      } else if (tagName === 'A') {
        toggleOnEnter = false;
      }

      if ((code === ENTER && toggleOnEnter) || (code === SPACE && toggleOnSpace)) {
        this.toggle(event);
      }

      if (code === ARROW_DOWN) {
        this.$emit(GL_DROPDOWN_FOCUS_CONTENT, event);
      }
    },
    calculateNonScrollableAreaHeight() {
      const scrollableArea = this.$refs.content?.querySelector(`.${GL_DROPDOWN_CONTENTS_CLASS}`);
      if (!scrollableArea) return;

      const floatingElementBoundingBox = this.$refs.content.getBoundingClientRect();
      const scrollableAreaBoundingBox = scrollableArea.getBoundingClientRect();
      this.nonScrollableContentHeight =
        floatingElementBoundingBox.height - scrollableAreaBoundingBox.height;
    },
    /**
     * Public method which returns `true` if the given element is in the DOM tree of this component,
     * and `false` otherwise.
     *
     * Useful for checking whether an event was dispatched against something in this dropdown,
     * e.g., pressing <kbd>Esc</kbd>.
     */
    containsElement(element) {
      return (
        element.closest(`.${BASE_DROPDOWN_CLASS}`) === this.$el ||
        element.closest(`.${DROPDOWN_CONTAINER_CLASS}`) === this.$refs.dropdownContainer
      );
    },
  },
};
</script>

<template>
  <div :class="[$options.BASE_DROPDOWN_CLASS, { '!gl-block': block }]">
    <component
      :is="toggleComponent"
      v-bind="toggleAttributes"
      :id="computedToggleId"
      ref="toggle"
      data-testid="base-dropdown-toggle"
      v-on="toggleListeners"
    >
      <!-- @slot Custom toggle button content -->
      <slot name="toggle" :accessibility-attributes="toggleAccessibilityAttributes">
        <span
          :id="computedToggleInnerId"
          class="gl-new-dropdown-button-text"
          :class="{ 'gl-sr-only': textSrOnly }"
          data-testid="base-dropdown-span"
        >
          {{ toggleText }}
        </span>
        <gl-icon
          v-if="!noCaret"
          class="gl-button-icon gl-new-dropdown-chevron"
          name="chevron-down"
        />
      </slot>
    </component>

    <dropdown-container :positioning-strategy="positioningStrategy">
      <div
        ref="dropdownContainer"
        v-outside.click.focusin="handleClickOutside"
        :class="$options.DROPDOWN_CONTAINER_CLASS"
      >
        <div
          :id="baseDropdownId"
          ref="content"
          data-testid="base-dropdown-menu"
          class="gl-new-dropdown-panel"
          :class="panelClasses"
          @keydown.esc.stop.prevent="closeAndFocus"
        >
          <div ref="dropdownArrow" class="gl-new-dropdown-arrow"></div>
          <div class="gl-new-dropdown-inner">
            <slot :visible="visible"></slot>
          </div>
        </div>
      </div>
    </dropdown-container>
  </div>
</template>
