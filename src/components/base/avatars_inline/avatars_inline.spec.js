import { shallowMount } from '@vue/test-utils';

import Avatar from '../avatar/avatar.vue';
import GlTooltip from '../tooltip/tooltip.vue';
import AvatarsInline from './avatars_inline.vue';

describe('avatars inline', () => {
  let wrapper;
  const avatars = [
    { src: 'avatar 1', tooltip: 'Avatar 1' },
    { src: 'avatar 2', tooltip: 'Avatar 2' },
    { src: 'avatar 3', tooltip: 'Avatar 3' },
  ];
  const badgeSrOnlyText = 'additional users';

  const buildWrapper = (propsData = {}) => {
    wrapper = shallowMount(AvatarsInline, {
      propsData: {
        badgeSrOnlyText,
        ...propsData,
      },
      stubs: {
        GlTooltip,
      },
    });
  };

  const findBadgeTooltip = () => wrapper.findComponent(GlTooltip);

  it('displays all avatars when component is not collapsed', () => {
    buildWrapper({ avatars, maxVisible: 1, avatarSize: 24, collapsed: false });

    expect(wrapper.findAllComponents(Avatar)).toHaveLength(avatars.length);
  });

  describe('when component is collapsed and maxVisible is the number of avatars', () => {
    beforeEach(() => {
      buildWrapper({ avatars, maxVisible: avatars.length, avatarSize: 24, collapsed: true });
    });

    it('displays all avatars', () => {
      expect(wrapper.findAllComponents(Avatar)).toHaveLength(avatars.length);
    });
  });

  it('hides all additional avatars beyond maxVisible', () => {
    buildWrapper({ avatars, maxVisible: avatars.length - 1, avatarSize: 24, collapsed: true });

    expect(wrapper.findAllComponents(Avatar)).toHaveLength(2);
  });

  it('adds md class selector to badge when avatar size is 24', () => {
    buildWrapper({ avatars, maxVisible: 1, avatarSize: 24, collapsed: true });

    expect(wrapper.find('.gl-avatars-inline-badge').classes()).toContain('md');
  });

  it('adds lg class selector to badge when avatar size is 32', () => {
    buildWrapper({ avatars, maxVisible: 1, avatarSize: 32, collapsed: true });

    expect(wrapper.find('.gl-avatars-inline-badge').classes()).toContain('lg');
  });

  describe('badge tooltips', () => {
    describe('when badgeTooltipProp is not set', () => {
      beforeEach(() => {
        buildWrapper({ avatars, maxVisible: 1, avatarSize: 24, collapsed: true });
      });

      it('does not render the tooltip', () => {
        expect(findBadgeTooltip().exists()).toBe(false);
      });
    });

    describe('when badge tooltip prop is set but no max characters are set', () => {
      beforeEach(() => {
        buildWrapper({
          avatars,
          maxVisible: 1,
          avatarSize: 24,
          collapsed: true,
          badgeTooltipProp: 'tooltip',
        });
      });

      it('renders the tooltip with the names of the hidden avatars', () => {
        expect(findBadgeTooltip().text()).toBe('Avatar 2, Avatar 3');
      });
    });

    describe('when badge tooltip prop and max characters are set', () => {
      beforeEach(() => {
        buildWrapper({
          avatars,
          maxVisible: 1,
          avatarSize: 24,
          collapsed: true,
          badgeTooltipProp: 'tooltip',
          badgeTooltipMaxChars: 11,
        });
      });

      it('renders the tooltip with the truncated names of the hidden avatars', () => {
        expect(findBadgeTooltip().text()).toBe('Avatar 2...');
      });
    });
  });

  describe('a11y', () => {
    it('renders screen reader only text for the collapse badge', () => {
      buildWrapper({ avatars, maxVisible: 1, collapsed: true, avatarSize: 32 });

      expect(wrapper.find('[data-testid="badge-sr-only-text"]').text()).toBe(badgeSrOnlyText);
    });

    it('hides badge text for screen readers', () => {
      buildWrapper({ avatars, maxVisible: 1, collapsed: true, avatarSize: 32 });

      expect(
        wrapper.find('[data-testid="collapsed-avatars-badge"]').attributes('aria-hidden'),
      ).toBe('true');
    });
  });
});
