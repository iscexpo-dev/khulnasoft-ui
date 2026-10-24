import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';

import { BDropdown } from '../../../vendor/bootstrap-vue/src/components/dropdown/dropdown';
import { dropdownVariantOptions } from '../../../utils/constants';
import GlLoadingIcon from '../loading_icon/loading_icon.vue';
import GlDropdown from './dropdown.vue';

const DEFAULT_BTN_CLASSES = ['btn', 'btn-default', 'btn-md', 'gl-button'];
const DEFAULT_BTN_TOGGLE_CLASSES = [
  'btn',
  'btn-default',
  'btn-md',
  'gl-button',
  'dropdown-toggle',
  'gl-dropdown-toggle',
];

describe('new dropdown', () => {
  let wrapper;

  const buildWrapper = (propsData, slots = {}) => {
    wrapper = mount(GlDropdown, {
      propsData,
      slots,
    });
  };

  const findByTestId = (testId) => wrapper.find(`[data-testid="${testId}"]`);

  const findSplitButton = () => wrapper.find('.btn:not(.gl-dropdown-toggle)');
  const findDropdownToggle = () => wrapper.find('.btn.gl-dropdown-toggle');
  const findLoadingIcon = () => wrapper.findComponent(GlLoadingIcon);
  const findIcon = () => wrapper.find('.dropdown-icon');
  const findCaret = () => wrapper.find('.dropdown-chevron');
  const findClearAll = () => findByTestId('clear-all-button');
  const findHighlightedItemsTitle = () => findByTestId('highlighted-items-title');
  const findHighlightedItems = () => findByTestId('highlighted-items');
  const findDropdown = () => wrapper.findComponent(BDropdown);

  it('renders when text is null', () => {
    buildWrapper({ text: null });

    expect(wrapper.exists()).toBe(true);
  });

  describe('disabled state', () => {
    it('is not disabled by default', () => {
      buildWrapper({});

      expect(findDropdownToggle().attributes('disabled')).toBe(undefined);
    });

    it('can be disabled', () => {
      buildWrapper({ disabled: true });

      expect(findDropdownToggle().attributes('disabled')).toBe('disabled');
    });

    it('can be disabled via the loading prop', () => {
      buildWrapper({ loading: true });

      expect(findDropdownToggle().attributes('disabled')).toBe('disabled');
    });
  });

  describe.each`
    props                                                | toggleClasses
    ${{}}                                                | ${[]}
    ${{ text: 'text' }}                                  | ${[]}
    ${{ text: 'text', icon: 'close' }}                   | ${['dropdown-icon-text']}
    ${{ icon: 'close' }}                                 | ${['dropdown-icon-only']}
    ${{ icon: 'close', text: 'text', textSrOnly: true }} | ${['dropdown-icon-only']}
    ${{ icon: 'close', textSrOnly: true }}               | ${['dropdown-icon-only']}
  `('dropdown with props $props', ({ props, toggleClasses }) => {
    beforeEach(async () => {
      buildWrapper(props);

      await nextTick();
    });

    it('sets toggle button classes', () => {
      const classes = findDropdownToggle().classes().sort();

      expect(classes).toEqual([...DEFAULT_BTN_TOGGLE_CLASSES, ...toggleClasses].sort());
    });
  });

  describe.each`
    props                              | splitClasses                                             | toggleClasses
    ${{}}                              | ${[]}                                                    | ${[]}
    ${{ text: 'text' }}                | ${['split-content-button']}                              | ${[]}
    ${{ text: 'text', icon: 'close' }} | ${['split-content-button', 'icon-split-content-button']} | ${['dropdown-icon-text']}
    ${{ icon: 'close' }}               | ${['icon-split-content-button']}                         | ${['dropdown-icon-only']}
  `('split dropdown with props $props', ({ props, splitClasses, toggleClasses }) => {
    beforeEach(async () => {
      buildWrapper({ split: true, ...props });

      await nextTick();
    });

    it('updates split button classes', () => {
      const classes = findSplitButton().classes().sort();

      expect(classes).toEqual(
        expect.arrayContaining([...DEFAULT_BTN_CLASSES, ...splitClasses].sort()),
      );
    });

    it('updates dropdown toggle button classes', () => {
      const classes = findDropdownToggle().classes().sort();

      expect(classes).toEqual(
        expect.arrayContaining(
          [...DEFAULT_BTN_TOGGLE_CLASSES, 'dropdown-toggle-split', ...toggleClasses].sort(),
        ),
      );
    });
  });

  describe('with split false', () => {
    beforeEach(async () => {
      buildWrapper({ split: false });

      await nextTick();
    });

    it('does not show split button', () => {
      expect(findSplitButton().exists()).toBe(false);
    });

    it('shows toggle button', () => {
      const classes = findDropdownToggle().classes().sort();

      expect(classes).toEqual(expect.arrayContaining([...DEFAULT_BTN_TOGGLE_CLASSES].sort()));
    });
  });

  // This spec is needed because the split button is updated through raw DOM manipulation
  describe('with split and component updates', () => {
    beforeEach(async () => {
      buildWrapper({ split: false });

      await nextTick();

      wrapper.setProps({ split: true, text: 'text' });

      await nextTick();
    });

    it('updates split button classes', () => {
      expect(findSplitButton().classes().sort()).toEqual(
        expect.arrayContaining([...DEFAULT_BTN_CLASSES, 'split-content-button']),
      );
    });
  });

  describe.each`
    toggleClass             | expectedClasses                                      | type
    ${'my-class'}           | ${[...DEFAULT_BTN_TOGGLE_CLASSES, 'my-class']}       | ${'string'}
    ${{ 'my-class': true }} | ${[...DEFAULT_BTN_TOGGLE_CLASSES, 'my-class']}       | ${'object'}
    ${['cls-1', 'cls-2']}   | ${[...DEFAULT_BTN_TOGGLE_CLASSES, 'cls-1', 'cls-2']} | ${'array'}
    ${null}                 | ${[...DEFAULT_BTN_TOGGLE_CLASSES]}                   | ${'null'}
  `('with toggle classes', ({ toggleClass, expectedClasses, type }) => {
    beforeEach(async () => {
      buildWrapper({ toggleClass });

      await nextTick();
    });

    it(`class is inherited from toggle class of type ${type}`, () => {
      expect(findDropdownToggle().classes().sort()).toEqual(
        expect.arrayContaining(expectedClasses.sort()),
      );
    });
  });

  describe('secondary category', () => {
    it.each(Object.keys(dropdownVariantOptions))('applies %s variant class properly', (variant) => {
      buildWrapper({ category: 'secondary', variant });

      expect(findDropdownToggle().classes()).toContain(`btn-${variant}-secondary`);
    });
  });

  describe('when the header slot exists', () => {
    const slots = { header: 'Header Content' };

    it('renders the header', () => {
      buildWrapper({}, slots);
      expect(wrapper.find('.gl-dropdown-header').exists()).toBe(true);
      expect(wrapper.html()).toContain('Header Content');
    });

    it('has the "!gl-border-b-0" class when header border disabled', () => {
      buildWrapper({ hideHeaderBorder: true }, slots);
      expect(wrapper.find('.gl-dropdown-header').classes()).toContain('!gl-border-b-0');
    });
  });

  describe('with no header slot exists', () => {
    it('does not render the header', () => {
      buildWrapper();
      expect(wrapper.find('.gl-dropdown-header').exists()).toBe(false);
    });

    it('does render the header if headerText provided', () => {
      buildWrapper({ headerText: 'Legacy Header Prop Text' });
      expect(wrapper.find('.gl-dropdown-header').exists()).toBe(true);
      expect(wrapper.html()).toContain('Legacy Header Prop Text');
    });
  });

  describe('when the footer slot exists', () => {
    const slots = { footer: 'Footer Content' };

    it('renders the footer', () => {
      buildWrapper({}, slots);
      expect(wrapper.find('.gl-dropdown-footer').exists()).toBe(true);
      expect(wrapper.html()).toContain('Footer Content');
    });
  });

  describe('with no footer slot exists', () => {
    it('does not render the footer', () => {
      buildWrapper();
      expect(wrapper.find('.gl-dropdown-footer').exists()).toBe(false);
    });
  });

  describe('Highlighted items', () => {
    const highlightedItemsTitle = 'Cool heading';
    const slotContent = '<li>Highlighted items Content</li>';
    const slots = { 'highlighted-items': slotContent };
    describe('with slot content and showHighlightedItemsTitle=true', () => {
      beforeEach(() => {
        buildWrapper({ showHighlightedItemsTitle: true }, slots);
      });

      it('renders the highlighted items', () => {
        expect(findHighlightedItems().exists()).toBe(true);
        expect(findHighlightedItems().html()).toContain(slotContent);
      });

      it('renders the default highlighted items title', () => {
        expect(findHighlightedItemsTitle().exists()).toBe(true);
        expect(findHighlightedItemsTitle().html()).toContain('Selected');
      });

      describe('with showHighlightedItemsTitle=false', () => {
        beforeEach(() => {
          buildWrapper({}, slots);
        });

        it('does not render the highlighted items header', () => {
          expect(findHighlightedItemsTitle().exists()).toBe(false);
        });
      });

      describe('with showClearAll=true and showHighlightedItemsTitle=false', () => {
        beforeEach(() => {
          buildWrapper({ showClearAll: true }, slots);
        });

        it('renders the clear all button and does not render the highlighted items title', () => {
          expect(findClearAll().exists()).toBe(true);
          expect(findHighlightedItemsTitle().exists()).toBe(false);
        });
      });

      describe('with showClearAll=true and showHighlightedItemsTitle=true', () => {
        beforeEach(() => {
          buildWrapper({ showHighlightedItemsTitle: true, showClearAll: true }, slots);
        });

        it('renders the clear all button and the highlighted items title', () => {
          expect(findClearAll().exists()).toBe(true);
          expect(findHighlightedItemsTitle().exists()).toBe(true);
        });
      });

      describe('with highlightedItemsTitle set and showHighlightedItemsTitle=true', () => {
        beforeEach(() => {
          buildWrapper({ highlightedItemsTitle, showHighlightedItemsTitle: true }, slots);
        });

        it('sets the highlighted items title', () => {
          expect(findHighlightedItemsTitle().exists()).toBe(true);
          expect(findHighlightedItemsTitle().text()).not.toContain('Selected');
          expect(findHighlightedItemsTitle().text()).toContain(highlightedItemsTitle);
        });
      });
    });

    describe('with no slot content', () => {
      beforeEach(() => {
        buildWrapper();
      });

      it('does not render the highlighted items content', () => {
        expect(findHighlightedItems().exists()).toBe(false);
      });
      it('does not render the highlighted items title', () => {
        expect(findHighlightedItemsTitle().exists()).toBe(false);
      });

      describe('with highlightedItemsTitle set', () => {
        beforeEach(() => {
          buildWrapper({ highlightedItemsTitle });
        });

        it('does not render the highlighted items title', () => {
          expect(findHighlightedItemsTitle().exists()).toBe(false);
        });
      });

      describe('with showClearAll=true', () => {
        beforeEach(() => {
          buildWrapper({ showClearAll: true });
        });

        it('renders the clear all button', () => {
          expect(findClearAll().exists()).toBe(true);
        });

        it('does not render the highlighted items title', () => {
          expect(findHighlightedItemsTitle().exists()).toBe(false);
        });
      });
    });
  });

  describe('button content templates', () => {
    const mockComponent = {
      template: '<span>mock</span>',
    };

    it('shows the button text template with the default loading spinner, icon, and dropdown caret', () => {
      const slots = { 'button-text': mockComponent };
      buildWrapper({ loading: true, icon: 'close' }, slots);
      expect(wrapper.findComponent(mockComponent).exists()).toBe(true);
      expect(wrapper.text()).toBe('mock');
      expect(findLoadingIcon().exists()).toBe(true);
      expect(findIcon().exists()).toBe(true);
      expect(findCaret().exists()).toBe(true);
    });

    it('shows only the button content template', () => {
      const slots = { 'button-content': mockComponent };
      buildWrapper({ loading: true, icon: 'close' }, slots);
      expect(wrapper.findComponent(mockComponent).exists()).toBe(true);
      expect(wrapper.text()).toBe('mock');
      expect(findLoadingIcon().exists()).toBe(false);
      expect(findIcon().exists()).toBe(false);
      expect(findCaret().exists()).toBe(false);
    });
  });

  describe('icon only dropdown', () => {
    it('shows the icon and dropdown caret', () => {
      buildWrapper({ icon: 'paper-airplane' });
      expect(wrapper.text()).toBe('');
      expect(findLoadingIcon().exists()).toBe(false);
      expect(findIcon().exists()).toBe(true);
      expect(findCaret().exists()).toBe(true);
    });

    it('shows text for screen readers', () => {
      buildWrapper({ icon: 'paper-airplane', text: 'screenreader button text', textSrOnly: true });
      expect(wrapper.text()).toBe('screenreader button text');
      expect(wrapper.find('span').classes()).toContain('gl-sr-only');
      expect(findLoadingIcon().exists()).toBe(false);
      expect(findIcon().exists()).toBe(true);
      expect(findCaret().exists()).toBe(true);
    });

    it('shows loading spinner instead of icon when loading', () => {
      buildWrapper({ icon: 'paper-airplane', loading: true });
      expect(wrapper.text()).toBe('');
      expect(findLoadingIcon().exists()).toBe(true);
      expect(findIcon().exists()).toBe(false);
      expect(findCaret().exists()).toBe(true);
    });
  });

  describe('Clear all button', () => {
    it('is not visible by default', () => {
      buildWrapper({});

      expect(findClearAll().exists()).toBe(false);
    });

    describe('when `showClearAll=true`', () => {
      const clearAllText = 'Clear all';
      const mockEvent = {};
      beforeEach(() => {
        buildWrapper({ showClearAll: true });
      });

      it('is visible', () => {
        expect(findClearAll().exists()).toBe(true);
        expect(findClearAll().text()).toBe(clearAllText);
      });

      it('emits an event when the `clear all` button is clicked', () => {
        expect(wrapper.emitted('clear-all')).toBeUndefined();

        findClearAll().vm.$emit('click', mockEvent);

        expect(wrapper.emitted('clear-all')).toHaveLength(1);
        expect(wrapper.emitted('clear-all')[0]).toEqual([mockEvent]);
      });

      it('can configure the clear all text', () => {
        buildWrapper({ showClearAll: true, clearAllText: 'Clear' });

        expect(findClearAll().exists()).toBe(true);
        expect(findClearAll().text()).toBe('Clear');
        expect(findClearAll().text()).not.toBe(clearAllText);
      });
    });
  });

  describe('popperOpts prop', () => {
    it('combines the passed in popperOpts with the default popperOpts', () => {
      const popperOpts = {
        modifiers: {
          flip: {
            flipVariationsByContent: false,
          },
        },
      };
      buildWrapper({ popperOpts });

      expect(findDropdown().props('popperOpts')).toEqual({
        modifiers: {
          flip: {
            flipVariationsByContent: false,
            padding: 28,
          },
        },
      });
    });

    it('uses the default popperOpts prop', () => {
      buildWrapper();

      expect(findDropdown().props('popperOpts')).toEqual({
        modifiers: {
          flip: {
            flipVariationsByContent: true,
            padding: 28,
          },
        },
      });
    });
  });
});
