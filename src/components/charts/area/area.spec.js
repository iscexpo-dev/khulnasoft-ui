import { nextTick } from 'vue';
import { shallowMount } from '@vue/test-utils';

import { LEGEND_LAYOUT_INLINE, LEGEND_LAYOUT_TABLE } from '~/utils/charts/constants';
import {
  mockCreateChartInstance,
  ChartTooltipStub,
  chartTooltipStubData,
} from '~helpers/chart_stubs';
import { expectHeightAutoClasses } from '~helpers/chart_height';
import Chart from '../chart/chart.vue';
import ChartLegend from '../legend/legend.vue';
import AreaChart from './area.vue';

let mockChartInstance;

jest.mock('echarts', () => ({
  getInstanceByDom: () => mockChartInstance,
  init: () => mockChartInstance,
  registerTheme: jest.fn(),
}));

describe('area component', () => {
  let wrapper;

  const findChart = () => wrapper.findComponent(Chart);
  const findLegend = () => wrapper.findComponent(ChartLegend);
  const findDataTooltip = () => wrapper.findComponent({ ref: 'dataTooltip' });
  const findAnnotationsTooltip = () => wrapper.findComponent({ ref: 'annotationsTooltip' });

  const createShallowWrapper = async ({ props = {}, ...options } = {}) => {
    wrapper = shallowMount(AreaChart, {
      propsData: { option: { series: [] }, data: [], ...props },
      stubs: {
        'chart-tooltip': ChartTooltipStub,
        Chart,
      },
      ...options,
    });

    await nextTick(); // GlChart waits for $nextTick when mounting, await for mount to complete.
  };

  beforeEach(() => {
    mockChartInstance = mockCreateChartInstance();
  });

  it('emits `created`, with the chart instance', async () => {
    await createShallowWrapper();

    expect(wrapper.emitted('created')).toHaveLength(1);
    expect(wrapper.emitted('created')[0][0]).toBe(mockChartInstance);
  });

  it('does not throw when destroyed before the chart instance is created', () => {
    wrapper = shallowMount(AreaChart, {
      propsData: { option: { series: [] }, data: [] },
      stubs: { Chart },
    });

    expect(wrapper.emitted('created')).toBeUndefined();
    expect(() => wrapper.destroy()).not.toThrow();
  });

  describe('Annotations tooltips', () => {
    it('are hidden by default', async () => {
      await createShallowWrapper();

      expect(findAnnotationsTooltip().exists()).toBe(false);
    });

    it('are displayed if passed via annotations props', async () => {
      await createShallowWrapper({
        props: {
          annotations: [
            {
              min: '',
              max: '',
            },
          ],
        },
      });

      expect(findAnnotationsTooltip().exists()).toBe(true);
    });

    it('are displayed if passed via option props', async () => {
      await createShallowWrapper({
        props: {
          option: {
            series: [
              {
                name: 'annotations',
                markPoint: {
                  data: [
                    {
                      xAxis: 10,
                    },
                  ],
                },
                data: [],
              },
            ],
          },
        },
      });

      expect(findAnnotationsTooltip().exists()).toBe(true);
    });

    it('has a default title and content when hovered', async () => {
      const params = {
        name: 'annotations',
        componentType: 'markPoint',
        data: {
          xAxis: '2018-01-25T01:00:00.000Z',
          tooltipData: { content: 'Scranton strangler was caught.' },
        },
        event: {
          event: {
            zrX: 100,
            zrY: 100,
          },
        },
      };

      await createShallowWrapper({
        props: {
          annotations: [
            {
              min: '',
              max: '',
            },
          ],
        },
      });

      wrapper.vm.onChartDataPointMouseOver(params);

      await nextTick();

      expect(findAnnotationsTooltip().html()).toContain(params.data.xAxis);
      expect(findAnnotationsTooltip().html()).toContain(params.data.tooltipData.content);
    });
  });

  describe('data tooltip', () => {
    it('is initialized', async () => {
      await createShallowWrapper();

      expect(findDataTooltip().props()).toMatchObject({
        useDefaultTooltipFormatter: true,
        chart: mockChartInstance,
      });
    });

    describe('is customized via slots', () => {
      const { params, title, content } = chartTooltipStubData;
      const value = params.seriesData[0].value[1];

      it('customizes tooltip value', async () => {
        const tooltipValueSlot = jest.fn().mockReturnValue('Value');

        await createShallowWrapper({
          scopedSlots: {
            'tooltip-value': tooltipValueSlot,
          },
        });

        expect(tooltipValueSlot).toHaveBeenCalledWith({ value });
        expect(findDataTooltip().text()).toBe('Value');
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
        const tooltipContentSlot = jest.fn().mockReturnValue('Title');

        await createShallowWrapper({
          scopedSlots: {
            'tooltip-content': tooltipContentSlot,
          },
        });

        expect(tooltipContentSlot).toHaveBeenCalledWith({
          params,
          content,
        });
        expect(findDataTooltip().text()).toBe('Title');
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

  describe('legend', () => {
    it('is inline by default', async () => {
      await createShallowWrapper();

      expect(findLegend().props('layout')).toBe(LEGEND_LAYOUT_INLINE);
    });

    it('is inline if correct prop value is set', async () => {
      await createShallowWrapper({
        props: {
          legendLayout: LEGEND_LAYOUT_INLINE,
        },
      });

      expect(findLegend().props('layout')).toBe(LEGEND_LAYOUT_INLINE);
    });

    it('is tabular if correct prop value is set', async () => {
      await createShallowWrapper({
        props: {
          legendLayout: LEGEND_LAYOUT_TABLE,
        },
      });

      expect(findLegend().props('layout')).toBe(LEGEND_LAYOUT_TABLE);
    });

    it('displays custom series info when prop is set', async () => {
      const legendSeriesInfo = [
        {
          name: 'Custom Legend Item',
          type: 'solid',
          color: '#000',
          data: [10, 20, 30],
        },
      ];

      await createShallowWrapper({
        props: {
          legendSeriesInfo,
        },
      });

      expect(findLegend().props('seriesInfo')).toEqual(expect.arrayContaining(legendSeriesInfo));
    });

    it('reacts to data changes', async () => {
      await createShallowWrapper({
        props: {
          data: [
            {
              name: 'Text 1',
              lineStyle: { type: 'line' },
            },
          ],
        },
      });

      expect(findLegend().props('seriesInfo')).toEqual([
        { name: 'Text 1', type: 'line', color: '#617ae2' },
      ]);

      wrapper.setProps({
        data: [
          {
            name: 'Text 2',
            lineStyle: { type: 'line' },
          },
        ],
      });
      await nextTick();

      expect(findLegend().props('seriesInfo')).toEqual([
        { name: 'Text 2', type: 'line', color: '#617ae2' },
      ]);
    });
  });

  describe('height', () => {
    expectHeightAutoClasses({
      createComponent: (props) => createShallowWrapper({ props: { ...props } }),
      findContainer: () => wrapper,
      findChart,
    });
  });
});
