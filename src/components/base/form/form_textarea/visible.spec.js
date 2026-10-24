import { shallowMount } from '@vue/test-utils';
import { useMockIntersectionObserver } from '../../../../utils/use_mock_intersection_observer';
import { GlVisibleDirective, resetObserver } from './visible';

describe('visible directive', () => {
  const { getInstances, trigger, observersCount, observesElement } = useMockIntersectionObserver();
  const mockHandleVisible = jest.fn();
  let wrapper;

  beforeEach(() => {
    // Reset the directive's shared observer to ensure test isolation
    resetObserver();
    mockHandleVisible.mockClear();
  });

  const createComponent = ({ template, data = {} } = {}) => {
    const component = {
      directives: { glVisible: GlVisibleDirective },
      methods: { handleVisible: mockHandleVisible },
      template: template || `<div v-gl-visible="handleVisible"></div>`,
      data() {
        return data;
      },
    };

    wrapper = shallowMount(component);
  };

  it('shares one observer between multiple directive instances', () => {
    createComponent({
      template: `<div>
          <span v-gl-visible="handleVisible"></span>
          <span v-gl-visible="handleVisible"></span>
          <span v-gl-visible="handleVisible"></span>
        </div>`,
    });

    expect(IntersectionObserver).toHaveBeenCalledTimes(1);
    expect(getInstances()).toHaveLength(1);
    const [observer] = getInstances();
    expect(observersCount(observer)).toBe(3);
  });

  it('creates the IntersectionObserver with a 640px rootMargin', () => {
    createComponent();

    expect(IntersectionObserver).toHaveBeenCalledWith(expect.any(Function), {
      rootMargin: '640px',
    });
  });

  it('invokes the callback when the element intersects', () => {
    createComponent();

    const [observer] = getInstances();
    trigger(observer, wrapper.element, { entry: { isIntersecting: true } });

    expect(mockHandleVisible).toHaveBeenCalledTimes(1);
  });

  it('does not invoke the callback when not intersecting', () => {
    createComponent();

    const [observer] = getInstances();
    trigger(observer, wrapper.element, { entry: { isIntersecting: false } });

    expect(mockHandleVisible).not.toHaveBeenCalled();
  });

  it('detaches the handler when the component is destroyed', () => {
    createComponent();

    const { element } = wrapper;
    expect(element.glVisibleHandler).not.toBe(undefined);

    wrapper.destroy();

    expect(element.glVisibleHandler).toBe(undefined);
  });

  it('re-binds the shared observer when the element is swapped via v-if/v-else', async () => {
    createComponent({
      template: `
        <div>
          <span v-if="useFirst" key="first" v-gl-visible="handleVisible" data-testid="first"></span>
          <span v-else key="second" v-gl-visible="handleVisible" data-testid="second"></span>
        </div>
      `,
      data: { useFirst: true },
    });

    const [observer] = getInstances();
    const firstEl = wrapper.find('[data-testid="first"]').element;
    expect(observersCount(observer)).toBe(1);
    expect(observesElement(observer, firstEl)).toBe(true);

    trigger(observer, firstEl, { entry: { isIntersecting: true } });
    expect(mockHandleVisible).toHaveBeenCalledTimes(1);

    await wrapper.setData({ useFirst: false });

    expect(getInstances()).toHaveLength(1);

    const secondEl = wrapper.find('[data-testid="second"]').element;
    expect(observersCount(observer)).toBe(1);
    expect(observesElement(observer, secondEl)).toBe(true);

    trigger(observer, secondEl, { entry: { isIntersecting: true } });
    expect(mockHandleVisible).toHaveBeenCalledTimes(2);
  });

  it.each([3, '', undefined, null, false, {}, []])(
    'throws when the value is %p instead of a function',
    (directiveValue) => {
      const component = {
        directives: { glVisible: GlVisibleDirective },
        data() {
          return { directiveValue };
        },
        template: `<div v-gl-visible="directiveValue"></div>`,
      };

      expect(() => {
        wrapper = shallowMount(component);
      }).toThrow(TypeError);
      expect(wrapper).toHaveLoggedVueErrors();
    },
  );
});
