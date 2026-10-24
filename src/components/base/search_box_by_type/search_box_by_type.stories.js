import { propDefaultFactory, disableControls } from '../../../utils/stories_utils';
import GlSearchBoxByType from './search_box_by_type.vue';

const template = `
  <gl-search-box-by-type
    v-model="searchQuery"
    :borderless="borderless"
    :clear-button-title="clearButtonTitle"
    :disabled="disabled"
    :is-loading="isLoading"
    :placeholder="placeholder"
  />
`;

const defaultValue = propDefaultFactory(GlSearchBoxByType);

const generateProps = ({
  borderless = defaultValue('borderless'),
  clearButtonTitle = defaultValue('clearButtonTitle'),
  disabled = defaultValue('disabled'),
  placeholder = 'Search',
  isLoading = defaultValue('isLoading'),
} = {}) => ({
  borderless,
  clearButtonTitle,
  disabled,
  placeholder,
  isLoading,
});

const Template = (args, { argTypes }) => ({
  components: {
    GlSearchBoxByType,
  },
  props: Object.keys(argTypes),
  data: () => ({ searchQuery: '' }),
  template,
});

export const Default = Template.bind({});
Default.args = generateProps();

export const Borderless = Template.bind({});
Borderless.args = generateProps({
  borderless: true,
});

export default {
  title: 'base/search-box-by-type',
  component: GlSearchBoxByType,
  parameters: {
    docs: {
      description: {
        component:
          'See [Pajamas Design System documentation](https://design.khulnasoft.com/components/search) for usage and implementation details.',
      },
    },
  },
  argTypes: {
    ...disableControls(['value']),
  },
};
