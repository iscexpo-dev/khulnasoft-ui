<script>
import { badgeVariantOptions, badgeVariantToIconVariantMap } from '../../../utils/constants';
import GlBadge from '../../base/badge/badge.vue';
import GlIcon from '../../base/icon/icon.vue';
import GlAnimatedNumber from '../../utilities/animated_number/animated_number.vue';
import GlTruncate from '../../utilities/truncate/truncate.vue';
import { formatNumberToLocale } from '../../../utils/number_utils';
import { GlTooltipDirective } from '../../../directives/tooltip/tooltip';

export default {
  name: 'GlSingleStat',
  components: {
    GlIcon,
    GlBadge,
    GlAnimatedNumber,
    GlTruncate,
  },
  directives: {
    GlTooltip: GlTooltipDirective,
  },
  props: {
    /**
     * Title text for the single stat.
     */
    title: {
      type: String,
      required: true,
    },
    /**
     * The numeric value to display.
     */
    value: {
      type: [String, Number],
      required: true,
    },
    /**
     * Unit text to display after the value.
     */
    unit: {
      type: String,
      required: false,
      default: null,
    },
    /**
     * Requires the `value` property to be a valid Number or convertible to one
     */
    useDelimiters: {
      type: Boolean,
      required: false,
      default: false,
    },
    /**
     * Visual variant of the single stat display.
     */
    variant: {
      type: String,
      required: false,
      default: badgeVariantOptions.neutral,
      validator: (variant) => Object.values(badgeVariantOptions).includes(variant),
    },
    /**
     * Name of the icon to show next to the title.
     */
    titleIcon: {
      type: String,
      required: false,
      default: null,
    },
    /**
     * Additional CSS class(es) to be applied to the title icon.
     */
    titleIconClass: {
      type: [Array, Object, String],
      required: false,
      default: '',
    },
    /**
     * Name of the icon to show next to the meta text.
     */
    metaIcon: {
      type: String,
      required: false,
      default: null,
    },
    /**
     * Meta text displayed below the main value.
     */
    metaText: {
      type: String,
      required: false,
      default: null,
    },
    /**
     * Tooltip text for the meta badge. When provided, the badge is wrapped in a button to ensure keyboard accessibility.
     */
    metaTooltip: {
      type: String,
      required: false,
      default: '',
    },
    /**
     * When true, animates the value change.
     */
    shouldAnimate: {
      type: Boolean,
      required: false,
      default: false,
    },
    /**
     * Number of decimal places for the animated value.
     */
    animationDecimalPlaces: {
      type: Number,
      required: false,
      default: 0,
    },
    /**
     * Description text for the single stat.
     */
    description: {
      type: String,
      required: false,
      default: null,
    },
  },
  data() {
    return {
      hideUnits: false,
    };
  },
  computed: {
    showMetaIcon() {
      return Boolean(this.metaIcon && !this.metaText);
    },
    showBadge() {
      return Boolean(this.metaText);
    },
    showTitleIcon() {
      return Boolean(this.titleIcon);
    },
    iconVariant() {
      return badgeVariantToIconVariantMap[this.variant];
    },
    canAnimate() {
      return this.shouldAnimate && !Number.isNaN(Number(this.value));
    },
    statValue() {
      if (this.useDelimiters) {
        const minimumFractionDigits = this.value.toString().split('.')[1]?.length || 0;

        return formatNumberToLocale(this.value, {
          minimumFractionDigits,
        });
      }

      return this.value;
    },
  },
  methods: {
    setHideUnits(flag) {
      this.hideUnits = flag;
    },
  },
};
</script>

<template>
  <div class="gl-single-stat gl-flex gl-flex-col gl-gap-2 gl-p-2" v-bind="$attrs" v-on="$listeners">
    <div class="gl-flex gl-items-center gl-text-heading">
      <gl-icon
        v-if="showTitleIcon"
        :name="titleIcon"
        :class="['gl-mr-2', titleIconClass]"
        data-testid="title-icon"
      />
      <span class="gl-text-base gl-font-normal" data-testid="title-text">{{ title }}</span>
    </div>
    <div class="gl-single-stat-content gl-flex gl-items-baseline gl-font-bold gl-text-strong">
      <span
        class="gl-single-stat-number gl-leading-1"
        :class="{ 'gl-mr-2': !unit }"
        data-testid="displayValue"
      >
        <gl-animated-number
          v-if="canAnimate"
          :number="Number(value)"
          :decimal-places="animationDecimalPlaces"
          :use-delimiters="useDelimiters"
          @animating="setHideUnits(true)"
          @animated="setHideUnits(false)"
        />
        <span v-else data-testid="non-animated-value">{{ statValue }}</span></span
      >
      <span
        v-if="unit"
        class="gl-mx-2 gl-text-sm gl-opacity-10 gl-transition-all"
        :class="{ '!gl-opacity-0': hideUnits }"
        data-testid="unit"
        >{{ unit }}</span
      >
      <gl-icon
        v-if="showMetaIcon"
        :variant="iconVariant"
        :name="metaIcon"
        data-testid="meta-icon"
      />
      <button
        v-if="showBadge && metaTooltip"
        v-gl-tooltip.viewport
        type="button"
        class="!gl-cursor-default gl-border-0 gl-bg-transparent gl-p-0 gl-leading-0"
        :title="metaTooltip"
        data-testid="meta-badge-button"
      >
        <gl-badge :variant="variant" :icon="metaIcon" data-testid="meta-badge">{{
          metaText
        }}</gl-badge>
      </button>
      <gl-badge
        v-else-if="showBadge"
        :variant="variant"
        :icon="metaIcon"
        data-testid="meta-badge"
        >{{ metaText }}</gl-badge
      >
    </div>
    <!-- @slot Supplementary content displayed below the value. -->
    <slot></slot>
    <gl-truncate
      v-if="description"
      data-testid="description"
      class="gl-text-sm gl-text-subtle"
      :text="description"
      with-tooltip
    />
  </div>
</template>
