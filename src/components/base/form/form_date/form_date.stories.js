import { propDefaultFactory } from '../../../../utils/stories_utils';
import GlFormGroup from '../form_group/form_group.vue';
import GlFormDate from './form_date.vue';

const defaultValue = propDefaultFactory(GlFormDate);

const template = `
<gl-form-group :label="labelText" :label-for="inputId">
  <gl-form-date
    :id="inputId"
    v-model="localValue"
    :disabled="disabled"
    :min="min"
    :max="max"
    :min-invalid-feedback="minInvalidFeedback"
    :max-invalid-feedback="maxInvalidFeedback"
    :readonly="readonly"
    :value="value"
  />
</gl-form-group>`;

const generateProps = ({
  inputId = 'input-id',
  labelText = 'Label',
  disabled = false,
  min = '',
  max = '',
  minInvalidFeedback = defaultValue('minInvalidFeedback'),
  maxInvalidFeedback = defaultValue('maxInvalidFeedback'),
  readonly = false,
  value = '',
} = {}) => ({
  inputId,
  labelText,
  disabled,
  min,
  max,
  minInvalidFeedback,
  maxInvalidFeedback,
  readonly,
  value,
});

const Template = (args) => ({
  components: { GlFormDate, GlFormGroup },
  props: Object.keys(args),
  watch: {
    value(newValue) {
      this.localValue = newValue;
    },
  },
  data() {
    return {
      localValue: this.value,
    };
  },
  template,
});

export const Default = Template.bind({});
Default.args = generateProps();

export const Disabled = Template.bind({});
Disabled.args = generateProps({ disabled: true });

export const DisabledValue = Template.bind({});
DisabledValue.args = generateProps({
  disabled: true,
  value: '2020-01-19',
});

export const MinMaxDates = Template.bind({});
MinMaxDates.args = generateProps({
  min: '2020-01-01',
  max: '2020-01-31',
  minInvalidFeedback: 'Must be after 2020-01-01.',
  maxInvalidFeedback: 'Must be before 2020-01-31.',
});

export const Readonly = Template.bind({});
Readonly.args = generateProps({
  readonly: true,
  value: '2020-01-19',
});

export const Value = Template.bind({});
Value.args = generateProps({ value: '2020-01-15' });

export const InvalidDate = Template.bind({});
InvalidDate.args = generateProps({
  min: '2020-01-01',
  max: '2020-01-31',
  minInvalidFeedback: 'Must be after 2020-01-01.',
  maxInvalidFeedback: 'Must be before 2020-01-31.',
  value: '2020-02-02',
});

export default {
  title: 'base/form/form-date',
  component: GlFormDate,
  parameters: {
    docs: {
      description: {
        component:
          'See [Pajamas Design System documentation](https://design.khulnasoft.com/components/date-picker) for usage and implementation details.',
      },
    },
  },
};
