import { shallowMount } from '@vue/test-utils';
import GlAnimatedChevronRightDownIcon from '../animated_icon/animated_chevron_right_down_icon.vue';
import GlIcon from '../icon/icon.vue';
import GlNavItem from './nav_item.vue';

describe('GlNavItem', () => {
  let wrapper;

  const findIcon = () => wrapper.findComponent(GlIcon);
  const findChevron = () => wrapper.findComponent(GlAnimatedChevronRightDownIcon);

  const createWrapper = (options = {}) => {
    wrapper = shallowMount(GlNavItem, {
      stubs: {
        GlAnimatedChevronRightDownIcon,
        RouterLink: {
          name: 'RouterLink',
          template: '<div><slot :navigate="() => {}" /></div>',
          props: ['to'],
        },
      },
      ...options,
    });
  };

  describe('slot classes', () => {
    it.each`
      icon      | iconSlot | endSlot  | isParent | isIconOnly | expectedClasses
      ${'home'} | ${false} | ${false} | ${false} | ${false}   | ${['gl-nav-item', 'gl-nav-item-has-start-slot']}
      ${null}   | ${true}  | ${false} | ${false} | ${false}   | ${['gl-nav-item', 'gl-nav-item-has-start-slot']}
      ${null}   | ${false} | ${true}  | ${false} | ${false}   | ${['gl-nav-item', 'gl-nav-item-has-end-slot']}
      ${null}   | ${false} | ${false} | ${true}  | ${false}   | ${['gl-nav-item', 'gl-nav-item-has-end-slot']}
      ${'home'} | ${true}  | ${true}  | ${true}  | ${false}   | ${['gl-nav-item', 'gl-nav-item-has-start-slot', 'gl-nav-item-has-end-slot']}
      ${'home'} | ${false} | ${false} | ${false} | ${true}    | ${['gl-nav-item', 'gl-nav-item-has-start-slot', 'gl-nav-item-is-icon-only']}
      ${null}   | ${false} | ${false} | ${false} | ${false}   | ${['gl-nav-item']}
    `(
      'applies correct slot classes',
      ({ icon, iconSlot, endSlot, isParent, isIconOnly, expectedClasses }) => {
        const propsData = { href: '/path', icon, isParent, isIconOnly };
        const scopedSlots = {};
        if (iconSlot) scopedSlots.icon = '<span>Icon</span>';
        if (endSlot) scopedSlots.end = '<span>End</span>';

        createWrapper({ propsData, scopedSlots });

        expect(wrapper.classes()).toEqual(expect.arrayContaining(expectedClasses));
      },
    );
  });

  describe('selected class', () => {
    it('adds selected class when selected prop is true', () => {
      createWrapper({ propsData: { href: '/path', selected: true } });

      expect(wrapper.classes()).toContain('selected');
    });

    it('does not add selected class when selected prop is false', () => {
      createWrapper({ propsData: { href: '/path', selected: false } });

      expect(wrapper.classes()).not.toContain('selected');
    });
  });

  describe('indicator classes', () => {
    it('applies the left indicator by default', () => {
      createWrapper({ propsData: { href: '/path' } });

      expect(wrapper.classes()).toContain('gl-nav-item-indicator-left');
    });

    it.each`
      indicatorPosition | expectedClass
      ${'left'}         | ${'gl-nav-item-indicator-left'}
      ${'right'}        | ${'gl-nav-item-indicator-right'}
      ${'bottom'}       | ${'gl-nav-item-indicator-bottom'}
    `(
      'applies $expectedClass when indicatorPosition is $indicatorPosition',
      ({ indicatorPosition, expectedClass }) => {
        createWrapper({ propsData: { href: '/path', indicatorPosition } });

        expect(wrapper.classes()).toContain(expectedClass);
      },
    );
  });

  describe('with href', () => {
    beforeEach(() => {
      createWrapper({
        propsData: {
          href: '/path',
        },
        slots: {
          default: 'Navigation Item',
        },
      });
    });

    it('should render an anchor tag', () => {
      expect(wrapper.find('a').exists()).toBe(true);
    });

    it('should set href attribute', () => {
      expect(wrapper.find('a').attributes('href')).toBe('/path');
    });

    it('should render slot content', () => {
      expect(wrapper.text()).toContain('Navigation Item');
    });
  });

  describe('without a router', () => {
    it('renders an anchor without warnings', () => {
      wrapper = shallowMount(GlNavItem, { propsData: { href: '/path' } });

      expect(wrapper.find('a').attributes('href')).toBe('/path');
    });
  });

  describe('with router-link', () => {
    beforeEach(() => {
      createWrapper({
        propsData: {
          to: '/path',
        },
        slots: {
          default: 'Navigation Item',
        },
      });
    });

    it('should render router-link', () => {
      expect(wrapper.findComponent({ name: 'RouterLink' }).exists()).toBe(true);
    });

    it('should pass to prop to router-link', () => {
      expect(wrapper.findComponent({ name: 'RouterLink' }).props('to')).toBe('/path');
    });
  });

  describe('with selected', () => {
    beforeEach(() => {
      createWrapper({
        propsData: {
          href: '/path',
          selected: true,
        },
      });
    });

    it('should add selected class', () => {
      expect(wrapper.classes()).toContain('selected');
    });

    it('should set aria-current to page', () => {
      expect(wrapper.find('a').attributes('aria-current')).toBe('page');
    });
  });

  describe('as button', () => {
    beforeEach(() => {
      createWrapper({
        slots: {
          default: 'Navigation Item',
        },
      });
    });

    it('should render a button', () => {
      expect(wrapper.find('button').exists()).toBe(true);
    });

    it('should emit click event', () => {
      wrapper.find('button').trigger('click');
      expect(wrapper.emitted('click')).toHaveLength(1);
    });
  });

  describe('with icon', () => {
    beforeEach(() => {
      createWrapper({
        propsData: {
          href: '/path',
          icon: 'home',
        },
        slots: {
          default: 'Navigation Item',
        },
      });
    });

    it('should render icon', () => {
      expect(findIcon().exists()).toBe(true);
    });

    it('should pass icon name to GlIcon', () => {
      expect(findIcon().props('name')).toBe('home');
    });

    it('should render icon in start slot', () => {
      expect(wrapper.find('[data-testid="nav-item-start"]').exists()).toBe(true);
    });
  });

  describe('with isIconOnly', () => {
    beforeEach(() => {
      createWrapper({
        propsData: {
          href: '/path',
          icon: 'home',
          isIconOnly: true,
        },
      });
    });

    it('only renders icon slot', () => {
      expect(wrapper.find('[data-testid="nav-item-start"]').exists()).toBe(true);
      expect(wrapper.find('[data-testid="nav-item-label"]').exists()).toBe(false);
      expect(wrapper.find('[data-testid="nav-item-end"]').exists()).toBe(false);
    });
  });

  describe('as parent', () => {
    beforeEach(() => {
      createWrapper({
        propsData: {
          isParent: true,
          expanded: false,
        },
        slots: {
          default: 'Parent Item',
        },
      });
    });

    it('should render a button', () => {
      expect(wrapper.find('button').exists()).toBe(true);
    });

    it('should render chevron icon', () => {
      expect(findChevron().exists()).toBe(true);
    });

    it('should pass expanded prop to chevron', () => {
      expect(findChevron().props('isOn')).toBe(false);
    });

    it('should update chevron when expanded changes', async () => {
      await wrapper.setProps({ expanded: true });
      expect(findChevron().props('isOn')).toBe(true);
    });

    it('should set aria-expanded attribute', () => {
      expect(wrapper.find('button').attributes('aria-expanded')).toBe('false');
    });
  });

  describe('with end slot', () => {
    beforeEach(() => {
      createWrapper({
        propsData: {
          href: '/path',
        },
        slots: {
          default: 'Navigation Item',
          end: '<span class="badge">5</span>',
        },
      });
    });

    it('should render end slot', () => {
      expect(wrapper.find('[data-testid="nav-item-end"]').exists()).toBe(true);
    });

    it('should render end slot content', () => {
      expect(wrapper.text()).toContain('5');
    });
  });
});
