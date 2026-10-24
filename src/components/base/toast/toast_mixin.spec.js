import { mount } from '@vue/test-utils';
// eslint-disable-next-line import-x/no-deprecated -- Deliberately testing the deprecated alias
import GlToastDefaultExport, { GlToastMixin, GlToastPlugin } from '.';

describe('GlToastMixin', () => {
  it('does not attach $toast property to components without the mixin', () => {
    const wrapper = mount({
      template: `<div />`,
    });

    expect(wrapper.vm.$toast).toBeUndefined();
  });

  it('shows a toast without the plugin being installed', async () => {
    const wrapper = mount({
      mixins: [GlToastMixin],
      template: `<div />`,
    });

    const toast = wrapper.vm.$toast.show('hello world');

    expect(toast).toEqual({
      id: expect.any(String),
      hide: expect.any(Function),
    });
  });
});

describe('GlToastPlugin', () => {
  it('installs the mixin', () => {
    const V = { mixin: jest.fn() };

    GlToastPlugin.install(V);

    expect(V.mixin).toHaveBeenCalledWith(GlToastMixin);
  });

  it('is the deprecated default export', () => {
    // eslint-disable-next-line import-x/no-deprecated -- Deliberately testing the deprecated alias
    expect(GlToastDefaultExport).toBe(GlToastPlugin);
  });
});
