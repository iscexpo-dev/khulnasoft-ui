import { shallowMount } from '@vue/test-utils';
import GlButtonGroup from './button_group.vue';

describe('GlButtonGroup', () => {
  let wrapper;

  const createWrapper = (args) => {
    wrapper = shallowMount(GlButtonGroup, args);
  };

  it('renders button group', () => {
    createWrapper();
    expect(wrapper.element.tagName).toBe('DIV');
    expect(wrapper.classes()).toMatchObject(['gl-button-group', 'btn-group']);
    expect(wrapper.attributes('role')).toBe('group');
  });

  it('sets "btn-group-vertical" css class when `vertical` prop is `true`', () => {
    createWrapper({ propsData: { vertical: true } });
    expect(wrapper.classes()).toMatchObject(['gl-button-group-vertical', 'btn-group-vertical']);
  });

  it('renders content of default slot', () => {
    createWrapper({ slots: { default: 'test' } });
    expect(wrapper.text()).toBe('test');
  });
});
