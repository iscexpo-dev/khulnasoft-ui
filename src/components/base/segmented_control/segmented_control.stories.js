import GlSegmentedControl from './segmented_control.vue';

const defaultOptions = [
  { value: 'pizza', text: 'Pizza' },
  { value: 'tacos', text: 'Tacos' },
  { value: 'burger', text: 'Burger', disabled: true },
];

const generateProps = ({ options = defaultOptions, initSelected = 'tacos' } = {}) => ({
  options,
  initSelected,
});

export const Default = (args, { argTypes }) => ({
  components: { GlSegmentedControl },
  props: Object.keys(argTypes),
  data() {
    return {
      selected: this.initSelected,
    };
  },
  watch: {
    initSelected(val) {
      this.selected = val;
    },
  },
  template: `
    <gl-segmented-control
      :options="options"
      v-model="selected"
    />
    `,
});
Default.args = generateProps();

export const WithButtonContentSlot = (args, { argTypes }) => ({
  components: { GlSegmentedControl },
  props: Object.keys(argTypes),
  data() {
    return {
      selected: this.initSelected,
    };
  },
  watch: {
    initSelected(val) {
      this.selected = val;
    },
  },
  template: `
    <gl-segmented-control
      :options="options"
      v-model="selected"
    >
      <template #button-content="option">
        Slot Content - {{ option.text }}
      </template>
    </gl-segmented-control>
    `,
});
WithButtonContentSlot.args = generateProps();

export default {
  title: 'base/segmented control',
  component: GlSegmentedControl,
  argTypes: {
    initSelected: {
      options: Object.values(defaultOptions)
        .filter(({ disabled }) => !disabled)
        .map(({ value }) => value),
      control: 'radio',
      table: {
        disable: true,
      },
    },
  },
};
