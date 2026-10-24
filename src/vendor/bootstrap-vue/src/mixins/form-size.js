import { extend } from '../vue'

// --- Props ---

export const props = {
  size: {
    type: String,
    required: false,
    default: undefined
  }
}

// --- Mixin ---

// @vue/component
export const formSizeMixin = extend({
  props,
  computed: {
    sizeFormClass() {
      return [this.size ? `form-control-${this.size}` : null]
    }
  }
})
