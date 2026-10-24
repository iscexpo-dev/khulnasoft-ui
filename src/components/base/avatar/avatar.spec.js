import { shallowMount } from '@vue/test-utils';
import { avatarSizeOptions } from '../../../utils/constants';
import GlAvatar from './avatar.vue';

describe('GlAvatar', () => {
  let wrapper;

  const createWrapper = (props) => {
    wrapper = shallowMount(GlAvatar, {
      propsData: props,
    });
  };

  describe('size property', () => {
    it('uses default size if none is provided', () => {
      createWrapper();

      expect(wrapper.props('size')).toBe(avatarSizeOptions[1]);
    });

    describe('when number is passed', () => {
      it.each([96, 64, 48, 32, 24, 16])('accepts size %s', (size) => {
        createWrapper({ size });

        expect(wrapper.props('size')).toBe(size);
      });

      it.each([12, 28, 36, 54, 98])('displays an error for size %s', (size) => {
        createWrapper({ size });

        expect(wrapper).toHaveLoggedVueWarnings();
      });

      it('adds correct CSS class to avatar', () => {
        createWrapper({ size: 16 });

        expect(wrapper.classes()).toContain('gl-avatar-s16');
      });
    });

    describe('when object is passed', () => {
      it('displays error if any of the sizes are invalid', () => {
        createWrapper({ size: { default: 16, md: 32, lg: 65 } });

        expect(wrapper).toHaveLoggedVueWarnings();
      });

      it('adds correct CSS classes to avatar', () => {
        createWrapper({ size: { default: 16, md: 32, lg: 64 } });

        expect(wrapper.classes()).toContain(
          'gl-avatar-s16',
          'gl-md-avatar-s32',
          'gl-lg-avatar-s64',
        );
      });
    });
  });

  describe('fallbackOnError property', () => {
    const findImage = () => wrapper.find('img');

    beforeEach(() => {
      createWrapper({ fallbackOnError: true, src: 'someproject.jpg' });
    });

    it('shows fallback identicon when image fails to load', async () => {
      await findImage().trigger('error');

      expect(findImage().exists()).toBe(false);
      expect(wrapper.find('.gl-avatar-identicon').exists()).toBe(true);
    });

    it('emits load-error event when image fails to load', async () => {
      await findImage().trigger('error');

      expect(wrapper.emitted('load-error')).toHaveLength(1);
    });

    it('allows changing the source when initially provided image fails to load', async () => {
      await findImage().trigger('error');

      expect(findImage().exists()).toBe(false);

      await wrapper.setProps({ src: 'foo.jpg' });

      expect(findImage().exists()).toBe(true);
      expect(wrapper.find('.gl-avatar-identicon').exists()).toBe(false);
    });
  });

  describe('aria-hidden property', () => {
    it('sets aria-hidden to true when there is no src', () => {
      createWrapper();

      expect(wrapper.attributes('aria-hidden')).toBe('true');
    });

    it('does not set aria-hidden when src is provided', () => {
      createWrapper({ src: 'foo.jpg' });

      expect(wrapper.attributes('aria-hidden')).toBe(undefined);
    });
  });
});
