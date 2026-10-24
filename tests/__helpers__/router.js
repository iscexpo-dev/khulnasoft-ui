import Vue from 'vue';
import { isGlobalVue3 } from '~/utils/vue_utils';

/**
 * Creates a router instance for use in specs, hiding the Vue 2 (vue-router@3)
 * vs Vue 3 (vue-router@4) API differences.
 *
 * Vue 2 routers are installed onto the component via the `router` component
 * option; Vue 3 routers are installed as a plugin, so callers should spread
 * `mountOptions` into their `mount()` call instead.
 *
 * @param {Array} routes - `vue-router` route definitions.
 * @returns {{ router: object, mountOptions: object }}
 */
export function createTestRouter(routes) {
  if (isGlobalVue3) {
    // Required conditionally so that Vue 2 test runs never load vue-router@4.
    // eslint-disable-next-line global-require
    const { createRouter, createMemoryHistory } = require('@khulnasoft/vue-router-vue3');
    const router = createRouter({
      history: createMemoryHistory(),
      routes,
    });

    return { router, mountOptions: { global: { plugins: [router] } } };
  }

  // eslint-disable-next-line global-require
  const VueRouter = require('vue-router');
  Vue.use(VueRouter);
  const router = new VueRouter({ mode: 'abstract', routes });

  return { router, mountOptions: { router } };
}
