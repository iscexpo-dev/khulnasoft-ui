import { isVue3 } from '../vue'

/**
 * Register a callback to be called when a Vue instance is destroyed/unmounted.
 *
 * For Vue 2: Uses $once with 'hook:destroyed' event
 * For Vue 3: Uses scope.cleanups for proper effect scope cleanup
 *
 * @param {Object} instance - The Vue instance to watch for destruction
 * @param {Function} callback - The callback to run when the instance is destroyed
 */
export const onInstanceDestroy = (instance, callback) => {
  if (isVue3(instance)) {
    // onScopeDispose is not available on instance and we do
    // not want to import 'vue' in this file
    instance.$.scope.cleanups.push(callback)
    return
  }

  instance.$once('hook:destroyed', callback)
}
