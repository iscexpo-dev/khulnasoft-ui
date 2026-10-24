import iconSpriteInfo from '@gitlab/svgs/dist/icons.json';
import { iconSizeOptions, iconVariantOptions } from '../../../utils/constants';
import { propDefaultFactory, disableControls } from '../../../utils/stories_utils';
import GlIcon from './icon.vue';

const components = {
  GlIcon,
};

const defaultValue = propDefaultFactory(GlIcon);

const generateProps = ({
  ariaLabel = 'This is an icon',
  name = 'check-circle',
  size = defaultValue('size'),
  variant = defaultValue('variant'),
} = {}) => ({
  ariaLabel,
  name,
  size,
  variant,
});

const template = `<gl-icon :aria-label="ariaLabel" :name="name" :size="size" :variant="variant" />`;

const Template = (args) => ({
  components,
  props: Object.keys(args),
  template,
});

export const Default = Template.bind({});
Default.args = generateProps();

export default {
  title: 'base/icon',
  component: GlIcon,
  parameters: {
    docs: {
      description: {
        component:
          'See [Pajamas Design System documentation](https://design.khulnasoft.com/product-foundations/iconography) for usage and implementation details.',
      },
    },
  },
  tags: ['skip-visual-test'],
  argTypes: {
    ...disableControls(['useDeprecatedSizes']),
    name: {
      options: iconSpriteInfo.icons,
      control: 'select',
    },
    size: {
      options: iconSizeOptions,
      control: 'select',
    },
    variant: {
      options: Object.keys(iconVariantOptions),
      control: 'select',
    },
  },
};
