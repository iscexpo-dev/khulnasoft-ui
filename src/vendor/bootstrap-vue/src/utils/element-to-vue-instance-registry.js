import { isVue3 } from '../vue'

const registry = new WeakMap()

export const registerElementToInstance = (element, instance) => {
  if (!isVue3(instance)) {
    return
  }

  registry.set(element, instance)
}

export const removeElementToInstance = element => {
  registry.delete(element)
}

export const getInstanceFromElement = element => {
  if (element.__vue__) {
    return element.__vue__
  }

  let currentElement = element

  while (currentElement) {
    if (registry.has(currentElement)) {
      /* istanbul ignore next */
      return registry.get(currentElement)
    }
    currentElement = currentElement.parentNode
  }

  return null
}
