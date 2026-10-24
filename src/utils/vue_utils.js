import Vue from 'vue';

/**
 * Checks whether the global Vue version is Vue 3 (or the Vue 3 compat build).
 *
 * Use this for module-level checks where no component instance is available,
 * such as conditional test logic or static configuration.
 *
 * @type {boolean}
 */
export const isGlobalVue3 = Boolean(Vue.Fragment);

/**
 * Checks whether a component instance is running under Vue 3 (or compat mode).
 *
 * In Vue 3, component instances expose an internal `$` property that holds
 * the component's internal instance. This property does not exist in Vue 2.
 *
 * Prefer this over {@link isGlobalVue3} when you have access to a component
 * instance, as it checks at the instance level rather than the global level.
 *
 * @param {object} instance - The Vue component instance (`this`).
 * @returns {boolean} `true` if the instance is a Vue 3 component.
 */
export const isVue3 = (instance) => Boolean(instance.$);

/**
 * Wraps a Vue component instance to safely access properties without
 * triggering Vue 3 development warnings.
 *
 * In Vue 3 (and compat mode), component instances are Proxies. Accessing a
 * property that doesn't exist on the instance (e.g. `this.$router` when no
 * router is installed) triggers a development warning from Vue's `get` trap:
 * "Property X was accessed during render but is not defined on instance."
 *
 * This utility returns a Proxy that uses the `in` operator (which hits Vue's
 * `has` trap, which is silent) to check for property existence before accessing
 * it. If the property doesn't exist, `undefined` is returned without ever
 * hitting Vue's `get` trap.
 *
 * In Vue 2, the instance is returned as-is since there are no Proxy warnings.
 *
 * @param {object} target - The Vue component instance (`this`).
 * @returns {object} The original instance (Vue 2) or a safe Proxy wrapper (Vue 3).
 */
export function safeVueInstance(target) {
  if (!isVue3(target)) {
    return target;
  }

  return new Proxy(target, {
    get(obj, prop) {
      return prop in obj ? obj[prop] : undefined;
    },
  });
}
