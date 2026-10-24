import { nextTick } from 'vue';
import { shallowMount } from '@vue/test-utils';
import {
  mockCreateChartInstance,
  ChartTooltipStub,
  chartTooltipStubData,
} from '~helpers/chart_stubs';
import { expectHeightAutoClasses } from '~helpers/chart_height';
import {
  mockDefaultLineData,
  mockDefaultBarData,
  mockSecondaryData,
  mockDefaultStackedBarData,
} from '../../../utils/charts/mock_data';
import Chart from '../chart/chart.vue';
import ChartLegend from '../legend/legend.vue';
import ColumnChart from './column.vue';

let mockChartInstance;

jest.mock('echarts', () => ({
  getInstanceByDom: () => mockChartInstance,
}));

describe('column chart component', () => {
  const defaultChartProps = {
    xAxisTitle: 'x axis',
    yAxisTitle: 'y axis',
    xAxisType: 'category',
    bars: mockDefaultBarData,
  };
  let wrapper;

  const chartItemClickedSpy = jest.fn();
  const findChart = () => wrapper.findComponent(Chart);
  const findChartTooltip = () => wrapper.findComponent({ ref: 'dataTooltip' });
  const findLegend = () => wrapper.findComponent(ChartLegend);

  const emitChartCreated = () => findChart().vm.$emit('created', mockChartInstance);

  const factory = (props = defaultChartProps, options = {}) => {
    wrapper = shallowMount(ColumnChart, {
      propsData: { ...props },
      listeners: {
        'chart-item-clicked': chartItemClickedSpy,
      },
      ...options,
    });
  };

  describe('mounted', () => {
    beforeEach(() => {
      factory();

      mockChartInstance = mockCreateChartInstance();
      emitChartCreated();
    });

    it('emits "created" when onCreated is called', () => {
      expect(wrapper.emitted('created')).toHaveLength(1);
    });

    it('calls event listener when "chart-item-clicked" is emitted on the Chart component', () => {
      findChart().vm.$emit('chart-item-clicked');

      expect(chartItemClickedSpy).toHaveBeenCalled();
    });

    it('should correctly render the chart', () => {
      expect(findChart().props('options')).toMatchSnapshot();
    });

    it('should stack series', () => {
      const options = findChart().props('options');

      expect(options.series[0].stack).toBe('default-series-stack');
    });

    it('does not render a legend for a single series', () => {
      expect(findLegend().exists()).toBe(false);
    });
  });

  describe('with line data provided', () => {
    beforeEach(() => {
      factory({
        ...defaultChartProps,
        bars: [],
        lines: mockDefaultLineData,
      });
    });
    it('should correctly render the chart', () => {
      expect(findChart().props('options')).toMatchSnapshot();
    });
  });

  describe('with secondary axis data provided', () => {
    const secondaryDataTitle = 'Column test secondary';

    beforeEach(() => {
      factory({
        ...defaultChartProps,
        secondaryData: mockSecondaryData,
        secondaryDataTitle,
      });
    });
    it('should correctly render the chart', () => {
      const options = findChart().props('options');

      expect(options).toMatchSnapshot();
    });

    it('should set the secondary Y axis name', () => {
      const options = findChart().props('options');

      expect(options.yAxis[1].name).toEqual(secondaryDataTitle);
    });

    it('should stack series', () => {
      const options = findChart().props('options');

      expect(options.series[1].stack).toBe('default-series-secondary-stack');
    });

    it('renders a legend with a distinct colour for each series', async () => {
      mockChartInstance = mockCreateChartInstance();
      emitChartCreated();
      await nextTick();

      expect(findLegend().props('seriesInfo')).toEqual([
        { name: 'Full', type: 'bar', color: expect.any(String), yAxisIndex: 0 },
        { name: 'Secondary 1', type: 'bar', color: expect.any(String), yAxisIndex: 1 },
      ]);

      const [primaryColor, secondaryColor] = findLegend()
        .props('seriesInfo')
        .map((s) => s.color);

      expect(primaryColor).not.toBe(secondaryColor);
    });
  });

  describe('with multiple bar series and no secondary axis', () => {
    beforeEach(async () => {
      factory({
        ...defaultChartProps,
        bars: mockDefaultStackedBarData.slice(0, 2),
      });
      mockChartInstance = mockCreateChartInstance();
      emitChartCreated();
      await nextTick();
    });

    it('renders a legend', () => {
      expect(findLegend().props('seriesInfo')).toEqual([
        { name: 'Fun 1', type: 'bar', color: expect.any(String), yAxisIndex: 0 },
        { name: 'Fun 2', type: 'bar', color: expect.any(String), yAxisIndex: 0 },
      ]);
    });
  });

  // The data palette doesn't meet text contrast, and colour alone can't carry
  // an axis-to-series mapping (WCAG 1.4.1), so axes keep the theme's text colour.
  describe('axis text colour', () => {
    const secondaryDataTitle = 'Column test secondary';
    const extraSecondarySeries = { name: 'Secondary 2', data: [1, 2, 3] };

    it.each`
      case                                      | props
      ${'a single series'}                      | ${{}}
      ${'several series on one axis'}           | ${{ bars: mockDefaultStackedBarData.slice(0, 2) }}
      ${'one series on each of two axes'}       | ${{ secondaryData: mockSecondaryData }}
      ${'several series on the primary axis'}   | ${{ bars: mockDefaultStackedBarData.slice(0, 2), secondaryData: mockSecondaryData }}
      ${'several series on the secondary axis'} | ${{ secondaryData: [...mockSecondaryData, extraSecondarySeries] }}
    `('is not overridden with a series colour for $case', ({ props }) => {
      factory({ ...defaultChartProps, secondaryDataTitle, ...props });

      const { yAxis } = findChart().props('options');

      [yAxis].flat().forEach((axis) => {
        expect(axis.nameTextStyle).toBeUndefined();
        expect(axis.axisLabel.color).toBeUndefined();
      });
    });
  });

  describe('with multiple series data provided', () => {
    it('should pass through custom stack series property', () => {
      factory({
        ...defaultChartProps,
        bars: mockDefaultStackedBarData.map((series) => ({
          ...series,
          stack: 'some-custom-stack',
        })),
      });

      const hasExpectedStackProperty = findChart()
        .props('options')
        .series.every((series) => series.stack === 'some-custom-stack');

      expect(hasExpectedStackProperty).toBe(true);
    });
  });

  describe('tooltip', () => {
    it('configures chart tooltip', async () => {
      factory(defaultChartProps, {
        stubs: {
          'chart-tooltip': ChartTooltipStub,
        },
      });
      mockChartInstance = mockCreateChartInstance();
      emitChartCreated();
      await nextTick();

      expect(findChartTooltip().props()).toMatchObject({
        chart: mockChartInstance,
        useDefaultTooltipFormatter: true,
      });
    });

    describe('custom tooltip slots', () => {
      const { params, title, content } = chartTooltipStubData;

      it('customizes value', async () => {
        const tooltipValueSlot = jest.fn().mockReturnValue('Custom tooltip value');

        factory(defaultChartProps, {
          stubs: {
            'chart-tooltip': ChartTooltipStub,
          },
          scopedSlots: {
            'tooltip-value': tooltipValueSlot,
          },
        });

        mockChartInstance = mockCreateChartInstance();
        emitChartCreated();
        await nextTick();

        expect(tooltipValueSlot).toHaveBeenCalledWith({ value: 9 });
        expect(findChartTooltip().text()).toBe('Custom tooltip value');
      });

      it('customizes title', async () => {
        const tooltipTitleSlot = jest.fn().mockReturnValue('Custom tooltip title');

        factory(defaultChartProps, {
          stubs: {
            'chart-tooltip': ChartTooltipStub,
          },
          scopedSlots: {
            'tooltip-title': tooltipTitleSlot,
          },
        });

        mockChartInstance = mockCreateChartInstance();
        emitChartCreated();
        await nextTick();

        expect(tooltipTitleSlot).toHaveBeenCalledWith({
          params,
          title,
        });
        expect(findChartTooltip().text()).toBe('Custom tooltip title');
      });

      it('customizes content', async () => {
        const tooltipContentSlot = jest.fn().mockReturnValue('Custom tooltip content');

        factory(defaultChartProps, {
          stubs: {
            'chart-tooltip': ChartTooltipStub,
          },
          scopedSlots: {
            'tooltip-content': tooltipContentSlot,
          },
        });

        mockChartInstance = mockCreateChartInstance();
        emitChartCreated();
        await nextTick();

        expect(tooltipContentSlot).toHaveBeenCalledWith({
          params,
          content,
        });
        expect(findChartTooltip().text()).toBe('Custom tooltip content');
      });
    });
  });

  describe('height', () => {
    expectHeightAutoClasses({
      createComponent: (props) => factory({ ...defaultChartProps, ...props }),
      findContainer: () => wrapper,
      findChart,
    });
  });
});
