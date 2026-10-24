<script>
import { navItemIndicatorPositionOptions } from '../../../utils/constants';
import GlAnimatedChevronRightDownIcon from '../animated_icon/animated_chevron_right_down_icon.vue';
import GlIcon from '../icon/icon.vue';

export default {
  name: 'GlNavItem',
  components: {
    GlAnimatedChevronRightDownIcon,
    GlIcon,
  },
  props: {
    /**
     * Link href attribute
     */
    href: {
      type: String,
      required: false,
      default: null,
    },
    /**
     * Icon name
     */
    icon: {
      type: String,
      required: false,
      default: null,
    },
    /**
     * Is icon only
     */
    isIconOnly: {
      type: Boolean,
      required: false,
      default: false,
    },
    /**
     * Is parent
     */
    isParent: {
      type: Boolean,
      required: false,
      default: false,
    },
    /**
     * Expanded
     */
    expanded: {
      type: Boolean,
      required: false,
      default: false,
    },
    /**
     * Is currently selected
     */
    selected: {
      type: Boolean,
      required: false,
      default: false,
    },
    /**
     * Router link to property
     */
    to: {
      type: [String, Object],
      required: false,
      default: null,
    },
    /**
     * Position of the selected indicator
     */
    indicatorPosition: {
      type: String,
      required: false,
      default: 'left',
      validator: (value) => navItemIndicatorPositionOptions[value] !== undefined,
    },
  },
  computed: {
    ariaExpanded() {
      return this.isParent ? String(this.expanded) : null;
    },
    classes() {
      return [
        'gl-nav-item',
        navItemIndicatorPositionOptions[this.indicatorPosition],
        {
          'gl-nav-item-is-icon-only': this.isIconOnly,
          'gl-nav-item-has-start-slot': this.icon || Boolean(this.$scopedSlots.icon),
          'gl-nav-item-has-end-slot': Boolean(this.$scopedSlots.end) || this.isParent,
          selected: this.selected,
        },
      ];
    },
  },
};
</script>

<template>
  <component
    :is="'router-link'"
    v-if="to"
    #default="{ navigate }"
    :to="to"
    active-class="selected"
    custom
  >
    <a :class="classes" :aria-current="selected ? 'page' : null" @click="navigate">
      <span v-if="icon || $scopedSlots.icon" class="gl-nav-item-slot" data-testid="nav-item-start">
        <slot name="icon">
          <gl-icon :name="icon" />
        </slot>
      </span>
      <template v-if="!isIconOnly">
        <span v-if="$scopedSlots.default" class="gl-nav-item-label" data-testid="nav-item-label">
          <slot :is-active="selected"></slot>
        </span>
        <span v-if="$scopedSlots.end" class="gl-nav-item-slot" data-testid="nav-item-end">
          <slot name="end"></slot>
        </span>
      </template>
    </a>
  </component>
  <a
    v-else-if="href"
    :class="classes"
    :href="href"
    :aria-current="selected ? 'page' : null"
    @click="$emit('click')"
    @keydown.escape="$emit('escape')"
    @pointerover="$emit('pointerover', $event)"
    @pointerleave="$emit('pointerleave', $event)"
  >
    <span v-if="icon || $scopedSlots.icon" class="gl-nav-item-slot" data-testid="nav-item-start">
      <slot name="icon">
        <gl-icon :name="icon" />
      </slot>
    </span>
    <template v-if="!isIconOnly">
      <span v-if="$scopedSlots.default" class="gl-nav-item-label" data-testid="nav-item-label">
        <slot></slot>
      </span>
      <span v-if="$scopedSlots.end" class="gl-nav-item-slot" data-testid="nav-item-end">
        <slot name="end"></slot>
      </span>
    </template>
  </a>
  <button
    v-else
    :aria-expanded="ariaExpanded"
    :class="classes"
    @click="$emit('click')"
    @keydown.escape="$emit('escape')"
    @pointerover="$emit('pointerover', $event)"
    @pointerleave="$emit('pointerleave', $event)"
  >
    <span v-if="icon || $scopedSlots.icon" class="gl-nav-item-slot" data-testid="nav-item-start">
      <slot name="icon">
        <gl-icon :name="icon" />
      </slot>
    </span>
    <template v-if="!isIconOnly">
      <span v-if="$scopedSlots.default" class="gl-nav-item-label" data-testid="nav-item-label">
        <slot></slot>
      </span>
      <span v-if="$scopedSlots.end" class="gl-nav-item-slot" data-testid="nav-item-end">
        <slot name="end"></slot>
      </span>
      <span v-else-if="isParent" class="gl-nav-item-slot" data-testid="nav-item-chevron">
        <gl-animated-chevron-right-down-icon class="gl-nav-item-chevron" :is-on="expanded" />
      </span>
    </template>
  </button>
</template>
