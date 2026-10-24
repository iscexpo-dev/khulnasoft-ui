<script>
import { isEmpty } from 'lodash-es';
import { maxZIndex, drawerVariants } from '../../../utils/constants';
import GlButton from '../button/button.vue';

export default {
  name: 'GlDrawer',
  components: {
    GlButton,
  },
  props: {
    /**
     * Controls the visibility state of the drawer.
     */
    open: {
      type: Boolean,
      required: true,
    },
    /**
     * Height of the header element (e.g., '64px'). Used to position the drawer below a fixed header.
     */
    headerHeight: {
      type: String,
      required: false,
      default: '',
    },
    /**
     * When true, makes the drawer header sticky so it remains visible when scrolling the drawer content.
     */
    headerSticky: {
      type: Boolean,
      required: false,
      default: false,
    },
    /**
     * Z-index value for the drawer. Useful for controlling stacking order with other elements.
     */
    zIndex: {
      type: Number,
      required: false,
      default: maxZIndex,
    },
    /**
     * Visual variant of the drawer.
     */
    variant: {
      type: String,
      required: false,
      default: drawerVariants.default,
      validator: (value) => Object.keys(drawerVariants).includes(value),
    },
  },
  computed: {
    positionFromTop() {
      return !isEmpty(this.headerHeight) ? this.headerHeight : 0;
    },
    drawerStyles() {
      const styles = {
        top: this.positionFromTop,
        zIndex: this.zIndex,
      };

      if (this.positionFromTop) {
        styles.maxHeight = `calc(100vh - ${this.positionFromTop})`;
      }

      return styles;
    },
    drawerHeaderStyles() {
      return {
        zIndex: this.headerSticky ? maxZIndex : null,
      };
    },
    shouldRenderFooter() {
      return Boolean(this.$slots.footer);
    },
    variantClass() {
      // eslint-disable-next-line @khulnasoft/tailwind-no-interpolation -- Not a CSS utility
      return `gl-drawer-${this.variant}`;
    },
  },
  watch: {
    open: {
      immediate: true,
      handler(open) {
        if (open) {
          document.addEventListener('keydown', this.handleEscape);
        } else {
          document.removeEventListener('keydown', this.handleEscape);
        }
      },
    },
  },
  beforeDestroy() {
    document.removeEventListener('keydown', this.handleEscape);
  },
  methods: {
    emitOpened() {
      /**
       * Emits when the opening animation has finished.
       * @event opened
       */
      this.$emit('opened');
    },
    handleEscape(e) {
      const ESC = 27;

      if (this.open && e.keyCode === ESC) {
        /**
         * Emits when drawer gets closed (by pressing ESC or clicking the close button).
         * @event close
         */
        this.$emit('close');
      }
    },
  },
};
</script>
<template>
  <transition name="gl-drawer" @after-enter="emitOpened">
    <aside v-if="open" :style="drawerStyles" class="gl-drawer" :class="variantClass">
      <div
        class="gl-drawer-header"
        :style="drawerHeaderStyles"
        :class="{ 'gl-drawer-header-sticky': headerSticky }"
      >
        <div class="gl-drawer-title">
          <!-- @slot Content for the drawer title area in the header. -->
          <slot name="title"></slot>
          <gl-button
            category="tertiary"
            size="small"
            icon="close"
            class="gl-drawer-close-button"
            aria-label="Close drawer"
            @click="$emit('close')"
          />
        </div>
        <!-- @slot Additional content below the title in the header section. -->
        <slot name="header"></slot>
      </div>
      <div
        class="gl-drawer-body"
        :class="{
          'gl-drawer-body-shrink': headerSticky,
          'gl-drawer-body-scrim': !shouldRenderFooter,
        }"
      >
        <!-- @slot Main content of the drawer body. -->
        <slot></slot>
      </div>
      <div
        v-if="shouldRenderFooter"
        class="gl-drawer-footer gl-drawer-footer-sticky gl-drawer-body-scrim-on-footer"
        :style="{ zIndex }"
      >
        <!-- @slot Content for the sticky footer at the bottom of the drawer. -->
        <slot name="footer"></slot>
      </div>
    </aside>
  </transition>
</template>
