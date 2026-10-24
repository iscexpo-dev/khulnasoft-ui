import { GlSparklineChart } from '../../../charts';
import { colorFromDefaultPalette } from '../../../utils/charts/theme';
import { makeContainer } from '../../../utils/story_decorators/container';

const chartData = [
  ['Mon', 10],
  ['Tue', 15],
  ['Wed', 9],
  ['Thu', 22],
  ['Fri', 29],
  ['Sat', 20],
  ['Sun', 18],
];

const customGradient = [
  colorFromDefaultPalette(0),
  colorFromDefaultPalette(1),
  colorFromDefaultPalette(2),
];

const generateProps = ({
  data = chartData,
  height = 50,
  tooltipLabel = 'tooltipLabel',
  showLastYValue = true,
  connectNulls = false,
  gradient,
  smooth,
} = {}) => ({
  data,
  height,
  tooltipLabel,
  showLastYValue,
  connectNulls,
  gradient,
  smooth,
});

const Template = (args) => ({
  components: { GlSparklineChart },
  props: Object.keys(args),
  template: `
    <gl-sparkline-chart
      :data="data"
      :height="height"
      :tooltip-label="tooltipLabel"
      :show-last-y-value="showLastYValue"
      :connect-nulls="connectNulls"
      :gradient="gradient"
      :smooth="smooth"
    />
  `,
});

export const Default = Template.bind({});
Default.args = generateProps();

export const WithoutLastYValue = Template.bind({});
WithoutLastYValue.args = generateProps({ showLastYValue: false });
WithoutLastYValue.tags = ['skip-visual-test'];

export const WithChartColorGradient = Template.bind({});
WithChartColorGradient.args = generateProps({ gradient: customGradient });

export const WithSmoothing = Template.bind({});
WithSmoothing.args = generateProps({ smooth: 0.5 });
WithSmoothing.tags = ['skip-visual-test'];

export const AutoHeight = Template.bind({});
Object.assign(AutoHeight, {
  args: generateProps({
    height: 'auto',
  }),
  decorators: [makeContainer({ height: '300px' })],
});

export default {
  title: 'charts/sparkline-chart',
  component: GlSparklineChart,
  parameters: {
    docs: {
      description: {
        component:
          'See [Pajamas Design System documentation](https://design.khulnasoft.com/data-visualization/charts) for usage and implementation details.',
      },
    },
  },
};
