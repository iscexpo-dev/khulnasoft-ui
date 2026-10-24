import { isVue3 } from '../vue'
import { makePropCacheMixin, getInternalPropName } from '../utils/cache'

const internalPropName = getInternalPropName('bvListeners')
export const listenersMixin = makePropCacheMixin('$listeners', 'bvListeners').extend({
  created() {
    if (!isVue3(this)) {
      return
    }

    this[internalPropName] = {
      // bug: this.$listeners is non-reactive in Vue.js 3 compat
      ...this.$listeners
    }
  },
  beforeUpdate() {
    if (!isVue3(this)) {
      return
    }
    this[internalPropName] = {
      ...this.$listeners
    }
  }
})
