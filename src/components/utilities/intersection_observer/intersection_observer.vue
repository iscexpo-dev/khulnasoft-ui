<script>
import { memoize } from 'lodash-es';

const getObserver = memoize(
  (options) =>
    new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        entry.target.$_gl_intersectionHandler(entry);
      });
    }, options || {}),
);

export default {
  name: 'GlIntersectionObserver',
  props: {
    /**
     * Extra options to pass directly to the intersection observer API.
     */
    options: {
      type: Object,
      required: false,
      default: null,
    },
  },
  mounted() {
    const observer = getObserver(this.options);

    this.$el.$_gl_intersectionHandler = (entry) => {
      /**
       * Emitted when the element's visibility changes
       */
      this.$emit('update', entry);

      if (entry.isIntersecting) {
        /**
         * Emitted when the element appears on the page
         */
        this.$emit('appear');
      } else {
        /**
         * Emitted when the element disappears from the page
         */
        this.$emit('disappear');
      }
    };
    this.$el.$_gl_intersectionObserver = observer;

    observer.observe(this.$el);
  },
  destroyed() {
    this.$el.$_gl_intersectionObserver.unobserve(this.$el);
    delete this.$el.$_gl_intersectionHandler;
    delete this.$el.$_gl_intersectionObserver;
  },
  // Expose getObserver method for tests
  getObserver,
};
</script>

<template>
  <div>
    <!--
    @slot The element you wish to observe, or a fallback if the observer doesn't work.
    -->
    <slot></slot>
  </div>
</template>
