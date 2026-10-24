import { GlDiscreteScatterChart } from '../../../charts';

const Template = (args, { argTypes }) => ({
  components: { GlDiscreteScatterChart },
  props: Object.keys(argTypes),
  template: `
  <gl-discrete-scatter-chart
    :data="data"
    :option="option"
    :y-axis-title="yAxisTitle"
    :x-axis-title="xAxisTitle"
    data-testid="discrete-scatter-chart"
    :height="height"
    :disableTooltip="disableTooltip"
  />
`,
});

const generateProps = ({
  data = [
    {
      type: 'scatter',
      data: [
        ['19 May', 6.95],
        ['20 May', 7.58],
        ['21 May', 8.81],
        ['22 May', 8.33],
        ['23 May', 9.96],
        ['24 May', 7.24],
        ['25 May', 4.26],
      ],
    },
  ],
  option = {},
  yAxisTitle = 'Pushes per day',
  xAxisTitle = 'Date',
  height = null,
} = {}) => ({
  data,
  option,
  yAxisTitle,
  xAxisTitle,
  height,
});

export const Default = Template.bind({});
Default.args = generateProps();

export const WithZoomAndScroll = Template.bind({});
WithZoomAndScroll.args = generateProps({
  option: {
    dataZoom: [
      {
        type: 'slider',
        startValue: 1,
      },
    ],
  },
});

export default {
  title: 'charts/discrete-scatter-chart',
  component: GlDiscreteScatterChart,
  parameters: {
    docs: {
      description: {
        component:
          'See [Pajamas Design System documentation](https://design.khulnasoft.com/data-visualization/charts) for usage and implementation details.',
      },
    },
  },
};
