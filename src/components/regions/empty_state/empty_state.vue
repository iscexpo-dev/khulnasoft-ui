<script>
import GlButton from '../../base/button/button.vue';
import GlIllustration from '../../base/illustration/illustration.vue';

export default {
  name: 'GlEmptyState',
  components: {
    GlButton,
    GlIllustration,
  },
  props: {
    /**
     * The title (heading) of the empty state.
     */
    title: {
      type: String,
      required: false,
      default: null,
    },
    /**
     * The header tag used in the empty state component (h1/h2/h3/h4/h5/h6).
     * For accessibility this should be set to an appropriate value in the context where the component is used.
     * Defaults to `h2`
     */
    headerLevel: {
      type: Number,
      required: false,
      default: 2,
      validator(value) {
        return value > 0 && value <= 6;
      },
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
     * The illustration's height used to prevent content reflow.
     */
    svgHeight: {
      type: Number,
      required: false,
      default: 144,
    },
    /**
     * The desciption/body text of the empty state.
     */
    description: {
      type: String,
      required: false,
      default: null,
    },
    /**
     * The primary GlButton's href.
     */
    primaryButtonLink: {
      type: String,
      required: false,
      default: null,
    },
    /**
     * The primary GlButton's text. If falsey, the button is not shown.
     */
    primaryButtonText: {
      type: String,
      required: false,
      default: null,
    },
    /**
     * The secondary GlButton's href.
     */
    secondaryButtonLink: {
      type: String,
      required: false,
      default: null,
    },
    /**
     * The secondary GlButton's text. If falsey, the button is not shown.
     */
    secondaryButtonText: {
      type: String,
      required: false,
      default: null,
    },
    /**
     * Determines whether to render the compact layout.
     */
    compact: {
      type: Boolean,
      required: false,
      default: false,
    },
    /**
     * When true, inverts the empty state illustration colors in dark mode.
     */
    invertInDarkMode: {
      type: Boolean,
      required: false,
      default: true,
    },
    /**
     * CSS classes to add to the content container
     */
    contentClass: {
      type: [Array, String, Object],
      required: false,
      default: () => [],
    },
  },
  computed: {
    headerComponent() {
      const level = this.headerLevel;
      return `h${level}`;
    },
    height() {
      return this.shouldPreventImageReflow ? this.svgHeight : null;
    },
    shouldPreventImageReflow() {
      return Boolean(this.svgHeight) && !this.illustrationName;
    },
    shouldRenderPrimaryButton() {
      return Boolean(this.primaryButtonLink && this.primaryButtonText);
    },
    shouldRenderSecondaryButton() {
      return Boolean(this.secondaryButtonLink && this.secondaryButtonText);
    },
    contentClasses() {
      return [this.compact ? 'gl-grow gl-basis-0 gl-px-4' : 'gl-m-auto gl-p-5', this.contentClass];
    },
  },
};
</script>

<template>
  <section
    class="gl-flex"
    :class="{
      'gl-empty-state gl-flex-col gl-text-center': !compact,
      'gl-flex-row': compact,
    }"
  >
    <div :class="{ 'gl-hidden gl-px-4 @sm:gl-block': compact, 'gl-max-w-full': !compact }">
      <gl-illustration v-if="illustrationName" :name="illustrationName" />
      <img
        v-else-if="svgPath"
        :src="svgPath"
        alt=""
        :class="{ 'gl-dark-invert-keep-hue': invertInDarkMode }"
        class="gl-max-w-full"
        :height="height"
      />
    </div>
    <div
      class="gl-empty-state-content gl-mx-auto gl-my-0"
      :class="contentClasses"
      data-testid="gl-empty-state-content"
    >
      <!--
          @slot Use this slot to customize the empty state's title area.
          Overrides the `title` prop.
        -->
      <slot ref="title" name="title">
        <component
          :is="headerComponent"
          class="gl-mb-0 gl-mt-0 gl-text-size-h-display gl-leading-36"
          :class="compact ? 'h5' : 'h4'"
        >
          {{ title }}
        </component>
      </slot>
      <p
        v-if="description || $scopedSlots.description"
        ref="description"
        class="gl-mb-0 gl-mt-4 gl-text-subtle"
      >
        <!--
          @slot Use this slot to customize the empty state's description
          area. Overrides the `description` prop.
        -->
        <slot name="description">
          {{ description }}
        </slot>
      </p>
      <div class="gl-mt-5 gl-flex gl-flex-wrap" :class="{ 'gl-justify-center': !compact }">
        <!--
          @slot Use this slot to customize the empty state's actions area,
          where the buttons are. Overrides button-related props:
          `primaryButtonLink`, `primaryButtonText`, `secondaryButtonLink`,
          `secondaryButtonText`.
        -->
        <slot name="actions">
          <gl-button
            v-if="shouldRenderPrimaryButton"
            variant="confirm"
            :class="compact ? 'gl-mr-3' : 'gl-mx-2'"
            class="gl-mb-3"
            :href="primaryButtonLink"
            >{{ primaryButtonText }}</gl-button
          >
          <gl-button
            v-if="shouldRenderSecondaryButton"
            class="gl-mb-3 gl-mr-3"
            :class="{ '!gl-mx-2': !compact }"
            :href="secondaryButtonLink"
            >{{ secondaryButtonText }}
          </gl-button>
        </slot>
      </div>
    </div>
  </section>
</template>
