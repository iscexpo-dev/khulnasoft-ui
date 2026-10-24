import { shallowMount } from '@vue/test-utils';
import { nextTick } from 'vue';
import { mockCreateChartInstance } from '~helpers/chart_stubs';
import Chart from '../chart/chart.vue';
import GlChartSeriesLabel from '../series_label/series_label.vue';
import Legend from './legend.vue';

let mockChartInstance;

jest.mock('echarts', () => ({
  getInstanceByDom: () => mockChartInstance,
  init: () => mockChartInstance,
  registerTheme: jest.fn(),
}));

const mockSeriesInfo = [
  {
    type: 'solid',
    name: 'Example Title 1',
    color: 'red',
    data: [1, 2, 3, 4, 5],
  },
  {
    type: 'solid',
    name: 'Example Title 2',
    color: 'red',
    data: [1, 2, 3, 4, 5],
  },
  {
    type: 'solid',
    name: 'Example Title 3',
    color: 'red',
    data: [1, 2, 3, 4, 5],
  },
];

const mockElementHeight = (element, clientHeight, scrollHeight) => {
  Object.defineProperty(element, 'clientHeight', {
    get: () => clientHeight,
  });
  Object.defineProperty(element, 'scrollHeight', {
    get: () => scrollHeight,
  });
};

describe('chart legend component', () => {
  let legendWrapper;
  let chart;

  const chartArgs = [
    Chart,
    {
      propsData: { options: {} },
      listeners: {
        created: (chartInstance) => {
          chart = chartInstance;
          chart.getDom = () => chartInstance;
        },
      },
    },
  ];

  const buildLegend = ({ propsData = {}, seriesInfo = mockSeriesInfo } = {}) => {
    legendWrapper = shallowMount(Legend, {
      propsData: {
        ...propsData,
        chart: mockChartInstance,
        seriesInfo,
      },
    });
  };

  beforeEach(async () => {
    mockChartInstance = mockCreateChartInstance();

    shallowMount(...chartArgs);
    await nextTick();
    // Runs after mounting the chart so that it has an up to date reference
    buildLegend();
  });

  it('renders the legend with no errors', () => {
    expect(legendWrapper.exists()).toBe(true);
  });

  describe('when the chart prop changes (e.g. after a canvas colour-mode rebuild)', () => {
    it('unbinds the listener from the old chart instance and rebinds it to the new one', async () => {
      const oldChart = mockChartInstance;
      const newChart = mockCreateChartInstance();
      // point the mocked echarts.getInstanceByDom at the new instance so the prop validator passes
      mockChartInstance = newChart;

      await legendWrapper.setProps({ chart: newChart });

      expect(oldChart.off).toHaveBeenCalledWith('legendselectchanged', expect.any(Function));
      expect(newChart.on).toHaveBeenCalledWith('legendselectchanged', expect.any(Function));
    });
  });

  it('displays correct number of series labels', () => {
    expect(legendWrapper.findAllComponents(GlChartSeriesLabel)).toHaveLength(3);
  });

  it('allows user to override max value label text using props', () => {
    buildLegend({
      propsData: {
        maxText: 'maxText',
      },
    });

    expect(legendWrapper.text()).toMatch('maxText');
  });

  it('allows user to override average value label text using props', () => {
    buildLegend({
      propsData: {
        averageText: 'averageText',
      },
    });

    expect(legendWrapper.text()).toMatch('averageText');
  });

  it('displays "Avg" for the average value label by default', () => {
    expect(legendWrapper.props().averageText).toMatch('Avg');
  });

  it('displays "Max" for the max value label by default', () => {
    expect(legendWrapper.props().maxText).toMatch('Max');
  });

  it('displays "Min" for the min value label by default', () => {
    expect(legendWrapper.props().minText).toMatch('Min');
  });

  it('displays "Current" for the current value label by default', () => {
    expect(legendWrapper.props().currentText).toMatch('Current');
  });

  describe('when clicking on a series label', () => {
    it('dispatches a `highlight` action on the chart', () => {
      legendWrapper.findComponent(GlChartSeriesLabel).trigger('click');
      expect(chart.dispatchAction).toHaveBeenCalled();
    });

    it('does not dispatch a `legendToggleSelect` action when there is only one active series', () => {
      buildLegend({ seriesInfo: [mockSeriesInfo[0]] });

      legendWrapper.findComponent(GlChartSeriesLabel).trigger('click');

      expect(chart.dispatchAction).toHaveBeenCalledTimes(0);
    });

    it('does not dispatch a `legendToggleSelect` action on the chart when disabled=true', () => {
      const disabledLegendItem = {
        type: 'solid',
        name: 'Example Title 4',
        color: 'red',
        data: [1, 2, 3, 4, 5],
        disabled: true,
      };

      const seriesInfo = [...mockSeriesInfo, disabledLegendItem];
      const disabledLegendItemIndex = seriesInfo.length - 1;

      buildLegend({ seriesInfo });

      legendWrapper
        .findAllComponents(GlChartSeriesLabel)
        .at(disabledLegendItemIndex)
        .trigger('click');

      expect(chart.dispatchAction).toHaveBeenCalledTimes(0);
    });
  });

  describe.each`
    layout      | rowSelector
    ${'inline'} | ${'.gl-legend-inline-series'}
    ${'table'}  | ${'.gl-legend-tabular-row'}
  `('series rows in the $layout layout', ({ layout, rowSelector }) => {
    const findRows = () => legendWrapper.findAll(rowSelector);

    beforeEach(() => {
      buildLegend({ propsData: { layout } });
    });

    it('renders each row as a native button so it is keyboard operable', () => {
      expect(findRows()).toHaveLength(mockSeriesInfo.length);
      findRows().wrappers.forEach((row) => {
        expect(row.element.tagName).toBe('BUTTON');
        expect(row.attributes('type')).toBe('button');
        expect(row.attributes('role')).toBeUndefined();
      });
    });

    it('exposes the visible state of each series with aria-pressed', async () => {
      expect(findRows().at(0).attributes('aria-pressed')).toBe('true');

      await findRows().at(0).trigger('click');

      expect(findRows().at(0).attributes('aria-pressed')).toBe('false');
      expect(findRows().at(1).attributes('aria-pressed')).toBe('true');
    });

    it('marks the row as aria-disabled when there is only one series', () => {
      buildLegend({ propsData: { layout }, seriesInfo: [mockSeriesInfo[0]] });

      expect(findRows().at(0).attributes('aria-disabled')).toBe('true');
    });
  });

  it('renders the inline layout by default', () => {
    expect(legendWrapper.props().layout).toMatch('inline');
    expect(legendWrapper.find('.gl-legend-inline').exists()).toBe(true);
    expect(legendWrapper.find('.gl-legend-tabular').exists()).toBe(false);
  });

  it('adds a fade when content scrolls', async () => {
    const legendInlineEl = legendWrapper.find('.gl-legend-inline').element;
    mockElementHeight(legendInlineEl, 200, 400);

    // update component to force recalculation of fade class after we mock the heights
    legendWrapper.setProps({
      averageText: 'averaaaaage',
    });

    // Why wait 3 ticks?
    await nextTick(); // 1. component waits a tick itself after update, before checking scrollHeight
    await nextTick(); // 2. so wait for next render, after component has applied class
    await nextTick(); // 3. ??? vue-3 pipeline fails without waiting an extra tick

    expect(legendWrapper.find('.gl-legend-b-fade').exists()).toBe(true);
  });

  describe('when setting the layout prop to table', () => {
    beforeEach(() => {
      buildLegend({
        propsData: {
          layout: 'table',
        },
      });
    });

    it('renders the table layout', () => {
      expect(legendWrapper.find('.gl-legend-tabular').exists()).toBe(true);
    });

    it('does not render the inline layout', () => {
      expect(legendWrapper.find('.gl-legend-inline').exists()).toBe(false);
    });

    it('allows user to override min value label text using props', async () => {
      await legendWrapper.setProps({ minText: 'minText' });

      expect(legendWrapper.text()).toMatch('minText');
    });

    it('allows user to override current value label text using props', async () => {
      await legendWrapper.setProps({ currentText: 'currentText' });

      expect(legendWrapper.text()).toMatch('currentText');
    });

    it.each`
      data          | reason
      ${null}       | ${'null'}
      ${undefined}  | ${'undefined'}
      ${[]}         | ${'empty'}
      ${[NaN, NaN]} | ${'only NaN values'}
    `('displays en-dash when series data is $reason', async ({ data }) => {
      const series = [
        {
          type: 'solid',
          name: 'Example Title',
          color: 'red',
          data,
        },
      ];

      await legendWrapper.setProps({
        seriesInfo: series,
      });

      legendWrapper.findAll('.gl-legend-tabular-details-cell').wrappers.forEach((wrapper) => {
        expect(wrapper.text()).toBe('-');
      });
    });

    it('does not display NaN values in cells', async () => {
      const series = [
        {
          type: 'solid',
          name: 'Example Title 1',
          data: [1, 2, NaN, 4, 5],
          color: 'red',
        },
        {
          type: 'solid',
          name: 'Example Title 2',
          data: [1, 2, 3, 4, NaN],
          color: 'red',
        },
      ];

      await legendWrapper.setProps({
        seriesInfo: series,
      });

      legendWrapper.findAll('.gl-legend-tabular-details-cell').wrappers.forEach((wrapper) => {
        expect(wrapper.text()).not.toBe('NaN');
      });
    });
  });
});
