// --- Utils for testing ---

export const wrapWithMethods = (Component, methods) => ({
  inheritAttrs: false,
  components: { wrappedComponent: Component },
  methods,
  template: `
    <wrapped-component v-bind="$attrs" v-on="$listeners">
      <slot v-for="(_, name) in $slots" :name="name" :slot="name" />
      <template v-for="(_, name) in $scopedSlots" :slot="name" slot-scope="slotData"><slot :name="name" v-bind="slotData" /></template>
    </wrapped-component>
  `
})

export const waitNT = ctx => new Promise(resolve => ctx.$nextTick(resolve))
export const waitRAF = () => new Promise(resolve => window.requestAnimationFrame(resolve))

/**
 * This little helper ensures that an event was emitted on a Vue Wrapper
 *
 * It will only work in jest specs that use real timers, and not mock timers
 *
 * Took a little inspiration from Capybara here
 *
 * @example await ensureEventEmitted(wrapper, 'shown')
 *
 * @param wrapper {VueTestUtils.VueWrapper}
 * @param event {string}
 * @param count {number?}
 * @returns {Promise<void>}
 */
export const ensureEventEmitted = (wrapper, event, count = 1) => {
  return new Promise(resolve => {
    const id = setInterval(() => {
      const instances = wrapper.emitted(event)?.length || 0
      if (instances >= count) {
        clearInterval(id)
        resolve()
      }
    }, 16)
  })
}

export const getInstanceFromVNode = vnode => vnode.__vueParentComponent?.ctx || vnode.__vue__
