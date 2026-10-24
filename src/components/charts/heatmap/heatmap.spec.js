import { shallowMount } from '@vue/test-utils';

import { nextTick } from 'vue';
import { mockCreateChartInstance } from '~helpers/chart_stubs';
import { expectHeightAutoClasses } from '~helpers/chart_height';
import {
  GL_COLOR_NEUTRAL_0,
  GL_COLOR_NEUTRAL_100,
  GL_COLOR_NEUTRAL_800,
  GL_COLOR_NEUTRAL_950,
} from '../../../tokens/build/js/tokens';
import Chart from '../chart/chart.vue';
import ChartTooltip from '../shared/tooltip/tooltip.vue';
import HeatMapChart from './heatmap.vue';

let mockChartInstance;

jest.mock('echarts', () => ({
  getInstanceByDom: () => mockChartInstance,
}));

describe('heatmap component', () => {
  let wrapper;

  const findChart = () => wrapper.findComponent(Chart);
  const findChartTooltip = () => wrapper.findComponent(ChartTooltip);
  const getOptions = () => findChart().props('options');

  const emitChartCreated = () => findChart().vm.$emit('created', mockChartInstance);

  const createComponent = (props = {}, mountOptions = {}) => {
    wrapper = shallowMount(HeatMapChart, {
      propsData: {
        options: { series: [] },
        dataSeries: [],
        ...props,
      },
      ...mountOptions,
    });

    emitChartCreated();
  };

  beforeEach(async () => {
    mockChartInstance = mockCreateChartInstance();
  });

  describe('color mode', () => {
    // ECharts interpolates the visualMap stops numerically, so they cannot be CSS custom
    // properties and have to be swapped for the current colour mode instead.
    const findHues = () => getOptions().visualMap.inRange.color;
    const findPlate = () => getOptions().grid.backgroundColor;
    const findSeparator = () => getOptions().xAxis.splitLine.lineStyle.color;

    const LIGHT_HUES = [GL_COLOR_NEUTRAL_100, '#617ae2', '#4e65cd', '#374291', '#2a2b59'];
    const DARK_HUES = [GL_COLOR_NEUTRAL_800, '#4e65cd', '#617ae2', '#7992f5', '#b7c6ff'];

    // The mode is read from the chart's ancestors, so these have to be in the document. The
    // component is mounted into a child of the scope host, because `attachTo` replaces its target.
    let host;
    let mountPoint;

    const createAttached = () => createComponent({}, { attachTo: mountPoint });

    const setDarkScope = async (enabled) => {
      host.classList.toggle('gl-dark-scope', enabled);
      await new Promise((resolve) => {
        setTimeout(resolve, 0);
      });
      await nextTick();
    };

    beforeEach(() => {
      host = document.createElement('div');
      mountPoint = document.createElement('div');
      host.appendChild(mountPoint);
      document.body.appendChild(host);
    });

    afterEach(() => {
      document.documentElement.className = '';
      document.body.innerHTML = '';
    });

    it('steps darker away from a light surface', () => {
      createAttached();

      expect(findHues()).toEqual(LIGHT_HUES);
      expect(findPlate()).toBe(GL_COLOR_NEUTRAL_100);
      expect(findSeparator()).toBe(GL_COLOR_NEUTRAL_0);
    });

    it('steps lighter away from a dark surface', async () => {
      await setDarkScope(true);
      createAttached();
      // the mode is only known once mounted, so the first render is corrected on the next tick
      await nextTick();

      expect(findHues()).toEqual(DARK_HUES);
      expect(findPlate()).toBe(GL_COLOR_NEUTRAL_800);
      expect(findSeparator()).toBe(GL_COLOR_NEUTRAL_950);
    });

    it('follows a scoped dark preview inside a light document', async () => {
      createAttached();

      expect(findHues()).toEqual(LIGHT_HUES);

      await setDarkScope(true);

      expect(findHues()).toEqual(DARK_HUES);
    });

    it('follows the document root flipping to dark', async () => {
      createAttached();

      document.documentElement.classList.add('gl-dark');
      await new Promise((resolve) => {
        setTimeout(resolve, 0);
      });
      await nextTick();

      expect(findHues()).toEqual(DARK_HUES);
    });

    it('uses the same palette for the legend as for the cells', async () => {
      await setDarkScope(true);
      createAttached();
      await nextTick();

      expect(wrapper.vm.seriesInfo.map(({ color }) => color)).toEqual(DARK_HUES);
      expect(wrapper.vm.seriesInfo.map(({ color }) => color)).toEqual(findHues());
    });
  });

  it('emits `created`, with the chart instance', () => {
    createComponent();

    expect(wrapper.emitted('created')).toHaveLength(1);
    expect(wrapper.emitted('created')[0][0]).toBe(mockChartInstance);
  });

  describe('tooltip position', () => {
    beforeEach(() => {
      createComponent();
    });

    it('is initialized', () => {
      expect(findChartTooltip().props('left')).toBe('0');
      expect(findChartTooltip().props('top')).toBe('0');
    });

    it('is reset when the xAxis formatter is triggered', async () => {
      const seriesId = 'Series Name0';
      const value = ['2020-02-10T06:45:26.879Z', 0.002671530922619002];
      const pixel = [66, 99];

      const params = {
        seriesData: [{ seriesId, value }],
      };

      mockChartInstance.convertToPixel.mockReturnValueOnce(pixel);

      getOptions().xAxis.axisPointer.label.formatter(params);

      await nextTick();
      expect(mockChartInstance.convertToPixel).toHaveBeenCalledWith({ seriesId }, value);

      expect(findChartTooltip().props('left')).toBe(`${pixel[0]}px`);
      expect(findChartTooltip().props('top')).toBe(`${pixel[1]}px`);
    });
  });

  describe('showTooltip', () => {
    it('is true by default', async () => {
      createComponent();
      await nextTick();

      expect(findChartTooltip().props('show')).toBe(true);
    });

    it('sets show prop on the tooltip component', async () => {
      createComponent({ showTooltip: false });
      await nextTick();

      expect(findChartTooltip().props('show')).toBe(false);
    });
  });

  describe('height', () => {
    expectHeightAutoClasses({
      createComponent,
      findContainer: () => wrapper,
      findChart,
    });
  });
});
