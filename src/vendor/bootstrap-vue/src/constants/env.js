export const HAS_WINDOW_SUPPORT = typeof window !== 'undefined'
export const HAS_DOCUMENT_SUPPORT = typeof document !== 'undefined'
export const HAS_NAVIGATOR_SUPPORT = typeof navigator !== 'undefined'
/* istanbul ignore next: JSDOM always returns false */
export const HAS_MUTATION_OBSERVER_SUPPORT =
  typeof MutationObserver !== 'undefined' ||
  typeof WebKitMutationObserver !== 'undefined' ||
  typeof MozMutationObserver !== 'undefined'

export const IS_BROWSER = HAS_WINDOW_SUPPORT && HAS_DOCUMENT_SUPPORT && HAS_NAVIGATOR_SUPPORT

export const WINDOW = HAS_WINDOW_SUPPORT ? window : {}
export const DOCUMENT = HAS_DOCUMENT_SUPPORT ? document : {}
export const NAVIGATOR = HAS_NAVIGATOR_SUPPORT ? navigator : {}
export const USER_AGENT = (NAVIGATOR.userAgent || '').toLowerCase()

export const IS_JSDOM = USER_AGENT.indexOf('jsdom') > 0

// Determine if the browser supports the option passive for events
export const HAS_PASSIVE_EVENT_SUPPORT = (() => {
  let passiveEventSupported = false
  if (IS_BROWSER) {
    try {
      const options = {
        // This function will be called when the browser
        // attempts to access the passive property
        get passive() {
          /* istanbul ignore next: will never be called in JSDOM */
          passiveEventSupported = true
        }
      }
      WINDOW.addEventListener('test', options, options)
      WINDOW.removeEventListener('test', options, options)
    } catch {
      /* istanbul ignore next: will never be called in JSDOM */
      passiveEventSupported = false
    }
  }
  return passiveEventSupported
})()
