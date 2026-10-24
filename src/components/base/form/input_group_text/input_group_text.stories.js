import GlInputGroupText from './input_group_text.vue';

const generateProps = (props = {}) => ({
  ...props,
});

const Template = (args) => ({
  components: { GlInputGroupText },
  props: Object.keys(args),
  template: `
      <gl-input-group-text>Some text</gl-input-group-text>
    `,
});

export const Default = Template.bind({});
Default.args = generateProps();

export default {
  title: 'base/form/input-group-text',
  component: GlInputGroupText,
  parameters: {
    controls: { disable: true },
  },
};
