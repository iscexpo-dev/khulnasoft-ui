<script>
import { debounce } from 'lodash-es';
import { GlResizeObserverDirective } from '../../../../directives/resize_observer/resize_observer';
import GlIcon from '../../icon/icon.vue';
import { translate } from '../../../../utils/i18n';
import GlTabs from './tabs.vue';

const NAV_CLASS = 'gl-scrollable-tabs-nav';

export default {
  name: 'GlScrollableTabs',
  components: {
    GlTabs,
    GlIcon,
  },
  directives: {
    GlResizeObserverDirective,
  },
  inheritAttrs: false,
  props: {
    /**
     * The aria-label that will be rendered inside for the scroll to left button.
     */
    scrollLeftLabel: {
      type: String,
      required: false,
      default: translate('GlTabs.GlScrollableTabs.scrollLeftLabel', 'Scroll left'),
    },
    /**
     * The aria-label that will be rendered inside for the scroll to right button.
     */
    scrollRightLabel: {
      type: String,
      required: false,
      default: translate('GlTabs.GlScrollableTabs.scrollRightLabel', 'Scroll right'),
    },
  },
  data() {
    return {
      width: 0,
      // This is a reactive value of a child element's scrollLeft. It is not two-way bound.
      // Do not set manually outside of "scroll" callback.
      scrollLeft: 0,
      navScrollWidth: 0,
    };
  },
  computed: {
    navClass() {
      const attrsNavClass = this.$attrs.navClass;

      if (!attrsNavClass) {
        return [NAV_CLASS];
      }
      if (Array.isArray(attrsNavClass)) {
        return [NAV_CLASS, ...attrsNavClass];
      }

      return [NAV_CLASS, attrsNavClass];
    },
    displayScrollLeft() {
      // if we have scrolled && there's overflow
      return this.scrollLeft && this.width < this.navScrollWidth;
    },

    displayScrollRight() {
      // if there's more overflow to the right
      return this.scrollLeft + this.width < this.navScrollWidth;
    },
    passthroughAttrs() {
      return Object.keys(this.$attrs)
        .filter((key) => !key.startsWith('action'))
        .reduce((acc, key) => Object.assign(acc, { [key]: this.$attrs[key] }), {});
    },
  },
  async mounted() {
    this.handleNavScroll = debounce((e) => {
      this.scrollLeft = e.target.scrollLeft;
    }, 100);

    this.getNavContainer().addEventListener('scroll', this.handleNavScroll);

    await this.$nextTick();
    this.navScrollWidth = this.getScrollWidth();
  },
  beforeDestroy() {
    this.getNavContainer().removeEventListener('scroll', this.handleNavScroll);
  },
  async updated() {
    // Whenever tabs are added or removed we need to recalculate the reactive scrollWidth
    await this.$nextTick();
    this.navScrollWidth = this.getScrollWidth();
  },
  methods: {
    handleResize({ contentRect: { width } }) {
      this.width = width;
      this.navScrollWidth = this.getScrollWidth();
    },
    scrollTabsLeft() {
      const scrollTo = this.scrollLeft - this.width;
      this.scrollTabs(Math.max(scrollTo, 0));
    },
    scrollTabsRight() {
      const scrollTo = this.scrollLeft + this.width;
      this.scrollTabs(Math.min(scrollTo, this.getScrollWidth() - this.width));
    },
    scrollTabs(scrollTo) {
      this.getNavContainer().scrollTo({ left: scrollTo, behavior: 'smooth' });
      this.scrollLeft = scrollTo;
    },
    getScrollWidth() {
      return this.getNavContainer()?.scrollWidth || 0;
    },
    getNavContainer() {
      return this.$el?.querySelector(`.${NAV_CLASS}`);
    },
  },
  NAV_CLASS,
};
</script>

<template>
  <gl-tabs
    v-gl-resize-observer-directive="handleResize"
    :nav-class="navClass"
    v-bind="passthroughAttrs"
    v-on="$listeners"
  >
    <template v-for="slot in Object.keys($slots)" #[slot]>
      <slot :name="slot"></slot>
    </template>
    <template #toolbar-start>
      <div v-show="displayScrollLeft" class="gl-tabs-fade gl-tabs-fade-left">
        <button
          class="gl-tabs-fade-icon-button"
          :aria-label="scrollLeftLabel"
          @click="scrollTabsLeft"
        >
          <gl-icon :size="16" name="chevron-lg-left" />
        </button>
      </div>
    </template>
    <template #toolbar-end>
      <div v-show="displayScrollRight" class="gl-tabs-fade gl-tabs-fade-right">
        <button
          class="gl-tabs-fade-icon-button"
          :aria-label="scrollRightLabel"
          @click="scrollTabsRight"
        >
          <gl-icon :size="16" name="chevron-lg-right" />
        </button>
      </div>
    </template>
  </gl-tabs>
</template>
