import { isReactive, nextTick, reactive } from 'vue';
import { shallowMount } from '@vue/test-utils';
import * as echarts from 'echarts';
import { toolboxHeight } from '~/utils/charts/config';
import { createTheme } from '~/utils/charts/theme';
import { waitForAnimationFrame } from '~/utils/test_utils';
import { useMockResizeObserver } from '~helpers/mock_dom_observer';
import { mockCreateChartInstance } from '~helpers/chart_stubs';
import Chart from './chart.vue';

let mockChartInstance;

jest.mock('echarts', () => {
  return {
    init: jest.fn(() => {
      // A copy drops the raw mark, like the real echarts.init() result, so GlChart has to add it
      mockChartInstance = { ...mockCreateChartInstance() };
      return mockChartInstance;
    }),
    registerTheme: jest.fn(),
  };
});

describe('chart component', () => {
  const themeName = 'khulnasoft';
  const defaultHeight = 400;

  let wrapper;

  const createWrapper = (props, mountOptions = {}) => {
    wrapper = shallowMount(Chart, {
      propsData: {
        options: {},
        ...props,
      },
      ...mountOptions,
    });
  };

  const { trigger: triggerResize } = useMockResizeObserver();

  const triggerChartItemClick = (params) => mockChartInstance.on.mock.calls[0][1](params);

  // MutationObserver callbacks are queued as microtasks, so yielding the task lets them run.
  const waitForMutationObserver = () =>
    new Promise((resolve) => {
      setTimeout(resolve, 0);
    });

  afterEach(() => {
    document.documentElement.className = '';
  });

  it('initializes chart using $refs.chart', async () => {
    createWrapper();
    await nextTick();

    expect(echarts.init).toHaveBeenCalledWith(
      wrapper.findComponent({ ref: 'chart' }).element,
      themeName,
      {
        renderer: wrapper.props().renderer,
        width: 300,
        height: 400,
      },
    );
  });

  it('does not resize the chart when responsive = false', async () => {
    createWrapper({
      responsive: false,
    });
    await nextTick();
    // initial call when chart gets created
    expect(wrapper.vm.chart.resize).toHaveBeenCalledTimes(1);

    triggerResize(wrapper.element);
    await waitForAnimationFrame();

    expect(wrapper.vm.chart.resize).toHaveBeenCalledTimes(1);
  });

  it('resizes the chart only once per animation frame when responsive = true', async () => {
    createWrapper();
    await nextTick();

    expect(wrapper.vm.chart.resize).toHaveBeenCalledTimes(1);

    triggerResize(wrapper.element);
    triggerResize(wrapper.element);
    await waitForAnimationFrame();

    expect(wrapper.vm.chart.resize).toHaveBeenCalledTimes(2);
  });

  it('emits "created" after initializing chart', async () => {
    createWrapper();
    await nextTick();

    expect(wrapper.emitted('created')).toEqual([[wrapper.vm.chart]]);
  });

  it('emits an instance that stays non-reactive when a consumer stores it', async () => {
    createWrapper();
    await nextTick();

    const [[chart]] = wrapper.emitted('created');
    const consumerData = reactive({ chart });

    expect(isReactive(consumerData.chart)).toBe(false);
    expect(consumerData.chart).toBe(mockChartInstance);
  });

  it('emits `chart-item-clicked` when a chart item is clicked', async () => {
    createWrapper();
    await nextTick();

    const params = { seriesIndex: 0, dataIndex: 1 };

    triggerChartItemClick(params);

    expect(wrapper.emitted('chart-item-clicked')).toEqual([[{ chart: wrapper.vm.chart, params }]]);
  });

  it('uses KhulnaSoft theme', () => {
    createWrapper();

    const [firstRegisterThemeCall] = echarts.registerTheme.mock.calls;
    expect(firstRegisterThemeCall[0]).toBe(themeName);
    expect(JSON.stringify(firstRegisterThemeCall[1])).toEqual(JSON.stringify(createTheme()));
  });

  it('waits a tick before creating the chart', async () => {
    createWrapper();

    expect(wrapper.vm.chart).toBe(null);

    await nextTick();

    expect(wrapper.vm.chart).toBeDefined();
  });

  describe('when rendering to canvas', () => {
    // Canvas cannot resolve CSS custom properties, so it is handed a theme whose colors have
    // already been resolved rather than the registered one.
    const stubTokens = (values) =>
      jest.spyOn(window, 'getComputedStyle').mockReturnValue({
        color: '#000000',
        getPropertyValue: (name) => values[name] ?? '',
      });

    const themePassedToInit = () => echarts.init.mock.calls.at(-1)[1];

    // The colour mode is read from the chart's ancestors, so it has to be in the document. The
    // component is mounted into a child of the scope host, because `attachTo` replaces its target.
    let host;
    let mountPoint;

    const createAttached = (props) => {
      createWrapper(props, { attachTo: mountPoint });
    };

    beforeEach(() => {
      host = document.createElement('div');
      mountPoint = document.createElement('div');
      host.appendChild(mountPoint);
      document.body.appendChild(host);
    });

    afterEach(() => {
      document.body.innerHTML = '';
    });

    it('passes a theme with resolved colors instead of the theme name', async () => {
      stubTokens({ '--gl-text-color-default': '#3a383f' });
      createAttached({ renderer: 'canvas' });
      await nextTick();

      expect(themePassedToInit().textStyle.color).toBe('#3a383f');
    });

    it('still passes the theme name when rendering to svg', async () => {
      createAttached({ renderer: 'svg' });
      await nextTick();

      expect(themePassedToInit()).toBe(themeName);
    });

    describe('when the color mode changes', () => {
      it('rebuilds the chart with the new colors', async () => {
        stubTokens({ '--gl-text-color-default': '#3a383f' });
        createAttached({ renderer: 'canvas' });
        await nextTick();

        const initialChart = wrapper.vm.chart;
        expect(themePassedToInit().textStyle.color).toBe('#3a383f');

        stubTokens({ '--gl-text-color-default': '#ececef' });
        host.classList.add('gl-dark-scope');
        await waitForMutationObserver();

        expect(initialChart.dispose).toHaveBeenCalled();
        expect(themePassedToInit().textStyle.color).toBe('#ececef');
      });

      it('preserves the legend selection and zoom range across the rebuild', async () => {
        stubTokens({ '--gl-text-color-default': '#3a383f' });
        createAttached({ renderer: 'canvas' });
        await nextTick();

        const initialChart = wrapper.vm.chart;
        initialChart.getOption.mockReturnValue({
          legend: [{ selected: { 'Series A': false } }],
          dataZoom: [{ start: 25, end: 75 }],
        });

        stubTokens({ '--gl-text-color-default': '#ececef' });
        host.classList.add('gl-dark-scope');
        await waitForMutationObserver();

        expect(wrapper.vm.chart).not.toBe(initialChart);
        expect(wrapper.vm.chart.setOption).toHaveBeenCalledWith({
          legend: [{ selected: { 'Series A': false } }],
          dataZoom: [{ start: 25, end: 75 }],
        });
      });

      it('stops reacting once the chart is destroyed', async () => {
        stubTokens({ '--gl-text-color-default': '#3a383f' });
        createAttached({ renderer: 'canvas' });
        await nextTick();

        const initialChart = wrapper.vm.chart;
        const chartElement = wrapper.vm.$refs.chart;

        wrapper.destroy();
        wrapper = null;

        // Destroying detaches the element, which would make a leaked subscription look inert
        // whether or not it was cleaned up. Put the element back inside a dark scope so that a
        // surviving subscription really would see the mode change and rebuild the chart.
        host.classList.add('gl-dark-scope');
        host.appendChild(chartElement);
        stubTokens({ '--gl-text-color-default': '#ececef' });
        document.documentElement.classList.add('gl-dark');
        await waitForMutationObserver();

        expect(initialChart.dispose).not.toHaveBeenCalled();
      });

      it('leaves the chart alone when the resolved colors are unchanged', async () => {
        stubTokens({ '--gl-text-color-default': '#3a383f' });
        createAttached({ renderer: 'canvas' });
        await nextTick();

        const initialChart = wrapper.vm.chart;

        host.classList.add('some-unrelated-class');
        await waitForMutationObserver();

        expect(initialChart.dispose).not.toHaveBeenCalled();
        expect(wrapper.vm.chart).toBe(initialChart);
      });
    });
  });

  describe('chart options', () => {
    describe('when options are set', () => {
      beforeEach(async () => {
        createWrapper({
          options: {
            title: { text: 'My chart title' },
          },
        });
        await nextTick();
      });

      it('inits chart options, adding aria.enabled', async () => {
        expect(wrapper.vm.chart.setOption).toHaveBeenCalledTimes(1);
        expect(wrapper.vm.chart.setOption).toHaveBeenCalledWith({
          title: { text: 'My chart title' },
          aria: { enabled: true },
        });

        expect(wrapper.emitted('updated')).toHaveLength(1);
      });

      it('reacts to options changes by merging options', async () => {
        wrapper.setProps({
          options: {
            title: { text: 'My new chart title' },
            xAxis: { show: true },
          },
        });
        await nextTick();

        expect(wrapper.vm.chart.setOption).toHaveBeenCalledTimes(2);
        expect(wrapper.vm.chart.setOption).toHaveBeenLastCalledWith({
          aria: { enabled: true },
          title: { text: 'My new chart title' },
          xAxis: { show: true },
        });
        expect(wrapper.emitted('updated')).toHaveLength(2);
      });
    });

    describe('when aria is explicitly disabled', () => {
      it('does not enable aria', async () => {
        createWrapper({
          options: { aria: { enabled: false } },
        });
        await nextTick();

        expect(wrapper.vm.chart.setOption).toHaveBeenCalledWith({
          aria: { enabled: false },
        });
      });
    });

    describe('with an accessible title', () => {
      it('adds it as a hidden title', async () => {
        createWrapper({ accessibleTitle: 'Sessions over time' });
        await nextTick();

        expect(wrapper.vm.chart.setOption).toHaveBeenCalledWith({
          aria: { enabled: true },
          title: { text: 'Sessions over time', show: false },
        });
      });

      it('keeps a title set in the options', async () => {
        createWrapper({
          accessibleTitle: 'Sessions over time',
          options: { title: { text: 'My chart title' } },
        });
        await nextTick();

        expect(wrapper.vm.chart.setOption).toHaveBeenCalledWith({
          aria: { enabled: true },
          title: { text: 'My chart title' },
        });
      });

      it('redraws the chart when it changes', async () => {
        createWrapper({ accessibleTitle: 'Sessions over time' });
        await nextTick();

        wrapper.setProps({ accessibleTitle: 'Sessions by flow' });
        await nextTick();

        expect(wrapper.vm.chart.setOption).toHaveBeenLastCalledWith({
          aria: { enabled: true },
          title: { text: 'Sessions by flow', show: false },
        });
      });
    });

    describe('when toolbox is enabled', () => {
      it('sets grid top to `toolboxHeight`', async () => {
        createWrapper({
          options: { toolbox: { show: true } },
        });
        await nextTick();

        expect(wrapper.vm.chart.setOption).toHaveBeenCalledWith({
          aria: { enabled: true },
          toolbox: { show: true },
          grid: { top: toolboxHeight },
        });
      });

      it('increases grid top by `toolboxHeight`', async () => {
        createWrapper({
          options: {
            toolbox: { show: true },
            grid: { top: 100 },
          },
        });
        await nextTick();

        expect(wrapper.vm.chart.setOption).toHaveBeenCalledWith({
          aria: { enabled: true },
          toolbox: { show: true },
          grid: { top: 100 + toolboxHeight },
        });
      });
    });
  });

  describe('sets chart dimensions', () => {
    it('sets dimensions', async () => {
      createWrapper();
      await nextTick();

      expect(wrapper.vm.chart.resize).toHaveBeenCalledTimes(1);
      expect(wrapper.vm.chart.resize).toHaveBeenLastCalledWith({
        height: 400,
        width: 'auto',
      });
    });

    it('sets custom dimensions', async () => {
      const width = 1234;
      const height = 123;

      createWrapper({
        width,
        height,
      });

      await nextTick();

      expect(wrapper.vm.chart.resize).toHaveBeenCalledTimes(1);
      expect(wrapper.vm.chart.resize).toHaveBeenLastCalledWith({
        width,
        height,
      });
    });

    describe('reacts to dimension changes', () => {
      beforeEach(async () => {
        createWrapper();
        await nextTick();
      });

      it('reacts to width changes', async () => {
        wrapper.setProps({
          width: 301,
        });
        await nextTick();

        expect(wrapper.vm.chart.resize).toHaveBeenCalledTimes(2);
        expect(wrapper.vm.chart.resize).toHaveBeenLastCalledWith({
          width: 301,
          height: defaultHeight,
        });
      });

      it('reacts to height changes', async () => {
        wrapper.setProps({
          height: 401,
        });
        await nextTick();

        expect(wrapper.vm.chart.resize).toHaveBeenCalledTimes(2);
        expect(wrapper.vm.chart.resize).toHaveBeenCalledWith({
          width: 'auto',
          height: 401,
        });
      });
    });
  });
});
