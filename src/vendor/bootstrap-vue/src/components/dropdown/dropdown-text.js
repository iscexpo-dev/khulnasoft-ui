import { extend, mergeData } from '../../vue'
import { NAME_DROPDOWN_TEXT } from '../../constants/components'
import { omit } from '../../utils/object'

// --- Props ---

export const props = {
  tag: {
    type: String,
    required: false,
    default: 'p'
  },
  textClass: {
    type: [Array, Object, String],
    required: false,
    default: undefined
  },
  variant: {
    type: String,
    required: false,
    default: undefined
  }
}

// --- Main component ---

// @vue/component
export const BDropdownText = /*#__PURE__*/ extend({
  name: NAME_DROPDOWN_TEXT,
  functional: true,
  props,
  render(h, { props, data, children }) {
    const { tag, textClass, variant } = props

    return h('li', mergeData(omit(data, ['attrs']), { attrs: { role: 'presentation' } }), [
      h(
        tag,
        {
          staticClass: 'b-dropdown-text',
          class: [textClass, { [`text-${variant}`]: variant }],
          props,
          attrs: data.attrs || {},
          ref: 'text'
        },
        children
      )
    ])
  }
})
