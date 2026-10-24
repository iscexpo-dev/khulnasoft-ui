<script>
import { debounce } from 'lodash-es';
import { translate } from '../../../utils/i18n';
import GlAvatar from '../avatar/avatar.vue';
import GlDisclosureDropdown from '../new_dropdowns/disclosure/disclosure_dropdown.vue';
import { GlTooltipDirective } from '../../../directives/tooltip/tooltip';
import { breadCrumbSizeOptions } from '../../../utils/constants';
import ClipboardButton from '../../shared_components/clipboard_button/clipboard_button.vue';
import GlBreadcrumbItem from './breadcrumb_item.vue';

export default {
  name: 'GlBreadcrumb',
  components: {
    GlBreadcrumbItem,
    GlAvatar,
    GlDisclosureDropdown,
    ClipboardButton,
  },
  directives: {
    GlTooltip: GlTooltipDirective,
  },
  inheritAttrs: false,
  props: {
    /**
     * The breadcrumb items to be displayed as links.
     */
    items: {
      type: Array,
      required: true,
      default: () => [{ text: '', href: '' }],
      validator: (items) => {
        return items.every((item) => {
          const keys = Object.keys(item);
          return (
            keys.includes('text') && item.text && (keys.includes('href') || keys.includes('to'))
          );
        });
      },
    },
    /**
     * Accessible label for the breadcrumb navigation.
     */
    ariaLabel: {
      type: String,
      required: false,
      default: 'Breadcrumb',
    },
    /**
     * The label for the collapsed dropdown toggle. Screen-reader only.
     */
    showMoreLabel: {
      type: String,
      required: false,
      default: () => translate('GlBreadcrumb.showMoreLabel', 'Show more breadcrumbs'),
    },
    /**
     * Allows to disable auto-resize behavior. Items will then overflow their container instead of being collapsed into a dropdown.
     */
    autoResize: {
      type: Boolean,
      required: false,
      default: true,
    },
    /**
     * Size of the breadcrumb item. Use `sm` for page breadcrumbs.
     */
    size: {
      type: String,
      required: false,
      default: breadCrumbSizeOptions.sm,
      validator: (value) => Object.keys(breadCrumbSizeOptions).includes(value),
    },
    /**
     * Copy to clipboard button for breadcrumbs path.
     */
    showClipboardButton: {
      type: Boolean,
      required: false,
      default: false,
    },
    /**
     * Custom path for copy to clipboard button. By default, it resolves to all items text values with `/` separator.
     */
    pathToCopy: {
      type: String,
      required: false,
      default: null,
    },
    /**
     * Custom tooltip text for clipboard button.
     */
    clipboardTooltipText: {
      type: String,
      required: false,
      default: null,
    },
  },
  data() {
    return {
      fittingItems: [...this.items], // array of items that fit on the screen
      overflowingItems: [], // array of items that didn't fit and were put in a dropdown instead
      totalBreadcrumbsWidth: 0, // the total width of all breadcrumb items combined
      widthPerItem: [], // array with the individual widths of each breadcrumb item
      dropdownWidth: 0, // the width of the breadcrumb item containing the dropdown toggle
      clipboardButtonWidth: 0, // the width of the clipboard button at the end of breadcrumbs
      resizeDone: false, // to apply some CSS only during/after resizing
    };
  },
  computed: {
    hasCollapsible() {
      return this.overflowingItems.length > 0;
    },
    breadcrumbStyle() {
      return this.resizeDone ? {} : { opacity: 0 };
    },
    itemClass() {
      if (this.resizeDone && this.fittingItems.length === 1) {
        return 'gl-breadcrumb-only-item';
      }
      return '';
    },
    dropdownItemClass() {
      // eslint-disable-next-line @khulnasoft/tailwind-no-interpolation
      return ['gl-breadcrumb-item', `gl-breadcrumb-item-${this.size}`];
    },
    dropdownSize() {
      return this.size === 'sm' ? 'small' : 'medium';
    },
    avatarSize() {
      return this.size === 'sm' ? 16 : 24;
    },
    clipboardButtonText() {
      if (this.pathToCopy) return this.pathToCopy;

      const items = Array.from(this.items, (item) => item.text);
      return items.join('/');
    },
  },
  watch: {
    items: {
      handler: 'measureAndMakeBreadcrumbsFit',
      deep: true,
    },
    autoResize(newValue) {
      if (newValue) this.enableAutoResize();
      else this.disableAutoResize();
    },
  },
  created() {
    this.debounceMakeBreadcrumbsFit = debounce(this.makeBreadcrumbsFit, 25);
  },
  mounted() {
    if (this.autoResize) {
      this.enableAutoResize();
    } else {
      this.resizeDone = true;
    }
    this.updateClipboardButtonWidth();
  },
  beforeDestroy() {
    this.disableAutoResize();
  },
  methods: {
    updateClipboardButtonWidth() {
      if (!this.showClipboardButton) {
        this.clipboardButtonWidth = 0;
        return;
      }

      const element = this.$refs.clipboardButton.$el;
      const marginLeft = parseInt(getComputedStyle(element).marginLeft, 10);
      this.clipboardButtonWidth = element.offsetWidth + marginLeft;
    },
    resetItems() {
      this.fittingItems = [...this.items];
      this.overflowingItems = [];
    },
    async measureAndMakeBreadcrumbsFit() {
      this.resetItems();
      if (!this.autoResize) return;
      this.resizeDone = false;

      // Wait for DOM update so all items get rendered and can be measured.
      await this.$nextTick();

      this.totalBreadcrumbsWidth = 0;

      // The component can unmount, or drop the dropdown, while waiting for the DOM update.
      if (!this.$refs.breadcrumbs || !this.$refs.dropdown) return;

      this.$refs.breadcrumbs.forEach((b, index) => {
        const width = b.$el.clientWidth;
        this.totalBreadcrumbsWidth += width;
        this.widthPerItem[index] = width;
      });

      this.totalBreadcrumbsWidth += this.clipboardButtonWidth;

      // The dropdown gets rendered during `!resizeDone` so we can measure its real width here.
      this.dropdownWidth = this.$refs.dropdown.clientWidth;

      this.makeBreadcrumbsFit();
    },
    makeBreadcrumbsFit() {
      this.resizeDone = false;
      this.resetItems();

      const containerWidth = this.$el.clientWidth;

      if (this.totalBreadcrumbsWidth > containerWidth) {
        // Not all breadcrumb items fit. Start moving items over to the dropdown.
        const startSlicingAt = 0;

        // The last item will never be moved into the dropdown.
        const stopSlicingAt = this.items.length - 1;

        let widthNeeded = this.totalBreadcrumbsWidth;
        for (let index = startSlicingAt; index < stopSlicingAt; index += 1) {
          // Move one breadcrumb item into the dropdown
          this.overflowingItems.push(this.fittingItems[startSlicingAt]);
          this.fittingItems.splice(startSlicingAt, 1);

          widthNeeded -= this.widthPerItem[index];

          // Does it fit now? Then stop.
          if (widthNeeded + this.dropdownWidth < containerWidth) break;
        }
      }

      const truncatedItemMaxWidth = Math.max(
        0,
        containerWidth - (this.dropdownWidth + this.clipboardButtonWidth),
      );
      this.$el.style.setProperty(
        '--gl-breadcrumb-truncated-item-max-width',
        `${truncatedItemMaxWidth}px`,
      );

      this.resizeDone = true;
    },
    isLastItem(index) {
      return index === this.fittingItems.length - 1;
    },
    getAriaCurrentAttr(index) {
      return this.isLastItem(index) ? 'page' : false;
    },
    enableAutoResize() {
      this.resizeObserver ||= new ResizeObserver(this.debounceMakeBreadcrumbsFit);
      this.resizeObserver.observe(this.$el);
      this.measureAndMakeBreadcrumbsFit();
    },
    disableAutoResize() {
      if (this.resizeObserver) {
        this.resizeObserver.unobserve(this.$el);
        this.resizeObserver = null;
      }
      this.resetItems();
    },
  },
};
</script>
<template>
  <nav class="gl-breadcrumbs" :aria-label="ariaLabel" :style="breadcrumbStyle">
    <ol class="gl-breadcrumb-list breadcrumb" v-bind="$attrs" v-on="$listeners">
      <li v-if="hasCollapsible || !resizeDone" ref="dropdown" :class="dropdownItemClass">
        <gl-disclosure-dropdown
          :items="overflowingItems"
          :toggle-text="showMoreLabel"
          fluid-width
          text-sr-only
          no-caret
          icon="ellipsis_h"
          :size="dropdownSize"
        />
      </li>

      <gl-breadcrumb-item
        v-for="(item, index) in fittingItems"
        ref="breadcrumbs"
        :key="index"
        :text="item.text"
        :href="item.href"
        :to="item.to"
        :size="size"
        :aria-current="getAriaCurrentAttr(index)"
        :class="itemClass"
        ><template #default>
          <gl-avatar
            v-if="item.avatarPath"
            :src="item.avatarPath"
            :size="avatarSize"
            aria-hidden="true"
            class="gl-breadcrumb-avatar-tile gl-border gl-mr-2"
            shape="rect"
            data-testid="avatar"
          /><span class="gl-align-middle">{{ item.text }}</span>
        </template>
      </gl-breadcrumb-item>

      <li v-if="showClipboardButton" class="gl-breadcrumb-clipboard-button">
        <clipboard-button
          ref="clipboardButton"
          data-testid="copy-to-clipboard-button"
          class="gl-ml-2"
          :text="clipboardButtonText"
          v-bind="clipboardTooltipText ? { title: clipboardTooltipText } : {}"
          :size="dropdownSize"
        />
      </li>
    </ol>
  </nav>
</template>
