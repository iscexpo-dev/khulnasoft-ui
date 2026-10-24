import { nextTick } from 'vue';
import { mount } from '@vue/test-utils';
import { waitForAnimationFrame } from '../../../utils/test_utils';
import GlAnimatedChevronRightDownIcon from '../animated_icon/animated_chevron_right_down_icon.vue';
import GlCollapse from '../collapse/collapse.vue';
import GlButton from '../button/button.vue';
import GlAccordionItem from './accordion_item.vue';
import { COLLAPSE_EVENT } from './constants';

describe('GlAccordionItem', () => {
  let wrapper;
  const defaultTitle = 'Item 1';
  const titleVisible = 'Item 1 visible';
  const defaultSlot = 'Hello';

  const createComponent = (props = {}, { defaultHeaderLevel = 3, autoCollapse = false } = {}) => {
    wrapper = mount(GlAccordionItem, {
      provide: {
        defaultHeaderLevel,
        autoCollapse,
      },
      propsData: {
        title: defaultTitle,
        ...props,
      },
      slots: {
        default: defaultSlot,
      },
      attachTo: document.body,
    });
  };

  const findButton = () => wrapper.findComponent(GlButton);
  const findChevron = () => wrapper.findComponent(GlAnimatedChevronRightDownIcon);
  const findCollapse = () => wrapper.findComponent(GlCollapse);
  const findHeader = () => wrapper.find('.gl-accordion-item-header');

  it('renders button with text, aria-controls, and aria-expanded', () => {
    createComponent();

    expect(findButton().find('span').text()).toBe(defaultTitle);
    expect(findButton().attributes('aria-controls')).toBe('accordion-item-1');
    expect(findButton().attributes('aria-expanded')).toBe('false');
  });

  it('renders alternative button text when the content is visible and the titleVisible property is set', async () => {
    createComponent({ titleVisible });
    await nextTick();
    expect(findButton().find('span').text()).toBe(defaultTitle);

    await findButton().trigger('click');
    await waitForAnimationFrame();

    expect(findButton().find('span').text()).toBe(titleVisible);
  });

  it('renders the appropriate header element', () => {
    createComponent({}, { defaultHeaderLevel: 3 });

    expect(wrapper.find('h3.gl-accordion-item-header').exists()).toBe(true);
    expect(wrapper.find('h4.gl-accordion-item-header').exists()).toBe(false);
  });

  it('renders the appropriate header element when overridden', () => {
    createComponent({ headerLevel: 4 }, { defaultHeaderLevel: 3 });

    expect(wrapper.find('h3.gl-accordion-item-header').exists()).toBe(false);
    expect(wrapper.find('h4.gl-accordion-item-header').exists()).toBe(true);
  });

  it.each(['custom-header-class', ['custom-header-class'], { 'custom-header-class': true }])(
    'applies custom classes to the header',
    (customClassProp) => {
      createComponent({ headerClass: customClassProp }, { defaultHeaderLevel: 3 });

      expect(findHeader().classes()).toContain('custom-header-class');
    },
  );

  it('renders slot text', () => {
    createComponent();

    expect(findCollapse().text()).toBe(defaultSlot);
  });

  it('is not expanded by default', () => {
    createComponent();

    expect(findChevron().props('isOn')).toBe(false);
    expect(findCollapse().props('visible')).toBe(false);
  });

  it('is expanded on button click', async () => {
    createComponent();
    await nextTick();
    await findButton().trigger('click');
    await waitForAnimationFrame();

    expect(findChevron().props('isOn')).toBe(true);
    expect(findCollapse().props('visible')).toBe(true);
    expect(findButton().attributes('aria-expanded')).toBe('true');
  });

  it('expands initially when visible prop is passed', async () => {
    createComponent({ visible: true });

    await nextTick();

    expect(findChevron().props('isOn')).toBe(true);
    expect(findCollapse().props('visible')).toBe(true);
  });

  it('emits the initial visible state', () => {
    createComponent({ visible: true });

    expect(wrapper.emitted('input')).toEqual([[true]]);
  });

  it('emits the visible state when toggled', async () => {
    createComponent({ visible: true });
    await nextTick();
    await findButton().trigger('click');
    await waitForAnimationFrame();

    expect(wrapper.emitted('input')).toEqual([[true], [false]]);
  });

  describe('when autoCollapse prop is false', () => {
    it('does not dispatch collapse event on parent element when opened', async () => {
      createComponent({ visible: false });
      await nextTick();

      const dispatchSpy = jest.spyOn(wrapper.vm.$parent.$el, 'dispatchEvent');

      await findButton().trigger('click');
      await waitForAnimationFrame();

      expect(dispatchSpy).not.toHaveBeenCalled();
    });
  });

  describe('when autoCollapse prop is true', () => {
    it('dispatches collapse event on parent element when opened', async () => {
      createComponent({ visible: false }, { autoCollapse: true });
      await nextTick();

      const dispatchSpy = jest.spyOn(wrapper.vm.$parent.$el, 'dispatchEvent');

      await findButton().trigger('click');
      await waitForAnimationFrame();

      expect(dispatchSpy).toHaveBeenCalledWith(
        new CustomEvent(COLLAPSE_EVENT, { detail: 'accordion-item-1' }),
      );
    });
  });

  describe('when visible prop is changed', () => {
    it('opens accordion item', async () => {
      createComponent({ visible: false });
      await nextTick();
      wrapper.setProps({ visible: true });
      await waitForAnimationFrame();

      expect(findButton().attributes('aria-expanded')).toBe('true');
    });

    describe('when autoCollapse prop is false', () => {
      it('does not dispatch collapse event on parent element', async () => {
        createComponent({ visible: false });
        await nextTick();

        const dispatchSpy = jest.spyOn(wrapper.vm.$parent.$el, 'dispatchEvent');

        wrapper.setProps({ visible: true });
        await waitForAnimationFrame();

        expect(dispatchSpy).not.toHaveBeenCalled();
      });
    });

    describe('when autoCollapse prop is true', () => {
      it('dispatches collapse event on parent element', async () => {
        createComponent({ visible: false }, { autoCollapse: true });
        await nextTick();

        const dispatchSpy = jest.spyOn(wrapper.vm.$parent.$el, 'dispatchEvent');

        wrapper.setProps({ visible: true });
        await waitForAnimationFrame();

        expect(dispatchSpy).toHaveBeenCalledWith(
          new CustomEvent(COLLAPSE_EVENT, { detail: 'accordion-item-1' }),
        );
      });
    });
  });

  describe('when collapse event is dispatched on parent element', () => {
    describe('when accordion item ID matches current accordion item', () => {
      beforeEach(async () => {
        createComponent({ visible: true }, { autoCollapse: true });
        await nextTick();

        wrapper.vm.$parent.$el.dispatchEvent(
          new CustomEvent(COLLAPSE_EVENT, { detail: 'accordion-item-1' }),
        );

        await waitForAnimationFrame();
      });

      it('does not collapse accordion item', () => {
        expect(wrapper.emitted('input')).toEqual([[true]]);
        expect(findButton().attributes('aria-expanded')).toBe('true');
      });
    });

    describe('when accordion item ID does not match current accordion item', () => {
      beforeEach(async () => {
        createComponent({ visible: true }, { autoCollapse: true });
        await nextTick();

        wrapper.vm.$parent.$el.dispatchEvent(
          new CustomEvent(COLLAPSE_EVENT, { detail: 'accordion-item-2' }),
        );

        await waitForAnimationFrame();
      });

      it('collapses accordion item', () => {
        expect(wrapper.emitted('input')).toEqual([[true], [false]]);
        expect(findButton().attributes('aria-expanded')).toBe('false');
      });
    });
  });
});
