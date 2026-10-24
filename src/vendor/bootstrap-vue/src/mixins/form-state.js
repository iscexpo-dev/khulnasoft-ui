/* Form control contextual state class computation
 *
 * Returned class is either 'is-valid' or 'is-invalid' based on the 'state' prop
 * state can be one of five values:
 *  - true for is-valid
 *  - false for is-invalid
 *  - null for no contextual state
 */
import { extend } from '../vue'
import { isBoolean } from '../utils/inspect'
import { safeVueInstance } from '../utils/safe-vue-instance'

// --- Props ---

export const props = {
  // Tri-state prop: true, false, null (or undefined)
  state: {
    type: Boolean,
    required: false,
    default: null
  }
}

// --- Mixin ---

// @vue/component
export const formStateMixin = extend({
  props,
  computed: {
    computedState() {
      // If not a boolean, ensure that value is null
      return isBoolean(this.state) ? this.state : null
    },
    stateClass() {
      const state = this.computedState
      return state === true ? 'is-valid' : state === false ? 'is-invalid' : null
    },
    computedAriaInvalid() {
      const ariaInvalid = safeVueInstance(this).ariaInvalid
      if (ariaInvalid === true || ariaInvalid === 'true' || ariaInvalid === '') {
        return 'true'
      }
      return this.computedState === false ? 'true' : ariaInvalid
    }
  }
})
