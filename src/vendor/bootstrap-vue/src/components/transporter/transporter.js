import { isVue3, extend, getVue3Constructor } from '../../vue'
import { NAME_TRANSPORTER, NAME_TRANSPORTER_TARGET } from '../../constants/components'
import { IS_BROWSER } from '../../constants/env'
import { HTMLElement } from '../../constants/safe-types'
import { concat } from '../../utils/array'
import { removeNode, select } from '../../utils/dom'
import { identity } from '../../utils/identity'
import { isFunction, isString } from '../../utils/inspect'
import { normalizeSlotMixin } from '../../mixins/normalize-slot'
import { createNewChildComponent } from '../../utils/create-new-child-component'

// --- Helper components ---

// BVTransporter/BVTransporterTarget:
//
// Single root node portaling of content, which retains parent/child hierarchy
// Unlike Portal-Vue where portaled content is no longer a descendent of its
// intended parent components
//
// Private components for use by Tooltips, Popovers and Modals
//
// Based on vue-simple-portal
// https://github.com/LinusBorg/vue-simple-portal

// Transporter target used by BVTransporter
// Supports only a single root element
// @vue/component
const BVTransporterTarget = /*#__PURE__*/ extend({
  // As an abstract component, it doesn't appear in the $parent chain of
  // components, which means the next parent of any component rendered inside
  // of this one will be the parent from which is was portal'd
  abstract: true,
  name: NAME_TRANSPORTER_TARGET,
  props: {
    // Even though we only support a single root element,
    // VNodes are always passed as an array
    nodes: {
      type: [Array, Function],
      required: false,
      default: undefined
    }
  },
  data: vm => {
    return {
      updatedNodes: vm.nodes
    }
  },
  destroyed() {
    removeNode(this.$el)
  },
  render(h) {
    const { updatedNodes } = this

    let $nodes = isFunction(updatedNodes) ? updatedNodes({}) : updatedNodes
    $nodes = concat($nodes).filter(identity)
    if ($nodes && $nodes.length > 0 && !$nodes[0].text) {
      return $nodes[0]
    }

    /* istanbul ignore next */
    return h()
  }
})

// --- Props ---

export const props = {
  // String: CSS selector,
  // HTMLElement: Element reference
  // Mainly needed for tooltips/popovers inside modals
  container: {
    type: [HTMLElement, String],
    required: false,
    default: 'body'
  },
  disabled: {
    type: Boolean,
    required: false,
    default: false
  },
  // This should be set to match the root element type
  tag: {
    type: String,
    required: false,
    default: 'div'
  }
}

// --- Main component ---

// @vue/component
export const BVTransporter = /*#__PURE__*/ extend({
  name: NAME_TRANSPORTER,
  mixins: [normalizeSlotMixin],
  props,
  watch: {
    disabled: {
      immediate: true,
      handler(disabled) {
        // Vue 2 only: manage manual portaling
        if (isVue3(this)) return

        disabled ? this.unmountTarget() : this.$nextTick(this.mountTarget)
      }
    }
  },
  created() {
    // Vue 2 only: create private non-reactive props
    if (isVue3(this)) return

    this.$_defaultFn = null
    this.$_target = null
  },
  beforeMount() {
    // Vue 2 only
    if (isVue3(this)) return

    this.mountTarget()
  },
  updated() {
    // Vue 2 only
    // We need to make sure that all children have completed updating
    // before rendering in the target
    // `vue-simple-portal` has the this in a `$nextTick()`,
    // while `portal-vue` doesn't
    // Just trying to see if the `$nextTick()` delay is required or not
    // Since all slots in Vue 2.6.x are always functions
    if (isVue3(this)) return
    this.updateTarget()
  },
  beforeDestroy() {
    // Vue 2 only
    if (isVue3(this)) return

    this.unmountTarget()
    this.$_defaultFn = null
  },
  methods: {
    // Get the element which the target should be appended to
    getContainer() {
      /* istanbul ignore else */
      if (IS_BROWSER) {
        const { container } = this
        return isString(container) ? select(container) : container
      } else {
        return null
      }
    },
    // Mount the target
    mountTarget() {
      if (!this.$_target) {
        const $container = this.getContainer()
        if ($container) {
          const $el = document.createElement('div')
          $container.appendChild($el)
          this.$_target = createNewChildComponent(this, BVTransporterTarget, {
            el: $el,
            propsData: {
              // Initial nodes to be rendered
              nodes: concat(this.normalizeSlot())
            }
          })
        }
      }
    },
    // Update the content of the target
    updateTarget() {
      if (IS_BROWSER && this.$_target) {
        const defaultFn = this.$scopedSlots.default
        if (!this.disabled) {
          /* istanbul ignore else: only applicable in Vue 2.5.x */
          if (defaultFn && this.$_defaultFn !== defaultFn) {
            // We only update the target component if the scoped slot
            // function is a fresh one. The new slot syntax (since Vue 2.6)
            // can cache unchanged slot functions and we want to respect that here
            this.$_target.updatedNodes = defaultFn
          } else if (!defaultFn) {
            // We also need to be back compatible with non-scoped default slot (i.e. 2.5.x)
            this.$_target.updatedNodes = this.$slots.default
          }
        }
        // Update the scoped slot function cache
        this.$_defaultFn = defaultFn
      }
    },
    // Unmount the target
    unmountTarget() {
      this.$_target && this.$_target.$destroy()
      this.$_target = null
    }
  },
  render(h) {
    if (isVue3(this)) {
      // Vue 3: use native Teleport
      if (this.disabled) {
        const $nodes = concat(this.normalizeSlot()).filter(identity)
        if ($nodes.length > 0) {
          return $nodes[0]
        }
      }

      const { Teleport } = getVue3Constructor(this)

      return h(
        Teleport,
        {
          to: this.container
        },
        this.normalizeSlot()
      )
    }

    // Vue 2: this component has no root element, so only a single VNode is allowed
    if (this.disabled) {
      const $nodes = concat(this.normalizeSlot()).filter(identity)
      if ($nodes.length > 0 && !$nodes[0].text) {
        return $nodes[0]
      }
    }
    return h()
  }
})
