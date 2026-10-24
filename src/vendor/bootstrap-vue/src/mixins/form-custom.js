import { extend } from '../vue'

// --- Props ---

export const props = {
  plain: {
    type: Boolean,
    required: false,
    default: false
  }
}

// --- Mixin ---

// @vue/component
export const formCustomMixin = extend({
  props,
  computed: {
    custom() {
      return !this.plain
    }
  }
})
