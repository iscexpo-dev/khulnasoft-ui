import { extend } from '../../vue'
import { NAME_DROPDOWN_ITEM_BUTTON } from '../../constants/components'
import { EVENT_NAME_CLICK } from '../../constants/events'
import { attrsMixin } from '../../mixins/attrs'
import { normalizeSlotMixin } from '../../mixins/normalize-slot'

// --- Props ---

export const props = {
  active: {
    type: Boolean,
    required: false,
    default: false
  },
  activeClass: {
    type: String,
    required: false,
    default: 'active'
  },
  buttonClass: {
    type: [Array, Object, String],
    required: false,
    default: undefined
  },
  disabled: {
    type: Boolean,
    required: false,
    default: false
  },
  variant: {
    type: String,
    required: false,
    default: undefined
  },
  role: {
    type: String,
    required: false,
    default: 'menuitem'
  }
}

// --- Main component ---

// @vue/component
export const BDropdownItemButton = /*#__PURE__*/ extend({
  name: NAME_DROPDOWN_ITEM_BUTTON,
  mixins: [attrsMixin, normalizeSlotMixin],
  inject: {
    getBvDropdown: { default: () => () => null }
  },
  inheritAttrs: false,
  props,
  computed: {
    bvDropdown() {
      return this.getBvDropdown()
    },

    computedAttrs() {
      return {
        ...this.bvAttrs,
        role: this.role,
        type: 'button',
        disabled: this.disabled,
        'aria-selected': this.active ? 'true' : null
      }
    }
  },
  methods: {
    closeDropdown() {
      if (this.bvDropdown) {
        this.bvDropdown.hide(true)
      }
    },
    onClick(event) {
      this.$emit(EVENT_NAME_CLICK, event)
      this.closeDropdown()
    }
  },
  render(h) {
    const { active, variant, bvAttrs } = this

    return h(
      'li',
      {
        class: bvAttrs.class,
        style: bvAttrs.style,
        attrs: { role: 'presentation' }
      },
      [
        h(
          'button',
          {
            staticClass: 'dropdown-item',
            class: [
              this.buttonClass,
              {
                [this.activeClass]: active,
                [`text-${variant}`]: variant && !(active || this.disabled)
              }
            ],
            attrs: this.computedAttrs,
            on: { click: this.onClick },
            ref: 'button'
          },
          this.normalizeSlot()
        )
      ]
    )
  }
})
