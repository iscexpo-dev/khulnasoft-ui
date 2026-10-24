import { shallowMount } from '@vue/test-utils';
import GlButton from '../button/button.vue';
import ColorModeToggle from './color_mode_toggle.vue';

describe('ColorModeToggle', () => {
  let wrapper;

  const createWrapper = (props = {}) => {
    wrapper = shallowMount(ColorModeToggle, {
      propsData: props,
    });
  };

  const findButton = () => wrapper.findComponent(GlButton);

  describe('default state', () => {
    beforeEach(() => {
      createWrapper();
    });

    it('renders a button with tertiary category', () => {
      expect(findButton().exists()).toBe(true);
      expect(findButton().props('category')).toBe('tertiary');
    });

    it('renders sun icon when dark mode is off', () => {
      expect(findButton().props('icon')).toBe('sun');
    });

    it('renders a medium button by default', () => {
      expect(findButton().props('size')).toBe('medium');
    });
  });

  describe('size prop', () => {
    it('passes the size through to the button', () => {
      createWrapper({ size: 'small' });

      expect(findButton().props('size')).toBe('small');
    });
  });

  describe('when isDarkMode is true', () => {
    beforeEach(() => {
      createWrapper({ isDarkMode: true });
    });

    it('renders moon icon', () => {
      expect(findButton().props('icon')).toBe('moon');
    });
  });

  describe('when isDarkMode is false', () => {
    beforeEach(() => {
      createWrapper({ isDarkMode: false });
    });

    it('renders sun icon', () => {
      expect(findButton().props('icon')).toBe('sun');
    });
  });

  describe('toggle event', () => {
    beforeEach(() => {
      createWrapper();
    });

    it('emits toggle event when button is clicked', () => {
      findButton().vm.$emit('click');

      expect(wrapper.emitted('toggle')).toHaveLength(1);
    });
  });
});
