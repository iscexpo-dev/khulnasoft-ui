<script>
import illustrationsPath from '@gitlab/svgs/dist/illustrations.svg';
import illustrationsInfo from '@gitlab/svgs/dist/illustrations.json';
import { logWarning } from '../../../utils/utils';

const knownIllustrations = illustrationsInfo.icons;

/** This is a re-usable vue component for rendering a svg sprite icon
 *  @example
 *  <illustration
 *    name="status-success-sm"
 *  />
 */
export default {
  name: 'GlIllustration',
  props: {
    /**
     * One of the illustrations from https://design.khulnasoft.com/product-foundations/illustration-directory
     */
    name: {
      type: String,
      required: true,
      validator: (value) => {
        if (knownIllustrations.some((obj) => obj.name === value)) {
          return true;
        }
        logWarning(`Illustration '${value}' is not a known illustration of @gitlab/svgs`, {
          name: 'GlIllustration',
        });
        return false;
      },
    },
  },
  computed: {
    spriteHref() {
      return `${illustrationsPath}#${this.name}`;
    },
    illustrationSize() {
      return knownIllustrations.find((obj) => obj.name === this.name).svg_size;
    },
  },
};
</script>

<template>
  <svg
    :key="spriteHref"
    :data-testid="`${name}-illustration`"
    role="presentation"
    :width="illustrationSize"
    :height="illustrationSize"
    v-on="$listeners"
  >
    <use :href="spriteHref" />
  </svg>
</template>
