import { shallowMount } from '@vue/test-utils';
import GlLink from '../link/link.vue';
import { badgeVariantOptions, linkVariantUnstyled } from '../../../utils/constants';
import Icon from '../icon/icon.vue';
import Badge from './badge.vue';

describe('badge', () => {
  let wrapper;

  const findIcon = () => wrapper.findComponent(Icon);
  const findLink = () => wrapper.findComponent(GlLink);

  const createComponent = ({ attrs = {}, propsData = {}, slots, listeners = {} } = {}) => {
    wrapper = shallowMount(Badge, {
      propsData,
      attrs,
      slots,
      listeners,
    });
  };

  describe('with "icon" prop', () => {
    describe.each`
      scenario                | hasSlot  | iconName     | iconSize | expectedIconSize | expectedRole | expectedAriaLabel
      ${'icon-only'}          | ${false} | ${'warning'} | ${'md'}  | ${16}            | ${'img'}     | ${undefined}
      ${'16px icon and slot'} | ${true}  | ${'warning'} | ${'md'}  | ${16}            | ${undefined} | ${undefined}
      ${'12px icon and slot'} | ${true}  | ${'warning'} | ${'sm'}  | ${12}            | ${undefined} | ${undefined}
    `(
      'with $scenario',
      ({ iconName, iconSize, expectedIconSize, hasSlot, expectedRole, expectedAriaLabel }) => {
        beforeEach(() => {
          const slots = hasSlot ? { default: 'slot-content' } : undefined;
          createComponent({ propsData: { icon: iconName, iconSize }, slots });
        });

        it(`sets badge "role" attribute to ${expectedRole}`, () => {
          expect(wrapper.attributes('role')).toBe(expectedRole);
        });

        describe('renders icon', () => {
          it('with correct props', () => {
            const icon = findIcon();
            expect(icon.exists()).toBe(true);
            expect(icon.props('name')).toBe(iconName);
          });

          it('with correct size', () => {
            expect(findIcon().props('size')).toBe(expectedIconSize);
          });
        });

        it('sets aria-label', () => {
          expect(wrapper.attributes('aria-label')).toBe(expectedAriaLabel);
        });
      },
    );

    it('applies custom aria-label when provided', () => {
      createComponent({
        propsData: { icon: 'calendar' },
        attrs: { 'aria-label': 'Due date' },
      });

      expect(wrapper.attributes('aria-label')).toBe('Due date');
    });
  });

  describe('without "icon" prop', () => {
    const mockSlotContent = 'slot-content';
    beforeEach(() => {
      createComponent({ slots: { default: mockSlotContent }, attrs: { 'aria-label': 'Success' } });
    });

    it('renders slot content', () => {
      expect(wrapper.html()).toContain(mockSlotContent);
    });

    it('does not render icon', () => {
      expect(findIcon().exists()).toBe(false);
    });

    it('sets badge "role" attribute to undefined', () => {
      expect(wrapper.attributes('role')).toBe(undefined);
    });

    it('sets aria-label', () => {
      expect(wrapper.attributes('aria-label')).toBe('Success');
    });
  });

  describe('wrapper element', () => {
    it('uses "span" element by default', () => {
      createComponent();

      expect(wrapper.element.tagName).toBe('SPAN');
    });

    it('creates element based on "tag" if not link', () => {
      createComponent({ propsData: { tag: 'div' } });

      expect(wrapper.element.tagName).toBe('DIV');
    });

    it('uses a link if "href" prop is set, regardless of "tag" prop', () => {
      createComponent({ propsData: { tag: 'div', href: 'https://www.khulnasoft.com' } });

      expect(findLink().exists()).toBe(true);
    });

    it('passes listeners to badge', async () => {
      const clickListener = jest.fn();
      createComponent({
        listeners: { click: clickListener },
      });

      await wrapper.trigger('click');

      expect(clickListener).toHaveBeenCalled();
    });
  });

  describe('classes', () => {
    it('sets default classes', () => {
      createComponent({ slots: { default: 'slot-content' } });

      expect(wrapper.classes()).toMatchObject(['gl-badge', 'badge', 'badge-pill', 'badge-neutral']);
    });

    it.each(Object.values(badgeVariantOptions))(
      'sets correct css class for variant %s',
      (variant) => {
        createComponent({ propsData: { variant } });

        expect(wrapper.classes(`badge-${variant}`)).toBe(true);
      },
    );

    it('sets "!gl-px-2" class when no child content is set', () => {
      createComponent();

      expect(wrapper.classes('!gl-px-2')).toBe(true);
    });
  });

  describe('optical alignment of circular icons', () => {
    it.each(['issue-open-m', 'issue-close'])(
      'nudges the "%s" icon left when the badge has content',
      (icon) => {
        createComponent({ propsData: { icon }, slots: { default: 'slot-content' } });

        expect(findIcon().classes('-gl-ml-2')).toBe(true);
      },
    );

    it('nudges the icon left when "iconOpticallyAligned" is set and the badge has content', () => {
      createComponent({
        propsData: { icon: 'status_failed', iconOpticallyAligned: true },
        slots: { default: 'slot-content' },
      });

      expect(findIcon().classes('-gl-ml-2')).toBe(true);
    });

    it.each([
      ['issue-open-m', false],
      ['issue-close', false],
      ['status_failed', true],
    ])('keeps the icon-only "%s" badge centered', (icon, iconOpticallyAligned) => {
      createComponent({ propsData: { icon, iconOpticallyAligned } });

      expect(findIcon().classes('-gl-ml-2')).toBe(false);
    });
  });

  describe('link badge', () => {
    const propsData = {
      href: 'https://www.khulnasoft.com',
      rel: 'external',
      target: '_blank',
      active: true,
      disabled: true,
    };

    it('passes link props to GlLink', () => {
      createComponent({
        propsData,
      });

      const expectedLinkProps = {
        ...propsData,
        variant: linkVariantUnstyled,
      };

      expect(findLink().props()).toMatchObject(expectedLinkProps);
    });

    it('passes listeners to badge', () => {
      const clickListener = jest.fn();
      createComponent({
        propsData,
        listeners: { click: clickListener },
      });

      findLink().vm.$emit('click');

      expect(clickListener).toHaveBeenCalled();
    });
  });
});
