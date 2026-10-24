import { progressBarVariantOptions } from '../../../utils/constants';
import GlProgressBar from './progress_bar.vue';

const generateProps = ({
  value = 30,
  variant = progressBarVariantOptions.primary,
  height,
  max = 100,
} = {}) => ({
  value,
  variant,
  height,
  max,
});

const Template = (args, { argTypes }) => ({
  components: { GlProgressBar },
  props: Object.keys(argTypes),
  template: '<gl-progress-bar :value="value" :variant="variant" :height="height" :max="max" />',
});

export const Default = Template.bind({});
Default.args = generateProps();

export const Variants = (args, { argTypes = {} }) => ({
  props: Object.keys(argTypes),
  components: { GlProgressBar },
  variants: Object.keys(progressBarVariantOptions),
  template: `
      <div class="gl-flex gl-flex-col gl-gap-3">
        <template v-for="variant in $options.variants">
          <gl-progress-bar :value="value" :variant="variant" />
        </template>
      </div>
    `,
});
Variants.args = generateProps();
Variants.parameters = { controls: { disable: true } };

export default {
  title: 'base/progress-bar',
  component: GlProgressBar,
  parameters: {
    docs: {
      description: {
        component:
          'See [Pajamas Design System documentation](https://design.khulnasoft.com/components/progress-bar) for usage and implementation details.',
      },
    },
  },
  argTypes: {
    variant: {
      options: progressBarVariantOptions,
      control: 'select',
    },
  },
};
