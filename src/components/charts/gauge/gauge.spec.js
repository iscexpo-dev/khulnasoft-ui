import { shallowMount } from '@vue/test-utils';
import { mockCreateChartInstance } from '~helpers/chart_stubs';
import { gaugeSafeHues, gaugeWarningHue } from '../../../utils/charts/theme';
import Chart from '../chart/chart.vue';
import GlGauge from './gauge.vue';

const placeholder = '--';

const defaultProps = {
  value: 48,
  min: 0,
  max: 100,
};

let mockChartInstance;

jest.mock('echarts', () => ({
  getInstanceByDom: () => mockChartInstance,
}));

describe('gauge component', () => {
  let wrapper;

  const findChart = () => wrapper.findComponent(Chart);
  const findChartOptions = () => findChart().props('options');

  const findSeries = () => findChartOptions().series[0];

  const findDetailText = () => findSeries().detail.formatter();
  const findAxisColor = () => findSeries().axisLine.lineStyle.color;

  const emitChartCreated = () => findChart().vm.$emit('created', mockChartInstance);

  const createComponent = (props = {}) => {
    wrapper = shallowMount(GlGauge, { propsData: { ...defaultProps, ...props } });
    emitChartCreated();
  };

  beforeEach(() => {
    mockChartInstance = mockCreateChartInstance();
  });

  it('emits `created`, with the chart instance', () => {
    createComponent();

    expect(wrapper.emitted('created')).toHaveLength(1);
    expect(wrapper.emitted('created')[0][0]).toBe(mockChartInstance);
  });

  describe('min and max', () => {
    it('are correctly set', () => {
      createComponent();

      expect(findSeries().min).toBe(defaultProps.min);
      expect(findSeries().max).toBe(defaultProps.max);
    });

    it('if not provided, they are set to default values', () => {
      createComponent({});

      expect(findSeries().min).toBe(0);
      expect(findSeries().max).toBe(100);
    });
  });

  describe('gauge detail text', () => {
    const text = 'Sample text';

    it('is displayed when text prop is set', () => {
      createComponent({ text });

      expect(findDetailText()).toBe(text);
    });

    it('is equal to value when text prop is not set', () => {
      createComponent({ value: 30 });

      expect(findDetailText()).toBe(30);
    });

    it('is equal to value when text prop is not set and value is less than min', () => {
      createComponent({ value: 30, min: 100, max: 500 });

      expect(findDetailText()).toBe(30);
    });

    it('is equal to value when text prop is not set and value is more than max', () => {
      createComponent({ value: 600, min: 100, max: 500 });

      expect(findDetailText()).toBe(600);
    });

    it('shows a placeholder when text prop is not set and value is NaN', () => {
      createComponent({ value: 'not a number' });

      expect(wrapper).toHaveLoggedVueWarnings();
      expect(findDetailText()).toBe(placeholder);
    });
  });

  describe('gauge splits', () => {
    it('are 10 in number when no prop is set', () => {
      createComponent();

      expect(findSeries().splitNumber).toBe(10);
    });

    it('are set to correct value when prop is set', () => {
      createComponent({ splitNumber: 30 });

      expect(findSeries().splitNumber).toBe(30);
    });
  });

  describe('thresholds and related colors', () => {
    describe('when no threshold is set', () => {
      beforeEach(() => {
        createComponent();
      });

      it('axis has a single color set', () => {
        expect(findAxisColor()).toHaveLength(1);
      });

      it('axis has correct color set', () => {
        expect(findAxisColor()[0]).toEqual([1, gaugeSafeHues[0]]);
      });
    });

    describe('when one threshold is set', () => {
      beforeEach(() => {
        createComponent({ thresholds: [50] });
      });

      it('axis has two colors set', () => {
        expect(findAxisColor()).toHaveLength(2);
      });

      it('first color is a safely looking color', () => {
        expect(findAxisColor()[0]).toEqual([0.5, gaugeSafeHues[0]]);
      });

      it('second color denotes the danger/warning zone', () => {
        expect(findAxisColor()[1]).toEqual([1, gaugeWarningHue]);
      });
    });

    describe('when two thresholds are set', () => {
      beforeEach(() => {
        createComponent({ thresholds: [50, 95] });
      });

      it('axis has three colors set', () => {
        expect(findAxisColor()).toHaveLength(3);
      });

      it('first color is a safely looking color', () => {
        expect(findAxisColor()[0]).toEqual([0.5, gaugeSafeHues[0]]);
      });

      it('second color is also safely looking, but a bit darker', () => {
        expect(findAxisColor()[1]).toEqual([0.95, gaugeSafeHues[1]]);
      });

      it('third color denotes the danger/warning zone', () => {
        expect(findAxisColor()[2]).toEqual([1, gaugeWarningHue]);
      });
    });

    describe('when more than two thresholds are set', () => {
      it('only two of them are used', () => {
        createComponent({ thresholds: [95, 50, 15, 25] });
        expect(findAxisColor()).toHaveLength(3);
      });

      it('if some of them are invalid values they are skipped', () => {
        createComponent({ thresholds: [undefined, 95, 'a string', NaN, 50, 15, 25] });

        expect(wrapper).toHaveLoggedVueWarnings();

        expect(findAxisColor()).toHaveLength(3);
      });
    });

    describe('thresholds are sorted by numeric value', () => {
      it('when values are valid', () => {
        createComponent({ thresholds: [95, 50, 15, 25] });

        expect(findAxisColor()).toHaveLength(3);
        expect(findAxisColor()[0]).toEqual([0.5, gaugeSafeHues[0]]);
        expect(findAxisColor()[1]).toEqual([0.95, gaugeSafeHues[1]]);
        expect(findAxisColor()[2]).toEqual([1, gaugeWarningHue]);
      });

      it('when some values are invalid', () => {
        createComponent({ thresholds: [NaN, 95, undefined, 'a string', 50, 15, 25] });

        expect(wrapper).toHaveLoggedVueWarnings();

        expect(findAxisColor()).toHaveLength(3);
        expect(findAxisColor()[0]).toEqual([0.5, gaugeSafeHues[0]]);
        expect(findAxisColor()[1]).toEqual([0.95, gaugeSafeHues[1]]);
        expect(findAxisColor()[2]).toEqual([1, gaugeWarningHue]);
      });
    });

    describe('when thresholds outside of min and max range are set, they will not show on the arc', () => {
      beforeEach(() => {
        createComponent({ thresholds: [-50, -0.1, 150] });
      });

      it('axis has a single color set', () => {
        expect(findAxisColor()).toHaveLength(1);
      });
    });

    describe('when thresholds that are not numbers are set, they will not show on the arc', () => {
      beforeEach(async () => {
        createComponent({ thresholds: ['not a number', NaN, undefined] });

        // eslint-disable-next-line jest/no-standalone-expect
        expect(wrapper).toHaveLoggedVueWarnings();
      });

      it('axis has a single color set', () => {
        expect(findAxisColor()).toHaveLength(1);
      });
    });

    describe('when custom options are added', () => {
      it('options get applied on the chart instance', () => {
        createComponent({ option: { series: [{ min: 30, max: 50 }] } });

        expect(findChartOptions().series[0].min).toBe(30);
        expect(findChartOptions().series[0].max).toBe(50);
      });

      describe('options are merged with values set as props', () => {
        beforeEach(() => {
          createComponent({
            min: 10,
            max: 20,
            splitNumber: 20,
            option: { series: [{ min: 30, max: 50 }] },
          });
        });

        it('they override props', () => {
          expect(findChartOptions().series[0].min).toBe(30);
          expect(findChartOptions().series[0].max).toBe(50);
        });

        it('they leave values that are not overriden as is', () => {
          expect(findChartOptions().series[0].splitNumber).toBe(20);
        });
      });
    });
  });
});
