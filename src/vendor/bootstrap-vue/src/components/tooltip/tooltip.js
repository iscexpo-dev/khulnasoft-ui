import { extend } from '../../vue'
import { NAME_TOOLTIP } from '../../constants/components'
import {
  EVENT_NAME_CLOSE,
  EVENT_NAME_DISABLE,
  EVENT_NAME_DISABLED,
  EVENT_NAME_ENABLE,
  EVENT_NAME_ENABLED,
  EVENT_NAME_HIDDEN,
  EVENT_NAME_HIDE,
  EVENT_NAME_OPEN,
  EVENT_NAME_SHOW,
  EVENT_NAME_SHOWN,
  MODEL_EVENT_NAME_PREFIX
} from '../../constants/events'
import { HTMLElement, SVGElement } from '../../constants/safe-types'
import { useParentMixin } from '../../mixins/use-parent'
import { getScopeId } from '../../utils/get-scope-id'
import { isUndefinedOrNull } from '../../utils/inspect'
import { pick } from '../../utils/object'
import { TOOLTIP_DELAY } from '../../constants/config'
import { createNewChildComponent, eventProp } from '../../utils/create-new-child-component'
import { normalizeSlotMixin } from '../../mixins/normalize-slot'
import { BVTooltip } from './helpers/bv-tooltip'

// --- Constants ---

const MODEL_PROP_NAME_ENABLED = 'disabled'
const MODEL_EVENT_NAME_ENABLED = MODEL_EVENT_NAME_PREFIX + MODEL_PROP_NAME_ENABLED

const MODEL_PROP_NAME_SHOW = 'show'
const MODEL_EVENT_NAME_SHOW = MODEL_EVENT_NAME_PREFIX + MODEL_PROP_NAME_SHOW

// --- Props ---

export const props = {
  // String: scrollParent, window, or viewport
  // Element: element reference
  // Object: Vue component
  boundary: {
    type: [HTMLElement, Object, String],
    required: false,
    default: 'scrollParent'
  },
  boundaryPadding: {
    type: [Number, String],
    required: false,
    default: 5
  },
  // String: HTML ID of container, if null body is used (default)
  // HTMLElement: element reference reference
  // Object: Vue Component
  container: {
    type: [HTMLElement, Object, String],
    required: false,
    default: undefined
  },
  customClass: {
    type: String,
    required: false,
    default: 'gl-tooltip'
  },
  delay: {
    type: [Number, Object, String],
    required: false,
    default: () => ({ ...TOOLTIP_DELAY })
  },
  [MODEL_PROP_NAME_ENABLED]: {
    type: Boolean,
    required: false,
    default: false
  },
  fallbackPlacement: {
    type: [Array, String],
    required: false,
    default: 'flip'
  },
  // ID to use for tooltip element
  // If not provided on will automatically be generated
  id: {
    type: String,
    required: false,
    default: undefined
  },
  noFade: {
    type: Boolean,
    required: false,
    default: false
  },
  noninteractive: {
    type: Boolean,
    required: false,
    default: false
  },
  offset: {
    type: [Number, String],
    required: false,
    default: 0
  },
  placement: {
    type: String,
    required: false,
    default: 'top'
  },
  [MODEL_PROP_NAME_SHOW]: {
    type: Boolean,
    required: false,
    default: false
  },
  // String ID of element, or element/component reference
  // Or function that returns one of the above
  // Required
  target: {
    type: [HTMLElement, SVGElement, Function, Object, String],
    required: true
  },
  title: {
    type: String,
    required: false,
    default: undefined
  },
  triggers: {
    type: [Array, String],
    required: false,
    default: 'hover focus'
  },
  variant: {
    type: String,
    required: false,
    default: undefined
  }
}

// --- Main component ---

// @vue/component
export const BTooltip = /*#__PURE__*/ extend({
  name: NAME_TOOLTIP,
  mixins: [normalizeSlotMixin, useParentMixin],
  inheritAttrs: false,
  props,
  data() {
    return {
      localShow: this[MODEL_PROP_NAME_SHOW],
      localTitle: '',
      localContent: ''
    }
  },
  computed: {
    // Data that will be passed to the template and popper
    templateData() {
      return {
        title: this.localTitle,
        content: this.localContent,
        interactive: !this.noninteractive,
        // Pass these props as is
        ...pick(this.$props, [
          'boundary',
          'boundaryPadding',
          'container',
          'customClass',
          'delay',
          'fallbackPlacement',
          'id',
          'noFade',
          'offset',
          'placement',
          'target',
          'target',
          'triggers',
          'variant',
          MODEL_PROP_NAME_ENABLED
        ])
      }
    },
    // Used to watch for changes to the title and content props
    templateTitleContent() {
      const { title, content } = this
      return { title, content }
    }
  },
  watch: {
    [MODEL_PROP_NAME_SHOW](newValue, oldValue) {
      if (newValue !== oldValue && newValue !== this.localShow && this.$_toolpop) {
        if (newValue) {
          this.$_toolpop.show()
        } else {
          // We use `forceHide()` to override any active triggers
          this.$_toolpop.forceHide()
        }
      }
    },
    [MODEL_PROP_NAME_ENABLED](newValue) {
      if (newValue) {
        this[EVENT_NAME_DISABLE]()
      } else {
        this[EVENT_NAME_ENABLE]()
      }
    },
    localShow(newValue) {
      // TODO: May need to be done in a `$nextTick()`
      this.$emit(MODEL_EVENT_NAME_SHOW, newValue)
    },
    templateData() {
      this.$nextTick(() => {
        if (this.$_toolpop) {
          this.$_toolpop.updateData(this.templateData)
        }
      })
    },
    // Watchers for title/content props (prop changes do not trigger the `updated()` hook)
    templateTitleContent() {
      this.$nextTick(this.updateContent)
    }
  },
  created() {
    // Create private non-reactive props
    this.$_toolpop = null
  },
  updated() {
    // Update the `propData` object
    // Done in a `$nextTick()` to ensure slot(s) have updated
    this.$nextTick(this.updateContent)
  },
  beforeDestroy() {
    // Destroy the tip instance
    if (this.$_toolpop) {
      this.$_toolpop.$destroy()
      this.$_toolpop = null
    }
  },
  mounted() {
    // Instantiate a new BVTooltip instance
    // Done in a `$nextTick()` to ensure DOM has completed rendering
    // so that target can be found
    this.$nextTick(() => {
      // Load the on demand child instance
      const Component = this.getComponent()
      // Ensure we have initial content
      this.updateContent()
      // Pass down the scoped style attribute if available
      const scopeId = getScopeId(this) || getScopeId(this.bvParent)
      // Create the instance
      const $toolpop = (this.$_toolpop = createNewChildComponent(this, Component, {
        // Pass down the scoped style ID
        _scopeId: scopeId || undefined,
        propsData: {
          [eventProp(EVENT_NAME_SHOW)]: this.onShow,
          [eventProp(EVENT_NAME_SHOWN)]: this.onShown,
          [eventProp(EVENT_NAME_HIDE)]: this.onHide,
          [eventProp(EVENT_NAME_HIDDEN)]: this.onHidden,
          [eventProp(EVENT_NAME_DISABLED)]: this.onDisabled,
          [eventProp(EVENT_NAME_ENABLED)]: this.onEnabled
        }
      }))
      // Set the initial data
      $toolpop.updateData(this.templateData)
      // Initially disabled?
      if (this[MODEL_PROP_NAME_ENABLED]) {
        // Initially disabled
        this[EVENT_NAME_DISABLE]()
      }
      // Initially show tooltip?
      if (this.localShow) {
        $toolpop.show()
      }
    })
  },
  methods: {
    getComponent() {
      // Overridden by BPopover
      return BVTooltip
    },
    updateContent() {
      // Overridden by BPopover
      // Tooltip: Default slot is `title`
      // Popover: Default slot is `content`, `title` slot is title
      // We pass a scoped slot function reference by default (Vue v2.6x)
      // And pass the title prop as a fallback
      this.setTitle(this.normalizeSlot() || this.title)
    },
    // Helper methods for `updateContent()`
    setTitle(value) {
      value = isUndefinedOrNull(value) ? '' : value
      // We only update the value if it has changed
      if (this.localTitle !== value) {
        this.localTitle = value
      }
    },
    setContent(value) {
      value = isUndefinedOrNull(value) ? '' : value
      // We only update the value if it has changed
      if (this.localContent !== value) {
        this.localContent = value
      }
    },
    // --- Template event handlers ---
    onShow(bvEvent) {
      // Placeholder
      this.$emit(EVENT_NAME_SHOW, bvEvent)
      if (bvEvent) {
        this.localShow = !bvEvent.defaultPrevented
      }
    },
    onShown(bvEvent) {
      // Tip is now showing
      this.localShow = true
      this.$emit(EVENT_NAME_SHOWN, bvEvent)
    },
    onHide(bvEvent) {
      this.$emit(EVENT_NAME_HIDE, bvEvent)
    },
    onHidden(bvEvent) {
      // Tip is no longer showing
      this.$emit(EVENT_NAME_HIDDEN, bvEvent)
      this.localShow = false
    },
    onDisabled(bvEvent) {
      // Prevent possible endless loop if user mistakenly
      // fires `disabled` instead of `disable`
      if (bvEvent && bvEvent.type === EVENT_NAME_DISABLED) {
        this.$emit(MODEL_EVENT_NAME_ENABLED, true)
        this.$emit(EVENT_NAME_DISABLED, bvEvent)
      }
    },
    onEnabled(bvEvent) {
      // Prevent possible endless loop if user mistakenly
      // fires `enabled` instead of `enable`
      if (bvEvent && bvEvent.type === EVENT_NAME_ENABLED) {
        this.$emit(MODEL_EVENT_NAME_ENABLED, false)
        this.$emit(EVENT_NAME_ENABLED, bvEvent)
      }
    },
    // --- Public methods for programmatic control ---
    [EVENT_NAME_OPEN]() {
      !this.localShow && this.$_toolpop && this.$_toolpop.show()
    },
    [EVENT_NAME_CLOSE]() {
      this.localShow && this.$_toolpop && this.$_toolpop.hide()
    },
    [EVENT_NAME_DISABLE]() {
      this.$_toolpop && this.$_toolpop.disable()
    },
    [EVENT_NAME_ENABLE]() {
      this.$_toolpop && this.$_toolpop.enable()
    }
  },
  render(h) {
    // Always renders a comment node
    // TODO:
    //   Future: Possibly render a target slot (single root element)
    //   which we can apply the listeners to (pass `this.$el` to BVTooltip)
    return h()
  }
})
