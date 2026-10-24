<script>
import GlButton from '../button/button.vue';
import GlButtonGroup from '../button_group/button_group.vue';
import GlIcon from '../icon/icon.vue';
import { translate } from '../../../utils/i18n';

export default {
  name: 'GlKeysetPagination',
  components: {
    GlButtonGroup,
    GlButton,
    GlIcon,
  },
  inheritAttrs: false,
  props: {
    // The following 4 properties match the default names of the
    // [PageInfo](https://docs.khulnasoft.com/ee/api/graphql/reference/index.html#pageinfo)
    // GraphQL type, allowing the returned `pageInfo` object to
    // be bound directly to this component:
    // `<gl-keyset-pagination v-bind="pageInfo">`
    /**
     * Whether or not the "Prev" button should be enabled
     */
    hasPreviousPage: {
      type: Boolean,
      required: false,
      default: false,
    },
    /**
     * Whether or not the "Next" button should be enabled
     */
    hasNextPage: {
      type: Boolean,
      required: false,
      default: false,
    },
    /**
     * A cursor that points to the first item in the current page.
     * Will be passed as an event parameter when the "prev" event is fired.
     */
    startCursor: {
      type: String,
      required: false,
      default: null,
    },
    /**
     * A cursor that points to the last item in the current page.
     * Will be passed as an event parameter when the "next" event is fired.
     */
    endCursor: {
      type: String,
      required: false,
      default: null,
    },
    /**
     * The text that will be rendered inside the "Previous" button.
     * It's important to provide this parameter since the default text is not translatable.
     */
    prevText: {
      type: String,
      required: false,
      default: () => translate('GlKeysetPagination.prevText', 'Previous'),
    },
    /**
     * A link that will be used as the "Prev" button\'s "href" attribute.
     * If provided, the "Prev" button renders as a link button; otherwise, it is rendered as a regular button.
     */
    prevButtonLink: {
      type: String,
      required: false,
      default: null,
    },
    /**
     * The aria-label that needs to be set for the
     * pagination landmark region.
     */
    navigationLabel: {
      type: String,
      required: false,
      default: () => translate('GlKeysetPagination.navigationLabel', 'Pagination'),
    },
    /**
     * The text that will be rendered inside the "Next" button.
     * It's important to provide this parameter since the default text is not translatable.
     */
    nextText: {
      type: String,
      required: false,
      default: () => translate('GlKeysetPagination.nextText', 'Next'),
    },
    /**
     * A link that will be used as the "Next" button\'s "href" attribute.
     * If provided, the "Next" button renders as a link button; otherwise, it is rendered as a regular button.
     */
    nextButtonLink: {
      type: String,
      required: false,
      default: null,
    },
    /**
     * Whether or not both buttons should be disabled (regardless of the "hasPreviousPage" and "hasNextPage" values).
     */
    disabled: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  computed: {
    isVisible() {
      return this.hasPreviousPage || this.hasNextPage;
    },
  },
};
</script>

<template>
  <nav v-if="isVisible" class="gl-pagination" :aria-label="navigationLabel">
    <gl-button-group class="gl-keyset-pagination gl-gap-3" v-bind="$attrs" v-on="$listeners">
      <gl-button
        :href="prevButtonLink"
        :disabled="disabled || !hasPreviousPage"
        data-testid="prevButton"
        category="tertiary"
        @click="$emit('prev', startCursor)"
      >
        <!-- @slot Used to customize the appearance of the "Prev" button -->
        <slot name="previous-button-content">
          <div class="gl-align-center gl-flex">
            <gl-icon name="chevron-lg-left" class="gl-mr-2" />
            {{ prevText }}
          </div>
        </slot>
      </gl-button>
      <gl-button
        :href="nextButtonLink"
        :disabled="disabled || !hasNextPage"
        data-testid="nextButton"
        category="tertiary"
        @click="$emit('next', endCursor)"
      >
        <!-- @slot Used to customize the appearance of the "Next" button -->
        <slot name="next-button-content">
          <div class="gl-align-center gl-flex">
            {{ nextText }}
            <gl-icon name="chevron-lg-right" class="gl-ml-2" />
          </div>
        </slot>
      </gl-button>
    </gl-button-group>
  </nav>
</template>
