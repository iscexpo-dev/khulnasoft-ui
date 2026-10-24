<script>
import { bannerVariants } from '../../../utils/constants';
import { translate } from '../../../utils/i18n';
import CloseButton from '../../shared_components/close_button/close_button.vue';
import GlButton from '../button/button.vue';
import GlCard from '../card/card.vue';
import GlIllustration from '../illustration/illustration.vue';

export default {
  name: 'GlBanner',
  components: {
    CloseButton,
    GlButton,
    GlCard,
    GlIllustration,
  },
  props: {
    /**
     * Used to set the title of the banner.
     */
    title: {
      type: String,
      required: true,
    },
    /**
     * HTML attributes to add to the submit button.
     */
    buttonAttributes: {
      type: Object,
      required: false,
      default: () => ({}),
    },
    /**
     * Text for the submit button.
     */
    buttonText: {
      type: String,
      required: true,
    },
    /**
     * Link for the submit button.
     */
    buttonLink: {
      type: String,
      required: false,
      default: null,
    },
    /**
     * The illustration's name.
     */
    illustrationName: {
      type: String,
      required: false,
      default: null,
    },
    /**
     * The illustration's URL.
     */
    svgPath: {
      type: String,
      required: false,
      default: null,
    },
    /**
     * The variant of the banner.
     */
    variant: {
      type: String,
      required: false,
      default: bannerVariants[0],
      validator(value) {
        return bannerVariants.includes(value);
      },
    },
    /**
     * The close button's label, it is used for the button's aria-label attribute.
     */
    dismissLabel: {
      type: String,
      required: false,
      default: () => translate('GlBanner.closeButtonTitle', 'Dismiss'),
    },
  },
  computed: {
    isIntroducing() {
      return this.variant === bannerVariants[1];
    },
  },
  methods: {
    handleClose() {
      /**
       * Emitted when the close button is clicked.
       *
       * @event close
       * @type {object}
       */
      this.$emit('close');
    },
    primaryButtonClicked() {
      /**
       * Emitted when the primary action button is clicked.
       *
       * @event primary
       * @type {object}
       */
      this.$emit('primary');
    },
  },
};
</script>

<template>
  <gl-card
    class="gl-banner gl-py-6 gl-pl-6 gl-pr-8"
    :class="{
      'gl-banner-introduction': isIntroducing,
    }"
    body-class="gl-flex gl-bg-transparent !gl-p-0"
  >
    <div v-if="svgPath || illustrationName" class="gl-banner-illustration">
      <gl-illustration v-if="illustrationName" :name="illustrationName" />
      <img v-else-if="svgPath" :src="svgPath" alt="" />
    </div>
    <div class="gl-banner-content">
      <h2 class="gl-banner-title">{{ title }}</h2>
      <!-- @slot The banner content to display -->
      <slot></slot>
      <gl-button
        variant="confirm"
        category="primary"
        data-testid="gl-banner-primary-button"
        :href="buttonLink"
        v-bind="buttonAttributes"
        @click="primaryButtonClicked"
        >{{ buttonText }}</gl-button
      >
      <!-- @slot The banner actions to display -->
      <slot name="actions"></slot>
    </div>
    <close-button class="gl-banner-close" :label="dismissLabel" @click="handleClose" />
  </gl-card>
</template>
