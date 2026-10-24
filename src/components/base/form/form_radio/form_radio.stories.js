import GlFormRadio from './form_radio.vue';

const defaultOptions = [
  { value: 'Option', name: 'radio-group' },
  { value: 'Slot option', name: 'radio-group', slot: 'With help text.' },
  { value: 'Checked option', name: 'radio-group' },
  {
    value: 'Checked disabled option',
    disabled: true,
    name: 'last-radio-group',
    checked: 'Checked disabled option',
  },
  { value: 'Disabled option', disabled: true, name: 'radio-group' },
  {
    value: 'Disabled option with help text',
    disabled: true,
    name: 'radio-group',
    slot: 'With help text.',
  },
  { value: 'Indeterminate option', name: 'indeterminate-radio-group' },
  { value: 'Indeterminate disabled option', disabled: true, name: 'indeterminate-radio-group' },
];

const template = `
<div>
  <gl-form-radio
    v-for="option in options"
    :key="option.value"
    :checked="option.checked || checked"
    :disabled="option.disabled"
    :name="option.name || name"
    :value="option.value"
  >
    {{ option.value }}
    <template v-if="option.slot" #help>{{ option.slot }}</template>
  </gl-form-radio>
</div>
`;

const generateProps = ({ checked = 'Checked option' } = {}) => ({
  checked,
});

const Template = (args) => ({
  components: { GlFormRadio },
  props: Object.keys(args),
  template,
  data() {
    return {
      options: defaultOptions,
    };
  },
});

export const Default = Template.bind({});
Default.args = generateProps();

export default {
  title: 'base/form/form-radio',
  component: GlFormRadio,
  parameters: {
    docs: {
      description: {
        component:
          'See [Pajamas Design System documentation](https://design.khulnasoft.com/components/radio-button) for usage and implementation details.',
      },
    },
  },
  argTypes: {
    checked: {
      options: defaultOptions.map(({ value }) => value),
      control: 'select',
    },
  },
};
