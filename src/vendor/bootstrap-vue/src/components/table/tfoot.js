import { extend } from '../../vue'
import { NAME_TFOOT } from '../../constants/components'
import { attrsMixin } from '../../mixins/attrs'
import { listenersMixin } from '../../mixins/listeners'
import { normalizeSlotMixin } from '../../mixins/normalize-slot'

// --- Props ---

export const props = {
  // Supported values: 'lite', 'dark', or null
  footVariant: {
    type: String,
    required: false,
    default: undefined
  }
}

// --- Main component ---

// TODO:
//   In Bootstrap v5, we won't need "sniffing" as table element variants properly inherit
//   to the child elements, so this can be converted to a functional component
// @vue/component
export const BTfoot = /*#__PURE__*/ extend({
  name: NAME_TFOOT,
  mixins: [attrsMixin, listenersMixin, normalizeSlotMixin],
  provide() {
    return {
      getBvTableRowGroup: () => this
    }
  },
  inject: {
    // Sniffed by `<b-tr>` / `<b-td>` / `<b-th>`
    getBvTable: {
      default: /* istanbul ignore next */ () => () => ({})
    }
  },
  inheritAttrs: false,
  props,
  computed: {
    bvTable() {
      return this.getBvTable()
    },
    // Sniffed by `<b-tr>` / `<b-td>` / `<b-th>`
    isTfoot() {
      return true
    },
    // Sniffed by `<b-tr>` / `<b-td>` / `<b-th>`
    isDark() {
      return this.bvTable.dark
    },
    // Sniffed by `<b-tr>` / `<b-td>` / `<b-th>`
    isStacked() {
      return this.bvTable.isStacked
    },
    // Sniffed by `<b-tr>` / `<b-td>` / `<b-th>`
    isResponsive() {
      return this.bvTable.isResponsive
    },
    // Sniffed by `<b-tr>` / `<b-td>` / `<b-th>`
    // Sticky headers are only supported in thead
    isStickyHeader() {
      return false
    },
    // Sniffed by `<b-tr>` / `<b-td>` / `<b-th>`
    // Needed to handle header background classes, due to lack of
    // background color inheritance with Bootstrap v4 table CSS
    hasStickyHeader() {
      return !this.isStacked && this.bvTable.stickyHeader
    },
    // Sniffed by `<b-tr>` / `<b-td>` / `<b-th>`
    tableVariant() {
      return this.bvTable.tableVariant
    },
    tfootClasses() {
      return [this.footVariant ? `thead-${this.footVariant}` : null]
    },
    tfootAttrs() {
      return { ...this.bvAttrs, role: 'rowgroup' }
    }
  },
  render(h) {
    return h(
      'tfoot',
      {
        class: this.tfootClasses,
        attrs: this.tfootAttrs,
        // Pass down any native listeners
        on: this.bvListeners
      },
      this.normalizeSlot()
    )
  }
})
