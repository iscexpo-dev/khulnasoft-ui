import { extend } from '../../../vue'
import { mathMax } from '../../../utils/math'
import { toInteger } from '../../../utils/number'
import { safeVueInstance } from '../../../utils/safe-vue-instance'

// --- Props ---

export const props = {
  currentPage: {
    type: [Number, String],
    required: false,
    default: 1
  },
  perPage: {
    type: [Number, String],
    required: false,
    default: 0
  }
}

// --- Mixin ---

// @vue/component
export const paginationMixin = extend({
  props,
  computed: {
    localPaging() {
      return this.hasProvider ? !!this.noProviderPaging : true
    },
    paginatedItems() {
      const { sortedItems, filteredItems, localItems } = safeVueInstance(this)
      let items = sortedItems || filteredItems || localItems || []
      const currentPage = mathMax(toInteger(this.currentPage, 1), 1)
      const perPage = mathMax(toInteger(this.perPage, 0), 0)
      // Apply local pagination
      if (this.localPaging && perPage) {
        // Grab the current page of data (which may be past filtered items limit)
        items = items.slice((currentPage - 1) * perPage, currentPage * perPage)
      }
      // Return the items to display in the table
      return items
    }
  }
})
