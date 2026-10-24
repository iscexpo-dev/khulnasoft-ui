import { uniqueId } from 'lodash-es';
import { formInputWidths, formStateOptions } from '../../../../utils/constants';
import GlFormGroup from '../form_group/form_group.vue';
import { formSelectOptions } from './constants';
import GlFormSelect from './form_select.vue';

const data = () => ({
  selected: 'Pizza',
});

const template = `
<gl-form-group :label="labelText" :label-for="inputId">
  <gl-form-select
    :id="inputId"
    v-model="selected"
    :aria-invalid="ariaInvalid"
    :autofocus="autofocus"
    :disabled="disabled"
    :form="form"
    :name="name"
    :options="options"
    :required="required"
    :select-class="selectClass"
    :state="state"
    :width="width"
  ></gl-form-select>
</gl-form-group>
`;

const generateProps = ({
  inputId = uniqueId('input-'),
  labelText = 'Label',
  ariaInvalid = null,
  autofocus = null,
  disabled = false,
  form = null,
  name = null,
  options = formSelectOptions,
  required = null,
  selectClass = null,
  state = null,
  width = null,
} = {}) => ({
  inputId,
  labelText,
  ariaInvalid,
  autofocus,
  disabled,
  form,
  name,
  options,
  required,
  selectClass,
  state,
  width,
});

const Template = (args) => ({
  components: { GlFormSelect, GlFormGroup },
  props: Object.keys(args),
  data,
  template,
});

export const Default = Template.bind({});
Default.args = generateProps();

export const Disabled = Template.bind({});
Disabled.args = generateProps({ disabled: true });

export const ValidState = Template.bind({});
ValidState.args = generateProps({ state: true });

export const InvalidState = Template.bind({});
InvalidState.args = generateProps({ state: false });

export const WithTruncation = (args, { argTypes }) => ({
  components: { GlFormSelect, GlFormGroup },
  props: Object.keys(argTypes),
  data() {
    return {
      selected: 1,
    };
  },
  template: `
    <div style="max-width: 300px;">
      ${template}
    </div>
    `,
});
WithTruncation.args = generateProps({
  options: [
    {
      value: 1,
      text: 'A form select option with a very looooooooong label',
    },
  ],
});

export const Widths = (args, { argTypes }) => ({
  components: { GlFormSelect, GlFormGroup },
  props: Object.keys(argTypes),
  data() {
    return {
      formInputWidths,
    };
  },
  template: `
      <div>
        <gl-form-group v-for="(width, name) in formInputWidths" :key="width" :label="name" :label-for="'width-' + width">
          <gl-form-select
            :id="'width-' + width"
            v-model="name"
            :width="width"
            :options="[{ value: name, text: name }]">
          </gl-form-select>
        </gl-form-group>
      </div>`,
});
Widths.args = generateProps();

export default {
  title: 'base/form/form-select',
  component: GlFormSelect,
  parameters: {
    controls: {
      // These are deprecated, so don't show them.
      exclude: ['selectSize', 'plain', 'size', 'htmlField', 'multiple'],
    },

    docs: {
      description: {
        component:
          'See [Pajamas Design System documentation](https://design.khulnasoft.com/components/select) for usage and implementation details.',
      },
    },
  },
  argTypes: {
    width: {
      options: formInputWidths,
      control: 'select',
    },
    state: {
      options: formStateOptions,
      control: 'select',
    },
  },
};
