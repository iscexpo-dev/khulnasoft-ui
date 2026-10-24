<script>
import { MountingPortal } from 'portal-vue';
import GlToast from './toast.vue';

const hasViewTransitions =
  typeof document !== 'undefined' && typeof document.startViewTransition === 'function';

export default {
  name: 'GlToaster',
  components: {
    MountingPortal,
    GlToast,
  },
  expose: ['addToast', 'hideToast', 'removeToast'],
  data() {
    return {
      toasts: [],
    };
  },
  methods: {
    addToast(config) {
      const add = () => this.toasts.push(config);

      if (hasViewTransitions && this.toasts.length > 0) {
        document.startViewTransition(add);
      } else {
        add();
      }
    },
    hideToast(id) {
      const refs = this.$refs.toastRefs;
      if (!refs) return;
      const toastComponents = Array.isArray(refs) ? refs : [refs];
      const component = toastComponents.find((c) => c.toastId === id);
      if (component) {
        component.hide();
      }
    },
    removeToast(id) {
      const idx = this.toasts.findIndex((t) => t.id === id);
      if (idx !== -1) {
        const toast = this.toasts[idx];
        this.toasts.splice(idx, 1);
        if (toast.onComplete) {
          toast.onComplete({ componentId: id });
        }
      }
    },
  },
};
</script>

<template>
  <mounting-portal mount-to="body" append>
    <div id="gl-toaster" class="b-toaster b-toaster-bottom-left">
      <div class="b-toaster-slot">
        <gl-toast
          v-for="toast in toasts"
          ref="toastRefs"
          :key="toast.id"
          :toast-id="toast.id"
          :message="toast.message"
          :action="toast.action"
          :auto-hide-delay="toast.autoHideDelay"
          @hidden="removeToast"
        />
      </div>
    </div>
  </mounting-portal>
</template>
