import { shallowMount } from '@vue/test-utils';
import { nextTick } from 'vue';
import { mockCreateChartInstance } from '~helpers/chart_stubs';
import { expectHeightAutoClasses } from '~helpers/chart_height';
import Chart from '../chart/chart.vue';
import ChartTooltip from '../shared/tooltip/tooltip.vue';
import TooltipDefaultFormat from '../shared/tooltip/tooltip_default_format/tooltip_default_format.vue';
import DiscreteScatterChart from './discrete_scatter.vue';

let mockChartInstance;

jest.mock('echarts', () => ({
  getInstanceByDom: () => mockChartInstance,
}));

describe('column chart component', () => {
  const mockData = {
    x: '19 May',
    y: 6.95,
  };

  const mockDataPixel = {
    x: 1,
    y: 2,
  };

  const defaultChartProps = {
    xAxisTitle: 'x axis',
    yAxisTitle: 'y axis',
    xAxisType: 'category',
    data: [[mockData.x, mockData.y]],
  };
  let wrapper;

  const findChart = () => wrapper.findComponent(Chart);

  const createComponent = (props = {}) => {
    wrapper = shallowMount(DiscreteScatterChart, {
      propsData: { ...defaultChartProps, ...props },
    });
  };

  beforeEach(() => {
    mockChartInstance = mockCreateChartInstance();
    mockChartInstance.convertToPixel.mockReturnValue([mockDataPixel.x, mockDataPixel.y]);
  });

  describe('height', () => {
    expectHeightAutoClasses({
      createComponent,
      findContainer: () => wrapper,
      findChart,
    });
  });

  describe('tooltip formatter', () => {
    let onLabelChange;

    beforeEach(async () => {
      createComponent();

      await findChart().vm.$emit('created', mockChartInstance);
      onLabelChange = findChart().props('options').tooltip.formatter;
    });

    describe.each([
      {
        params: {
          data: [mockData.x, mockData.y],
        },
        descr: 'when data is an array',
      },
      {
        params: {
          data: { value: [mockData.x, mockData.y] },
        },
        descr: 'when data is an object',
      },
    ])('$descr', ({ params }) => {
      it('sets the popover content', async () => {
        onLabelChange(params);
        await nextTick();

        expect(mockChartInstance.convertToPixel).toHaveBeenCalledTimes(1);
        expect(mockChartInstance.convertToPixel).toHaveBeenLastCalledWith('grid', [
          mockData.x,
          mockData.y,
        ]);

        expect(wrapper.findComponent(ChartTooltip).props('left')).toBe(`${mockDataPixel.x}px`);
        expect(wrapper.findComponent(ChartTooltip).props('top')).toBe(`${mockDataPixel.y}px`);
        expect(wrapper.findComponent(TooltipDefaultFormat).props('tooltipContent')).toEqual({
          'y axis': { color: '', value: mockData.y },
        });
      });
    });

    describe.each([
      {
        params: {},
        descr: 'when data is missing',
      },
      {
        params: {
          data: [],
        },
        descr: 'when data is an empty array',
      },
      {
        params: { data: 'foo' },
        descr: 'when data is not an array',
      },
      {
        params: {
          data: { value: [] },
        },
        descr: 'when data.value is an empty array',
      },
      {
        params: { data: { value: undefined } },
        descr: 'when data.value is undefined',
      },
      {
        params: { data: { value: 'foo' } },
        descr: 'when data.value is not an array',
      },
    ])('$descr', ({ params }) => {
      it('does not set the tooltip content', async () => {
        onLabelChange(params);
        await nextTick();

        expect(mockChartInstance.convertToPixel).not.toHaveBeenCalled();
        expect(wrapper.findComponent(ChartTooltip).props('left')).toBe('0');
        expect(wrapper.findComponent(ChartTooltip).props('top')).toBe('0');
        expect(wrapper.findComponent(TooltipDefaultFormat).props('tooltipContent')).toEqual({
          'y axis': { color: '', value: undefined },
        });
      });
    });
  });

  describe('disable-tooltip', () => {
    describe('when false', () => {
      beforeEach(async () => {
        createComponent();
        await findChart().vm.$emit('created', mockChartInstance);
      });

      it('renders the ChartTooltip component', async () => {
        expect(wrapper.findComponent(ChartTooltip).exists()).toBe(true);
      });

      it('sets chart tooltip options', () => {
        expect(findChart().props('options').tooltip).not.toBeUndefined();
      });
    });

    describe('when true', () => {
      beforeEach(async () => {
        createComponent({ disableTooltip: true });
        await findChart().vm.$emit('created', mockChartInstance);
      });

      it('does not render the ChartTooltip component', async () => {
        expect(wrapper.findComponent(ChartTooltip).exists()).toBe(false);
      });

      it('does not set chart tooltip options', () => {
        expect(findChart().props('options').tooltip).toBeUndefined();
      });
    });
  });
});
