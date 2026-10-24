import { shallowMount } from '@vue/test-utils';
import { waitForAnimationFrame } from '~/utils/test_utils';
import GlAnimatedNumber from './animated_number.vue';

const duration = 2000;
const ACTION_ANIMATED = 'animated';
const ACTION_ANIMATING = 'animating';

describe('GlAnimatedNumber', () => {
  let wrapper;

  const createComponent = ({
    number = 100,
    decimalPlaces = 0,
    useDelimiters = false,
    animateOnMount = false,
  } = {}) => {
    wrapper = shallowMount(GlAnimatedNumber, {
      propsData: {
        number,
        decimalPlaces,
        useDelimiters,
        duration,
        animateOnMount,
      },
    });
  };

  const runOutAnimationTimer = async () => {
    const {
      vm: { startTime },
    } = wrapper;

    wrapper.setData({
      startTime: startTime - duration,
    });

    await waitForAnimationFrame();
  };

  it('renders the component', () => {
    createComponent();

    expect(wrapper.findComponent(GlAnimatedNumber).exists()).toBe(true);
  });

  describe('when animateOnMount is false', () => {
    describe.each`
      withDecimal | number      | updatedNumber | decimalPlaces | useDelimiters | expectedInitialOnMount | expectedInitialOnUpdate
      ${false}    | ${100}      | ${200}        | ${0}          | ${false}      | ${'100'}               | ${'200'}
      ${true}     | ${100.2}    | ${200.2}      | ${1}          | ${false}      | ${'100.2'}             | ${'200.2'}
      ${true}     | ${100000.2} | ${200000.2}   | ${1}          | ${true}       | ${'100,000.2'}         | ${'200,000.2'}
    `(
      'when withDecimal = $withDecimal, useDelimiters = $useDelimiters',
      ({
        number,
        updatedNumber,
        decimalPlaces,
        useDelimiters,
        expectedInitialOnMount,
        expectedInitialOnUpdate,
      }) => {
        beforeEach(() => {
          createComponent({ number, decimalPlaces, useDelimiters });
        });

        it('displays the correct number on mount', async () => {
          await waitForAnimationFrame();

          expect(wrapper.text()).toBe(expectedInitialOnMount);
        });

        it('displays the correct number when updated', async () => {
          await waitForAnimationFrame();

          await wrapper.setProps({ number: updatedNumber });

          await runOutAnimationTimer();

          expect(wrapper.text()).toBe(expectedInitialOnUpdate);
        });
      },
    );
  });

  describe('when animateOnMount is true', () => {
    describe.each`
      withDecimal | number      | decimalPlaces | useDelimiters | expectedInitial | expectedEnd
      ${false}    | ${100}      | ${0}          | ${false}      | ${'0'}          | ${'100'}
      ${true}     | ${100.2}    | ${1}          | ${false}      | ${'0.0'}        | ${'100.2'}
      ${true}     | ${100000.2} | ${1}          | ${true}       | ${'0.0'}        | ${'100,000.2'}
    `(
      'when withDecimal = $withDecimal, useDelimiters = $useDelimiters',
      ({ number, decimalPlaces, useDelimiters, expectedInitial, expectedEnd }) => {
        beforeEach(() => {
          createComponent({ number, decimalPlaces, useDelimiters, animateOnMount: true });
        });

        it('displays the correct initial number', () => {
          expect(wrapper.text()).toBe(expectedInitial);
        });

        it('displays the correct end number', async () => {
          await runOutAnimationTimer();

          expect(wrapper.text()).toBe(expectedEnd);
        });
      },
    );
  });

  describe('animation event emissions', () => {
    beforeEach(() => {
      createComponent({ animateOnMount: true });
    });

    it(`emits ${ACTION_ANIMATING} when the animation starts`, () => {
      expect(wrapper.emitted(ACTION_ANIMATING)).toHaveLength(1);
    });

    it(`emits ${ACTION_ANIMATED} when the animation completes`, async () => {
      expect(wrapper.emitted(ACTION_ANIMATED)).toBeUndefined();

      await waitForAnimationFrame();

      expect(wrapper.emitted(ACTION_ANIMATED)).toBeUndefined();

      await runOutAnimationTimer();

      expect(wrapper.emitted(ACTION_ANIMATED)).toHaveLength(1);
    });
  });
});
