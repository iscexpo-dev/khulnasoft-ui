import { extend } from '../../vue'
import { NAME_POPOVER } from '../../constants/components'
import { EVENT_NAME_CLICK } from '../../constants/events'
import { SLOT_NAME_TITLE } from '../../constants/slots'
import { BTooltip, props as BTooltipProps } from '../tooltip/tooltip'
import { BVPopover } from './helpers/bv-popover'
import { sortKeys } from '../../utils/object'

// --- Props ---

export const props = sortKeys({
  ...BTooltipProps,
  content: {
    type: String,
    required: false,
    default: undefined
  },
  delay: {
    type: [Number, Object, String],
    required: false,
    default: () => ({ show: 50, hide: 150 })
  },
  placement: {
    type: String,
    required: false,
    default: 'right'
  },
  triggers: {
    type: [Array, String],
    required: false,
    default: EVENT_NAME_CLICK
  }
})

// --- Main component ---

// @vue/component
export const BPopover = /*#__PURE__*/ extend({
  name: NAME_POPOVER,
  extends: BTooltip,
  inheritAttrs: false,
  props,
  methods: {
    getComponent() {
      // Overridden by BPopover
      return BVPopover
    },
    updateContent() {
      // Tooltip: Default slot is `title`
      // Popover: Default slot is `content`, `title` slot is title
      // We pass a scoped slot function references by default (Vue v2.6x)
      // And pass the title prop as a fallback
      this.setContent(this.normalizeSlot() || this.content)
      this.setTitle(this.normalizeSlot(SLOT_NAME_TITLE) || this.title)
    }
  }
  // Render function provided by BTooltip
})
