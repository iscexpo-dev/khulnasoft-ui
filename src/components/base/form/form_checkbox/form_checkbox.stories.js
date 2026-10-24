import GlFormCheckbox from './form_checkbox.vue';
import GlFormCheckboxGroup from './form_checkbox_group.vue';

const components = {
  GlFormCheckbox,
  GlFormCheckboxGroup,
};

const data = () => ({
  selected: ['checked-option', 'checked-disabled-option'],
});

const template = `
<div>
  <gl-form-checkbox-group v-model="selected" :state="state">
    <gl-form-checkbox value="option">Option</gl-form-checkbox>
    <gl-form-checkbox value="slot-option">
      Slot option
      <template #help> With help text. </template>
    </gl-form-checkbox>
    <gl-form-checkbox value="checked-option">Checked option</gl-form-checkbox>
    <gl-form-checkbox value="checked-disabled-option" :disabled="true">Checked disabled option</gl-form-checkbox>
    <gl-form-checkbox value="disabled-option" :disabled="true">Disabled option</gl-form-checkbox>
    <gl-form-checkbox value="disabled-option-with-help-text" :disabled="true">
      Disabled option
      <template #help> With help text. </template>
    </gl-form-checkbox>
    <template #first>
      <gl-form-checkbox value="first">First</gl-form-checkbox>
    </template>
  </gl-form-checkbox-group>
  <gl-form-checkbox value="indeterminate-option" :indeterminate="indeterminate">Indeterminate option</gl-form-checkbox>
  <gl-form-checkbox value="indeterminate-disabled-option" :indeterminate="indeterminate" :disabled="true">Indeterminate disabled option</gl-form-checkbox>
</div>
`;

const Template = (args, { argTypes }) => ({
  props: Object.keys(argTypes),
  components,
  data,
  template,
});

export const Default = Template.bind({});
Default.args = { indeterminate: true };

const Single = (args, { argTypes }) => ({
  props: Object.keys(argTypes),
  components,
  template: `
    <div>
      <gl-form-checkbox value="checked-option" checked="checked-option">Checked option</gl-form-checkbox>
    </div>
  `,
});

export const SingleCheckbox = Single.bind({});

export default {
  title: 'base/form/form checkbox',
  component: GlFormCheckbox,
  parameters: {
    docs: {
      description: {
        component:
          'See [Pajamas Design System documentation](https://design.khulnasoft.com/components/checkbox) for usage and implementation details.',
      },
    },
  },
};
