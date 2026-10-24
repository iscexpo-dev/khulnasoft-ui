<script>
import { colorFromBackground } from '../utils/utils';
import { GlTooltipDirective } from '../directives/tooltip/tooltip';
import GlBadge from '../components/base/badge/badge.vue';

export default {
  name: 'TokensStory',
  components: {
    GlBadge,
  },
  directives: {
    GlTooltip: GlTooltipDirective,
  },
  inject: ['containerClass'],
  props: {
    /**
     * Map of design tokens to display in the story.
     */
    tokens: {
      type: Object,
      required: false,
      default: () => ({}),
    },
  },
  methods: {
    isHex(value) {
      return value.startsWith('#');
    },
    getTokenName(token) {
      return token.path.filter(Boolean).join('.');
    },
    getClasses(value) {
      if (!this.isHex(value)) return '';

      const textColorVariant = colorFromBackground(value, 4.5);
      return {
        'gl-text-neutral-950': textColorVariant === 'dark',
        'gl-text-neutral-0': textColorVariant === 'light',
      };
    },
  },
};
</script>

<template>
  <div :class="containerClass">
    <ul class="gl-m-0 gl-list-none gl-p-0">
      <li
        v-for="token in tokens"
        :key="token.name"
        class="gl-flex gl-flex-wrap gl-items-center gl-justify-between gl-gap-3 gl-p-3"
        :class="getClasses(token.$value)"
        :style="{ backgroundColor: token.$value }"
      >
        <code v-gl-tooltip :title="token.comment" class="gl-text-inherit">
          {{ getTokenName(token) }}
        </code>
        <div class="gl-flex gl-items-center gl-gap-3">
          <gl-badge v-if="token.$deprecated" v-gl-tooltip :title="token.comment" variant="danger">
            Deprecated
          </gl-badge>
          <code class="gl-text-inherit">{{ token.$value }}</code>
        </div>
      </li>
    </ul>
  </div>
</template>
