import { GlLineChart } from '../../../charts';
import { mockAnnotationsSeries, mockAnnotationsConfigs } from '../../../utils/charts/mock_data';
import { timeSeriesDateFormatter } from '../../../utils/charts/utils';
import { generateTimeSeries } from '../../../utils/data_utils';
import { disableControls } from '../../../utils/stories_utils';

const components = {
  GlLineChart,
};
const defaultData = [
  {
    name: 'Requested',
    data: [
      ['Mon', 1184],
      ['Tue', 1346],
      ['Wed', 1035],
      ['Thu', 1226],
      ['Fri', 1421],
      ['Sat', 1347],
      ['Sun', 1035],
    ],
  },
  {
    name: 'Actual',
    data: [
      ['Mon', 1509],
      ['Tue', 1275],
      ['Wed', 1187],
      ['Thu', 1287],
      ['Fri', 1098],
      ['Sat', 1457],
      ['Sun', 1452],
    ],
  },
  {
    name: 'Predicted',
    data: [
      ['Mon', 1041],
      ['Tue', 1468],
      ['Wed', 1273],
      ['Thu', 1503],
      ['Fri', 1209],
      ['Sat', 1416],
      ['Sun', 1213],
    ],
  },
];

const defaultOptions = {
  animation: false,
  xAxis: {
    name: 'Time',
    type: 'category',
  },
};

const template = (content = '') => `<gl-line-chart
  :data="data"
  :option="option"
  :thresholds="thresholds"
  :annotations="annotations"
  :includeLegendAvgMax="includeLegendAvgMax"
  :showLegend="showLegend"
  :height="height"
  :click-to-pin-tooltip="clickToPinTooltip"
  >
    ${content}
  </gl-line-chart>`;

const generateProps = ({
  data = defaultData,
  option = defaultOptions,
  thresholds = [],
  annotations = [],
  includeLegendAvgMax = true,
  showLegend = true,
  height = null,
  clickToPinTooltip = false,
} = {}) => ({
  showLegend,
  includeLegendAvgMax,
  option,
  thresholds,
  annotations,
  data,
  height,
  clickToPinTooltip,
});

const Template = (_args, { argTypes }) => ({
  props: Object.keys(argTypes),
  components,
  template: template(),
});

export const Default = Template.bind({});
Default.args = generateProps();

export const WithThreshold = Template.bind({});
WithThreshold.args = generateProps({
  thresholds: [{ threshold: 1350, operator: '>' }],
});

export const WithAnnotationsAsProps = Template.bind({});
WithAnnotationsAsProps.storyName = 'with annotations as props (recommended)';
WithAnnotationsAsProps.args = generateProps({
  ...mockAnnotationsConfigs,
  data: [
    {
      name: 'Time Series',
      data: generateTimeSeries(),
    },
  ],
  option: {
    animation: false,
    xAxis: {
      type: 'time',
      name: 'Time',
      axisLabel: {
        formatter: timeSeriesDateFormatter,
      },
    },
  },
});

export const WithAnnotationsAsOptionSeries = Template.bind({});
WithAnnotationsAsOptionSeries.args = generateProps({
  data: [
    {
      name: 'Time Series',
      data: generateTimeSeries(),
    },
  ],
  option: {
    ...mockAnnotationsSeries,
    animation: false,
    xAxis: {
      type: 'time',
      name: 'Time',
      axisLabel: {
        formatter: timeSeriesDateFormatter,
      },
    },
  },
});

export const WithZoomAndScroll = Template.bind({});
WithZoomAndScroll.args = generateProps({
  data: [
    {
      name: 'Time Series',
      data: generateTimeSeries(),
    },
  ],
  option: {
    animation: false,
    xAxis: {
      type: 'time',
      name: 'Time',
      axisLabel: {
        formatter: timeSeriesDateFormatter,
      },
    },
    dataZoom: [
      {
        type: 'slider',
        startValue: '2018-03-01T00:00:00.000',
      },
    ],
  },
});

export const WithToolbox = Template.bind({});
WithToolbox.args = generateProps({
  option: {
    animation: false,
    xAxis: {
      name: 'Time',
      type: 'category',
    },
    toolbox: { show: true },
  },
});

export const NoLegend = Template.bind({});
NoLegend.args = generateProps({
  data: [
    {
      name: 'Time Series',
      data: generateTimeSeries(),
    },
  ],
  option: {
    animation: false,
    xAxis: {
      type: 'time',
      name: 'Time',
      axisLabel: {
        formatter: timeSeriesDateFormatter,
      },
    },
  },
  showLegend: false,
});

export const WithCustomTooltip = (_args, { argTypes }) => ({
  props: Object.keys(argTypes),
  components,
  template: template(`
    <template #tooltip-title="{ params }">{{params && params.value}}</template>
    <template #tooltip-content="{ params }">
      <div v-for="p in params && params.seriesData">{{p.seriesName}}: {{p.value[1]}}</div>
    </template>
  `),
});
WithCustomTooltip.args = generateProps();
WithCustomTooltip.tags = ['skip-visual-test'];

export const WithClickToPinTooltip = (_args, { argTypes }) => ({
  props: Object.keys(argTypes),
  components,
  template: template(`
    <template #tooltip-title="{ params }">{{params && params.value}}</template>
    <template #tooltip-content="{ params }">
      <div v-for="p in params && params.seriesData"><strong>{{p.seriesName}}:</strong> <a href="javascript:void(0)">{{p.value[1]}}</a></div>
    </template>
  `),
});
WithClickToPinTooltip.args = generateProps({
  clickToPinTooltip: true,
});
WithClickToPinTooltip.tags = ['skip-visual-test'];

export default {
  title: 'charts/line-chart',
  component: GlLineChart,
  parameters: {
    docs: {
      description: {
        component:
          'See [Pajamas Design System documentation](https://design.khulnasoft.com/data-visualization/charts) for usage and implementation details.',
      },
    },
  },
  argTypes: {
    ...disableControls([
      'formatTooltipText',
      'legendAverageText',
      'legendMaxText',
      'legendMinText',
      'legendCurrentText',
      'legendLayout',
    ]),
  },
};
