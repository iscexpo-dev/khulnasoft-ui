<script>
import { BModal } from '../../../vendor/bootstrap-vue/src/components/modal/modal';
import { translate } from '../../../utils/i18n';
import {
  COMMA,
  focusableTags,
  modalButtonDefaults,
  modalSizeOptions,
} from '../../../utils/constants';
import { focusFirstFocusableElement, logWarning } from '../../../utils/utils';
import CloseButton from '../../shared_components/close_button/close_button.vue';
import GlButton from '../button/button.vue';

function validatorHelper(obj) {
  return Object.keys(obj).every((val) => val === 'text' || val === 'attributes');
}

export default {
  name: 'GlModal',
  components: {
    BModal,
    GlButton,
    CloseButton,
  },
  inheritAttrs: false,
  model: {
    prop: 'visible',
    event: 'change',
  },
  props: {
    /**
     * Unique identifier for the modal. Used to control the modal programmatically.
     */
    modalId: {
      type: String,
      required: true,
    },
    /**
     * HTML tag to use for the modal title. Options: 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'.
     */
    titleTag: {
      type: String,
      required: false,
      default: 'h4',
    },
    /**
     * HTML tag to use for the modal header. Default is 'div' for accessibility reasons.
     */
    headerTag: {
      type: String,
      required: false,
      default: 'div',
    },
    /**
     * Title text to display in the modal header.
     */
    title: {
      type: String,
      required: false,
      default: null,
    },
    /**
     * Additional CSS class(es) to apply to the modal.
     */
    modalClass: {
      type: String,
      required: false,
      default: '',
    },
    /**
     * HTML tag to use for the modal footer. Default is 'div' for accessibility reasons.
     */
    footerTag: {
      type: String,
      required: false,
      default: 'div',
    },
    /**
     * Configuration object for the primary action button. Should contain 'text' and optionally 'attributes' properties.
     */
    actionPrimary: {
      type: Object,
      required: false,
      default: null,
      validator: (obj) => validatorHelper(obj),
    },
    /**
     * Configuration object for the secondary action button. Should contain 'text' and optionally 'attributes' properties.
     */
    actionSecondary: {
      type: Object,
      required: false,
      default: null,
      validator: (obj) => validatorHelper(obj),
    },
    /**
     * Configuration object for the cancel button. Should contain 'text' and optionally 'attributes' properties.
     */
    actionCancel: {
      type: Object,
      required: false,
      default: null,
      validator: (obj) => validatorHelper(obj),
    },
    /**
     * Size of the modal. Options: 'sm', 'md', 'lg'.
     */
    size: {
      type: String,
      required: false,
      default: modalSizeOptions.md,
      validator: (val) => Object.keys(modalSizeOptions).includes(val),
    },
    /**
     * The close button's label, it is used for the button's aria-label attribute.
     */
    dismissLabel: {
      type: String,
      required: false,
      default: () => translate('GlModal.closeButtonTitle', 'Close'),
    },
    /**
     * Controls the visibility state of the modal.
     */
    visible: {
      type: Boolean,
      required: false,
      default: false,
    },
    /**
     * Accessible label for the modal. Used for the aria-label attribute.
     */
    ariaLabel: {
      type: String,
      required: false,
      default: '',
    },
    /**
     * When true, prevents the modal from automatically focusing an element when shown.
     */
    noFocusOnShow: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  computed: {
    shouldRenderModalOk() {
      return Boolean(this.$slots['modal-ok']);
    },
    shouldRenderModalCancel() {
      return Boolean(this.$slots['modal-cancel']);
    },
    shouldRenderModalFooter() {
      return Boolean(
        this.actionCancel ||
        this.actionSecondary ||
        this.actionPrimary ||
        this.$slots['modal-footer'],
      );
    },
  },
  mounted() {
    if (!this.ariaLabel && !this.title) {
      logWarning('Accessible name for modal missing. Please add title prop or aria-label.', {
        name: 'GlModal',
        element: this.$el,
      });
    }
  },
  methods: {
    show() {
      this.$refs.modal.show();
    },
    hide() {
      this.$refs.modal.hide();
    },
    toggle() {
      this.$refs.modal.toggle();
    },
    ok() {
      this.$refs.modal.onOk();
    },
    cancel() {
      this.$refs.modal.onCancel();
    },
    close() {
      this.$refs.modal.onClose();
    },
    primary(event) {
      this.$emit('primary', event);
    },
    canceled(event) {
      this.$emit('canceled', event);
    },
    secondary(event) {
      this.$emit('secondary', event);
      if (!event?.defaultPrevented) {
        this.close();
      }
    },
    // set default variant button styling
    buttonBinding(prop, name) {
      if (!prop.attributes) {
        return modalButtonDefaults[name];
      }
      return prop.attributes;
    },
    setFocus() {
      if (this.noFocusOnShow) return;

      const btnElts = [...this.$refs.modal.$refs.modal.querySelectorAll('button')];
      const modalElts = [
        ...this.$refs.modal.$refs.body.querySelectorAll(focusableTags.join(COMMA)),
      ];

      // Iterate over the array and if you find the close button,
      // move it to the end
      const closeBtnIndex = btnElts.findIndex((elt) => elt === this.$refs['close-button']?.$el);
      if (closeBtnIndex > -1) {
        btnElts.push(...btnElts.splice(closeBtnIndex, 1));
      }

      // ModalElts are the first choice, the btnElts are a backup
      focusFirstFocusableElement([...modalElts, ...btnElts]);
    },
  },
};
</script>

<template>
  <!--
  Emitted when the modal visibility changes
  @event change
  -->
  <b-modal
    :id="modalId"
    ref="modal"
    :title-tag="titleTag"
    :size="size"
    :visible="visible"
    :aria-label="ariaLabel || title"
    :header-tag="headerTag"
    :footer-tag="footerTag"
    v-bind="$attrs"
    lazy
    :modal-class="['gl-modal', modalClass]"
    v-on="$listeners"
    @shown="setFocus"
    @ok="primary"
    @cancel="canceled"
    @change="$emit('change', $event)"
  >
    <template #default>
      <slot name="default"></slot>
    </template>
    <template #modal-header>
      <!-- @slot Entire modal header container contents (including the close button on the top right corner) -->
      <slot name="modal-header">
        <h2 class="modal-title">
          <!-- @slot Modal title. If modal-header slot is used, this slot will not be shown. -->
          <slot name="modal-title">{{ title }}</slot>
        </h2>
      </slot>
      <!-- @slot Content of Modal header close button. If modal-header slot is used, this slot will not be shown. -->
      <close-button ref="close-button" :label="dismissLabel" @click="close" />
    </template>
    <template v-if="shouldRenderModalOk" #modal-ok>
      <slot name="modal-ok"></slot>
    </template>
    <template v-if="shouldRenderModalCancel" #modal-cancel>
      <slot name="modal-cancel"></slot>
    </template>
    <!-- @slot Populated via props: modal-action-primary, modal-action-cancel and modal-action-secondary. -->
    <template v-if="shouldRenderModalFooter" #modal-footer>
      <slot name="modal-footer">
        <!--
        Emitted when clicked on modal-action-cancel
        @event canceled
        -->
        <gl-button
          v-if="actionCancel"
          class="js-modal-action-cancel"
          v-bind="buttonBinding(actionCancel, 'actionCancel')"
          @click="cancel"
        >
          {{ actionCancel.text }}
        </gl-button>
        <!--
        Emitted when clicked on modal-action-secondary
        @event secondary
        -->
        <gl-button
          v-if="actionSecondary"
          class="js-modal-action-secondary"
          v-bind="buttonBinding(actionSecondary, 'actionSecondary')"
          @click="secondary"
        >
          {{ actionSecondary.text }}
        </gl-button>
        <!--
        Emitted when clicked on modal-action-primary
        @event primary
        -->
        <gl-button
          v-if="actionPrimary"
          class="js-modal-action-primary"
          v-bind="buttonBinding(actionPrimary, 'actionPrimary')"
          @click="ok"
        >
          {{ actionPrimary.text }}
        </gl-button>
      </slot>
    </template>
  </b-modal>
</template>
