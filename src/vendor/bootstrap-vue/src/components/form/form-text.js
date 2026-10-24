import { extend, mergeData } from '../../vue'
import { NAME_FORM_TEXT } from '../../constants/components'
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
  tag: {
    type: String,
    required: false,
    default: 'small'
  },
  textVariant: {
    type: String,
    required: false,
    default: 'muted'
  }
}

// --- Main component ---

// @vue/component
export const BFormText = /*#__PURE__*/ extend({
  name: NAME_FORM_TEXT,
  functional: true,
  props,
  render(h, { props, data, children }) {
    return h(
      props.tag,
      mergeData(data, {
        class: {
          'form-text': !props.inline,
          [`text-${props.textVariant}`]: props.textVariant
        },
        attrs: {
          id: props.id
        }
      }),
      children
    )
  }
})
