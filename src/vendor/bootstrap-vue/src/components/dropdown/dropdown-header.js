import { extend, mergeData } from '../../vue'
import { NAME_DROPDOWN_HEADER } from '../../constants/components'
import { isTag } from '../../utils/dom'
import { omit } from '../../utils/object'

// --- Props ---

export const props = {
  id: {
    type: String,
    required: false,
    default: undefined
  },
  tag: {
    type: String,
    required: false,
    default: 'header'
  },
  variant: {
    type: String,
    required: false,
    default: undefined
  }
}

// --- Main component ---

// @vue/component
export const BDropdownHeader = /*#__PURE__*/ extend({
  name: NAME_DROPDOWN_HEADER,
  functional: true,
  props,
  render(h, { props, data, children }) {
    const { tag, variant } = props

    return h('li', mergeData(omit(data, ['attrs']), { attrs: { role: 'presentation' } }), [
      h(
        tag,
        {
          staticClass: 'dropdown-header',
          class: { [`text-${variant}`]: variant },
          attrs: {
            ...(data.attrs || {}),
            id: props.id || null,
            role: isTag(tag, 'header') ? null : 'heading'
          },
          ref: 'header'
        },
        children
      )
    ])
  }
})
