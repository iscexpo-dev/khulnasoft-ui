import { extend, mergeData } from '../../vue'
import { NAME_FORM_VALID_FEEDBACK } from '../../constants/components'
import { PROP_TYPE_BOOLEAN, PROP_TYPE_STRING } from '../../constants/props'
import { keys, omit } from '../../utils/object'

// --- Props ---

export const props = {
  ariaLive: {
    type: PROP_TYPE_STRING,
    required: false,
    default: undefined
  },
  forceShow: {
    type: PROP_TYPE_BOOLEAN,
    required: false,
    default: false
  },
  id: {
    type: PROP_TYPE_STRING,
    required: false,
    default: undefined
  },
  role: {
    type: PROP_TYPE_STRING,
    required: false,
    default: undefined
  },
  // Tri-state prop: `true`, `false`, or `null`
  state: {
    type: PROP_TYPE_BOOLEAN,
    required: false,
    default: null
  },
  tag: {
    type: PROP_TYPE_STRING,
    required: false,
    default: 'div'
  },
  tooltip: {
    type: PROP_TYPE_BOOLEAN,
    required: false,
    default: false
  }
}

// --- Main component ---

// @vue/component
export const BFormValidFeedback = /*#__PURE__*/ extend({
  name: NAME_FORM_VALID_FEEDBACK,
  functional: true,
  props,
  render(h, { props, data, children }) {
    const { tooltip, ariaLive } = props
    const show = props.forceShow === true || props.state === true

    return h(
      props.tag,
      mergeData(omit(data, keys(props)), {
        class: {
          '!gl-block': show,
          'valid-feedback': !tooltip,
          'valid-tooltip': tooltip
        },
        attrs: {
          id: props.id || null,
          role: props.role || null,
          'aria-live': ariaLive || null,
          'aria-atomic': ariaLive ? 'true' : null
        }
      }),
      children
    )
  }
})
