<script>
import { translate } from '../../../utils/i18n';
import {
  alertVariantOptions,
  alertVariantIconMap,
  buttonCategoryOptions,
} from '../../../utils/constants';
import CloseButton from '../../shared_components/close_button/close_button.vue';
import GlButton from '../button/button.vue';
import GlIcon from '../icon/icon.vue';

export default {
  name: 'GlAlert',
  components: {
    GlIcon,
    CloseButton,
    GlButton,
  },
  props: {
    /**
     * The title text to display in the alert header.
     */
    title: {
      type: String,
      required: false,
      default: '',
    },
    /**
     * Controls the dismiss button's visibility.
     */
    dismissible: {
      type: Boolean,
      required: false,
      default: true,
    },
    /**
     * The close button's label, it is used for the button's aria-label attribute.
     */
    dismissLabel: {
      type: String,
      required: false,
      default: () => translate('GlAlert.closeButtonTitle', 'Dismiss'),
    },
    /**
     * The variant of the alert.
     */
    variant: {
      type: String,
      required: false,
      default: alertVariantOptions.info,
      validator: (value) => Object.keys(alertVariantOptions).includes(value),
    },
    /**
     * If provided, renders the primary button as a link.
     */
    primaryButtonLink: {
      type: String,
      required: false,
      default: '',
    },
    /**
     * If provided, renders a primary action button.
     */
    primaryButtonText: {
      type: String,
      required: false,
      default: '',
    },
    /**
     * If provided, renders the secondary button as a link.
     */
    secondaryButtonLink: {
      type: String,
      required: false,
      default: '',
    },
    /**
     * If provided, renders a secondary action button.
     */
    secondaryButtonText: {
      type: String,
      required: false,
      default: '',
    },
    /**
     * When true, the alert stays fixed at the top of its container.
     */
    sticky: {
      type: Boolean,
      required: false,
      default: false,
    },
    /**
     * The header level used in the alert (h1/h2/h3/h4/h5/h6).
     *
     * This overrides the value provided by GlAlert. For accessibility this should be set to an
     * appropriate value in the context where the alert is used.
     */
    headerLevel: {
      type: Number,
      required: false,
      default: 2,
      validator(value) {
        return [1, 2, 3, 4, 5, 6].includes(value);
      },
    },
    /**
     * Set the aria-live attribute on the alert.
     *
     * Only set to 'assertive' if alert requires immediate user action.
     * Otherwise, rely on the default value.
     *
     */
    politeness: {
      type: String,
      required: false,
      default: 'polite',
      validator(value) {
        return ['off', 'polite', 'assertive'].includes(value);
      },
    },
  },
  expose: ['focus'],
  data() {
    return {
      hasProgrammaticFocus: false,
    };
  },
  computed: {
    headingComponent() {
      return `h${this.headerLevel}`;
    },
    role() {
      if (
        [
          alertVariantOptions.danger,
          alertVariantOptions.warning,
          alertVariantOptions.success,
        ].includes(this.variant)
      ) {
        return 'alert';
      }

      return 'status';
    },
    iconName() {
      return alertVariantIconMap[this.variant];
    },
    shouldRenderActions() {
      return Boolean(this.$slots.actions || this.actionButtons.length);
    },
    actionButtons() {
      return [
        {
          text: this.primaryButtonText,
          attrs: {
            href: this.primaryButtonLink,
            variant: 'confirm',
            category: buttonCategoryOptions.primary,
          },
          listeners: {
            click: this.primaryButtonClicked,
          },
        },
        {
          text: this.secondaryButtonText,
          attrs: {
            href: this.secondaryButtonLink,
            variant: 'default',
            category: buttonCategoryOptions.secondary,
          },
          listeners: {
            click: this.secondaryButtonClicked,
          },
        },
      ].reduce((acc, actionButton) => {
        if (!actionButton.text) return acc;

        const attrs = { ...actionButton.attrs };
        if (!attrs.href) {
          delete attrs.href;
        }

        acc.push({ ...actionButton, attrs });
        return acc;
      }, []);
    },
    variantClass() {
      // eslint-disable-next-line @khulnasoft/tailwind-no-interpolation -- Not a CSS utility
      return `gl-alert-${this.variant}`;
    },
  },
  methods: {
    /**
     * Focus the alert.
     */
    focus() {
      this.$el.focus();
      this.hasProgrammaticFocus = true;
    },
    primaryButtonClicked(event) {
      /**
       * Emitted when the primary action button is clicked.
       *
       * @event primary-action
       * @type {object}
       */
      this.$emit('primary-action', event);
    },
    secondaryButtonClicked(event) {
      /**
       * Emitted when the secondary action button is clicked.
       *
       * @event secondary-action
       * @type {object}
       */
      this.$emit('secondary-action', event);
    },
    onDismiss() {
      /**
       * Emitted when the dismiss button is clicked.
       *
       * @event dismiss
       * @type {object}
       */
      this.$emit('dismiss');
    },
  },
};
</script>

<template>
  <div
    :role="role"
    :aria-live="politeness"
    :class="[
      'gl-alert',
      { 'gl-alert-sticky': sticky },
      { 'gl-alert-not-dismissible': !dismissible },
      { 'gl-alert-has-title': !!title },
      { 'gl-alert-has-actions': shouldRenderActions },
      { 'gl-focus': hasProgrammaticFocus },
      variantClass,
    ]"
    tabindex="-1"
    @blur="hasProgrammaticFocus = false"
  >
    <div class="gl-alert-icon-container">
      <gl-icon :name="iconName" class="gl-alert-icon" />
    </div>
    <div class="gl-alert-content">
      <component :is="headingComponent" v-if="title" class="gl-alert-title">{{ title }}</component>

      <div class="gl-alert-body">
        <!-- @slot The alert message to display. -->
        <slot></slot>
      </div>

      <div v-if="shouldRenderActions" class="gl-alert-actions">
        <!-- @slot If the primary/secondary action buttons aren't flexible enough, place arbitrary content here. -->
        <slot name="actions">
          <gl-button
            v-for="(actionButton, index) in actionButtons"
            :key="index"
            class="gl-alert-action"
            size="small"
            v-bind="actionButton.attrs"
            v-on="actionButton.listeners"
          >
            {{ actionButton.text }}
          </gl-button>
        </slot>
      </div>
    </div>

    <close-button
      v-if="dismissible"
      ref="dismiss"
      class="gl-dismiss-btn"
      :label="dismissLabel"
      @click="onDismiss"
    />
  </div>
</template>
