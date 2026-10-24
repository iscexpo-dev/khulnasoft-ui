import { extend, mergeData } from '../../vue'
import { NAME_FORM_ROW } from '../../constants/components'
import { PROP_TYPE_STRING } from '../../constants/props'

// --- Props ---

export const props = {
  tag: {
    type: PROP_TYPE_STRING,
    required: false,
    default: 'div'
  }
}

// --- Main component ---

// @vue/component
export const BFormRow = /*#__PURE__*/ extend({
  name: NAME_FORM_ROW,
  functional: true,
  props,
  render(h, { props, data, children }) {
    return h(
      props.tag,
      mergeData(data, {
        staticClass: 'form-row'
      }),
      children
    )
  }
})
