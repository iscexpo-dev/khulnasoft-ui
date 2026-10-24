import { GlChart, GlChartSeriesLabel } from '../../../../charts';
import {
  SERIES_NAME,
  SERIES_NAME_LONG,
  SERIES_NAME_LONG_WITHOUT_SPACES,
} from '../../../../utils/stories_constants';

import GlChartTooltip from './tooltip.vue';

const components = {
  GlChart,
  GlChartTooltip,
  GlChartSeriesLabel,
};

const baseStoryOptions = {
  props: {},
  components,
  data() {
    return {
      chart: null,
      options: {},
      showTooltip: true,
      top: '50%',
      left: '0px',
    };
  },
  methods: {
    onCreated(chart) {
      this.chart = chart;
    },
  },
};

const getStoryOptions = (tooltipContent) => ({
  ...baseStoryOptions,
  template: `<div class="gl-relative">
    <gl-chart
      :options="options"
      :height="100"
      @created="onCreated"
    />
    <gl-chart-tooltip
      v-if="chart"
      :chart="chart"
      :show="showTooltip"
      :top="top"
      :left="left"
    >
      <template #title>
        <div>
          Example Title
        </div>
      </template>
      ${tooltipContent}
    </gl-chart-tooltip>
</div>`,
});

export const Default = (args, { argTypes }) => ({
  props: Object.keys(argTypes),
  ...getStoryOptions('Example Content'),
});

export const WithLongSeriesLabel = (args, { argTypes }) => ({
  props: Object.keys(argTypes),
  ...getStoryOptions(`
        <gl-chart-series-label color="#1F78D1">${SERIES_NAME[SERIES_NAME_LONG]}</gl-chart-series-label>
      `),
});

export const WithLongSeriesLabelWithNoSpaces = (args, { argTypes }) => ({
  props: Object.keys(argTypes),
  ...getStoryOptions(`
        <gl-chart-series-label color="#1F78D1">${SERIES_NAME[SERIES_NAME_LONG_WITHOUT_SPACES]}</gl-chart-series-label>
      `),
});

export default {
  title: 'charts/chart-tooltip',
  component: GlChartTooltip,
  parameters: {
    bootstrapComponent: 'b-popover',
    controls: { disable: true },
    docs: {
      description: {
        component:
          'See [Pajamas Design System documentation](https://design.khulnasoft.com/data-visualization/charts) for usage and implementation details.',
      },
    },
  },
};
