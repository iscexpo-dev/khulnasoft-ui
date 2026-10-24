import { shallowMount } from '@vue/test-utils';
import CloseButton from '../../shared_components/close_button/close_button.vue';
import Token from './token.vue';

const findIcon = (wrapper) => wrapper.findComponent(CloseButton);

describe('Token component', () => {
  let wrapper;

  const viewOnlyClass = 'gl-token-view-only';

  const createComponent = (propsData) =>
    shallowMount(Token, {
      propsData,
    });

  it('emits close when "x" is clicked', () => {
    wrapper = createComponent();
    findIcon(wrapper).vm.$emit('click');
    expect(wrapper.emitted('close')).toHaveLength(1);
  });

  it('hides the icon when view-only', () => {
    wrapper = createComponent({ viewOnly: true });
    expect(findIcon(wrapper).exists()).toBe(false);
  });

  it('includes view-only class when view-only', () => {
    wrapper = createComponent({ viewOnly: true });
    expect(wrapper.classes()).toContain(viewOnlyClass);
  });

  it('does not include view-only class when not view-only', () => {
    wrapper = createComponent({ viewOnly: false });
    expect(wrapper.classes()).not.toContain(viewOnlyClass);
  });

  it.each`
    variant           | cssClass
    ${undefined}      | ${'gl-token-default-variant'}
    ${'default'}      | ${'gl-token-default-variant'}
    ${'search-type'}  | ${'gl-token-search-type-variant'}
    ${'search-value'} | ${'gl-token-search-value-variant'}
  `('sets class .$cssClass when variant is $variant', ({ variant, cssClass }) => {
    wrapper = createComponent({ viewOnly: true, variant });
    expect(wrapper.classes()).toContain(cssClass);
  });
});
