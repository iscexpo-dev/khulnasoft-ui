<script>
import CloseButton from '../../shared_components/close_button/close_button.vue';

const MIN_DURATION = 1000;
const DEFAULT_AUTO_HIDE_DELAY = 5000;
const hasAnimateSupport = typeof Element !== 'undefined' && Boolean(Element.prototype.animate);

export default {
  name: 'GlToast',
  components: {
    CloseButton,
  },
  props: {
    /**
     * Unique identifier for the toast notification.
     */
    toastId: {
      type: String,
      required: true,
    },
    /**
     * The message text to display in the toast.
     */
    message: {
      type: String,
      required: true,
    },
    /**
     * Action button configuration for the toast.
     */
    action: {
      type: Object,
      required: false,
      default: null,
    },
    /**
     * Delay in milliseconds before auto-hiding the toast.
     */
    autoHideDelay: {
      type: Number,
      required: false,
      default: DEFAULT_AUTO_HIDE_DELAY,
    },
  },
  data() {
    return {
      visible: true,
    };
  },
  computed: {
    effectiveDelay() {
      return Math.max(this.autoHideDelay, MIN_DURATION);
    },
  },
  created() {
    this.useCssTransition = hasAnimateSupport;
    this.dismissTimer = null;
    this.deadline = 0;
    this.timeRemaining = this.effectiveDelay;
    this.isHiding = false;
  },
  beforeDestroy() {
    clearTimeout(this.dismissTimer);
  },
  methods: {
    startDismissTimer() {
      clearTimeout(this.dismissTimer);
      this.deadline = Date.now() + this.timeRemaining;
      this.dismissTimer = setTimeout(() => this.hide(), this.timeRemaining);
    },
    onPause() {
      if (!this.dismissTimer) return;
      clearTimeout(this.dismissTimer);
      this.dismissTimer = null;
      this.timeRemaining = Math.max(this.deadline - Date.now(), MIN_DURATION);
    },
    onResume() {
      if (!this.timeRemaining || this.dismissTimer) return;
      this.startDismissTimer();
    },
    hide() {
      if (this.isHiding) return;
      this.isHiding = true;
      clearTimeout(this.dismissTimer);
      this.dismissTimer = null;
      this.visible = false;
    },
    onAfterLeave() {
      this.$emit('hidden', this.toastId);
    },
    onActionClick(e) {
      if (this.action && this.action.onClick) {
        this.action.onClick(e, { id: this.toastId, hide: () => this.hide() });
      }
    },
  },
};
</script>

<template>
  <div
    :id="`${toastId}_toast_outer`"
    class="b-toast b-toast-append"
    role="status"
    aria-live="polite"
    aria-atomic="true"
  >
    <transition
      enter-active-class="fade"
      enter-to-class="show"
      leave-class="show"
      leave-active-class="fade"
      appear
      appear-active-class="fade"
      appear-to-class="show"
      :css="useCssTransition"
      @after-appear="startDismissTimer"
      @after-leave="onAfterLeave"
    >
      <div
        v-if="visible"
        :id="toastId"
        class="toast gl-toast"
        tabindex="0"
        @mouseenter="onPause"
        @mouseleave="onResume"
      >
        <div class="toast-body">{{ message }}</div>
        <header class="toast-header">
          <a
            v-if="action"
            :role="action.href ? undefined : 'button'"
            :href="action.href"
            class="gl-toast-action"
            @click="onActionClick"
            >{{ action.text }}</a
          >
          <close-button class="gl-toast-close-button" @click="hide" />
        </header>
      </div>
    </transition>
  </div>
</template>
