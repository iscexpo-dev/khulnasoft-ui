import { extend, isVue3 } from '../vue'
import { cloneDeep } from './clone-deep'
import { looseEqual } from './loose-equal'
import { hasOwnProperty, keys } from './object'

const isEmpty = value => !value || keys(value).length === 0

export const makePropWatcher = propName => ({
  handler(newValue, oldValue) {
    if (looseEqual(newValue, oldValue)) {
      return
    }
    if (isEmpty(newValue) || isEmpty(oldValue)) {
      this[propName] = cloneDeep(newValue)
      return
    }
    for (const key in oldValue) {
      if (!hasOwnProperty(newValue, key)) {
        this.$delete(this.$data[propName], key)
      }
    }
    for (const key in newValue) {
      this.$set(this.$data[propName], key, newValue[key])
    }
  }
})

export const getInternalPropName = proxyPropName => `bv_internal__${proxyPropName}`

export const makePropCacheMixin = (propName, proxyPropName) => {
  const internalPropName = getInternalPropName(proxyPropName)
  return extend({
    data() {
      return { [internalPropName]: isVue3(this) ? null : cloneDeep(this[propName] || {}) }
    },
    computed: {
      [proxyPropName]() {
        if (internalPropName in this && this[internalPropName]) {
          return this[internalPropName]
        }
        const result = { ...this[propName] }
        Object.keys(result).forEach(key => {
          if (result[key] === undefined) {
            delete result[key]
          }
        })
        return result
      }
    },
    created() {
      if (!isVue3(this)) {
        // Work around unwanted re-renders: https://github.com/vuejs/vue/issues/10115
        this.$watch(propName, makePropWatcher(internalPropName).handler)
      }
    }
  })
}
