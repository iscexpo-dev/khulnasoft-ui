import { shallowMount } from '@vue/test-utils';
import GlBaseAnimatedIcon from './base_animated_icon.vue';

describe('GlBaseAnimatedIcon component', () => {
  let wrapper;

  const createComponent = (options) => {
    wrapper = shallowMount(GlBaseAnimatedIcon, {
      ...options,
    });
  };

  describe('state class', () => {
    it.each`
      isOn     | expectedClass
      ${false} | ${'gl-animated-icon-off'}
      ${true}  | ${'gl-animated-icon-on'}
    `('adds the $expectedClass when isOn is $isOn', ({ isOn, expectedClass }) => {
      createComponent({ propsData: { isOn } });

      expect(wrapper.classes()).toStrictEqual([
        'gl-animated-icon',
        expectedClass,
        'gl-animated-icon-current',
      ]);
    });
  });

  describe('aria-label', () => {
    it('renders aria-label attribute', () => {
      const ariaLabel = "Icon's accessible label";
      createComponent({ propsData: { ariaLabel } });

      expect(wrapper.attributes('aria-label')).toBe(ariaLabel);
    });
  });

  describe('variant', () => {
    it.each`
      variant       | expectedClass
      ${'current'}  | ${'gl-animated-icon-current'}
      ${'default'}  | ${'gl-animated-icon-default'}
      ${'subtle'}   | ${'gl-animated-icon-subtle'}
      ${'strong'}   | ${'gl-animated-icon-strong'}
      ${'disabled'} | ${'gl-animated-icon-disabled'}
      ${'link'}     | ${'gl-animated-icon-link'}
      ${'info'}     | ${'gl-animated-icon-info'}
      ${'warning'}  | ${'gl-animated-icon-warning'}
      ${'danger'}   | ${'gl-animated-icon-danger'}
      ${'success'}  | ${'gl-animated-icon-success'}
    `('adds the $expectedClass class when variant is $variant', ({ variant, expectedClass }) => {
      createComponent({ propsData: { variant } });

      expect(wrapper.classes()).toStrictEqual([
        'gl-animated-icon',
        'gl-animated-icon-off',
        expectedClass,
      ]);
    });
  });
});
