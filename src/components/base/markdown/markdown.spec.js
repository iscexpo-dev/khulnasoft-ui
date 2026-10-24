import { shallowMount } from '@vue/test-utils';
import GlMarkdown from './markdown.vue';

describe('GlMarkdown', () => {
  it('applies gl-compact-markdown class when compact property is true', () => {
    const wrapper = shallowMount(GlMarkdown, {
      propsData: {
        compact: true,
      },
    });

    expect(wrapper.classes()).toContain('gl-compact-markdown');
  });

  it('does not apply gl-compact-markdown class when compact property is false', () => {
    const wrapper = shallowMount(GlMarkdown, {
      propsData: {
        compact: false,
      },
    });

    expect(wrapper.classes()).not.toContain('gl-compact-markdown');
  });
});
