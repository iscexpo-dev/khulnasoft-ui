import { GlChart, GlChartLegend } from '../../../charts';
import { HEIGHT_AUTO_CLASSES, LEGEND_LAYOUT_TABLE } from '../../../utils/charts/constants';
import { generateSeriesData } from '../../../utils/charts/story_config';
import {
  SERIES_NAME_SHORT,
  SERIES_NAME_LONG,
  SERIES_NAME_LONG_WITHOUT_SPACES,
} from '../../../utils/stories_constants';

const generateOptions = (seriesLength, seriesNameType) => {
  return {
    legend: {
      show: false,
    },
    xAxis: {
      type: 'category',
      data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    },
    yAxis: {
      type: 'value',
    },
    series: generateSeriesData(seriesLength, seriesNameType).map((data) => ({
      color: data.color,
      data: data.data,
      name: data.name,
      showSymbol: true,
      type: 'line',
    })),
    animation: false,
  };
};

const generateSeriesInfo = (amount, nameType) => {
  const seriesData = generateSeriesData(amount, nameType);

  return seriesData.map((item) => ({
    type: 'solid',
    name: item.name,
    color: item.color,
    data: item.data,
  }));
};

const generateTemplate = (type, wrapperAttrs = {}, chartAttrs = {}) => {
  const layoutTypeAttribute =
    type === LEGEND_LAYOUT_TABLE ? `:layout="'${LEGEND_LAYOUT_TABLE}'"` : '';

  return `<div v-bind='${JSON.stringify(wrapperAttrs)}'>
    <gl-chart
      :options="$options.options"
      v-bind='${JSON.stringify(chartAttrs)}'
      @created="onCreated"
    />
    <gl-chart-legend
      v-if="chart"
      ${layoutTypeAttribute}
      :chart="chart"
      :series-info="$options.seriesInfo"
    />
  </div>`;
};

const components = {
  GlChart,
  GlChartLegend,
};

const baseStoryOptions = {
  props: {},
  components,
  data() {
    return {
      chart: null,
    };
  },
  methods: {
    onCreated(chart) {
      this.chart = chart;
    },
  },
};

const disabledLegendItem = {
  type: 'solid',
  name: 'Disabled Item',
  color: 'var(--gl-chart-axis-line-color)',
  disabled: true,
};

const getStoryOptions = (seriesLength, seriesNameType, legendLayoutType) => {
  return {
    ...baseStoryOptions,
    options: generateOptions(seriesLength, seriesNameType),
    seriesInfo: generateSeriesInfo(seriesLength, seriesNameType),
    template: generateTemplate(legendLayoutType),
  };
};

export const Default = () => getStoryOptions(10, SERIES_NAME_SHORT);
export const DefaultWithDisabledLegendItem = () => {
  const storyOptions = getStoryOptions(10, SERIES_NAME_SHORT);

  storyOptions.seriesInfo = [...storyOptions.seriesInfo, disabledLegendItem];

  return storyOptions;
};
export const DefaultWithLongSeriesNames = () => getStoryOptions(10, SERIES_NAME_LONG);

export const DefaultWithLongSeriesNamesAndNoSpaces = () =>
  getStoryOptions(10, SERIES_NAME_LONG_WITHOUT_SPACES);

export const DefaultWithOverflowingFixedContainerHeight = () => {
  const storyOptions = getStoryOptions(50, SERIES_NAME_LONG_WITHOUT_SPACES, null);

  storyOptions.template = generateTemplate(
    null,
    {
      class: HEIGHT_AUTO_CLASSES, // line, area, heatmap etc charts all have these classes on the wrapper element in auto height mode
      style: 'height: 400px; overflow: hidden; outline: 1px solid red;', // Simulate being inside a dashboard panel with fixed height and no overflow
    },
    {
      height: 'auto',
      class: 'gl-grow', // line, area, heatmap etc charts all have gl-grow on the <gl-chart> element in auto height mode
    },
  );

  return storyOptions;
};

export const WithTabularLayout = () => getStoryOptions(10, SERIES_NAME_SHORT, LEGEND_LAYOUT_TABLE);
export const WithTabularLayoutAndDisabledLegendItem = () => {
  const storyOptions = getStoryOptions(10, SERIES_NAME_SHORT, LEGEND_LAYOUT_TABLE);

  storyOptions.seriesInfo = [...storyOptions.seriesInfo, disabledLegendItem];

  return storyOptions;
};
export const WithTabularLayoutAndLongSeriesNames = () =>
  getStoryOptions(10, SERIES_NAME_LONG, LEGEND_LAYOUT_TABLE);
export const WithTabularLayoutAndLongSeriesNamesWithNoSpaces = () =>
  getStoryOptions(10, SERIES_NAME_LONG_WITHOUT_SPACES, LEGEND_LAYOUT_TABLE);

export const WithTabularOverflowingFixedContainerHeight = () => {
  const storyOptions = getStoryOptions(50, SERIES_NAME_LONG_WITHOUT_SPACES, LEGEND_LAYOUT_TABLE);

  storyOptions.template = generateTemplate(
    LEGEND_LAYOUT_TABLE,
    {
      class: HEIGHT_AUTO_CLASSES, // line, area, heatmap etc charts all have these classes on the wrapper element in auto height mode
      style: 'height: 400px; overflow: hidden; outline: 1px solid red;', // Simulate being inside a dashboard panel with fixed height and no overflow
    },
    {
      height: 'auto',
      class: 'gl-grow', // line, area, heatmap etc charts all have gl-grow on the <gl-chart> element in auto height mode
    },
  );

  return storyOptions;
};

export default {
  title: 'charts/chart-legend',
  component: GlChartLegend,
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        component:
          'See [Pajamas Design System documentation](https://design.khulnasoft.com/data-visualization/charts) for usage and implementation details.',
      },
    },
  },
};
