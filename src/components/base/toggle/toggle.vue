<script>
import { uniqueId } from 'lodash-es';

import { glToggleConfig } from '../../../config';
import { toggleLabelPosition } from '../../../utils/constants';
import GlIcon from '../icon/icon.vue';
import GlLoadingIcon from '../loading_icon/loading_icon.vue';

let uuid = 0;

export default {
  name: 'GlToggle',
  components: {
    GlIcon,
    GlLoadingIcon,
  },
  model: {
    prop: 'value',
    event: 'change',
  },
  props: {
    /**
     * The name attribute for the hidden input element.
     */
    name: {
      type: String,
      required: false,
      default: null,
    },
    /**
     * The toggle's state.
     * @model
     */
    value: {
      type: Boolean,
      required: false,
      default: null,
    },
    /**
     * Whether the toggle should be disabled.
     */
    disabled: {
      type: Boolean,
      required: false,
      default: false,
    },
    /**
     * Keep the toggle focusable while `disabled` is `true`. Uses `aria-disabled` so the toggle stays in the tab order and is announced by assistive technology.
     */
    accessibleDisabled: {
      type: Boolean,
      required: false,
      default: () => glToggleConfig.accessibleDisabledToggle,
    },
    /**
     * Space-separated ids of elements that describe the toggle, in addition to its help text.
     */
    ariaDescribedby: {
      type: String,
      required: false,
      default: undefined,
    },
    /**
     * Whether the toggle is in the loading state.
     */
    isLoading: {
      type: Boolean,
      required: false,
      default: false,
    },
    /**
     * The toggle's label.
     */
    label: {
      type: String,
      required: false,
      default: null,
    },
    /**
     * The toggle's description.
     */
    description: {
      type: String,
      required: false,
      default: undefined,
    },
    /**
     * A help text to be shown below the toggle.
     */
    help: {
      type: String,
      required: false,
      default: undefined,
    },
    /**
     * The label's position relative to the toggle. If 'hidden', the toggle will add the .gl-sr-only class so the label is still accessible to screen readers.
     */
    labelPosition: {
      type: String,
      required: false,
      default: 'top',
      validator(position) {
        return Object.values(toggleLabelPosition).includes(position);
      },
    },
  },
  data() {
    return {
      labelId: uniqueId('toggle-label-'),
    };
  },
  computed: {
    shouldRenderDescription() {
      return Boolean(this.$scopedSlots.description || this.description) && this.isVerticalLayout;
    },
    shouldRenderHelp() {
      return Boolean(this.$slots.help || this.help) && this.isVerticalLayout;
    },
    toggleClasses() {
      return [
        { 'gl-sr-only': this.labelPosition === 'hidden' },
        this.shouldRenderDescription ? 'gl-mb-2' : 'gl-mb-3',
      ];
    },
    icon() {
      return this.value ? 'check-xs' : 'close-xs';
    },
    helpId() {
      return this.shouldRenderHelp ? `toggle-help-${this.uuid}` : undefined;
    },
    describedBy() {
      return [this.helpId, this.ariaDescribedby].filter(Boolean).join(' ') || undefined;
    },
    isNativeDisabled() {
      return this.disabled && !this.accessibleDisabled;
    },
    isChecked() {
      return this.value ? 'true' : 'false';
    },
    isVerticalLayout() {
      return this.labelPosition === 'top' || this.labelPosition === 'hidden';
    },
  },

  beforeCreate() {
    this.uuid = uuid;
    uuid += 1;
  },

  methods: {
    toggleFeature() {
      if (!this.disabled) {
        /**
         * Emitted when the state changes.
         *
         * @event change
         * @property {boolean} value Whether the toggle is enabled.
         */
        this.$emit('change', !this.value);
      }
    },
  },
};
</script>

<template>
  <div
    class="gl-toggle-wrapper gl-mb-0 gl-flex"
    :class="{
      'gl-flex-col': isVerticalLayout,
      'gl-toggle-label-inline': !isVerticalLayout,
      'is-disabled': disabled,
    }"
    data-testid="toggle-wrapper"
  >
    <span
      :id="labelId"
      :class="toggleClasses"
      class="gl-toggle-label gl-shrink-0"
      data-testid="toggle-label"
    >
      <!-- @slot The toggle's label. -->
      <slot name="label">{{ label }}</slot>
    </span>
    <span
      v-if="shouldRenderDescription"
      class="gl-description-label gl-mb-3"
      data-testid="toggle-description"
    >
      <!-- @slot A description text to be shown below the label. Unavailable when the label is positioned on the left. -->
      <slot name="description">{{ description }}</slot>
    </span>
    <input v-if="name" :name="name" :value="value" type="hidden" />
    <button
      role="switch"
      :aria-checked="isChecked"
      :aria-labelledby="labelId"
      :aria-describedby="describedBy"
      :aria-disabled="disabled"
      :class="{
        'is-checked': value,
        'is-disabled': disabled || isLoading,
        'is-loading': isLoading,
      }"
      class="gl-toggle gl-shrink-0"
      type="button"
      :disabled="isNativeDisabled"
      @click.prevent="toggleFeature"
    >
      <gl-loading-icon v-if="isLoading" color="dark" class="toggle-loading" />
      <span v-else class="toggle-icon">
        <gl-icon :name="icon" :size="12" />
      </span>
    </button>
    <span v-if="shouldRenderHelp" :id="helpId" class="gl-help-label" data-testid="toggle-help">
      <!-- @slot A help text to be shown below the toggle. Unavailable when the label is positioned on the left. -->
      <slot name="help">{{ help }}</slot>
    </span>
  </div>
</template>
