import { extend, mergeData } from '../../vue'
import { NAME_FORM } from '../../constants/components'
import { keys, omit } from '../../utils/object'
// --- Props ---

export const props = {
  id: {
    type: String,
    required: false,
    default: undefined
  },
  inline: {
    type: Boolean,
    required: false,
    default: false
  },
  novalidate: {
    type: Boolean,
    required: false,
    default: false
  },
  validated: {
    type: Boolean,
    required: false,
    default: false
  }
}

// --- Main component ---

// @vue/component
export const BForm = /*#__PURE__*/ extend({
  name: NAME_FORM,
  functional: true,
  props,
  render(h, { props, data, children }) {
    return h(
      'form',
      mergeData(omit(data, keys(props)), {
        class: {
          'form-inline': props.inline,
          'was-validated': props.validated
        },
        attrs: {
          id: props.id,
          novalidate: props.novalidate
        }
      }),
      children
    )
  }
})
