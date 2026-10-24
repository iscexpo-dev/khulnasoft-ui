<script>
export default {
  name: 'GlCollapse',
  model: {
    prop: 'visible',
    event: 'input',
  },
  props: {
    /**
     * Controls the visibility state of the collapse.
     */
    visible: {
      type: Boolean,
      default: false,
      required: false,
    },
    /**
     * HTML tag to use for the collapse container element.
     */
    tag: {
      type: String,
      required: false,
      default: 'div',
    },
  },
  data() {
    return {
      show: this.visible,
      transitioning: false,
    };
  },
  computed: {
    classObject() {
      const { transitioning } = this;

      return {
        collapse: !transitioning,
        show: this.show && !transitioning,
      };
    },
    slotScope() {
      return {
        visible: this.show,
        close: () => {
          this.show = false;
        },
      };
    },
    transitionProps() {
      return {
        ...this.$attrs,
        css: true,
        enterClass: '',
        enterActiveClass: 'collapsing',
        enterToClass: 'collapse show',
        leaveClass: 'collapse show',
        leaveActiveClass: 'collapsing',
        leaveToClass: 'collapse',
      };
    },
  },
  watch: {
    visible(newValue) {
      if (newValue !== this.show) {
        this.show = newValue;
      }
    },
    show(newValue, oldValue) {
      if (newValue !== oldValue) {
        this.emitState();
      }
    },
  },
  async mounted() {
    await this.$nextTick();
    this.emitState();
  },
  beforeDestroy() {
    // Trigger state emit if needed
    this.show = false;
  },
  methods: {
    reflow(el) {
      // Requesting an elements offsetHeight will trigger a reflow of the element content
      // Without forcing a reflow, the browser optimize the operation and cause animation to fail
      return Boolean(el && el.nodeType === Node.ELEMENT_NODE) && el.offsetHeight;
    },
    emitState() {
      const { show } = this;
      this.$emit('input', show);
    },
    enter(el) {
      this.transitioning = true;

      el.style.height = 0;
      // In a `debounceByAnimationFrame()` for `appear` to work
      window.requestAnimationFrame(() => {
        this.reflow(el);
        el.style.height = `${el.scrollHeight}px`;
      });
    },
    afterEnter(el) {
      this.transitioning = false;
      this.$emit('shown');
      el.style.height = '';
    },
    leave(el) {
      this.transitioning = true;
      el.style.height = 'auto';
      el.style.display = 'block';
      el.style.height = `${el.getBoundingClientRect().height}px`;
      this.reflow(el);
      el.style.height = 0;
    },
    afterLeave(el) {
      this.transitioning = false;
      this.$emit('hidden');
      el.style.height = '';
    },
  },
};
</script>

<template>
  <transition
    :visible="visible"
    v-bind="transitionProps"
    v-on="$listeners"
    @enter="enter"
    @after-enter="afterEnter"
    @leave="leave"
    @afterLeave="afterLeave"
  >
    <component :is="tag" v-show="show" :class="classObject">
      <!-- @slot The content to show/hide. -->
      <slot v-bind="slotScope"></slot>
    </component>
  </transition>
</template>
