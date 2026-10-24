<script>
import GlLink from '../../link/link.vue';
import GlIcon from '../../icon/icon.vue';
import { ENTER, SPACE } from '../constants';
import { stopEvent } from '../../../../utils/utils';
import { dropdownItemVariantOptions } from '../../../../utils/constants';
import { isItem } from './utils';
import { DISCLOSURE_DROPDOWN_ITEM_NAME } from './constants';

export const ITEM_CLASS = 'gl-new-dropdown-item';

export default {
  name: DISCLOSURE_DROPDOWN_ITEM_NAME,
  ITEM_CLASS,
  components: { GlLink, GlIcon },
  props: {
    /**
     * The item object to render as a disclosure dropdown item.
     */
    item: {
      type: Object,
      required: false,
      default: null,
      validator: isItem,
    },
    /**
     * The variant of the dropdown item.
     */
    variant: {
      type: String,
      default: null,
      validator(value) {
        return dropdownItemVariantOptions[value] !== undefined;
      },
      required: false,
    },
    /**
     * The name of the icon to display in the dropdown item.
     */
    icon: {
      type: String,
      default: null,
      required: false,
    },
    /**
     * Does dropdown have icons
     */
    siblingsHaveIcons: {
      type: Boolean,
      default: false,
      required: false,
    },

    /**
     * Is the item able to be selected
     */
    disabled: {
      type: Boolean,
      default: false,
      required: false,
    },
  },
  computed: {
    isLink() {
      return typeof this.item?.href === 'string' || typeof this.item?.to !== 'undefined';
    },
    isCustomContent() {
      return Boolean(this.$scopedSlots.default);
    },
    itemComponent() {
      const { item } = this;

      if (this.isLink)
        return {
          is: GlLink,
          attrs: {
            href: item.href,
            to: item.to,
            variant: 'unstyled',
            ...item.extraAttrs,
          },
          listeners: {
            click: this.action,
          },
        };

      return {
        is: 'button',
        attrs: {
          ...item?.extraAttrs,
          type: 'button',
        },
        listeners: {
          click: () => {
            item?.action?.call(undefined, item);
            this.action();
          },
        },
      };
    },
    listIndex() {
      return this.item?.extraAttrs?.disabled ? null : 0;
    },
    componentIndex() {
      return this.item?.extraAttrs?.disabled ? null : -1;
    },
    itemVariant() {
      return this.variant || this.item?.variant;
    },
    classes() {
      return [
        this.$options.ITEM_CLASS,
        this.item?.wrapperClass ?? '',
        // This isn't a Tailwind class, so this lint rule isn't relevant.
        // It just so happens this class has the same prefix `gl-`.
        this.itemVariant && this.itemVariant !== 'default'
          ? // eslint-disable-next-line @khulnasoft/tailwind-no-interpolation
            `gl-new-dropdown-item-${this.itemVariant}`
          : '',
        this.disabled ? 'disabled' : '',
      ];
    },
    iconName() {
      return this.icon || this.item?.icon;
    },
    wrapperListeners() {
      const listeners = {
        keydown: this.onKeydown,
      };
      if (this.isCustomContent) {
        listeners.click = this.action;
      }
      return listeners;
    },
  },
  methods: {
    onKeydown(event) {
      if (!this.disabled) {
        const { code } = event;

        if (code === ENTER || code === SPACE) {
          if (this.isCustomContent) {
            this.action();
          } else {
            stopEvent(event);
            /** Instead of simply navigating or calling the action, we want
             * the `a/button` to be the target of the event as it might have additional attributes.
             * E.g. `a` might have `target` attribute.
             */
            const e = new MouseEvent('click', { bubbles: true, cancelable: true });
            if (this.isLink) {
              this.$refs.item.$el.dispatchEvent(e);
            } else {
              this.$refs.item?.dispatchEvent(e);
            }
          }
        }
      }
    },
    action() {
      this.$emit('action', this.item);
    },
    handleClick(event) {
      if (this.disabled) {
        stopEvent(event);
      }
    },
  },
};
</script>

<template>
  <li
    :tabindex="listIndex"
    :class="classes"
    data-testid="disclosure-dropdown-item"
    :aria-disabled="disabled"
    v-on="wrapperListeners"
  >
    <slot>
      <component
        :is="itemComponent.is"
        v-bind="itemComponent.attrs"
        ref="item"
        class="gl-new-dropdown-item-content"
        :tabindex="componentIndex"
        v-on="itemComponent.listeners"
        @click="handleClick"
      >
        <span class="gl-new-dropdown-item-text-wrapper">
          <slot name="list-item">
            <span v-if="iconName || siblingsHaveIcons" class="gl-new-dropdown-item-icon">
              <gl-icon v-if="iconName" :name="iconName" variant="current" />
            </span>
            {{ item.text }}
          </slot>
        </span>
      </component>
    </slot>
  </li>
</template>
