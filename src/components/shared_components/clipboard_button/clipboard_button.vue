<script>
import { GlTooltipDirective } from '../../../directives/tooltip/tooltip';
import GlButton from '../../base/button/button.vue';
import { translate } from '../../../utils/i18n';

export default {
  name: 'ClipboardButton',
  components: {
    GlButton,
  },
  directives: {
    GlTooltip: GlTooltipDirective,
  },
  props: {
    /**
     * The text to copy to clipboard
     */
    text: {
      type: String,
      required: true,
    },
    /**
     * The tooltip text shown on hover
     */
    title: {
      type: String,
      required: false,
      default: () => translate('ClipboardButton.title', 'Copy to clipboard'),
    },
    /**
     * Button size
     */
    size: {
      type: String,
      required: false,
      default: 'medium',
    },
  },
  data() {
    return {
      localTitle: this.title,
      titleTimeout: null,
    };
  },
  methods: {
    updateTooltip(title) {
      this.localTitle = title;

      clearTimeout(this.titleTimeout);

      this.titleTimeout = setTimeout(() => {
        this.localTitle = this.title;
      }, 1000);
    },
    async handleClick() {
      try {
        await navigator.clipboard.writeText(this.text);
        this.updateTooltip(translate('ClipboardButton.copied', 'Copied'));
      } catch {
        this.updateTooltip(translate('ClipboardButton.error', 'Copy failed'));
      }
    },
  },
};
</script>

<template>
  <gl-button
    v-gl-tooltip.hover.focus.top
    variant="default"
    category="tertiary"
    icon="copy-to-clipboard"
    :size="size"
    :title="localTitle"
    :aria-label="localTitle"
    @click="handleClick"
  />
</template>
