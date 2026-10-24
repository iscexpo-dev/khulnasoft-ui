import { shallowMount } from '@vue/test-utils';
import GlInputGroupText from './input_group_text.vue';

describe('GlInputGroupText', () => {
  let wrapper;

  const createWrapper = (slots) => {
    wrapper = shallowMount(GlInputGroupText, {
      slots,
    });
  };

  it('uses "div" element', () => {
    createWrapper();
    expect(wrapper.element.tagName).toBe('DIV');
  });

  it('sets "input-group-text" css class', () => {
    createWrapper();
    expect(wrapper.classes()).toMatchObject(['input-group-text']);
  });

  it('renders content of default slot', () => {
    createWrapper({ default: 'test' });
    expect(wrapper.text()).toBe('test');
  });
});
