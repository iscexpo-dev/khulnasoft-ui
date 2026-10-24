<script>
import { throttle } from 'lodash-es';

const throttleDuration = 1000;
/**
 * After adding more items, scroll will adjust slightly.
 * Values in pixels, should be a small amount.
 */
export const adjustScrollGap = 5;
const THRESHOLD = 1;

export default {
  name: 'GlInfiniteScroll',
  props: {
    /**
     * Total number of items available
     */
    totalItems: {
      type: Number,
      required: false,
      default: 0,
    },
    /**
     * Numbers of items fetched before scrolling
     */
    fetchedItems: {
      type: Number,
      required: true,
    },
    /**
     * Max height of the list before the scrollbar appears
     */
    maxListHeight: {
      type: Number,
      required: false,
      default: 0,
    },
  },
  computed: {
    listHeight() {
      return {
        maxHeight: this.maxListHeight ? `${this.maxListHeight}px` : 'auto',
      };
    },
    legendText() {
      if (this.totalItems > 0) {
        return `Showing ${this.fetchedItems} of ${this.totalItems} items`;
      }

      return `Showing ${this.fetchedItems} items`;
    },
  },
  watch: {
    async fetchedItems(newVal, oldVal) {
      // Re-adjust scroll to the current item if more items are added
      if (newVal > oldVal) {
        const { scrollHeight, scrollTop } = this.$refs.infiniteContainer;
        // Only when scrolled to the top
        if (scrollHeight !== 0 && scrollTop === 0) {
          // Wait until the DOM is fully updated to adjust scroll
          await this.$nextTick();
          const { scrollHeight: newScrollHeight } = this.$refs.infiniteContainer;

          // New scrollTop is the new height, minus the old height
          // minus a small space to allow the user to trigger a scroll once more
          let top = newScrollHeight - scrollHeight - adjustScrollGap;

          // Never adjust to 0, or a new event may be be triggered
          if (top < 1) {
            top = 1;
          }

          this.scrollTo({ top });
        }
      }
    },
  },

  async mounted() {
    // Scroll to bottom for reverse effect
    await this.$nextTick();

    // Check both kebab-case (Vue 2) and camelCase (@vue/compat) $listeners.
    const listening = (...names) => names.some((name) => this.$listeners[name]);

    if (listening('top-reached', 'topReached') && !listening('bottom-reached', 'bottomReached')) {
      this.scrollDown();
    }
  },

  methods: {
    /**
     * Scroll to the top of the container, leaving a gap
     * to avoid triggering the event.
     */
    scrollUp() {
      this.scrollTo({ top: adjustScrollGap });
    },
    /**
     * Scroll to the bottom of the container, leaving a gap
     * to avoid triggering the event.
     */
    scrollDown() {
      const { scrollHeight } = this.$refs.infiniteContainer;
      this.scrollTo({ top: scrollHeight - adjustScrollGap });
    },
    /**
     * Scroll to a location in the container
     *
     * @param params.top - Number of pixels along Y axis to
     * scroll the list container.
     * @param params.behavior - Determines whether scrolling
     * is instant or animates smoothly. Can be 'auto', 'instant', or 'smooth'
     * See [MDN spec](https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollTo)
     */
    scrollTo({ top, behavior }) {
      this.$refs.infiniteContainer.scrollTo({ top, behavior });
    },

    topReached: throttle(function topReachedThrottled() {
      /**
       * Emitted when item container is scrolled to the top
       */
      this.$emit('top-reached');
    }, throttleDuration),
    bottomReached: throttle(function bottomReachedThrottled() {
      /**
       * Emitted when item container is scrolled to the bottom
       */
      this.$emit('bottom-reached');
    }, throttleDuration),
    itemsListHeight() {
      return this.$refs.infiniteContainer.scrollHeight;
    },
    scrollTop() {
      return this.$refs.infiniteContainer.scrollTop;
    },
    handleScroll: throttle(function handleScrollThrottled() {
      if (Math.abs(this.itemsListHeight() - this.maxListHeight - this.scrollTop()) < THRESHOLD) {
        this.bottomReached();
      } else if (this.scrollTop() <= THRESHOLD) {
        this.topReached();
      }
    }),
  },
};
</script>

<template>
  <div>
    <!-- @slot Header of the list, appears above the items -->
    <slot name="header"></slot>
    <div
      ref="infiniteContainer"
      :style="listHeight"
      class="gl-infinite-scroll-container"
      v-bind="$attrs"
      @scroll="handleScroll"
      v-on="$listeners"
    >
      <!-- @slot List of items -->
      <slot name="items"></slot>
    </div>
    <p class="gl-infinite-scroll-legend">
      <!-- @slot Footer of the list, appears below the items -->
      <slot :fetched-items="fetchedItems" :total-items="totalItems">
        {{ legendText }}
      </slot>
    </p>
  </div>
</template>
