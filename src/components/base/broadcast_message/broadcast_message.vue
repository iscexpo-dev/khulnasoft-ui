<script>
import { broadcastMessageThemes } from '../../../utils/constants';
import { translate } from '../../../utils/i18n';
import CloseButton from '../../shared_components/close_button/close_button.vue';
import GlIcon from '../icon/icon.vue';
import { TYPE_BANNER, TYPE_NOTIFICATION, TYPE_LIST } from './constants';

export default {
  name: 'GlBroadcastMessage',
  components: {
    CloseButton,
    GlIcon,
  },
  props: {
    /**
     * The icon to show next to the text.
     */
    iconName: {
      type: String,
      required: false,
      default: 'bullhorn',
    },
    /**
     * Allow the broadcast message to be dismissed by a user.
     */
    dismissible: {
      type: Boolean,
      required: false,
      default: true,
    },
    /**
     * The dismiss button's label, it is used for the button's aria-label attribute.
     */
    dismissLabel: {
      type: String,
      required: false,
      default: () => translate('GlBroadcastMessage.closeButtonTitle', 'Dismiss'),
    },
    /**
     * The theme's name to use, this should correspond to the user's selected theme in KhulnaSoft.
     */
    theme: {
      type: String,
      required: false,
      default: Object.keys(broadcastMessageThemes)[0],
      validator: (value) => Object.keys(broadcastMessageThemes).includes(value),
    },
    /**
     * The base layout to use. `notification` type broadcast messages are not compatible
     with the `dismissible` or `theme` props.
     */
    type: {
      type: String,
      required: false,
      default: TYPE_BANNER,
      validator: (value) => TYPE_LIST.includes(value),
    },
  },
  computed: {
    showDismissButton() {
      return this.dismissible || this.type === TYPE_NOTIFICATION;
    },
  },
  methods: {
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
  <div class="gl-broadcast-message" :class="`${theme} ${type}`">
    <div class="gl-broadcast-message-content">
      <div class="gl-broadcast-message-icon">
        <gl-icon :name="iconName" />
      </div>
      <div class="gl-broadcast-message-text">
        <h2 class="gl-sr-only">Admin message</h2>
        <!-- @slot The broadcast message's text -->
        <slot></slot>
      </div>
    </div>
    <close-button
      v-if="showDismissButton"
      ref="dismiss"
      class="gl-broadcast-message-dismiss"
      :label="dismissLabel"
      @click="onDismiss"
    />
  </div>
</template>
