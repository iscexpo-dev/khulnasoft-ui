import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import { waitForAnimationFrame } from '../../../utils/test_utils';
import Collapse from './collapse.vue';

describe('collapse', () => {
  const origGetBCR = Element.prototype.getBoundingClientRect;

  beforeEach(() => {
    // Mock `getBoundingClientRect()` so that the we can get a fake height for element
    // Needed for keyboard navigation testing
    Element.prototype.getBoundingClientRect = jest.fn(() => ({
      width: 100,
      height: 100,
      top: 0,
      left: 0,
      bottom: 0,
      right: 0,
    }));
  });

  afterEach(() => {
    // Reset overrides
    Element.prototype.getBoundingClientRect = origGetBCR;
  });

  it('should have expected default structure', async () => {
    const wrapper = mount(Collapse);
    await nextTick();
    await waitForAnimationFrame();
    expect(wrapper.classes()).toContain('collapse');
    expect(wrapper.classes()).not.toContain('show');
    expect(wrapper.element.style.display).toEqual('none');
    expect(wrapper.text()).toEqual('');
  });

  it('renders default slot content', async () => {
    const wrapper = mount(Collapse, {
      slots: {
        default: '<div>foobar</div>',
      },
    });
    await nextTick();
    await waitForAnimationFrame();
    expect(wrapper.classes()).toContain('collapse');
    expect(wrapper.classes()).not.toContain('show');
    expect(wrapper.element.style.display).toEqual('none');
    expect(wrapper.find('div > div').exists()).toBe(true);
    expect(wrapper.text()).toEqual('foobar');
  });

  it('renders with the correct tag when tag prop is passed in', async () => {
    const wrapper = mount(Collapse, {
      propsData: {
        tag: 'button',
      },
    });
    expect(wrapper.element.tagName).toBe('BUTTON');
  });

  it('should mount as visible when prop visible is true', async () => {
    const wrapper = mount(Collapse, {
      propsData: {
        visible: true,
      },
      slots: {
        default: '<div>foobar</div>',
      },
    });
    await nextTick();
    await waitForAnimationFrame();
    expect(wrapper.classes()).toContain('show');
    expect(wrapper.classes()).toContain('collapse');
    expect(wrapper.element.style.display).toEqual('');
    expect(wrapper.find('div > div').exists()).toBe(true);
    expect(wrapper.text()).toEqual('foobar');
  });

  it('should emit its state on mount (initially hidden)', async () => {
    const wrapper = mount(Collapse, {
      slots: {
        default: '<div>foobar</div>',
      },
    });
    await nextTick();
    await waitForAnimationFrame();
    expect(wrapper.emitted('show')).toBeUndefined();
    expect(wrapper.emitted('input')).toStrictEqual([[false]]);
    expect(wrapper.element.style.display).toEqual('none');
  });

  it('should emit its state on mount (initially visible)', async () => {
    const wrapper = mount(Collapse, {
      propsData: {
        visible: true,
      },
      slots: {
        default: '<div>foobar</div>',
      },
    });
    await nextTick();
    await waitForAnimationFrame();
    expect(wrapper.emitted('show')).toBeUndefined(); // Does not emit show when initially visible
    expect(wrapper.emitted('input')).toStrictEqual([[true]]);
    expect(wrapper.element.style.display).toEqual('');
  });

  it('setting visible to true after mount shows collapse', async () => {
    const wrapper = mount(Collapse, {
      propsData: {
        visible: false,
      },
      slots: {
        default: '<div>foobar</div>',
      },
    });
    await nextTick();
    await waitForAnimationFrame();

    expect(wrapper.emitted('show')).toBeUndefined();
    expect(wrapper.emitted('input')).toStrictEqual([[false]]);

    expect(wrapper.element.style.display).toEqual('none');

    // Change visible prop
    await wrapper.setProps({
      visible: true,
    });
    await nextTick();
    await waitForAnimationFrame();

    expect(wrapper.emitted('input')).toStrictEqual([[false], [true]]);
    expect(wrapper.element.style.display).toEqual('');
  });

  it('default slot scope works', async () => {
    let scope = null;
    const wrapper = mount(Collapse, {
      propsData: {
        visible: true,
      },
      scopedSlots: {
        default(props) {
          scope = props;
          return this.$createElement('div', 'foobar');
        },
      },
    });
    await nextTick();
    await waitForAnimationFrame();
    expect(wrapper.element.style.display).toEqual('');
    expect(wrapper.emitted('show')).toBeUndefined(); // Does not emit show when initially visible
    expect(wrapper.emitted('input')).toStrictEqual([[true]]);

    expect(scope).not.toBe(null);
    expect(scope.visible).toBe(true);
    expect(typeof scope.close).toBe('function');

    scope.close();
    await nextTick();
    await waitForAnimationFrame();

    expect(scope).not.toBe(null);
    expect(scope.visible).toBe(false);
    expect(typeof scope.close).toBe('function');
  });
});
