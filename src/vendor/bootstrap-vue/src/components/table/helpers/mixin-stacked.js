import { extend } from '../../../vue'

// --- Props ---

export const props = {
  stacked: {
    type: [Boolean, String],
    required: false,
    default: false
  }
}

// --- Mixin ---

// @vue/component
export const stackedMixin = extend({
  props,
  computed: {
    isStacked() {
      const { stacked } = this
      // `true` when always stacked, or returns breakpoint specified
      return stacked === '' ? true : stacked
    },
    isStackedAlways() {
      return this.isStacked === true
    },
    stackedTableClasses() {
      const { isStackedAlways } = this
      return {
        'b-table-stacked': isStackedAlways,
        [`b-table-stacked-${this.stacked}`]: !isStackedAlways && this.isStacked
      }
    }
  }
})
