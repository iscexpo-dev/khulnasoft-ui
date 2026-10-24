import GlColorModeToggle from './color_mode_toggle.vue';

const Template = (args, { argTypes }) => ({
  components: { GlColorModeToggle },
  props: Object.keys(argTypes),
  data() {
    return {
      darkMode: this.isDarkMode,
    };
  },
  watch: {
    isDarkMode(newValue) {
      this.darkMode = newValue;
    },
  },
  template: `
    <gl-color-mode-toggle
      :is-dark-mode="darkMode"
      @toggle="darkMode = !darkMode"
    />
  `,
});

export const Default = Template.bind({});
Default.args = {
  isDarkMode: false,
};

export default {
  title: 'base/color_mode_toggle',
  component: GlColorModeToggle,
  argTypes: {
    isDarkMode: {
      control: 'boolean',
      description: 'Whether dark mode is currently active',
    },
  },
};
