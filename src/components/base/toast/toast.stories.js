import { userEvent, within, waitFor, expect } from '@storybook/test';
import Vue from 'vue';
import GlButton from '../button/button.vue';
import GlToast from './toast.vue';
import { GlToastPlugin } from '.';

Vue.use(GlToastPlugin);

const play = async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  const button = canvas.getByRole('button');
  await userEvent.click(button);
  await waitFor(() => expect(within(canvasElement).getByRole('button')).toHaveFocus());
  await waitFor(() => expect(within(document).getByRole('status')).toBeVisible());
};

function makeStory({ buttonText, toastShowArgs }) {
  const story = (args, { argTypes }) => ({
    props: Object.keys(argTypes),
    components: { GlButton },
    template: `
      <gl-button @click="showToast()">
        ${buttonText}
      </gl-button>`,
    beforeDestroy() {
      // It seems that in Vue 2, toasts are automatically removed when the
      // parent component is destroyed. In Vue 3, that appears not to happen,
      // for some reason
      //
      // Ideally that underlying problem would be fixed, but in practice, it
      // shouldn't be much of a problem, since toasts auto-hide eventually
      // anyway.
      //
      // This matters in the visual tests because we switch stories between
      // taking screenshots, which means that toast(s) from the previous story
      // might still be present. This meant that the `getByRole('status')`
      // query of the `play` function was failing, since more than one toast
      // was present sometimes.
      //
      // So, we explicitly hide toasts when the stories are destroyed.
      while (this.toasts.length > 0) {
        this.toasts.pop().hide();
      }
    },
    created() {
      this.toasts = [];
    },
    methods: {
      showToast() {
        const [message, options = {}] = toastShowArgs;
        this.toasts.push(
          this.$toast.show(message, { ...options, autoHideDelay: this.autoHideDelay }),
        );
      },
    },
  });

  return Object.assign(story, { play });
}

export const Default = makeStory({
  buttonText: 'Show default toast',
  toastShowArgs: ['This is the default toast.'],
});

export const WithButtonAction = makeStory({
  buttonText: 'Show toast with actions',
  toastShowArgs: [
    'This is a toast with an action.',
    {
      action: {
        text: 'Undo',
        onClick: () => {},
      },
    },
  ],
});

export const WithHrefAction = makeStory({
  buttonText: 'Show toast with a link',
  toastShowArgs: [
    'This is a toast with a link.',
    {
      action: {
        text: 'Follow the rabbit',
        href: 'some-url',
      },
    },
  ],
});

export const WithLongContent = makeStory({
  buttonText: 'Show toast with a long content',
  toastShowArgs: [
    'This is a toast with a long content and an action. Notice how the text wraps to multiple lines when the max-width is reached.',
    {
      action: {
        text: 'Undo action',
        onClick: () => {},
      },
    },
  ],
});

export default {
  title: 'base/toast',
  component: GlToast,
  args: {
    autoHideDelay: 5000,
  },
  argTypes: {
    autoHideDelay: {
      control: { type: 'number', min: 1000, step: 500 },
      description: 'Duration in milliseconds before the toast auto-hides (minimum 1000).',
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          'See [Pajamas Design System documentation](https://design.khulnasoft.com/components/toast) for usage and implementation details.',
      },
    },
  },
};
