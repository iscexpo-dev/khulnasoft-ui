import GlIntersperse from './intersperse.vue';

const template = `
  <div>
    <gl-intersperse :separator="separator" :lastSeparator="lastSeparator">
      <span v-for="item in items">{{ item }}</span>
    </gl-intersperse>
  </div>
  `;

const generateProps = ({
  separator = ', ',
  lastSeparator = '',
  items = ['Foo', 'Bar', 'Baz', 'Qaz'],
} = {}) => ({
  separator,
  lastSeparator,
  items,
});

const Template = (args, { argTypes }) => ({
  components: {
    GlIntersperse,
  },
  props: Object.keys(argTypes),
  template,
});

export const Default = Template.bind({});
Default.args = generateProps();

export default {
  title: 'utilities/intersperse',
  component: GlIntersperse,
  parameters: {
    docs: {
      description: {
        component:
          'See [Pajamas Design System documentation](https://design.khulnasoft.com/components/utility-intersperse) for usage and implementation details.',
      },
    },
  },
};

export const CustomSeparator = Template.bind({});
CustomSeparator.args = generateProps({
  separator: '-',
});

export const CustomLastSeparator = Template.bind({});
CustomLastSeparator.args = generateProps({
  lastSeparator: ' and ',
});
