import { GlStackedColumnChart } from '../../../charts';
import {
  mockDefaultStackedLineData,
  mockDefaultStackedBarData,
  mockSecondaryData,
  mockMultiStackBarData,
} from '../../../utils/charts/mock_data';
import { stackedPresentationOptions } from '../../../utils/constants';
import {
  GL_COLOR_DATA_ORANGE_600,
  GL_COLOR_DATA_AQUA_500,
  GL_COLOR_DATA_GREEN_600,
  GL_COLOR_DATA_MAGENTA_500,
} from '../../../tokens/build/js/tokens';

const components = { GlStackedColumnChart };

const template = (content) => `
  <gl-stacked-column-chart
    :bars="bars"
    :lines="lines"
    :option="option"
    :presentation="presentation"
    :group-by="groupBy"
    :x-axis-type="xAxisType"
    :x-axis-title="xAxisTitle"
    :y-axis-title="yAxisTitle"
    :secondary-data="secondaryData"
    :secondary-data-title="secondaryDataTitle"
    :height="height"
    :custom-palette="customPalette"
    :includeLegendAvgMax="includeLegendAvgMax"
    :click-to-pin-tooltip="clickToPinTooltip"
  >
    ${content}
  </gl-stacked-column-chart>
`;

const mockSecondaryDataTitle = 'Merges';

const generateProps = ({
  bars = mockDefaultStackedBarData,
  lines = [],
  option = {},
  groupBy = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  xAxisType = 'category',
  xAxisTitle = 'January - December 2018',
  yAxisTitle = 'Commits',
  presentation = stackedPresentationOptions.stacked,
  secondaryData = [],
  secondaryDataTitle = '',
  height = null,
  customPalette,
  includeLegendAvgMax = true,
  clickToPinTooltip = false,
} = {}) => ({
  bars,
  lines,
  option,
  presentation,
  groupBy,
  xAxisType,
  xAxisTitle,
  yAxisTitle,
  secondaryDataTitle,
  secondaryData,
  height,
  customPalette,
  includeLegendAvgMax,
  clickToPinTooltip,
});

const Template = (args, { argTypes }) => ({
  components,
  props: Object.keys(argTypes),
  template: template(),
});

export const Default = Template.bind({});
Default.args = generateProps();

export const Tiled = Template.bind({});
Tiled.args = generateProps({ presentation: stackedPresentationOptions.tiled });

export const WithMultipleStacks = Template.bind({});
WithMultipleStacks.args = generateProps({
  bars: mockMultiStackBarData,
});

export const StackedWithLineData = Template.bind({});
StackedWithLineData.args = generateProps({ lines: mockDefaultStackedLineData });

export const TiledWithLineData = Template.bind({});
TiledWithLineData.args = generateProps({
  presentation: stackedPresentationOptions.tiled,
  lines: mockDefaultStackedLineData,
});

export const WithZoomAndScroll = Template.bind({});
WithZoomAndScroll.args = generateProps({
  option: {
    dataZoom: [
      {
        startValue: 1,
      },
    ],
  },
});

export const WithToolbox = Template.bind({});
WithToolbox.args = generateProps({
  option: { toolbox: { show: true } },
});

export const SecondaryYAxis = Template.bind({});
SecondaryYAxis.args = generateProps({
  secondaryData: mockSecondaryData,
  secondaryDataTitle: mockSecondaryDataTitle,
});

export const SecondaryYAxisLine = Template.bind({});
SecondaryYAxisLine.args = generateProps({
  secondaryData: [{ ...mockSecondaryData[0], type: 'line' }],
  secondaryDataTitle: mockSecondaryDataTitle,
});

export const WithCustomColorPalette = Template.bind({});
WithCustomColorPalette.args = generateProps({
  customPalette: [
    GL_COLOR_DATA_ORANGE_600,
    GL_COLOR_DATA_AQUA_500,
    GL_COLOR_DATA_GREEN_600,
    GL_COLOR_DATA_MAGENTA_500,
  ],
});

export const WithoutLegendValues = Template.bind({});
WithoutLegendValues.args = generateProps({ includeLegendAvgMax: false });

export const WithCustomTooltip = (_args, { argTypes }) => ({
  components,
  props: Object.keys(argTypes),
  template: template(`
    <template #tooltip-title="{ params }">Month: {{params && params.value}}</template>
    <template #tooltip-content="{ params }">
      <div v-for="p in params && params.seriesData">{{p.seriesName}}: {{p.value}}</div>
    </template>
  `),
});
WithCustomTooltip.args = generateProps();
WithCustomTooltip.tags = ['skip-visual-test'];

export const WithCustomTooltipValue = (_args, { argTypes }) => ({
  components,
  props: Object.keys(argTypes),
  template: template(`
    <template #tooltip-value="{value}">
      {{ value.toFixed(2) }} commits
    </template>
  `),
});
WithCustomTooltipValue.args = generateProps();
WithCustomTooltipValue.tags = ['skip-visual-test'];

export const WithClickToPinTooltip = (_args, { argTypes }) => ({
  components,
  props: Object.keys(argTypes),
  template: template(`
    <template #tooltip-title="{ params }">Month: {{params && params.value}}</template>
    <template #tooltip-content="{ params }">
      <div v-for="p in params && params.seriesData">{{p.seriesName}}: <a href="javascript:void(0)">{{p.value}}</a></div>
    </template>
  `),
});
WithClickToPinTooltip.args = generateProps({
  clickToPinTooltip: true,
});
WithClickToPinTooltip.tags = ['skip-visual-test'];

export default {
  title: 'charts/stacked-column-chart',
  component: GlStackedColumnChart,
  parameters: {
    docs: {
      description: {
        component:
          'See [Pajamas Design System documentation](https://design.khulnasoft.com/data-visualization/charts) for usage and implementation details.',
      },
    },
  },
};
