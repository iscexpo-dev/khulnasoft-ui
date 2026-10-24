import { extend } from '../vue'
import { attemptFocus, isVisible, matches, requestAF, select } from '../utils/dom'

// --- Constants ---

const SELECTOR = 'input, textarea, select'

// --- Props ---

export const props = {
  autofocus: {
    type: Boolean,
    required: false,
    default: false
  },
  disabled: {
    type: Boolean,
    required: false,
    default: false
  },
  form: {
    type: String,
    required: false,
    default: undefined
  },
  id: {
    type: String,
    required: false,
    default: undefined
  },
  name: {
    type: String,
    required: false,
    default: undefined
  },
  required: {
    type: Boolean,
    required: false,
    default: false
  }
}

// --- Mixin ---

// @vue/component
export const formControlMixin = extend({
  props,
  mounted() {
    this.handleAutofocus()
  },
  /* istanbul ignore next */
  activated() {
    this.handleAutofocus()
  },
  methods: {
    handleAutofocus() {
      this.$nextTick(() => {
        requestAF(() => {
          let el = this.$el
          if (this.autofocus && isVisible(el)) {
            if (!matches(el, SELECTOR)) {
              el = select(SELECTOR, el)
            }
            attemptFocus(el)
          }
        })
      })
    }
  }
})
