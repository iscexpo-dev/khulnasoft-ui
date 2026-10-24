import { extend } from '../../vue'
import { NAME_TAB } from '../../constants/components'
import { MODEL_EVENT_NAME_PREFIX } from '../../constants/events'
import { SLOT_NAME_TITLE } from '../../constants/slots'
import { sortKeys } from '../../utils/object'
import { idMixin, props as idProps } from '../../mixins/id'
import { normalizeSlotMixin } from '../../mixins/normalize-slot'
import { BVTransition } from '../transition/bv-transition'

// --- Constants ---

const MODEL_PROP_NAME_ACTIVE = 'active'
const MODEL_EVENT_NAME_ACTIVE = MODEL_EVENT_NAME_PREFIX + MODEL_PROP_NAME_ACTIVE

// --- Props ---

export const props = sortKeys({
  ...idProps,
  [MODEL_PROP_NAME_ACTIVE]: {
    type: Boolean,
    required: false,
    default: false
  },
  buttonId: {
    type: String,
    required: false,
    default: undefined
  },
  disabled: {
    type: Boolean,
    required: false,
    default: false
  },
  lazy: {
    type: Boolean,
    required: false,
    default: false
  },
  noBody: {
    type: Boolean,
    required: false,
    default: false
  },
  tag: {
    type: String,
    required: false,
    default: 'div'
  },
  title: {
    type: String,
    required: false,
    default: undefined
  },
  // Sniffed by `<b-tabs>` and added to nav `li.nav-item`
  titleItemClass: {
    type: [Array, Object, String],
    required: false,
    default: undefined
  },
  titleLinkAttributes: {
    type: Object,
    required: false,
    default: undefined
  },
  // Sniffed by `<b-tabs>` and added to nav `a.nav-link`
  titleLinkClass: {
    type: [Array, Object, String],
    required: false,
    default: undefined
  }
})

// --- Main component ---

// @vue/component
export const BTab = /*#__PURE__*/ extend({
  name: NAME_TAB,
  mixins: [idMixin, normalizeSlotMixin],
  inject: {
    getBvTabs: {
      default: () => () => ({})
    }
  },
  props,
  data() {
    return {
      localActive: this[MODEL_PROP_NAME_ACTIVE] && !this.disabled
    }
  },
  computed: {
    bvTabs() {
      return this.getBvTabs()
    },
    // For parent sniffing of child
    _isTab() {
      return true
    },
    tabClasses() {
      const { localActive: active, disabled } = this

      return [
        {
          active,
          disabled,
          'card-body': this.bvTabs.card && !this.noBody
        },
        // Apply <b-tabs> `activeTabClass` styles when this tab is active
        active ? this.bvTabs.activeTabClass : null
      ]
    },
    controlledBy() {
      return this.buttonId || this.safeId('__BV_tab_button__')
    },
    computedNoFade() {
      return !(this.bvTabs.fade || false)
    },
    computedLazy() {
      return this.bvTabs.lazy || this.lazy
    }
  },
  watch: {
    [MODEL_PROP_NAME_ACTIVE](newValue, oldValue) {
      if (newValue !== oldValue) {
        if (newValue) {
          // If activated post mount
          this.activate()
        } else {
          /* istanbul ignore next */
          if (!this.deactivate()) {
            // Tab couldn't be deactivated, so we reset the synced active prop
            // Deactivation will fail if no other tabs to activate
            this.$emit(MODEL_EVENT_NAME_ACTIVE, this.localActive)
          }
        }
      }
    },
    disabled(newValue, oldValue) {
      if (newValue !== oldValue) {
        const { firstTab } = this.bvTabs
        if (newValue && this.localActive && firstTab) {
          this.localActive = false
          firstTab()
        }
      }
    },
    localActive(newValue) {
      // Make `active` prop work with `.sync` modifier
      this.$emit(MODEL_EVENT_NAME_ACTIVE, newValue)
    }
  },
  mounted() {
    // Inform `<b-tabs>` of our presence
    this.registerTab()
  },
  updated() {
    // Force the tab button content to update (since slots are not reactive)
    // Only done if we have a title slot, as the title prop is reactive
    const { updateButton } = this.bvTabs
    if (updateButton && this.hasNormalizedSlot(SLOT_NAME_TITLE)) {
      updateButton(this)
    }
  },
  beforeDestroy() {
    // Inform `<b-tabs>` of our departure
    this.unregisterTab()
  },
  methods: {
    // Private methods
    registerTab() {
      // Inform `<b-tabs>` of our presence
      const { registerTab } = this.bvTabs
      if (registerTab) {
        registerTab(this)
      }
    },
    unregisterTab() {
      // Inform `<b-tabs>` of our departure
      const { unregisterTab } = this.bvTabs
      if (unregisterTab) {
        unregisterTab(this)
      }
    },
    // Public methods
    activate() {
      // Not inside a `<b-tabs>` component or tab is disabled
      const { activateTab } = this.bvTabs
      return activateTab && !this.disabled ? activateTab(this) : false
    },
    deactivate() {
      // Not inside a `<b-tabs>` component or not active to begin with
      const { deactivateTab } = this.bvTabs
      return deactivateTab && this.localActive ? deactivateTab(this) : false
    }
  },
  render(h) {
    const { localActive } = this

    const $content = h(
      this.tag,
      {
        staticClass: 'tab-pane',
        class: this.tabClasses,
        directives: [{ name: 'show', value: localActive }],
        attrs: {
          role: 'tabpanel',
          id: this.safeId(),
          'aria-hidden': localActive ? 'false' : 'true',
          'aria-labelledby': this.controlledBy || null
        },
        ref: 'panel'
      },
      // Render content lazily if requested
      [localActive || !this.computedLazy ? this.normalizeSlot() : h()]
    )

    return h(
      BVTransition,
      {
        props: {
          mode: 'out-in',
          noFade: this.computedNoFade
        }
      },
      [$content]
    )
  }
})
