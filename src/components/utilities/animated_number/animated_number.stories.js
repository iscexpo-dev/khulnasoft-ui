import { propDefaultFactory } from '../../../utils/stories_utils';
import GlAnimatedNumber from './animated_number.vue';

const template = `
  <div>
    <gl-animated-number :number="updatedNumber" :decimalPlaces="decimalPlaces" :use-delimiters="useDelimiters" :duration="duration" :animateOnMount="animateOnMount"/>
    <button @click="updateNumber">Update number</button>
  </div>
`;

const defaultValue = propDefaultFactory(GlAnimatedNumber);

const generateProps = ({
  initialNumber = 100,
  decimalPlaces = defaultValue('decimalPlaces'),
  useDelimiters = false,
  duration = 1000,
  animateOnMount = defaultValue('animateOnMount'),
} = {}) => ({
  initialNumber,
  decimalPlaces,
  useDelimiters,
  duration,
  animateOnMount,
});

const Template = (args, { argTypes }) => ({
  components: { GlAnimatedNumber },
  props: Object.keys(argTypes),
  template,
  data() {
    return {
      updatedNumber: this.initialNumber,
    };
  },
  methods: {
    updateNumber() {
      this.updatedNumber = Math.floor(Math.random() * 100);
    },
  },
});

export const InitialAnimate = Template.bind({});
InitialAnimate.args = generateProps({
  animateOnMount: true,
});

export const Default = Template.bind({});
Default.args = generateProps();

export default {
  title: 'utilities/animated-number',
  component: GlAnimatedNumber,
  parameters: {
    docs: {
      description: {
        component:
          'See [Pajamas Design System documentation](https://design.khulnasoft.com/components/utility-animated-number) for usage and implementation details.',
      },
    },
  },
  argTypes: {},
  tags: ['skip-visual-test'],
};
