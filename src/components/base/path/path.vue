<script>
import iconSpriteInfo from '@gitlab/svgs/dist/icons.json';
import { uniqueId, findLast } from 'lodash-es';
import { GlResizeObserverDirective } from '../../../directives/resize_observer/resize_observer';
import GlIcon from '../icon/icon.vue';

const BOUNDARY_WIDTH = 40;
const PATH_ITEM_CLASS = 'gl-path-button';
const PATH_ACTIVE_ITEM_CLASS = 'gl-path-active-item';

export default {
  name: 'GlPath',
  components: {
    GlIcon,
  },
  directives: {
    GlResizeObserverDirective,
  },
  props: {
    /**
     * A list of path items in the form:
     * ```
     * {
     *   title:    String, required
     *   metric:   Any, optional
     *   icon:     String, optional
     *   disabled: Boolean, optional
     * }
     * ```
     */
    items: {
      type: Array,
      required: false,
      default: () => [],
    },
    /**
     * The items' background color.
     */
    backgroundColor: {
      type: String,
      required: false,
      default: 'rgba(0,0,0,0)',
    },
  },
  data() {
    return {
      selectedIndex: 0,
      width: 0,
      scrollLeft: 0,
    };
  },
  computed: {
    entireListVisible() {
      return this.width >= this.getScrollWidth();
    },
    displayScrollLeft() {
      return !this.entireListVisible && this.scrollLeft;
    },
    displayScrollRight() {
      const scrollOffset = this.getScrollWidth() - this.width;
      return !this.entireListVisible && scrollOffset !== this.scrollLeft;
    },
    rightHandBoundary() {
      return this.width - BOUNDARY_WIDTH + this.scrollLeft;
    },
    leftHandBoundary() {
      return this.scrollLeft + BOUNDARY_WIDTH;
    },
  },
  watch: {
    items: {
      immediate: true,
      handler(items) {
        const selectedIndex = items.findIndex((item) => item.selected);
        this.selectedIndex = selectedIndex > 0 ? selectedIndex : 0;
      },
    },
  },
  beforeCreate() {
    this.pathUuid = uniqueId('path-');
  },
  methods: {
    pathItemClass(index) {
      return index === this.selectedIndex
        ? `${PATH_ITEM_CLASS} ${PATH_ACTIVE_ITEM_CLASS}`
        : PATH_ITEM_CLASS;
    },
    onItemClicked(selectedIndex) {
      this.selectedIndex = selectedIndex;
      /**
       * Emitted when an item is selected.
       */
      this.$emit('selected', this.items[this.selectedIndex]);
    },
    handleResize({ contentRect: { width } }) {
      this.width = width;
    },
    scrollPathLeft() {
      const previousItemToScollTo = findLast(this.$refs.pathListItems, (listItem) => {
        return listItem.offsetLeft < this.leftHandBoundary;
      });

      const availableWidth =
        this.width - previousItemToScollTo.offsetWidth - BOUNDARY_WIDTH - BOUNDARY_WIDTH;

      let scrollTo = previousItemToScollTo.offsetLeft - BOUNDARY_WIDTH - availableWidth;

      if (scrollTo < 0) {
        scrollTo = 0;
      }
      this.scrollPath(scrollTo);
    },
    scrollPathRight() {
      const nextItemToScollTo = this.$refs.pathListItems.find(
        (listItem) => listItem.offsetLeft + listItem.offsetWidth > this.rightHandBoundary,
      );
      let scrollTo = nextItemToScollTo.offsetLeft - BOUNDARY_WIDTH;

      if (scrollTo > this.getScrollWidth() - this.width) {
        scrollTo = this.getScrollWidth() - this.width;
      }
      this.scrollPath(scrollTo);
    },
    scrollPath(scrollTo) {
      this.$refs.pathNavList.scrollTo({ left: scrollTo, behavior: 'smooth' });
      this.scrollLeft = scrollTo;
    },
    getScrollWidth() {
      return this.$refs.pathNavList ? this.$refs.pathNavList.scrollWidth : 0;
    },
    shouldDisplayIcon(icon) {
      return icon && iconSpriteInfo.icons.includes(icon);
    },
    pathId(index) {
      return `${this.pathUuid}-item-${index}`;
    },
    getAriaCurrentAttr(index) {
      return index === this.selectedIndex;
    },
  },
};
</script>

<template>
  <div
    v-gl-resize-observer-directive="handleResize"
    class="gl-path-nav"
    :style="{ '--path-bg-color': backgroundColor }"
    data-testid="gl-path-nav"
  >
    <span v-show="displayScrollLeft" class="gl-path-fade gl-path-fade-left">
      <button class="gl-clear-icon-button" aria-label="Scroll left" @click="scrollPathLeft">
        <gl-icon :size="32" name="chevron-left" />
      </button>
    </span>
    <ul ref="pathNavList" class="gl-path-nav-list">
      <li
        v-for="(item, index) in items"
        ref="pathListItems"
        :key="index"
        class="gl-path-nav-list-item"
      >
        <button
          :id="pathId(index)"
          :class="pathItemClass(index)"
          :aria-current="getAriaCurrentAttr(index)"
          :category="item.disabled ? 'tertiary' : undefined"
          :disabled="item.disabled"
          @click="onItemClicked(index)"
        >
          <gl-icon
            v-if="shouldDisplayIcon(item.icon)"
            :name="item.icon"
            class="gl-mr-2"
            data-testid="gl-path-item-icon"
          />{{ item.title
          }}<span v-if="item.metric" class="gl-pl-2 gl-font-normal">{{ item.metric }}</span>
        </button>
        <!--
          @slot Additional content to be displayed in a path item.
          @binding {Object} pathItem The path item being rendered.
          @binding {String} pathId The rendered path item's ID.
        -->
        <slot :path-item="item" :path-id="pathId(index)"></slot>
      </li>
    </ul>
    <span v-show="displayScrollRight" class="gl-path-fade gl-path-fade-right">
      <button class="gl-clear-icon-button" aria-label="Scroll right" @click="scrollPathRight">
        <gl-icon :size="32" name="chevron-right" />
      </button>
    </span>
  </div>
</template>
