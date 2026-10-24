// Generic Bootstrap v4 fade (no-fade) transition component
//
// Assumes that `show` class is not required when
// the transition has finished the enter transition
// (show and fade classes are only applied during transition)

import { extend, mergeData } from '../../vue'
import { NAME_TRANSITION } from '../../constants/components'
import { isPlainObject } from '../../utils/inspect'

// --- Constants ---

const NO_FADE_PROPS = {
  name: '',
  enterClass: '',
  enterActiveClass: '',
  enterToClass: 'show',
  leaveClass: 'show',
  leaveActiveClass: '',
  leaveToClass: ''
}

const FADE_PROPS = {
  ...NO_FADE_PROPS,
  enterActiveClass: 'fade',
  leaveActiveClass: 'fade'
}

// --- Props ---

export const props = {
  // Has no effect if `trans-props` provided
  appear: {
    type: Boolean,
    required: false,
    default: false
  },
  // Can be overridden by user supplied `trans-props`
  mode: {
    type: String,
    required: false,
    default: undefined
  },
  // Only applicable to the built in transition
  // Has no effect if `trans-props` provided
  noFade: {
    type: Boolean,
    required: false,
    default: false
  },
  // For user supplied transitions (if needed)
  transProps: {
    type: Object,
    required: false,
    default: undefined
  }
}

const hasAnimateSupport = typeof Element !== 'undefined' && Boolean(Element.prototype.animate)

// --- Main component ---

// @vue/component
export const BVTransition = /*#__PURE__*/ extend({
  name: NAME_TRANSITION,
  functional: true,
  props,
  render(h, { children, data, props }) {
    let transProps = props.transProps
    if (!isPlainObject(transProps)) {
      transProps = props.noFade ? NO_FADE_PROPS : FADE_PROPS
      if (props.appear) {
        // Default the appear classes to equal the enter classes
        transProps = {
          ...transProps,
          appear: true,
          appearClass: transProps.enterClass,
          appearActiveClass: transProps.enterActiveClass,
          appearToClass: transProps.enterToClass
        }
      }
    }
    transProps = {
      mode: props.mode,
      ...transProps,
      /*
       bootstrap-vue says: We always need `css` true

       @khulnasoft/ui says: OMG. THE FREAKING TRANSITIONS.
       So apparently jsdom doesn't implement animations (who can blame them)
       but a Vue Transition relies on the native animationend/transitionend
       events in order to fire onAfterLeave. jsdom will never fire the `onAfterLeave`
       which is relied on by e.g. the tooltip component to do it's `hidden` logic.

       So if in specs, we set `css: false`, everything will work as expected.
       The best way we have found is to do a feature detection on `Element.prototype.animate`
       */
      css: hasAnimateSupport
    }

    const dataCopy = { ...data }
    delete dataCopy.props
    Object.keys(props).forEach(key => {
      delete dataCopy[key]
    })

    return h(
      'transition',
      // Any transition event listeners will get merged here
      mergeData(dataCopy, { props: transProps }),
      children
    )
  }
})
