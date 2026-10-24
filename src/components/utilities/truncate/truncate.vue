<script>
import { GlTooltipDirective } from '../../../directives/tooltip/tooltip';
import { GlResizeObserverDirective } from '../../../directives/resize_observer/resize_observer';
import { POSITION, ZERO_WIDTH_SPACE } from './constants';

export default {
  name: 'GlTruncate',
  POSITION,
  directives: {
    GlTooltip: GlTooltipDirective,
    GlResizeObserver: GlResizeObserverDirective,
  },
  props: {
    /**
     * Text to be ellipsized
     */
    text: {
      type: String,
      required: true,
    },
    /**
     * Ellipsis position
     */
    position: {
      type: String,
      required: false,
      default: POSITION.END,
      validator: (value) => Object.values(POSITION).includes(value),
    },
    /**
     * Display the full text in a tooltip only if it is being truncated
     */
    withTooltip: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  data() {
    return {
      isTruncated: false,
    };
  },
  computed: {
    middleIndex() {
      return Math.floor(this.text.length / 2);
    },

    preventWhitespaceCollapse() {
      // We don't use `\s` here since it includes non-breaking spaces and other
      // non-collapsible whitespace characters.
      // See https://infra.spec.whatwg.org/#strip-and-collapse-ascii-whitespace
      // and https://infra.spec.whatwg.org/#ascii-whitespace.
      const collapsibleWhitespaceChar = /^[ \n\t\r\f]$/;
      const { text, middleIndex } = this;
      const lastCharOfFirstIsCollapsibleWhitespace = collapsibleWhitespaceChar.test(
        text.charAt(middleIndex - 1),
      );
      const firstCharOfLastIsCollapsibleWhitespace = collapsibleWhitespaceChar.test(
        text.charAt(middleIndex),
      );

      return lastCharOfFirstIsCollapsibleWhitespace && !firstCharOfLastIsCollapsibleWhitespace;
    },
    first() {
      const first = this.text.slice(0, this.middleIndex);

      if (this.preventWhitespaceCollapse) {
        // Because this component's root element has an internal flex layout,
        // whitespace at the end of the first child span and at the beginning
        // of the second child span would be ignored (i.e., totally collapsed).
        //
        // This means that strings with a space character in the middle would
        // render as if there were no space, which would be incorrect (e.g.,
        // "Gap here" would render as "Gaphere").
        //
        // So, in that case, we insert a zero-width space at the end of the
        // first child span to prevent that whitespace from being totally
        // collapsed. In other words:
        // 'first-part-with-space ' → 'first-part-with-space &ZeroWidthSpace;'
        //
        // If there's a whitespace character at the begging of the second child
        // span, we do *not* do this, since the left-to-right mark (&lrm;) just
        // before `{{ last }}` in the template prevents the collapse of any
        // whitespace at the start of `last`. If we ignored this edge case,
        // we'd render a double space, which wouldn't correspond to how the
        // string would normally render.
        //
        // See
        // https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model/Whitespace#whitespace_in_block_formatting_contexts
        // for more information on how browsers treat whitespace.
        return `${first}${ZERO_WIDTH_SPACE}`;
      }

      return first;
    },
    last() {
      return this.text.slice(this.middleIndex);
    },
    isTooltipDisabled() {
      return !this.withTooltip || !this.isTruncated;
    },
    title() {
      return this.withTooltip ? this.text : undefined;
    },
  },
  watch: {
    withTooltip(withTooltip) {
      if (withTooltip) {
        this.checkTruncationState();
      }
    },
  },
  methods: {
    checkTruncationState() {
      if (this.withTooltip) {
        this.isTruncated = this.$refs.text.scrollWidth > this.$refs.text.offsetWidth;
      }
    },
  },
};
</script>

<template>
  <span
    v-if="position === $options.POSITION.START"
    v-gl-tooltip="{ disabled: isTooltipDisabled }"
    v-gl-resize-observer:[withTooltip]="checkTruncationState"
    class="gl-truncate-component"
    :title="title"
  >
    <span ref="text" class="gl-truncate-start !gl-text-ellipsis">&lrm;{{ text }}&lrm;</span>
  </span>

  <span
    v-else-if="position === $options.POSITION.MIDDLE"
    v-gl-tooltip="{ disabled: isTooltipDisabled }"
    v-gl-resize-observer:[withTooltip]="checkTruncationState"
    class="gl-truncate-component"
    :title="title"
    :aria-label="text"
  >
    <span ref="text" class="gl-truncate-end">{{ first }}</span
    ><span class="gl-truncate-start">&lrm;{{ last }}&lrm;</span>
  </span>

  <span
    v-else
    v-gl-tooltip="{ disabled: isTooltipDisabled }"
    v-gl-resize-observer:[withTooltip]="checkTruncationState"
    class="gl-truncate-component"
    data-testid="truncate-end-container"
    :title="title"
  >
    <span ref="text" class="gl-truncate-end">{{ text }}</span>
  </span>
</template>
