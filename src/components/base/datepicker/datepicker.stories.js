import { userEvent, within, waitFor, expect } from '@storybook/test';
import GlFormGroup from '../form/form_group/form_group.vue';
import { datepickerWidthOptionsMap } from '../../../utils/constants';
import { disableControls } from '../../../utils/stories_utils';
import { useFakeDate } from '../../../utils/use_fake_date';
import { makeContainer } from '../../../utils/story_decorators/container';
import GlDatepicker from './datepicker.vue';

const defaults = {
  components: { GlFormGroup, GlDatepicker },
  mixins: [useFakeDate()],
};

// The year is set manually to avoid snapshot changes.
const currentYear = 2026;
const defaultDate = new Date(currentYear, 0, 15);
const defaultMinDate = new Date(currentYear, 0, 1);
const defaultMaxDate = new Date(currentYear, 2, 31);

const generateProps = ({
  minDate = defaultMinDate,
  maxDate = defaultMaxDate,
  disabled = false,
  state = true,
} = {}) => ({
  minDate,
  maxDate,
  disabled,
  state,
});

export const Default = (_args, { argTypes }) => ({
  ...defaults,
  props: Object.keys(argTypes),
  data() {
    return {
      pickerValue: defaultDate,
    };
  },
  template: `<gl-datepicker :max-date="new Date(maxDate)" :min-date="new Date(minDate)" v-model="pickerValue" :disabled="disabled" :state="state"/>`,
});
Default.args = generateProps();
Default.play = async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  const button = canvas.getByRole('button', { name: 'Open datepicker' });
  await userEvent.click(button);
  await waitFor(() => expect(button).toHaveFocus());
  await waitFor(() => expect(within(canvasElement).getByRole('grid')).toBeVisible());
};

export const CustomTrigger = (_args, { argTypes }) => ({
  ...defaults,
  props: Object.keys(argTypes),
  data() {
    return {
      pickerValue: null,
    };
  },
  template: `
    <div>
      <div class="dropdown">
        <button type="button" class="dropdown-menu-toggle">
          <span class="dropdown-toggle-text"> Start date: {{value}} </span>
        </button>
      </div>
      <gl-datepicker v-model="pickerValue" target=".dropdown-menu-toggle" :container="null" />
    </div>`,
});
CustomTrigger.args = generateProps();

export const WithClearButton = (_args, { argTypes }) => ({
  ...defaults,
  props: Object.keys(argTypes),
  data() {
    return {
      pickerValue: defaultDate,
    };
  },
  template: `<gl-datepicker showClearButton :max-date="new Date(maxDate)" :min-date="new Date(minDate)" v-model="pickerValue" />`,
});
WithClearButton.args = generateProps();

export const Widths = (_args, { argTypes }) => ({
  ...defaults,
  props: Object.keys(argTypes),
  data() {
    return {
      datepickerWidthOptionsMap,
      pickerValue: defaultDate,
    };
  },
  template: `
    <div class="gl-flex gl-flex-col gl-gap-3">
      <gl-form-group label="Width: sm">
        <gl-datepicker showClearButton :max-date="new Date(maxDate)" :min-date="new Date(minDate)" v-model="pickerValue" width="sm" />
      </gl-form-group>
      <gl-form-group label="Width: md (default)">
        <gl-datepicker showClearButton :max-date="new Date(maxDate)" :min-date="new Date(minDate)" v-model="pickerValue" width="md" />
      </gl-form-group>
      <gl-form-group label="Width: lg">
        <gl-datepicker showClearButton :max-date="new Date(maxDate)" :min-date="new Date(minDate)" v-model="pickerValue" width="lg" />
      </gl-form-group>
      <gl-form-group label="Width: xl">
        <gl-datepicker showClearButton :max-date="new Date(maxDate)" :min-date="new Date(minDate)" v-model="pickerValue" width="xl" />
      </gl-form-group>
    </div>
  `,
});
Widths.args = generateProps();

export default {
  title: 'base/datepicker',
  component: GlDatepicker,
  parameters: {
    docs: {
      description: {
        component:
          'See [Pajamas Design System documentation](https://design.khulnasoft.com/components/date-picker) for usage and implementation details.',
      },
    },
  },
  decorators: [makeContainer({ height: '280px' })],
  argTypes: {
    ...disableControls([
      'target',
      'container',
      'value',
      'startRange',
      'endRange',
      'disableDayFn',
      'firstDay',
      'ariaLabel',
      'placeholder',
      'autocomplete',
      'displayField',
      'startOpened',
      'defaultDate',
      'i18n',
      'theme',
      'showClearButton',
      'inputId',
      'inputLabel',
      'inputName',
    ]),
    minDate: {
      control: 'date',
    },
    maxDate: {
      control: 'date',
    },
    width: {
      options: datepickerWidthOptionsMap,
      control: 'select',
    },
  },
};
