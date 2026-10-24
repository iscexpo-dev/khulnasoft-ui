import { nextTick } from 'vue';
import { shallowMount } from '@vue/test-utils';

import { stackedPresentationOptions } from '@khulnasoft/ui/src/utils/constants';
import {
  mockCreateChartInstance,
  ChartTooltipStub,
  chartTooltipStubData,
} from '~helpers/chart_stubs';
import { expectHeightAutoClasses } from '~helpers/chart_height';
import { LEGEND_LAYOUT_INLINE, LEGEND_LAYOUT_TABLE } from '~/utils/charts/constants';
import {
  mockDefaultStackedLineData,
  mockDefaultStackedBarData,
  mockSecondaryData,
  mockMultiStackBarData,
} from '../../../utils/charts/mock_data';
import Chart from '../chart/chart.vue';
import ChartLegend from '../legend/legend.vue';
import ChartTooltip from '../shared/tooltip/tooltip.vue';
import * as themeUtils from '../../../utils/charts/theme';
import TooltipDefaultFormat from '../shared/tooltip/tooltip_default_format/tooltip_default_format.vue';
import StackedColumnChart from './stacked_column.vue';

let mockChartInstance;

jest.mock('echarts', () => ({
  getInstanceByDom: () => mockChartInstance,
  init: () => mockChartInstance,
  registerTheme: jest.fn(),
}));

const defaultChartProps = {
  seriesNames: [],
  bars: mockDefaultStackedBarData,
  groupBy: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  xAxisType: 'category',
  xAxisTitle: 'January - December 2018',
  yAxisTitle: 'Commits',
};

describe('stacked column chart component', () => {
  let wrapper;

  const findChart = () => wrapper.findComponent(Chart);
  const findLegend = () => wrapper.findComponent(ChartLegend);
  const findDataTooltip = () => wrapper.findComponent(ChartTooltip);
  const findTooltipDefaultFormat = () => wrapper.findComponent(TooltipDefaultFormat);

  const createShallowWrapper = async ({ props = {}, stubs, ...options } = {}) => {
    wrapper = shallowMount(StackedColumnChart, {
      propsData: { ...defaultChartProps, ...props },
      stubs: {
        'chart-tooltip': ChartTooltipStub,
        Chart,
        ...stubs,
      },
      ...options,
    });

    await nextTick(); // GlChart waits for $nextTick when mounting, await for mount to complete.
  };

  beforeEach(() => {
    mockChartInstance = mockCreateChartInstance();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('emits `created`, with the chart instance', async () => {
    await createShallowWrapper();

    expect(wrapper.emitted('created')).toHaveLength(1);
    expect(wrapper.emitted('created')[0][0]).toBe(mockChartInstance);
  });

  it('should correctly render the chart', async () => {
    await createShallowWrapper();

    expect(findChart().props('options')).toMatchSnapshot();
  });

  describe('with data provided', () => {
    beforeEach(async () => {
      await createShallowWrapper();
    });

    it('should stack series in the same stack', () => {
      const options = findChart().props('options');

      expect(options.series[0].stack).toBe('default-series-stack');
      expect(options.series[1].stack).toBe('default-series-stack');
      expect(options.series[2].stack).toBe('default-series-stack');
      expect(options.series[3].stack).toBe('default-series-stack');
    });
  });

  describe('with data provided in tiled style', () => {
    beforeEach(async () => {
      await createShallowWrapper({
        props: { presentation: 'tiled' },
      });
    });

    it('should not stack series', () => {
      const options = findChart().props('options');

      expect(options.series[0].stack).toBe(null);
      expect(options.series[1].stack).toBe(null);
      expect(options.series[2].stack).toBe(null);
      expect(options.series[3].stack).toBe(null);
    });
  });

  describe('with line data provided', () => {
    beforeEach(() => {
      createShallowWrapper({
        props: {
          bars: [],
          lines: mockDefaultStackedLineData,
        },
      });
    });
    it('should correctly render the chart', () => {
      expect(findChart().props('options')).toMatchSnapshot();
    });
  });

  describe('legend', () => {
    it('is inline by default', async () => {
      await createShallowWrapper();

      expect(findLegend().props('layout')).toBe(LEGEND_LAYOUT_INLINE);
    });

    it('is inline if correct prop value is set', async () => {
      await createShallowWrapper({ props: { legendLayout: LEGEND_LAYOUT_INLINE } });

      expect(findLegend().props('layout')).toBe(LEGEND_LAYOUT_INLINE);
    });

    it('is tabular if correct prop value is set', async () => {
      await createShallowWrapper({ props: { legendLayout: LEGEND_LAYOUT_TABLE } });

      expect(findLegend().props('layout')).toBe(LEGEND_LAYOUT_TABLE);
    });

    describe('legend series info', () => {
      beforeEach(async () => {
        await createShallowWrapper({
          props: {
            bars: [mockDefaultStackedBarData[0], mockDefaultStackedBarData[1]],
          },
        });
      });

      it('passes correct series info to legend', () => {
        expect(findLegend().props('seriesInfo')).toHaveLength(2);
        expect(findLegend().props('seriesInfo')).toEqual([
          {
            name: 'Fun 1',
            type: 'bar',
            color: '#617ae2',
            data: mockDefaultStackedBarData[0].data,
            yAxisIndex: 0,
          },
          {
            name: 'Fun 2',
            type: 'bar',
            color: '#b14f18',
            data: mockDefaultStackedBarData[1].data,
            yAxisIndex: 0,
          },
        ]);
      });

      it('reacts to data changes', async () => {
        wrapper.setProps({
          bars: [...mockDefaultStackedBarData],
        });
        await nextTick();

        expect(findLegend().props('seriesInfo')).toHaveLength(4);
        expect(findLegend().props('seriesInfo')).toEqual([
          {
            name: 'Fun 1',
            type: 'bar',
            color: '#617ae2',
            data: mockDefaultStackedBarData[0].data,
            yAxisIndex: 0,
          },
          {
            name: 'Fun 2',
            type: 'bar',
            color: '#b14f18',
            data: mockDefaultStackedBarData[1].data,
            yAxisIndex: 0,
          },
          {
            name: 'Fun 3',
            type: 'bar',
            color: '#0090b1',
            data: mockDefaultStackedBarData[2].data,
            yAxisIndex: 0,
          },
          {
            name: 'Fun 4',
            type: 'bar',
            color: '#4e7f0e',
            data: mockDefaultStackedBarData[3].data,
            yAxisIndex: 0,
          },
        ]);
      });
    });

    describe('when `includeLegendAvgMax` prop is disabled', () => {
      beforeEach(async () => {
        await createShallowWrapper({ props: { includeLegendAvgMax: false } });
      });

      it('passes correct series info to legend', () => {
        expect(findLegend().props('seriesInfo')).toEqual(
          expect.arrayContaining([
            {
              type: 'bar',
              name: 'Fun 1',
              color: expect.any(String),
              data: undefined,
              yAxisIndex: 0,
            },
          ]),
        );
      });
    });
  });

  describe('with secondary axis data provided', () => {
    const secondaryDataTitle = 'test secondary';

    beforeEach(() => {
      createShallowWrapper({
        props: {
          ...defaultChartProps,
          secondaryData: mockSecondaryData,
          secondaryDataTitle,
        },
      });
    });
    it('should correctly render the chart', () => {
      const chart = findChart();

      expect(chart.props('options')).toMatchSnapshot();
    });

    it('should set the secondary Y axis name', () => {
      const chart = findChart();

      expect(chart.props('options').yAxis[1].name).toEqual(secondaryDataTitle);
    });

    it('should stack secondary series', () => {
      const options = findChart().props('options');

      expect(options.series[4].stack).toBe('default-series-secondary-stack');
    });
  });

  describe('tooltip', () => {
    const {
      params: { seriesData: chartTooltipStubSeriesData },
    } = chartTooltipStubData;

    const seriesDataWithStack = chartTooltipStubSeriesData.map((series) => ({
      ...series,
      stack: 'default-series-stack',
    }));

    const StackedColumnChartTooltipStub = (seriesData = seriesDataWithStack) => ({
      ...ChartTooltipStub,
      data() {
        return {
          ...chartTooltipStubData,
          params: {
            seriesData,
          },
        };
      },
    });

    beforeEach(() => {
      createShallowWrapper();
    });

    it('is initialized', () => {
      expect(findDataTooltip().props('chart')).toBe(mockChartInstance);
    });

    it('inverts order of series in tooltip and uses border color', async () => {
      await createShallowWrapper({
        stubs: {
          'chart-tooltip': StackedColumnChartTooltipStub(),
          TooltipDefaultFormat,
        },
      });

      const tooltipContentEntries = Object.entries(
        findTooltipDefaultFormat().props('tooltipContent'),
      );

      expect(tooltipContentEntries).toEqual([
        ['Apples (2)', { color: 'red2', value: ['Count', 10] }],
        ['Oranges (1)', { color: 'orange2', value: ['Count', 9] }],
      ]);
    });

    it('uses `color` if `borderColor` is not set', async () => {
      const seriesDataWithColor = seriesDataWithStack.map(({ borderColor, ...series }, idx) => ({
        ...series,
        color: `red-${idx}`,
      }));

      await createShallowWrapper({
        stubs: {
          'chart-tooltip': StackedColumnChartTooltipStub(seriesDataWithColor),
          TooltipDefaultFormat,
        },
      });

      const tooltipContentEntries = Object.entries(
        findTooltipDefaultFormat().props('tooltipContent'),
      );

      expect(tooltipContentEntries).toEqual([
        ['Apples (2)', { color: 'red-1', value: ['Count', 10] }],
        ['Oranges (1)', { color: 'red-0', value: ['Count', 9] }],
      ]);
    });

    describe('with multiple stacks', () => {
      const mockMultiStackSeriesData = [
        {
          seriesIndex: 0,
          seriesName: 'Apples (1)',
          value: ['Count', 30],
          borderColor: 'red2',
          stack: 'fruits',
        },
        {
          seriesIndex: 1,
          seriesName: 'Oranges (2)',
          value: ['Count', 25],
          borderColor: 'orange2',
          stack: 'fruits',
        },
        {
          seriesIndex: 2,
          seriesName: 'Carrots (3)',
          value: ['Count', 18],
          borderColor: 'blue2',
          stack: 'vegetables',
        },
        {
          seriesIndex: 3,
          seriesName: 'Broccoli (4)',
          value: ['Count', 14],
          borderColor: 'green2',
          stack: 'vegetables',
        },
      ];

      it('inverts order within each stack group independently in tooltip', async () => {
        await createShallowWrapper({
          props: {
            bars: mockMultiStackBarData,
          },
          stubs: {
            'chart-tooltip': StackedColumnChartTooltipStub(mockMultiStackSeriesData),
            TooltipDefaultFormat,
          },
        });

        const tooltipContentEntries = Object.entries(
          findTooltipDefaultFormat().props('tooltipContent'),
        );

        expect(tooltipContentEntries).toEqual([
          ['Oranges (2)', { color: 'orange2', value: ['Count', 25] }],
          ['Apples (1)', { color: 'red2', value: ['Count', 30] }],
          ['Broccoli (4)', { color: 'green2', value: ['Count', 14] }],
          ['Carrots (3)', { color: 'blue2', value: ['Count', 18] }],
        ]);
      });

      it('defaults "clickToPinTooltip" to false', async () => {
        await createShallowWrapper({
          stubs: {
            'chart-tooltip': StackedColumnChartTooltipStub(mockMultiStackSeriesData),
            TooltipDefaultFormat,
          },
        });

        expect(findDataTooltip().props('clickToPin')).toBe(false);
      });

      it('passes "clickToPinTooltip" prop to data tooltip when provided', async () => {
        await createShallowWrapper({
          props: {
            clickToPinTooltip: true,
          },
          stubs: {
            'chart-tooltip': StackedColumnChartTooltipStub(mockMultiStackSeriesData),
            TooltipDefaultFormat,
          },
        });

        expect(findDataTooltip().props('clickToPin')).toBe(true);
      });
    });

    describe('with data provided in tiled style', () => {
      beforeEach(async () => {
        await createShallowWrapper({
          props: { presentation: stackedPresentationOptions.tiled },
          stubs: {
            TooltipDefaultFormat,
          },
        });
      });

      it('maintains original order of series in tooltip', async () => {
        const tooltipContentEntries = Object.entries(
          findTooltipDefaultFormat().props('tooltipContent'),
        );

        expect(tooltipContentEntries).toEqual([
          ['Oranges (1)', { color: 'orange2', value: ['Count', 9] }],
          ['Apples (2)', { color: 'red2', value: ['Count', 10] }],
        ]);
      });
    });

    describe('is customized via slots', () => {
      const { params, title, content } = chartTooltipStubData;

      it('customizes tooltip value', async () => {
        const tooltipValueSlot = jest.fn().mockReturnValue('Custom tooltip value');

        await createShallowWrapper({
          stubs: {
            TooltipDefaultFormat,
          },
          scopedSlots: {
            'tooltip-value': tooltipValueSlot,
          },
        });

        expect(tooltipValueSlot).toHaveBeenCalledWith({ value: ['Count', 10] });
        expect(findDataTooltip().text()).toContain('Custom tooltip value');
      });

      it('customizes title', async () => {
        const tooltipTitleSlot = jest.fn().mockReturnValue('Title');

        await createShallowWrapper({
          scopedSlots: {
            'tooltip-title': tooltipTitleSlot,
          },
        });

        expect(tooltipTitleSlot).toHaveBeenCalledWith({
          params,
          title,
        });

        expect(findDataTooltip().text()).toBe('Title');
      });

      it('customizes content', async () => {
        const tooltipContentSlot = jest.fn().mockReturnValue('Custom Content');

        await createShallowWrapper({
          scopedSlots: {
            'tooltip-content': tooltipContentSlot,
          },
        });

        expect(tooltipContentSlot).toHaveBeenCalledWith({
          params,
          content,
        });
        expect(findDataTooltip().text()).toBe('Custom Content');
      });
    });

    it('is customized via deprecated formatting function', async () => {
      const formatTooltipText = jest.fn();

      await createShallowWrapper({
        props: {
          formatTooltipText,
        },
      });

      expect(findDataTooltip().props()).toMatchObject({
        useDefaultTooltipFormatter: false,
        chart: mockChartInstance,
      });

      expect(findChart().props('options').xAxis.axisPointer.label.formatter).toBe(
        formatTooltipText,
      );
    });
  });

  describe('color palette', () => {
    let paletteSpy;

    describe('default palette', () => {
      beforeEach(() => {
        paletteSpy = jest.spyOn(themeUtils, 'colorFromDefaultPalette');

        createShallowWrapper();
      });

      it('calls colorFromDefaultPalette', () => {
        expect(paletteSpy).toHaveBeenCalled();
      });
    });

    describe('custom palette', () => {
      beforeEach(() => {
        paletteSpy = jest.spyOn(themeUtils, 'colorFromDefaultPalette');

        createShallowWrapper({
          props: {
            customPalette: ['#FFFHHH', '#FFFJJJ', '#FFFIII', '#FFFKKK'],
          },
        });
      });

      it('does not call colorFromDefaultPalette', () => {
        expect(paletteSpy).not.toHaveBeenCalled();
      });

      it('matches the snapshot', () => {
        const chart = findChart();

        expect(chart.props('options')).toMatchSnapshot();
      });
    });
  });

  describe('height', () => {
    expectHeightAutoClasses({
      createComponent: (props) => createShallowWrapper({ props }),
      findContainer: () => wrapper,
      findChart,
    });
  });
});
