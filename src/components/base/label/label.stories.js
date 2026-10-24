import { userEvent, within, waitFor, expect } from '@storybook/test';
import { tooltipPlacements } from '../../../utils/constants';
import GlLabel from './label.vue';

const template = `
  <div class="gl-flex">
    <gl-label
      :background-color="backgroundColor"
      :title="title"
      :description="description"
      :tooltip-placement="tooltipPlacement"
      :target="target"
      :scoped="scoped"
      :show-close-button="showCloseButton"
      :disabled="disabled"
      :footer="footer"
    />
  </div>`;

const Template = (args, { argTypes }) => ({
  components: { GlLabel },
  props: Object.keys(argTypes),
  template,
});

const generateProps = ({
  title = 'Label title',
  tooltipPlacement = tooltipPlacements.top,
  scoped = false,
  description = '',
  target = '#',
  backgroundColor = '#D9C2EE',
  showCloseButton = false,
  disabled = false,
  footer = '',
} = {}) => ({
  backgroundColor,
  title,
  description,
  tooltipPlacement,
  target,
  scoped,
  showCloseButton,
  disabled,
  footer,
});

export const Default = Template.bind({});
Default.args = generateProps();

export const Scoped = Template.bind({});
Scoped.args = generateProps({ title: 'scoped::label', scoped: true });

export const WithCloseButton = Template.bind({});
WithCloseButton.args = generateProps({ showCloseButton: true });

export const WithoutTarget = Template.bind({});
WithoutTarget.args = generateProps({ target: '' });

export const WithFooter = Template.bind({});
WithFooter.args = generateProps({ footer: 'Footer text', description: 'Description text' });
WithFooter.play = async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  const link = canvas.getByRole('link');
  await userEvent.click(link);
  await waitFor(() => expect(link).toHaveFocus());
  await waitFor(() => expect(within(document).getByRole('tooltip')).toBeVisible());
};

export default {
  title: 'base/label',
  component: GlLabel,
  parameters: {
    docs: {
      description: {
        component:
          'See [Pajamas Design System documentation](https://design.khulnasoft.com/components/label) for usage and implementation details.',
      },
    },
  },
  argTypes: {
    backgroundColor: {
      control: 'color',
    },
    tooltipPlacement: {
      options: tooltipPlacements,
      control: 'select',
    },
  },
};
