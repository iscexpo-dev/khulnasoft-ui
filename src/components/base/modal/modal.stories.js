import { userEvent, within, waitFor, expect } from '@storybook/test';
import { GlModalDirective } from '../../../directives/modal';
import GlButton from '../button/button.vue';
import BVueReadme from '../../../vendor/bootstrap-vue/src/components/modal/README.md';
import GlModal from './modal.vue';

const play =
  (expectFinalState = () => Promise.resolve()) =>
  async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button');
    await userEvent.click(button);
    await expectFinalState();
  };

const generateTemplate = ({ props = {}, slots = {} } = {}) => {
  const extraProps = Object.entries(props)
    .map(([key, value]) => `:${key}="${value}"`)
    .join('\n        ');

  return `
    <div>
      <gl-button v-gl-modal-directive="'test-modal-id'" category="primary" variant="confirm">
        Open modal
      </gl-button>
      <gl-modal
        ${extraProps}
        :action-primary="{text: 'Okay'}"
        :action-secondary="{text: 'Discard Changes'}"
        :action-cancel="{text: 'Cancel'}"
        :scrollable="scrollable"
        :no-focus-on-show="noFocusOnShow"
        :header-tag="headerTag"
        :footer-tag="footerTag"
        modal-id="test-modal-id"
        title="Example title"
        no-fade
      >
      <p v-for="n in contentParagraphs">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
      </p>
      ${Object.entries(slots).map(
        ([slot, contents]) => `<template #${slot}>${contents}</template>`,
      )}
      </gl-modal>
    </div>
  `;
};

const Template = (args, { argTypes, viewMode }) => ({
  components: { GlModal, GlButton },
  directives: { GlModalDirective },
  props: Object.keys(argTypes),
  template: generateTemplate(),
  viewMode,
});

const generateProps = ({
  contentPagraphs = 1,
  scrollable = false,
  noFocusOnShow = false,
} = {}) => ({
  contentParagraphs: contentPagraphs,
  scrollable,
  noFocusOnShow,
});

export const Default = Template.bind({});
Default.args = generateProps();
Default.play = play(() =>
  waitFor(() =>
    expect(
      within(within(document).getByRole('dialog')).getByRole('button', { name: 'Cancel' }),
    ).toHaveFocus(),
  ),
);

export const WithScrollingContent = Template.bind({});
WithScrollingContent.args = generateProps({
  contentPagraphs: 100,
  scrollable: true,
});
WithScrollingContent.play = play(() =>
  waitFor(() =>
    expect(
      within(within(document).getByRole('dialog')).getByRole('button', { name: 'Cancel' }),
    ).toHaveFocus(),
  ),
);

export const WithAHeader = (args, { argTypes, viewMode }) => ({
  components: { GlModal, GlButton },
  directives: { GlModalDirective },
  props: Object.keys(argTypes),
  template: generateTemplate({
    slots: {
      'modal-header': '<h4>A custom header</h4>',
    },
  }),
  viewMode,
});
WithAHeader.args = generateProps();
WithAHeader.play = play(() =>
  waitFor(() =>
    expect(
      within(within(document).getByRole('dialog')).getByRole('button', { name: 'Cancel' }),
    ).toHaveFocus(),
  ),
);

export const WithoutAFooter = (args, { argTypes, viewMode }) => ({
  components: { GlModal, GlButton },
  directives: { GlModalDirective },
  props: Object.keys(argTypes),
  template: generateTemplate({
    props: { 'hide-footer': true },
  }),
  viewMode,
});
WithoutAFooter.args = generateProps();
WithoutAFooter.play = play(() =>
  waitFor(() =>
    expect(
      within(within(document).getByRole('dialog')).getByRole('button', { name: 'Close' }),
    ).toHaveFocus(),
  ),
);

export const WithoutFocus = Template.bind({});
WithoutFocus.args = generateProps({
  noFocusOnShow: true,
});
WithoutFocus.play = play();

export default {
  title: 'base/modal',
  component: GlModal,
  directives: { GlModalDirective },
  parameters: {
    bootstrapComponent: 'b-modal',
    bootstrapDocs: BVueReadme,
    docs: {
      description: {
        component:
          'See [Pajamas Design System documentation](https://design.khulnasoft.com/components/modal) for usage and implementation details.',
      },
    },
  },
};
