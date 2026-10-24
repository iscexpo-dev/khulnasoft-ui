/* eslint-disable import-x/no-default-export */
import Vue from 'vue';
import { createNewChildComponent } from '../../../vendor/bootstrap-vue/src/utils/create-new-child-component';
import GlToaster from './toaster.vue';

let toastsCount = 0;
let toasterInstance = null;

function ensureToaster(vm) {
  if (toasterInstance) {
    const portalTarget = document.getElementById('gl-toaster');
    if (portalTarget && document.body.contains(portalTarget)) {
      return toasterInstance;
    }
    toasterInstance.$destroy();
    toasterInstance = null;
  }

  const ToasterComponent = Vue.extend(GlToaster);
  toasterInstance = createNewChildComponent(vm, ToasterComponent);
  toasterInstance.$mount(document.createElement('div'));

  return toasterInstance;
}

function showToast(message, options = {}) {
  const toaster = ensureToaster(this);

  // eslint-disable-next-line @khulnasoft/tailwind-no-interpolation -- Not a CSS utility
  const id = `gl-toast-${toastsCount}`;
  toastsCount += 1;

  const hide = () => toaster.hideToast(id);
  const toast = { id, hide };

  const autoHideDelay = !Number.isNaN(options?.autoHideDelay) ? options.autoHideDelay : undefined;

  toaster.addToast({
    id,
    message,
    action: options.action || null,
    autoHideDelay,
    onComplete: options.onComplete || null,
  });

  return toast;
}

/**
 * Adds a `$toast` property to the component it's applied to.
 *
 * Use this to opt individual components into toasts, instead of adding `$toast`
 * to every component in the app with `GlToastPlugin`.
 */
export const GlToastMixin = {
  beforeCreate() {
    if (this.$toast) {
      return;
    }
    this.$toast = { show: showToast.bind(this) };
  },
};

/**
 * Note: This is not a typical Vue component and needs to be registered before instantiating a Vue app.
 * Once registered, the toast will be globally available throughout your app.
 *
 * See https://design.khulnasoft.com/components/toast for detailed documentation.
 */
export const GlToastPlugin = {
  install(V) {
    V.mixin(GlToastMixin);
  },
};

/**
 * @deprecated Use the named `GlToastPlugin` export instead.
 */
export default GlToastPlugin;
