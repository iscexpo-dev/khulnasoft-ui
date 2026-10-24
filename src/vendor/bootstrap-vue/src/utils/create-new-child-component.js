import { isVue3, getVue3Constructor } from '../vue'

// Regex to detect event handler props: onSomething or onSomethingOnce
const EVENT_HANDLER_RE = /^on([A-Z][a-zA-Z]*)$/
const ONCE_SUFFIX = 'Once'

/**
 * Converts an event name to a handler prop name.
 * Use as computed property key with event constants: [eventProp(EVENT_NAME_HIDDEN)]
 * @param {string} eventName - The event name (e.g., 'hidden', 'show', 'mouseenter')
 * @param {Object} options - Options object
 * @param {boolean} options.once - If true, returns the "once" variant (e.g., 'onHiddenOnce')
 * @returns {string} The handler prop name (e.g., 'onHidden', 'onHiddenOnce')
 */
export const eventProp = (eventName, { once = false } = {}) => {
  const capitalized = eventName.charAt(0).toUpperCase() + eventName.slice(1)
  return `on${capitalized}${once ? ONCE_SUFFIX : ''}`
}

/**
 * Parses a handler prop name to extract event name and once flag.
 * Examples:
 *   onShow -> { eventName: 'show', once: false }
 *   onShowOnce -> { eventName: 'show', once: true }
 *   onMouseenter -> { eventName: 'mouseenter', once: false }
 */
const parseEventHandlerProp = propName => {
  const match = propName.match(EVENT_HANDLER_RE)
  if (!match) return null

  let eventPart = match[1]
  const once = eventPart.endsWith(ONCE_SUFFIX)
  if (once) eventPart = eventPart.slice(0, -ONCE_SUFFIX.length)

  const eventName = eventPart.charAt(0).toLowerCase() + eventPart.slice(1)
  return { eventName, once }
}

/**
 * Extracts event handlers from config and separates them from other props.
 * @param {Object} config - The config object with potential event handler props
 * @returns {{ handlers: Array<{eventName: string, handler: Function, once: boolean}>, cleanConfig: Object }}
 */
const extractEventHandlers = config => {
  const handlers = []
  const cleanConfig = { ...config }

  if (cleanConfig.propsData) {
    const cleanPropsData = {}
    Object.keys(cleanConfig.propsData).forEach(propName => {
      const parsed = parseEventHandlerProp(propName)
      if (parsed && typeof cleanConfig.propsData[propName] === 'function') {
        handlers.push({ ...parsed, handler: cleanConfig.propsData[propName] })
      } else {
        cleanPropsData[propName] = cleanConfig.propsData[propName]
      }
    })
    cleanConfig.propsData = cleanPropsData
  }

  return { handlers, cleanConfig }
}

const BUILTIN_DIRECTIVES = [
  'show',
  'model',
  'bind',
  'cloak',
  'else',
  'else-if',
  'for',
  'html',
  'if',
  'memo',
  'on',
  'once',
  'pre',
  'slot',
  'text'
]

const resolveComponentOptions = Component => {
  const opts =
    typeof Component === 'function' && Component.options
      ? { ...Component.options }
      : { ...Component }

  if (opts.directives) {
    opts.directives = Object.fromEntries(
      Object.entries(opts.directives).filter(([key]) => !BUILTIN_DIRECTIVES.includes(key))
    )
  }

  return opts
}

export const createNewChildComponent = (parent, Component, config = {}) => {
  const bvEventRoot = parent.$root ? parent.$root.$options.bvEventRoot || parent.$root : null

  // Vue 3: resolve component options and instantiate via the Vue constructor
  // to ensure the component runs through the Vue 3 runtime path
  if (isVue3(parent)) {
    const Vue = getVue3Constructor(parent)
    const componentOptions = resolveComponentOptions(Component)

    return new Vue({
      ...componentOptions,
      ...config,
      parent,
      bvParent: parent,
      bvEventRoot
    })
  }

  // Vue 2: extract handlers and subscribe manually after creation
  const { handlers, cleanConfig } = extractEventHandlers(config)

  const instance = new Component({
    ...cleanConfig,
    parent,
    bvParent: parent,
    bvEventRoot
  })

  // Subscribe to events using $on/$once
  handlers.forEach(({ eventName, handler, once }) => {
    instance[once ? '$once' : '$on'](eventName, handler)
  })

  return instance
}
