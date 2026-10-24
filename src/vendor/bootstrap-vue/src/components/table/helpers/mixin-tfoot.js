import { extend } from '../../../vue'
import { SLOT_NAME_CUSTOM_FOOT } from '../../../constants/slots'
import { BTfoot } from '../tfoot'

// --- Props ---

export const props = {
  footClone: {
    type: Boolean,
    required: false,
    default: false
  },
  // Any Bootstrap theme variant (or custom)
  // Falls back to `headRowVariant`
  footRowVariant: {
    type: String,
    required: false,
    default: undefined
  },
  // 'dark', 'light', or `null` (or custom)
  footVariant: {
    type: String,
    required: false,
    default: undefined
  },
  tfootClass: {
    type: [Array, Object, String],
    required: false,
    default: undefined
  },
  tfootTrClass: {
    type: [Array, Object, String],
    required: false,
    default: undefined
  }
}

// --- Mixin ---

// @vue/component
export const tfootMixin = extend({
  props,
  methods: {
    renderTFootCustom() {
      const h = this.$createElement
      if (this.hasNormalizedSlot(SLOT_NAME_CUSTOM_FOOT)) {
        return h(
          BTfoot,
          {
            class: this.tfootClass || null,
            props: { footVariant: this.footVariant || this.headVariant || null },
            key: 'bv-tfoot-custom'
          },
          this.normalizeSlot(SLOT_NAME_CUSTOM_FOOT, {
            items: this.computedItems.slice(),
            fields: this.computedFields.slice(),
            columns: this.computedFields.length
          })
        )
      }

      return h()
    },
    renderTfoot() {
      // Passing true to renderThead will make it render a tfoot
      return this.footClone ? this.renderThead(true) : this.renderTFootCustom()
    }
  }
})
