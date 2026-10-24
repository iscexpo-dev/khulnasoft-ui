import { formInputWidths } from '../../../../utils/constants';
import GlFormGroup from '../form_group/form_group.vue';
import GlFormInput from './form_input.vue';

const template = `
<gl-form-group :label="labelText" :label-for="inputId">
  <gl-form-input
    :id="inputId"
    :type="type"
    :readonly="readonly"
    :disabled="disabled"
    :value="value"
    :width="width"
    :state="state"
    :placeholder="placeholder"
  />
</gl-form-group>`;

const generateProps = ({
  inputId = 'input-id',
  width = GlFormInput.props.width.default,
  value = '',
  disabled = false,
  readonly = false,
  labelText = 'Label',
  type = 'text',
  state = true,
  placeholder = 'Placeholder',
} = {}) => ({
  labelText,
  inputId,
  width,
  value,
  disabled,
  readonly,
  type,
  state,
  placeholder,
});

const Template = (args) => ({
  components: { GlFormInput, GlFormGroup },
  props: Object.keys(args),
  template,
});

export const Default = Template.bind({});
Default.args = generateProps({
  value: 'some text',
  labelText: 'Default',
});

export const Disabled = Template.bind({});
Disabled.args = generateProps({
  value: 'some text',
  disabled: true,
  labelText: 'Disabled',
});

export const Readonly = Template.bind({});
Readonly.args = generateProps({ value: 'readonly text', readonly: true, labelText: 'Readonly' });

export const NumberInput = Template.bind({});
NumberInput.args = generateProps({
  value: '42',
  labelText: 'Number input',
  type: 'number',
});
NumberInput.tags = ['skip-visual-test'];

export const Widths = (args, { argTypes }) => ({
  components: { GlFormInput, GlFormGroup },
  props: Object.keys(argTypes),
  data: () => ({
    formInputWidths,
  }),
  template: `
  <div>
    <gl-form-group v-for="(width, name) in formInputWidths" :key="width" :label="name" :label-for="'width-' + width">
      <gl-form-input
          :id="'width-' + width"
          :value="name"
          :width="width"
          class="gl-mb-4"
      />
    </gl-form-group>
  </div>`,
});
Widths.args = {};

export const ResponsiveWidths = (args, { argTypes }) => ({
  components: { GlFormInput, GlFormGroup },
  props: Object.keys(argTypes),
  template: `
      <div>
        <gl-form-group label="Default" label-for="responsive-widths-1">
          <gl-form-input
            id="responsive-widths-1"
            :width="{ default: 'md', md: 'lg', lg: 'xl' }"
            value="With \`default\` key"
            class="gl-mb-4"
          />
        </gl-form-group>

        <gl-form-group label="Without default" label-for="responsive-widths-2">
          <gl-form-input
            id="responsive-widths-2"
            :width="{ md: 'lg', lg: 'xl' }"
            value="Without \`default\` key"
          />
        </gl-form-group>
      </div>`,
});
ResponsiveWidths.args = {};

export default {
  title: 'base/form/form-input',
  component: GlFormInput,
  parameters: {
    docs: {
      description: {
        component:
          'See [Pajamas Design System documentation](https://design.khulnasoft.com/components/text-input) for usage and implementation details.',
      },
    },
  },
  argTypes: {
    width: {
      options: formInputWidths,
      control: 'select',
    },
  },
};
