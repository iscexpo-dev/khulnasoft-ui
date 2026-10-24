import { propDefaultFactory } from '../../../utils/stories_utils';
import { viewModeOptions, loadingIconSizes, loadingIconVariants } from '../../../utils/constants';
import GlLoadingIcon from './loading_icon.vue';

const template = `
  <div :class="['gl-p-3', 'gl-rounded-default', 'gl-text-center', { 'gl-bg-gray-950' : color === 'light' } ]" >
    <gl-loading-icon
      :label="label"
      :size="size"
      :inline="inline"
      :color="color"
      :variant="variant"
    />Loading
  </div>
`;

const defaultValue = propDefaultFactory(GlLoadingIcon);

const generateProps = () => ({
  label: defaultValue('label'),
  size: defaultValue('size'),
  color: defaultValue('color'),
  inline: defaultValue('inline'),
  variant: defaultValue('variant'),
});

const Template = (args) => ({
  components: { GlLoadingIcon },
  props: Object.keys(args),
  template,
});

export const Default = Template.bind({});
Default.args = generateProps();

export default {
  title: 'base/loading icon',
  component: GlLoadingIcon,
  parameters: {
    docs: {
      description: {
        component:
          'See [Pajamas Design System documentation](https://design.khulnasoft.com/components/spinner) for usage and implementation details.',
      },
    },
  },
  argTypes: {
    color: {
      options: viewModeOptions,
      control: 'select',
    },
    size: {
      options: loadingIconSizes,
      control: 'select',
    },
    variant: {
      options: loadingIconVariants,
      control: 'select',
    },
  },
};
