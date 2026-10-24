import { GlColumnChart } from "../../../charts";
import {
  mockDefaultLineData,
  mockDefaultBarData,
  mockDefaultStackedBarData,
  mockSecondaryBarData,
  mockSecondaryTrendlineData,
} from "../../../utils/charts/mock_data";

const template = (content = "") => `
  <gl-column-chart
    :bars="bars"
    :lines="lines"
    :secondary-data="secondaryData"
    :option="option"
    :y-axis-title="yAxisTitle"
    :secondary-data-title="secondaryDataTitle"
    :x-axis-title="xAxisTitle"
    :x-axis-type="xAxisType"
    :height="height"
  >
    ${content}
  </gl-column-chart>
  `;

const generateProps = ({
  bars = mockDefaultBarData,
  lines = [],
  option = {},
  yAxisTitle = "Pushes per day",
  xAxisTitle = "User",
  xAxisType = "category",
  secondaryData = [],
  secondaryDataTitle = "",
  height = null,
} = {}) => ({
  bars,
  lines,
  option,
  yAxisTitle,
  xAxisTitle,
  xAxisType,
  secondaryData,
  secondaryDataTitle,
  height,
});

const Template = (args, { argTypes }) => ({
  components: { GlColumnChart },
  props: Object.keys(argTypes),
  template: template(),
});

export const Default = Template.bind({});
Default.args = generateProps();

export const WithLineSeries = Template.bind({});
WithLineSeries.args = generateProps({
  lines: mockDefaultLineData,
});

export const WithZoomAndScroll = Template.bind({});
WithZoomAndScroll.args = generateProps({
  option: {
    dataZoom: [
      {
        type: "slider",
        startValue: 1,
      },
    ],
  },
});

export const WithToolbox = Template.bind({});
WithToolbox.args = generateProps({
  option: { toolbox: { show: true } },
});

export const MultipleBarSeries = Template.bind({});
MultipleBarSeries.args = generateProps({
  bars: mockDefaultStackedBarData.slice(0, 2),
});
MultipleBarSeries.parameters = {
  docs: {
    description: {
      story:
        "When series share a unit, use a single axis rather than `secondary-data` — a legend renders automatically whenever there is more than one series.",
    },
  },
};

export const SecondaryYAxis = Template.bind({});
SecondaryYAxis.args = generateProps({
  secondaryData: mockSecondaryBarData,
  secondaryDataTitle: "New bar data",
});
SecondaryYAxis.parameters = {
  docs: {
    description: {
      story:
        "Reserve the secondary axis for series at different magnitudes or units. A legend renders automatically to identify each series. See [work item 3467](https://github.com/khulnasoft/khulnasoft-ui/issues/3467).",
    },
  },
};

export const SecondaryYAxisLine = Template.bind({});
SecondaryYAxisLine.args = generateProps({
  secondaryData: mockSecondaryTrendlineData,
  secondaryDataTitle: "New line data",
});

export const WithCustomTooltip = (args, { argTypes }) => ({
  components: { GlColumnChart },
  props: Object.keys(argTypes),
  template: template(`
    <template #tooltip-title="{ params }">Custom tooltip title: {{params && params.value}}</template>
    <template #tooltip-content="{ params }">
      <div v-for="p in params && params.seriesData">Wow so custom: {{p.seriesName}}: {{p.value[1]}}</div>
    </template>
  `),
});
WithCustomTooltip.args = generateProps();
WithCustomTooltip.tags = ["skip-visual-test"];

export default {
  title: "charts/column-chart",
  component: GlColumnChart,
  parameters: {
    docs: {
      description: {
        component:
          "See [Pajamas Design System documentation](https://design.khulnasoft.com/data-visualization/charts) for usage and implementation details.",
      },
    },
  },
};
