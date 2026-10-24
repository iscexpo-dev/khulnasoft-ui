import { extend, mergeData } from '../../vue'
import { NAME_DROPDOWN_FORM } from '../../constants/components'
import { omit, sortKeys } from '../../utils/object'
import { BForm, props as formControlProps } from '../form/form'

// --- Props ---

export const props = sortKeys({
  ...formControlProps,
  disabled: {
    type: Boolean,
    required: false,
    default: false
  },
  formClass: {
    type: [Array, Object, String],
    required: false,
    default: undefined
  }
})

// --- Main component ---

// @vue/component
export const BDropdownForm = /*#__PURE__*/ extend({
  name: NAME_DROPDOWN_FORM,
  functional: true,
  props,
  render(h, { props, data, listeners, children }) {
    return h('li', mergeData(omit(data, ['attrs', 'on']), { attrs: { role: 'presentation' } }), [
      h(
        BForm,
        {
          staticClass: 'b-dropdown-form',
          class: [props.formClass, { disabled: props.disabled }],
          props,
          attrs: {
            ...(data.attrs || {}),
            disabled: props.disabled,
            // Tab index of -1 for keyboard navigation
            tabindex: props.disabled ? null : '-1'
          },
          on: listeners,
          ref: 'form'
        },
        children
      )
    ])
  }
})
