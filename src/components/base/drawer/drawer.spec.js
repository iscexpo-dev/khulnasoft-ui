import { shallowMount } from '@vue/test-utils';
import Drawer from './drawer.vue';

describe('drawer component', () => {
  let wrapper;
  const mountWithOpts = ({ props = { open: true }, slots = {} }) => {
    wrapper = shallowMount(Drawer, { propsData: props, slots });
  };

  describe('default settings', () => {
    describe('when open is true', () => {
      it('makes gl-drawer visible when open is true', () => {
        mountWithOpts({});

        expect(wrapper.isVisible()).toBe(true);
      });
    });

    describe('when header-height is set', () => {
      it('renders drawer container with `top` and `max-height` styles', () => {
        const headerHeight = '40px';
        mountWithOpts({ props: { open: true, headerHeight } });

        expect(wrapper.find('aside').attributes('style')).toBe(
          `top: ${headerHeight}; z-index: 10; max-height: calc(100vh - ${headerHeight});`,
        );
      });
    });

    describe('when sticky header is true', () => {
      it('renders drawer header with sticky position', () => {
        mountWithOpts({ props: { open: true, headerSticky: true } });
        const header = wrapper.find('.gl-drawer-header');
        const body = wrapper.find('.gl-drawer-body');

        expect(header.classes()).toContain('gl-drawer-header-sticky');
        expect(body.classes()).toContain('gl-drawer-body-shrink');
        expect(header.attributes('style')).toBe('z-index: 10;');
      });
    });

    describe('when open is false', () => {
      it('cannot find aside html element', () => {
        mountWithOpts({ props: { open: false } });

        expect(wrapper.find('aside').exists()).toBe(false);
      });
    });

    describe('on click of the close button', () => {
      it('emits close event', () => {
        mountWithOpts({ props: { open: true } });

        wrapper.find('.gl-drawer-close-button').vm.$emit('click');

        expect(wrapper.emitted().close).toHaveLength(1);
      });
    });

    describe('on esc keydown', () => {
      it('emits close event when open is true', () => {
        mountWithOpts({ props: { open: true } });

        const event = new KeyboardEvent('keydown', { keyCode: 27 });
        document.dispatchEvent(event);

        expect(wrapper.emitted().close).toHaveLength(1);
      });

      it('does not call onClose when open is false', () => {
        mountWithOpts({ props: { open: false } });

        const event = new KeyboardEvent('keydown', { keyCode: 27 });
        document.dispatchEvent(event);

        expect(wrapper.emitted('close')).toBe(undefined);
      });

      it('does not call onClose when open is false and keyCode is not esc', () => {
        mountWithOpts({ props: { open: false } });

        const event = new KeyboardEvent('keydown', { keyCode: 37 });
        document.dispatchEvent(event);

        expect(wrapper.emitted('close')).toBe(undefined);
      });
    });
  });

  it.each`
    slot         | parentSelector
    ${'title'}   | ${'.gl-drawer-title'}
    ${'header'}  | ${'.gl-drawer-header'}
    ${'default'} | ${'.gl-drawer-body'}
    ${'footer'}  | ${'.gl-drawer-footer'}
  `('renders nodes when added to the $slot slot', ({ slot, parentSelector }) => {
    mountWithOpts({
      slots: {
        [slot]: `<div data-testid="${slot}" />`,
      },
    });

    // eslint-disable-next-line unicorn/no-array-callback-reference
    expect(wrapper.find(parentSelector).find(`[data-testid="${slot}"]`).exists()).toBe(true);
  });

  it('should add scrim to footer', () => {
    mountWithOpts({
      slots: {
        footer: `<div data-testid="footer" />`,
      },
    });

    expect(wrapper.find('.gl-drawer-footer').classes()).toContain('gl-drawer-body-scrim-on-footer');
    expect(wrapper.find('.gl-drawer-body').classes()).not.toContain('gl-drawer-body-scrim');
  });

  it('should add scrim to scrollable container', () => {
    mountWithOpts({
      slots: {
        default: `<div data-testid="default" />`,
      },
    });

    expect(wrapper.find('.gl-drawer-footer').exists()).toBe(false);
    expect(wrapper.find('.gl-drawer-body').classes()).toContain('gl-drawer-body-scrim');
  });

  it.each`
    variant      | variantClass
    ${'default'} | ${'gl-drawer-default'}
    ${'sidebar'} | ${'gl-drawer-sidebar'}
  `('adds class depending on variant prop', ({ variant, variantClass }) => {
    mountWithOpts({ props: { open: true, variant } });

    expect(wrapper.find('.gl-drawer').classes()).toContain(variantClass);
  });
});
