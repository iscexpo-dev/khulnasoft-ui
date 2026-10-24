import { shallowMount } from '@vue/test-utils';
import { useMockResizeObserver } from '~helpers/mock_dom_observer';
import { GlResizeObserverDirective, resetObserver } from './resize_observer';

describe('resize observer directive', () => {
  const { trigger, observersCount, observesElement } = useMockResizeObserver();

  const mockHandleResize = jest.fn();
  let wrapper;

  beforeEach(() => {
    // Reset the directive's shared observer to ensure test isolation
    resetObserver();
  });

  const createComponent = ({ template, data = {} } = {}) => {
    const defaultTemplate = `<div v-resize-observer="handleResize"></div>`;

    const component = {
      directives: {
        resizeObserver: GlResizeObserverDirective,
      },
      methods: {
        handleResize: mockHandleResize,
      },
      template: template || defaultTemplate,
      data() {
        return data;
      },
    };

    wrapper = shallowMount(component);
  };

  it('shares one observer between multiple directive instances', () => {
    createComponent({
      template: `<div>
          <span v-resize-observer="handleResize"></span>
          <span v-resize-observer="handleResize"></span>
          <span v-resize-observer="handleResize"></span>
        </div>`,
    });

    expect(ResizeObserver).toHaveBeenCalledTimes(1);
    expect(ResizeObserver.mock.instances).toHaveLength(1);
  });

  it('subscribes the given DOM element to be observed', () => {
    expect(observersCount()).toBe(0);

    createComponent();

    expect(observersCount()).toBe(1);
    expect(observesElement(wrapper.element)).toBe(true);
  });

  it('does not subscribe if the argument is false', () => {
    createComponent({ template: '<div v-resize-observer:[false]="handleResize"></div>' });

    expect(observersCount()).toBe(0);
    expect(observesElement(wrapper.element)).toBe(false);
  });

  it('passes the first entries "contentRect" and "target" to the given handler', () => {
    createComponent();

    trigger(wrapper.element, { entry: { contentRect: {} } });

    expect(mockHandleResize).toHaveBeenCalledTimes(1);
    expect(mockHandleResize).toHaveBeenCalledWith({ contentRect: {}, target: wrapper.element });
  });

  it("detaches then reattaches observer based on argument's value", async () => {
    expect(observersCount()).toBe(0);

    createComponent({
      template: '<div v-resize-observer:[isEnabled]="handleResize"></div>',
      data: {
        isEnabled: true,
      },
    });

    expect(observersCount()).toBe(1);
    expect(wrapper.element.glResizeHandler).not.toBe(undefined);

    await wrapper.setData({ isEnabled: false });

    expect(wrapper.element.glResizeHandler).toBe(undefined);

    await wrapper.setData({ isEnabled: true });

    expect(wrapper.element.glResizeHandler).not.toBe(undefined);
  });

  it('does a clean up when the component is destroyed', () => {
    createComponent();

    const { element } = wrapper;

    expect(element.glResizeHandler).not.toBe(undefined);

    wrapper.destroy();

    expect(element.glResizeHandler).toBe(undefined);
  });

  describe('check directive value', () => {
    it.each([3, '', undefined, null, false, {}, []])(
      'throws if the handler is %p instead of a function',
      (directiveValue) => {
        const testComponentWithoutHandler = {
          directives: {
            resizeObserver: GlResizeObserverDirective,
          },
          data() {
            return {
              directiveValue,
            };
          },
          template: `<div v-resize-observer="directiveValue"></div>`,
        };

        expect(() => {
          wrapper = shallowMount(testComponentWithoutHandler);
        }).toThrow(TypeError);
        expect(wrapper).toHaveLoggedVueErrors();
      },
    );
  });
});
