<script>
import { GlResizeObserverDirective } from '../../../directives/resize_observer/resize_observer';
import GlButton from '../../base/button/button.vue';
import { STATES } from './constants';

export default {
  name: 'GlTruncateText',
  components: {
    GlButton,
  },
  directives: {
    GlResizeObserver: GlResizeObserverDirective,
  },
  props: {
    /**
     * The text for the 'Show more' button
     */
    showMoreText: {
      type: String,
      required: false,
      default: 'Show more',
    },
    /**
     * The text for the 'Show less' button
     */
    showLessText: {
      type: String,
      required: false,
      default: 'Show less',
    },
    /**
     * The number of lines that are initially visible on larger screens
     */
    lines: {
      type: Number,
      required: false,
      default: 3,
    },
    /**
     * The number of lines that are initially visible on smaller screens
     */
    mobileLines: {
      type: Number,
      required: false,
      default: 10,
    },
    /**
     * Props that are passed to the toggle button
     */
    toggleButtonProps: {
      type: Object,
      required: false,
      default() {
        return {};
      },
    },
  },
  data() {
    return {
      state: STATES.INITIAL,
    };
  },
  computed: {
    showTruncationToggle() {
      return this.isTruncated || this.isExtended;
    },
    truncationToggleText() {
      return this.isTruncated ? this.showMoreText : this.showLessText;
    },
    cssVariables() {
      return { '--lines': this.lines, '--mobile-lines': this.mobileLines };
    },
    truncationClasses() {
      return this.isExtended ? null : 'gl-truncate-text gl-overflow-hidden';
    },
    ariaExpanded() {
      return (!this.isTruncated).toString();
    },
    isTruncated() {
      return this.state === STATES.TRUNCATED;
    },
    isExtended() {
      return this.state === STATES.EXTENDED;
    },
  },
  methods: {
    onResize({ target }) {
      if (target.scrollHeight > target.offsetHeight) {
        this.state = STATES.TRUNCATED;
      } else if (this.isTruncated) {
        this.state = STATES.INITIAL;
      }
    },
    toggleTruncation() {
      if (this.isTruncated) {
        this.state = STATES.EXTENDED;
      } else if (this.isExtended) {
        this.state = STATES.TRUNCATED;
      }
    },
  },
};
</script>

<template>
  <section>
    <article
      v-gl-resize-observer="onResize"
      :class="truncationClasses"
      :style="cssVariables"
      :aria-expanded="ariaExpanded"
    >
      <!-- @slot Text content -->
      <slot></slot>
    </article>
    <gl-button
      v-if="showTruncationToggle"
      v-bind="toggleButtonProps"
      variant="link"
      @click="toggleTruncation"
      >{{ truncationToggleText }}</gl-button
    >
  </section>
</template>
