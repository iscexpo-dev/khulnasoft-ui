import { shallowMount } from '@vue/test-utils';
import GlDropdownForm from './dropdown_form.vue';

describe('GlDropdownForm', () => {
  it('renders main components', () => {
    const wrapper = shallowMount(GlDropdownForm);
    expect(wrapper).toBeInstanceOf(Object);
  });
});
