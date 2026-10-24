<script>
import iconsPath from '@gitlab/svgs/dist/icons.svg';
import iconsInfo from '@gitlab/svgs/dist/icons.json';
import { logWarning } from '../../../utils/utils';
import { iconSizeOptions, iconVariantOptions } from '../../../utils/constants';

const knownIcons = new Set(iconsInfo.icons);

/** This is a re-usable vue component for rendering a svg sprite icon
 *  @example
 *  <icon
 *    name="retry"
 *    :size="32"
 *    class="top"
 *  />
 */
export default {
  name: 'GlIcon',
  props: {
    /**
     * Accessible icon name used by screen readers and other assistive technologies.
     * Provide when icon is not merely decorative
     */
    ariaLabel: {
      type: String,
      required: false,
      default: undefined,
    },
    /**
     * One of the icons from https://design.khulnasoft.com/product-foundations/iconography-directory
     */
    name: {
      type: String,
      required: true,
      validator: (value) => {
        if (knownIcons.has(value)) {
          return true;
        }
        logWarning(`Icon '${value}' is not a known icon of @gitlab/svgs`, { name: 'GlIcon' });
        return false;
      },
    },
    /**
     * Icon size
     */
    size: {
      type: Number,
      required: false,
      default: 16,
      validator: (value) => iconSizeOptions.includes(value),
    },
    /**
     * Icon variant
     */
    variant: {
      type: String,
      required: false,
      default: 'current',
      validator: (value) => Object.keys(iconVariantOptions).includes(value),
    },
  },
  computed: {
    spriteHref() {
      return `${iconsPath}#${this.name}`;
    },
    iconSizeClass() {
      return this.size ? `s${this.size}` : '';
    },
    iconVariantClass() {
      return this.variant ? iconVariantOptions[this.variant] : '';
    },
  },
};
</script>

<template>
  <svg
    :key="spriteHref"
    :class="['gl-icon', iconSizeClass, iconVariantClass]"
    :data-testid="`${name}-icon`"
    role="img"
    :aria-hidden="!ariaLabel"
    :aria-label="ariaLabel"
    v-on="$listeners"
  >
    <use :href="spriteHref" />
  </svg>
</template>
