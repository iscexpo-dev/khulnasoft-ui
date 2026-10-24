import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import avatarPath1 from '../../../../static/img/avatar.png';
import avatarPath3 from '../../../../static/img/avatar_1.png';
import ClipboardButton from '../../shared_components/clipboard_button/clipboard_button.vue';
import GlDisclosureDropdown from '../new_dropdowns/disclosure/disclosure_dropdown.vue';
import GlDisclosureDropdownItem from '../new_dropdowns/disclosure/disclosure_dropdown_item.vue';
import GlBreadcrumb from './breadcrumb.vue';
import GlBreadcrumbItem from './breadcrumb_item.vue';

describe('Breadcrumb component', () => {
  let wrapper;

  const items = [
    {
      text: 'first_breadcrumb',
      href: 'https://khulnasoft.com',
      avatarPath: avatarPath1,
    },
    {
      text: 'second_breadcrumb',
      to: 'to_value',
    },
    {
      text: 'third_breadcrumb',
      href: 'https://about.khulnasoft.com',
      avatarPath: avatarPath3,
    },
  ];

  const findAllAvatars = () => wrapper.findAll('[data-testid="avatar"]');
  const findBreadcrumbItems = () => wrapper.findAllComponents(GlBreadcrumbItem);
  const findOverflowDropdown = () => wrapper.findComponent(GlDisclosureDropdown);
  const findOverflowingItems = () => wrapper.findAllComponents(GlDisclosureDropdownItem);
  const findClipboardButtonListItem = () => wrapper.find('.gl-breadcrumb-clipboard-button');
  const findClipboardButton = () => wrapper.findComponent(ClipboardButton);

  const findVisibleBreadcrumbItems = () =>
    findBreadcrumbItems().wrappers.filter((item) => item.isVisible());

  const createComponent = (propsData = { items }) => {
    wrapper = mount(GlBreadcrumb, {
      propsData,
      stubs: {
        GlBreadcrumbItem,
        GlDisclosureDropdown,
      },
    });
  };

  const mockElementWidth = (element, widthInPx) => {
    Object.defineProperty(element, 'clientWidth', {
      get: () => widthInPx,
    });
  };

  const mockOffsetWidth = (element, widthInPx) => {
    Object.defineProperty(element, 'offsetWidth', {
      get: () => widthInPx,
    });
  };

  const mockWideWrapperWidth = () => {
    mockElementWidth(wrapper.element, 1000);
  };

  const mockSmallWrapperWidth = () => {
    mockElementWidth(wrapper.element, 100);
  };

  const mockItemsWidths = () => {
    findBreadcrumbItems().wrappers.forEach((item) => {
      mockElementWidth(item.element, 100);
    });
  };

  const mockLeftMargin = () => {
    jest.spyOn(window, 'getComputedStyle').mockReturnValue({
      marginLeft: '8px',
    });
  };

  describe('items', () => {
    it('has one breadcrumb-item for each item in the items props', async () => {
      createComponent();
      await nextTick();

      expect(findBreadcrumbItems()).toHaveLength(items.length);
    });

    it('does not log an error when it unmounts while items change', async () => {
      createComponent();
      await nextTick();

      wrapper.setProps({ items: [...items, { text: 'fourth_breadcrumb', href: '/fourth' }] });
      // The items watcher starts, and waits for the DOM update.
      await nextTick();
      wrapper.destroy();
      await nextTick();

      expect(wrapper).not.toHaveLoggedVueErrors();
    });

    it('renders correctly when no items and autoresize', async () => {
      createComponent({ items: [], autoResize: true });
      await nextTick();

      expect(findBreadcrumbItems()).toHaveLength(0);
    });
  });

  describe('ariaLabel', () => {
    it('uses prop if provided', () => {
      createComponent({ items, ariaLabel: 'Folder breadcrumbs' });

      expect(wrapper.attributes('aria-label')).toBe('Folder breadcrumbs');
    });

    it('uses default if prop not provided', () => {
      createComponent();

      expect(wrapper.attributes('aria-label')).toBe('Breadcrumb');
    });
  });

  describe('showMoreLabel', () => {
    describe('when provided', () => {
      beforeEach(async () => {
        createComponent({ items, showMoreLabel: 'More...' });
        mockSmallWrapperWidth();
        mockItemsWidths();
        await nextTick();
      });

      it('uses prop', () => {
        expect(findOverflowDropdown().props('toggleText')).toBe('More...');
      });
    });

    describe('when not provided', () => {
      beforeEach(async () => {
        createComponent();
        mockSmallWrapperWidth();
        mockItemsWidths();
        await nextTick();
      });

      it('uses default', () => {
        expect(findOverflowDropdown().props('toggleText')).toBe('Show more breadcrumbs');
      });
    });
  });

  describe('autoResize', () => {
    describe('by default', () => {
      beforeEach(async () => {
        createComponent();
        mockSmallWrapperWidth();
        mockItemsWidths();
        await nextTick();
      });

      it('moves overflowing items into dropdown', () => {
        expect(findOverflowDropdown().exists()).toBe(true);
        expect(findOverflowingItems().length).toBeGreaterThan(0);
      });

      it('reacts to prop changing to false', async () => {
        expect(findOverflowDropdown().exists()).toBe(true);
        await wrapper.setProps({ autoResize: false });
        await nextTick();
        expect(findOverflowDropdown().exists()).toBe(false);
        expect(findBreadcrumbItems()).toHaveLength(items.length);
      });
    });

    describe('when set to false', () => {
      beforeEach(async () => {
        createComponent({ items, autoResize: false });
        mockSmallWrapperWidth();
        mockItemsWidths();
        await nextTick();
      });

      it('keeps all items visible', () => {
        expect(findOverflowDropdown().exists()).toBe(false);
        expect(findBreadcrumbItems()).toHaveLength(items.length);
      });

      it('does not trigger auto-resize behavior when items change', async () => {
        await wrapper.setProps({
          items: [...items, { text: 'fourth_breadcrumb', to: 'the_moon' }],
        });
        await nextTick();

        expect(findOverflowDropdown().exists()).toBe(false);
        expect(findBreadcrumbItems()).toHaveLength(items.length + 1);
      });

      it('reacts to prop changing to true', async () => {
        expect(findOverflowDropdown().exists()).toBe(false);
        await wrapper.setProps({ autoResize: true });
        await nextTick();
        await nextTick(); // otherwise test fails with VUE_VERSION=3
        expect(findOverflowDropdown().exists()).toBe(true);
        expect(findOverflowingItems().length).toBeGreaterThan(0);
      });
    });
  });

  describe('avatars', () => {
    it('renders 2 avatars when 2 avatarPaths are passed', async () => {
      createComponent();
      await nextTick();

      expect(findAllAvatars()).toHaveLength(2);
    });
  });

  describe('size', () => {
    describe('when `size` is not provided', () => {
      beforeEach(async () => {
        createComponent({ items });
        mockSmallWrapperWidth();
        mockItemsWidths();
        await nextTick();
      });

      it('sets default size to "sm"', async () => {
        const breadcrumbItem = wrapper.findComponent(GlBreadcrumbItem);
        expect(breadcrumbItem.props('size')).toBe('sm');
        expect(findOverflowDropdown().props('size')).toBe('small');
        expect(findAllAvatars().at(0).props('size')).toBe(16);
      });
    });

    describe('when `size` is provided', () => {
      beforeEach(async () => {
        createComponent({ items, size: 'md' });
        mockSmallWrapperWidth();
        mockItemsWidths();
        await nextTick();
      });

      it('handles "md" size when specified', async () => {
        const breadcrumbItem = wrapper.findComponent(GlBreadcrumbItem);
        expect(breadcrumbItem.props('size')).toBe('md');
        expect(findOverflowDropdown().props('size')).toBe('medium');
        expect(findAllAvatars().at(0).props('size')).toBe(24);
      });
    });
  });

  describe('bindings', () => {
    beforeEach(() => {
      createComponent();
      mockWideWrapperWidth();
    });

    it('first breadcrumb has text, href && ariaCurrent=`false` bound', () => {
      expect(findBreadcrumbItems().at(0).props()).toMatchObject({
        text: items[0].text,
        href: items[0].href,
        ariaCurrent: false,
      });
    });

    it('second breadcrumb has text, to && ariaCurrent=`false` bound', () => {
      expect(findBreadcrumbItems().at(1).props()).toMatchObject({
        text: items[1].text,
        to: items[1].to,
        ariaCurrent: false,
      });
    });

    it('last breadcrumb has text, to && ariaCurrent=`page` bound', () => {
      expect(findBreadcrumbItems().at(2).props()).toMatchObject({
        text: items[2].text,
        href: items[2].href,
        ariaCurrent: 'page',
      });
    });
  });

  describe('collapsible', () => {
    describe(`when there is enough room to fit all items`, () => {
      beforeEach(() => {
        createComponent();
        mockWideWrapperWidth();
      });

      it('should not display collapsed list expander', () => {
        expect(findOverflowDropdown().exists()).toBe(false);
      });

      it('should display all items visible', () => {
        expect(findVisibleBreadcrumbItems()).toHaveLength(items.length);
      });
    });

    describe.each([
      ['sm', 'small', 40],
      ['md', 'medium', 48],
    ])(
      'when size is "%s" and there is NOT enough room to fit all items',
      (size, dropdownSize, buttonWidth) => {
        beforeEach(async () => {
          createComponent({ items, size });
          mockSmallWrapperWidth();
          mockItemsWidths();
          await nextTick();
        });

        it('should display overflow dropdown', () => {
          expect(findOverflowDropdown().exists()).toBe(true);
        });

        it(`should display overflow dropdown with ${dropdownSize} size`, () => {
          expect(findOverflowDropdown().props('size')).toBe(dropdownSize);
        });

        it(`moves the overflowing items into the dropdown accounting for ${buttonWidth}px button width`, () => {
          const fittingItems = findBreadcrumbItems().length;
          const overflowingItems = wrapper.findAllComponents(GlDisclosureDropdownItem).length;
          expect(fittingItems + overflowingItems).toEqual(items.length);
        });

        it('sets max-width of the last item using CSS variable', async () => {
          const lastVisibleItem = findVisibleBreadcrumbItems().at(-1);
          expect(lastVisibleItem.classes()).toContain('gl-breadcrumb-only-item');

          // The CSS variable is set on the parent breadcrumb component
          const cssVariable = wrapper.element.style.getPropertyValue(
            '--gl-breadcrumb-truncated-item-max-width',
          );
          expect(cssVariable).not.toHaveLength(0);
        });
      },
    );
  });

  describe('dropdown width measurement', () => {
    it('measures and uses actual dropdown width instead of hardcoded value', async () => {
      createComponent();
      mockSmallWrapperWidth();
      mockItemsWidths();
      mockElementWidth(wrapper.vm.$refs.dropdown, 666);

      await nextTick();

      expect(wrapper.vm.dropdownWidth).toBe(666);
    });
  });

  describe('clipboardButton', () => {
    it('does not render clipboard button by default', () => {
      wrapper = mount(GlBreadcrumb, {
        propsData: { items },
        stubs: {
          GlBreadcrumbItem,
          GlDisclosureDropdown,
        },
      });

      expect(findClipboardButtonListItem().exists()).toBe(false);
      expect(findClipboardButton().exists()).toBe(false);
    });

    it('renders copy to clipboard button in a separate list item', () => {
      wrapper = mount(GlBreadcrumb, {
        propsData: { items, showClipboardButton: true },
        stubs: {
          GlBreadcrumbItem,
          GlDisclosureDropdown,
        },
      });

      expect(findClipboardButtonListItem().exists()).toBe(true);
      expect(findClipboardButton().exists()).toBe(true);
      expect(findClipboardButton().props('text')).toBe(
        'first_breadcrumb/second_breadcrumb/third_breadcrumb',
      );
      expect(findClipboardButton().props('title')).toBe('Copy to clipboard');
    });

    it('renders copy to clipboard button with custom path and tooltip', () => {
      wrapper = mount(GlBreadcrumb, {
        propsData: {
          items,
          showClipboardButton: true,
          pathToCopy:
            'https://khulnasoft.com/myProject/first_breadcrumb/second_breadcrumb/third_breadcrumb',
          clipboardTooltipText: 'Copy my breadcrumb text',
        },
        stubs: {
          GlBreadcrumbItem,
          GlDisclosureDropdown,
        },
      });

      expect(findClipboardButton().exists()).toBe(true);
      expect(findClipboardButton().props('text')).toBe(
        'https://khulnasoft.com/myProject/first_breadcrumb/second_breadcrumb/third_breadcrumb',
      );
      expect(findClipboardButton().props('title')).toBe('Copy my breadcrumb text');
    });

    describe('width calculation in auto-resize', () => {
      it('initializes clipboard button width to 0 when not shown', () => {
        createComponent({ items, showClipboardButton: false });

        expect(wrapper.vm.clipboardButtonWidth).toBe(0);
      });

      it('measures clipboard button width including margin on mount when shown', () => {
        createComponent({ items, showClipboardButton: true });

        const clipboardButtonElement = wrapper.vm.$refs.clipboardButton.$el;
        mockOffsetWidth(clipboardButtonElement, 30);
        mockLeftMargin();

        wrapper.vm.updateClipboardButtonWidth();

        expect(wrapper.vm.clipboardButtonWidth).toBe(38); // 30px width + 8px margin
      });

      it('includes clipboard button width in total breadcrumbs width calculation', async () => {
        createComponent({ items, showClipboardButton: true });

        const clipboardButtonElement = wrapper.vm.$refs.clipboardButton.$el;
        mockOffsetWidth(clipboardButtonElement, 30);
        mockLeftMargin();

        wrapper.vm.updateClipboardButtonWidth();
        mockItemsWidths();
        await wrapper.vm.measureAndMakeBreadcrumbsFit();

        // Total should be: (3 items * 100px) + 38px clipboard button width (30px + 8px margin) = 338px
        expect(wrapper.vm.totalBreadcrumbsWidth).toBe(338);
      });
    });
  });
});
