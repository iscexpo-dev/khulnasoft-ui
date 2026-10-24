import { propDefaultFactory } from '../../../utils/stories_utils';
import { alignOptions } from '../../../utils/constants';
import GlPagination from './pagination.vue';

const components = { GlPagination };

const defaultValue = propDefaultFactory(GlPagination);

const generateProps = ({
  value = 3,
  align = defaultValue('align'),
  linkGen = defaultValue('linkGen'),
  nextPage = defaultValue('nextPage'),
  perPage = 10, // Existing stories/shots used this value instead of the default
  prevPage = defaultValue('prevPage'),
  totalItems = 200, // The component's default value of 0 is for compact pagination, which most stories here do not use.
} = {}) => ({
  value,
  align,
  linkGen,
  nextPage,
  perPage,
  prevPage,
  totalItems,
});

const template = `
  <gl-pagination
    v-model="currentPage"
    :align="align"
    :link-gen="linkGen"
    :next-page="nextPage"
    :per-page="perPage"
    :prev-page="prevPage"
    :total-items="totalItems"
  />
`;

const defaults = (args) => ({
  data() {
    return {
      currentPage: args.value,
      alignOptions,
    };
  },
  watch: {
    initialPage(value) {
      this.value = value;
    },
  },
});

export const Default = (args, { argTypes }) => ({
  components,
  props: Object.keys(argTypes),
  ...defaults(args),
  template,
});
Default.args = generateProps();

export const LinkBased = (args, { argTypes }) => ({
  components,
  props: Object.keys(argTypes),
  ...defaults(args),
  template,
});
LinkBased.args = generateProps({ linkGen: (page) => `/page/${page}` });

export const AlignCenter = (args, { argTypes }) => ({
  components,
  props: Object.keys(argTypes),
  ...defaults(args),
  template,
});
AlignCenter.args = generateProps({ align: alignOptions.center });

export const AlignRight = (args, { argTypes }) => ({
  components,
  props: Object.keys(argTypes),
  ...defaults(args),
  template,
});
AlignRight.args = generateProps({ align: alignOptions.right });

export default {
  title: 'base/pagination',
  component: GlPagination,
  parameters: {
    docs: {
      description: {
        component:
          'See [Pajamas Design System documentation](https://design.khulnasoft.com/components/pagination) for usage and implementation details.',
      },
    },
  },
  argTypes: {
    align: {
      options: Object.values(alignOptions),
      control: 'select',
    },
  },
};
