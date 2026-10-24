import { toggleLabelPosition } from '../../../utils/constants';
import { propDefaultFactory, disableControls } from '../../../utils/stories_utils';
import GlToggle from './toggle.vue';

const defaultValue = propDefaultFactory(GlToggle);

const withDescription = 'An explanation for what the toggle does.';

const longHelp = `This is a toggle component with a long help message.
  You can notice how the text wraps when the width of the container
  is not enough to fix the entire text.`;

const generateProps = ({
  value = true,
  disabled = defaultValue('disabled'),
  accessibleDisabled = defaultValue('accessibleDisabled'),
  isLoading = defaultValue('isLoading'),
  label = 'Label',
  labelId = 'example-toggle',
  description = '',
  help = 'Toggle something for the website.',
  labelPosition = defaultValue('labelPosition'),
} = {}) => ({
  value,
  disabled,
  accessibleDisabled,
  isLoading,
  label,
  labelId,
  description,
  help,
  labelPosition,
});

const Template = (args, { argTypes }) => ({
  components: { GlToggle },
  props: Object.keys(argTypes),
  data() {
    return {
      localValue: this.value,
    };
  },
  watch: {
    value(newValue) {
      this.localValue = newValue;
    },
  },
  template: `
  <div class="gl-text-base">
    <gl-toggle
      v-model="localValue"
      :disabled="disabled"
      :accessible-disabled="accessibleDisabled"
      :description="description"
      :help="help"
      :label-id="labelId"
      :is-loading="isLoading"
      :label="label"
      :label-position="labelPosition"
    />
  </div>`,
});

export const Default = Template.bind({});
Default.args = generateProps();

export const WithDescription = Template.bind({});
WithDescription.args = generateProps({
  description: withDescription,
});

export const WithLongHelp = Template.bind({});
WithLongHelp.args = generateProps({
  help: longHelp,
});

export const LabelPositionLeft = Template.bind({});
LabelPositionLeft.args = generateProps({
  labelPosition: 'left',
});

export const WithCustomClass = (args, { argTypes }) => ({
  components: { GlToggle },
  props: Object.keys(argTypes),
  data() {
    return {
      localValue: this.value,
    };
  },
  watch: {
    value(newValue) {
      this.localValue = newValue;
    },
  },
  template: `
  <div class="gl-text-base" style="width: 200px;">
    <gl-toggle
      class="gl-justify-between"
      v-model="localValue"
      :disabled="disabled"
      :description="description"
      :help="help"
      :label-id="labelId"
      :is-loading="isLoading"
      :label="label"
      :label-position="labelPosition"
    />
  </div>`,
});
WithCustomClass.args = generateProps({
  labelPosition: 'left',
});

export const AllVariants = (args, { argTypes = {} }) => ({
  components: { GlToggle },
  props: Object.keys(argTypes),
  states: [
    { label: 'On', value: true },
    { label: 'Off', value: false },
    { label: 'On disabled', value: true, disabled: true },
    { label: 'Off disabled', value: false, disabled: true },
    { label: 'Loading on', value: true, isLoading: true },
    { label: 'Loading off', value: false, isLoading: true },
  ],
  template: `
    <div class="gl-flex gl-flex-col gl-gap-5 gl-items-start">
      <gl-toggle
        v-for="state in $options.states"
        :key="state.label"
        :value="state.value"
        :disabled="!!state.disabled"
        :is-loading="!!state.isLoading"
        :label="state.label"
      />
    </div>
  `,
});
AllVariants.parameters = { controls: { disable: true } };

export default {
  title: 'base/toggle',
  component: GlToggle,
  parameters: {
    docs: {
      description: {
        component:
          'See [Pajamas Design System documentation](https://design.khulnasoft.com/components/toggle) for usage and implementation details.',
      },
    },
  },
  argTypes: {
    ...disableControls(['name']),
    labelPosition: {
      options: Object.keys(toggleLabelPosition),
      control: 'select',
    },
    label: {
      control: 'text',
    },
    description: {
      control: 'text',
    },
    help: {
      control: 'text',
    },
  },
};
