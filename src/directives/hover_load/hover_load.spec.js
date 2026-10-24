import { shallowMount } from '@vue/test-utils';
import { HoverLoadDirective as hoverLoad, DELAY_ON_HOVER } from './hover_load';

jest.useFakeTimers();

describe('hover load directive', () => {
  let wrapper;
  const findTarget = () => wrapper.findComponent('.target');

  const createComponent = (handleLoad) => {
    const component = {
      directives: {
        hoverLoad,
      },
      data() {
        return {
          handleLoad,
        };
      },
      template: `<div v-hover-load="handleLoad" class="target"></div>`,
    };

    wrapper = shallowMount(component);
  };

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it.each`
    hoverDuration         | action                | expectedCalls
    ${DELAY_ON_HOVER}     | ${'triggers'}         | ${1}
    ${DELAY_ON_HOVER - 1} | ${'does not trigger'} | ${0}
  `('$action the callback after $hoverDuration ms', ({ hoverDuration, expectedCalls }) => {
    const mockHandleLoad = jest.fn();
    createComponent(mockHandleLoad);

    findTarget().trigger('mouseover');

    jest.advanceTimersByTime(hoverDuration);

    findTarget().trigger('mouseout');

    expect(mockHandleLoad).toHaveBeenCalledTimes(expectedCalls);

    if (expectedCalls) {
      expect(mockHandleLoad).toHaveBeenCalledWith(findTarget().element);
    }
  });

  it('cleans up the mouseover event when component is destroyed', () => {
    createComponent(jest.fn());

    const target = findTarget().vm.$el;
    jest.spyOn(target, 'removeEventListener');
    wrapper.destroy();

    expect(target.removeEventListener).toHaveBeenCalledWith(
      'mouseover',
      expect.any(Function),
      true,
    );
  });
});
