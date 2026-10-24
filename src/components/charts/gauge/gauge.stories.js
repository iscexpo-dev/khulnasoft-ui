import GlGauge from './gauge.vue';

const template = `
  <gl-gauge
    :value="value"
    :min="min"
    :max="max"
    :thresholds="thresholds"
    :text="text"
    :split-number="splitNumber"
    :option="option"
    :height="height"
  />
`;

const generateProps = ({
  value = 48,
  min = 0,
  max = 100,
  text = '',
  option = {},
  thresholds = [38, 82],
  splitNumber = 10,
  height = null,
} = {}) => ({
  option,
  value,
  min,
  max,
  thresholds,
  text,
  splitNumber,
  height,
});

const Template = (args, { argTypes }) => ({
  components: { GlGauge },
  props: Object.keys(argTypes),
  template,
});

export const Default = Template.bind({});
Default.args = generateProps();

export const OneThreshold = Template.bind({});
OneThreshold.args = generateProps({
  value: 65,
  thresholds: [85],
});

export const TwoThresholds = Template.bind({});
TwoThresholds.args = generateProps({
  value: 90,
  thresholds: [60, 85],
});

export const NoThresholds = Template.bind({});
NoThresholds.args = generateProps({
  value: 90,
  thresholds: [],
});

export const WithCustomDetailText = Template.bind({});
WithCustomDetailText.args = generateProps({
  value: 90,
  text: '90Mbps',
  thresholds: [60, 85],
});

export const WithNaNValues = Template.bind({});
WithNaNValues.args = generateProps({
  min: 'not a number value',
  max: 'not a number value',
  value: 'not a number value',
  thresholds: [60, 85],
});

export const WithToolbox = Template.bind({});
WithToolbox.args = generateProps({
  option: { toolbox: { show: true } },
});

export default {
  title: 'charts/gauge-chart',
  component: GlGauge,
  parameters: {
    docs: {
      description: {
        component:
          'See [Pajamas Design System documentation](https://design.khulnasoft.com/data-visualization/charts) for usage and implementation details.',
      },
    },
  },
};
