import GlInputGroupText from '../input_group_text/input_group_text.vue';
import { propDefaultFactory, disableControls } from '../../../../utils/stories_utils';
import GlFormInputGroup from './form_input_group.vue';

const template = `
  <gl-form-input-group
    :readonly="readonly"
    :select-on-click="selectOnClick"
    :predefined-options="predefinedOptions"
    :label="label"
    :inputClass="inputClass">
    <template #prepend v-if="prepend">
      <gl-input-group-text>{{prepend}}</gl-input-group-text>
    </template>
    <template #append v-if="append">
      <gl-input-group-text>{{append}}</gl-input-group-text>
    </template>
  </gl-form-input-group>
`;

const defaultValue = propDefaultFactory(GlFormInputGroup);

const generateProps = ({
  prepend = 'Username',
  append = 'Add',
  readonly = false,
  selectOnClick = false,
  predefinedOptions = defaultValue('predefinedOptions'),
  label = 'label',
  inputClass = '',
} = {}) => ({
  prepend,
  append,
  readonly,
  selectOnClick,
  predefinedOptions,
  label,
  inputClass,
});

const Template = (args, { argTypes }) => ({
  components: { GlFormInputGroup, GlInputGroupText },
  props: Object.keys(argTypes),
  template,
});

export const Default = Template.bind({});
Default.args = generateProps();

export const PredefinedOptions = Template.bind({});
PredefinedOptions.args = generateProps({
  prepend: '',
  predefinedOptions: [
    { name: 'Embed', value: 'https://embed.com' },
    { name: 'Share', value: 'https://share.org' },
  ],
});

export default {
  title: 'base/form/form-input-group',
  component: GlFormInputGroup,
  parameters: {
    docs: {
      description: {
        component:
          'See [Pajamas Design System documentation](https://design.khulnasoft.com/components/form-input-group) for usage and implementation details.',
      },
    },
  },
  argTypes: {
    ...disableControls(['value']),
    prepend: {
      control: 'text',
    },
    append: {
      control: 'text',
    },
    inputClass: {
      control: 'text',
    },
    label: {
      control: 'text',
    },
  },
};
