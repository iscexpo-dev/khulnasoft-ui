import { shallowMount } from '@vue/test-utils';
import { nextTick } from 'vue';
import {
  mockCreateChartInstance,
  ChartTooltipStub,
  chartTooltipStubData,
} from '~helpers/chart_stubs';
import { expectHeightAutoClasses } from '~helpers/chart_height';
import Chart from '../chart/chart.vue';
import ChartTooltip from '../shared/tooltip/tooltip.vue';
import BarChart from './bar.vue';

let mockChartInstance;

jest.mock('echarts', () => ({
  getInstanceByDom: () => mockChartInstance,
}));

const defaultChartProps = {
  xAxisTitle: 'Pushes per day',
  xAxisType: 'value',
  yAxisTitle: 'User',
  data: {
    Office: [
      [100, 'Scranton Strangler'],
      [300, 'Dwight'],
    ],
  },
};

describe('Bar chart component', () => {
  let wrapper;

  const findChart = () => wrapper.findComponent(Chart);
  const findChartTooltip = () => wrapper.findComponent(ChartTooltip);

  const getOptions = () => findChart().props('options');
  const emitChartCreated = () => findChart().vm.$emit('created', mockChartInstance);

  const createComponent = ({ props = {}, stubs = {}, scopedSlots = {}, height } = {}) => {
    wrapper = shallowMount(BarChart, {
      propsData: { ...defaultChartProps, ...props, height },
      stubs: {
        'chart-tooltip': ChartTooltipStub,
        ...stubs,
      },
      scopedSlots,
    });
  };

  beforeEach(() => {
    mockChartInstance = mockCreateChartInstance();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('when mounted', () => {
    beforeEach(() => {
      createComponent();
    });

    it('should render chart with axis and series', () => {
      const chart = findChart();

      expect(chart.props('options')).toMatchSnapshot();
    });

    it('should not emit created', () => {
      expect(wrapper.emitted('created')).toBeUndefined();
    });
  });

  describe('when mounted and chart has created', () => {
    beforeEach(() => {
      createComponent();
      emitChartCreated();
    });

    it('emits "created" when onCreated is called', () => {
      expect(wrapper.emitted('created')).toEqual([[mockChartInstance]]);
    });

    it('long Y axis labels are ellipsized', () => {
      const { yAxis: { axisLabel: { formatter } } = {} } = getOptions();

      defaultChartProps.data.Office.map(([, name]) => expect(formatter(name)).toMatchSnapshot());
    });
  });

  describe('when multiple series data provided', () => {
    const multipleSeriesData = {
      ...defaultChartProps.data,
      DunderMifflin: [
        [200, 'Scranton Strangler'],
        [500, 'Dwight'],
      ],
    };

    beforeEach(() => {
      createComponent({ props: { data: multipleSeriesData } });
    });

    it('should correctly render chart', () => {
      expect(getOptions()).toMatchSnapshot();
    });

    describe('with tiled presentation', () => {
      beforeEach(() => {
        createComponent({ props: { data: multipleSeriesData, presentation: 'tiled' } });
      });

      it('should not stack series', () => {
        getOptions().series.forEach(({ stack }) => {
          expect(stack).toBeNull();
        });
      });
    });
  });

  describe('height', () => {
    expectHeightAutoClasses({
      createComponent,
      findContainer: () => wrapper,
      findChart,
    });
  });

  describe('tooltip', () => {
    beforeEach(() => {
      createComponent();
      emitChartCreated();
    });

    it('is initialized', () => {
      expect(findChartTooltip().props()).toMatchObject({
        chart: mockChartInstance,
        useDefaultTooltipFormatter: true,
        dimensionAxis: 'yAxis',
      });
    });

    describe('customized via slots', () => {
      const { title, params, content } = chartTooltipStubData;

      it('customizes tooltip title', async () => {
        const tooltipTitleSlot = jest.fn().mockReturnValue('Custom title');

        createComponent({
          scopedSlots: {
            'tooltip-title': tooltipTitleSlot,
          },
        });
        emitChartCreated();
        await nextTick();

        expect(tooltipTitleSlot).toHaveBeenCalledWith({ title, params });
        expect(findChartTooltip().text()).toContain('Custom title');
      });

      it('customizes tooltip value', async () => {
        const tooltipValueSlot = jest.fn().mockReturnValue('Custom tooltip value');

        createComponent({
          scopedSlots: {
            'tooltip-value': tooltipValueSlot,
          },
        });
        emitChartCreated();
        await nextTick();

        expect(tooltipValueSlot).toHaveBeenCalledWith({ value: 9 });
        expect(findChartTooltip().text()).toContain('Custom tooltip value');
      });

      it('customizes tooltip content', async () => {
        const tooltipContentSlot = jest.fn().mockReturnValue('Custom content');

        createComponent({
          scopedSlots: {
            'tooltip-content': tooltipContentSlot,
          },
        });
        emitChartCreated();
        await nextTick();

        expect(tooltipContentSlot).toHaveBeenCalledWith({ params, content });
        expect(findChartTooltip().text()).toContain('Custom content');
      });
    });
  });
});
