import { times } from 'lodash-es';
import { GlAreaChart } from '../../../charts';
import { mockAnnotationsSeries, mockAnnotationsConfigs } from '../../../utils/charts/mock_data';
import { GL_COLOR_DATA_AQUA_500, GL_COLOR_DATA_ORANGE_600 } from '../../../tokens/build/js/tokens';
import { timeSeriesDateFormatter } from '../../../utils/charts/utils';
import { generateTimeSeries } from '../../../utils/data_utils';
import { disableControls } from '../../../utils/stories_utils';

const components = {
  GlAreaChart,
};
const defaultData = [
  {
    name: 'First Series',
    data: [
      ['Mon', 1220],
      ['Tue', 932],
      ['Wed', 901],
      ['Thu', 934],
      ['Fri', 1290],
      ['Sat', 1330],
      ['Sun', 1320],
    ],
  },
];

const defaultOptions = {
  xAxis: {
    name: 'Time',
    type: 'category',
  },
};

const template = (content) => `<gl-area-chart
  :data="data"
  :option="option"
  :thresholds="thresholds"
  :annotations="annotations"
  :includeLegendAvgMax="includeLegendAvgMax"
  :height="height"
  :legendSeriesInfo="legendSeriesInfo"
  >
    ${content}
  </gl-area-chart>`;

const generateProps = ({
  data = defaultData,
  option = defaultOptions,
  thresholds = [],
  annotations = [],
  includeLegendAvgMax = true,
  height = null,
  legendSeriesInfo = [],
} = {}) => ({
  data,
  option,
  thresholds,
  annotations,
  includeLegendAvgMax,
  height,
  legendSeriesInfo,
});

const Template = (args, { argTypes }) => ({
  components,
  props: Object.keys(argTypes),
  template: template(),
});

export const Default = Template.bind({});
Default.args = generateProps();

export const WithThreshold = Template.bind({});
WithThreshold.args = generateProps({
  thresholds: [{ threshold: 1200, operator: '>' }],
});

export const WithAnnotationsAsProps = Template.bind({});
WithAnnotationsAsProps.storyName = 'With annotations as props (recommended)';
WithAnnotationsAsProps.args = generateProps({
  ...mockAnnotationsConfigs,
  data: [
    {
      name: 'Time Series',
      data: generateTimeSeries(),
    },
  ],
  option: {
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
    xAxis: {
      type: 'time',
      name: 'Time',
      axisLabel: {
        formatter: timeSeriesDateFormatter,
      },
    },
    dataZoom: [
      {
        startValue: '2018-03-01T00:00:00.000',
      },
    ],
  },
});

export const WithToolbox = Template.bind({});
WithToolbox.args = generateProps({
  option: {
    xAxis: {
      name: 'Time',
      type: 'category',
    },
    toolbox: { show: true },
  },
});

export const MultSeries = Template.bind({});
MultSeries.args = generateProps({
  data: times(10, (index) => ({
    name: index,
    data: defaultData[0].data.map(([label, value]) => [label, value * index]),
  })),
});

export const WithCustomLegendItems = Template.bind({});
WithCustomLegendItems.args = generateProps({
  legendSeriesInfo: [
    {
      name: 'Custom Legend Item 1',
      type: 'solid',
      color: GL_COLOR_DATA_ORANGE_600,
      data: [10, 20],
    },
    {
      name: 'Custom Legend Item 2',
      type: 'solid',
      color: GL_COLOR_DATA_AQUA_500,
      data: [30, 50],
    },
  ],
});

export const WithCustomTooltip = (_args, { argTypes }) => ({
  props: Object.keys(argTypes),
  components,
  template: template(`
    <template #tooltip-title="{ params }">{{params && params.value}}</template>
    <template #tooltip-content="{ params }">
      <div v-if="params">{{params.seriesData[0].seriesName}}: {{params.seriesData[0].value[1]}}</div>
    </template>
  `),
});
WithCustomTooltip.args = generateProps();
WithCustomTooltip.tags = ['skip-visual-test'];

export default {
  title: 'charts/area-chart',
  component: GlAreaChart,
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
      'dataSeries',
      'formatTooltipText',
      'legendAverageText',
      'legendMaxText',
      'legendMinText',
      'legendCurrentText',
      'legendLayout',
    ]),
  },
};
