import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import { autoUpdate } from '@floating-ui/dom';
import { useMockIntersectionObserver } from '~/utils/use_mock_intersection_observer';
import GlBaseDropdown from '../base_dropdown/base_dropdown.vue';
import {
  GL_DROPDOWN_SHOWN,
  GL_DROPDOWN_HIDDEN,
  ARROW_DOWN,
  ARROW_UP,
  HOME,
  END,
  ENTER,
  POSITION_ABSOLUTE,
  POSITION_FIXED,
} from '../constants';
import { logWarning } from '../../../../utils/utils';
import GlIntersectionObserver from '../../../utilities/intersection_observer/intersection_observer.vue';
import GlCollapsibleListbox, { ITEM_SELECTOR } from './listbox.vue';
import GlListboxSearchInput from './listbox_search_input.vue';
import GlListboxItem from './listbox_item.vue';
import GlListboxGroup from './listbox_group.vue';
import {
  mockOptions,
  mockOptionsValues,
  mockGroups,
  mockGroupOptionsValues,
  mockGroupsWithTextSrOnly,
} from './mock_data';

jest.mock('@floating-ui/dom');
jest.mock('../../../../utils/utils', () => ({
  ...jest.requireActual('../../../../utils/utils'),
  logWarning: jest.fn(),
}));

autoUpdate.mockImplementation(() => {
  return () => {};
});

describe('GlCollapsibleListbox', () => {
  let wrapper;

  const buildWrapper = (propsData, slots = {}, provide = {}) => {
    wrapper = mount(GlCollapsibleListbox, {
      propsData,
      slots,
      provide,
      stubs: {
        MountingPortal: {
          template: '<div><slot /></div>',
        },
      },
      attachTo: document.body,
    });
  };

  useMockIntersectionObserver();

  const findBaseDropdown = () => wrapper.findComponent(GlBaseDropdown);
  const findListContainer = () => wrapper.find('[role="listbox"]');
  const findListboxItems = (root = wrapper) => root.findAllComponents(GlListboxItem);
  const findListboxGroups = () => wrapper.findAllComponents(GlListboxGroup);
  // eslint-disable-next-line unicorn/no-array-callback-reference
  const findListItem = (index) => findListboxItems().at(index).find(ITEM_SELECTOR);
  const findHeaderText = () => wrapper.find("[data-testid='listbox-header-text']");
  const findSearchBox = () => wrapper.findComponent(GlListboxSearchInput);
  const findNoResultsText = () => wrapper.find("[data-testid='listbox-no-results-text']");
  const findLoadingIcon = () => wrapper.find("[data-testid='listbox-search-loader']");
  const findSRNumberOfResultsText = () => wrapper.find("[data-testid='listbox-number-of-results']");
  const findResetButton = () => wrapper.find("[data-testid='listbox-reset-button']");
  const findSelectAllButton = () => wrapper.find("[data-testid='listbox-select-all-button']");
  const findIntersectionObserver = () => wrapper.findComponent(GlIntersectionObserver);
  const findDropdownMenu = () => wrapper.find("[data-testid='base-dropdown-menu']");
  const findDropdownToggle = () => wrapper.find("[data-testid='base-dropdown-toggle'");
  const findDropdownTextSpan = () => wrapper.find('[data-testid="base-dropdown-span"]');

  it('passes custom offset to the base dropdown', () => {
    const dropdownOffset = { mainAxis: 10, crossAxis: 40 };
    buildWrapper({ dropdownOffset });

    expect(findBaseDropdown().props('offset')).toEqual(dropdownOffset);
  });

  it('passes custom placement to the base dropdown', () => {
    buildWrapper({ placement: 'bottom-end' });

    expect(findBaseDropdown().props('placement')).toEqual('bottom-end');
  });

  describe('toggle text', () => {
    describe.each`
      toggleText          | multiple | selected                  | expectedToggleText
      ${'Toggle caption'} | ${true}  | ${[mockOptions[0].value]} | ${'Toggle caption'}
      ${''}               | ${true}  | ${[mockOptions[0]].value} | ${''}
      ${''}               | ${false} | ${mockOptions[0].value}   | ${mockOptions[0].text}
      ${''}               | ${false} | ${''}                     | ${''}
      ${''}               | ${false} | ${null}                   | ${mockOptions[12].text}
    `('when listbox', ({ toggleText, multiple, selected, expectedToggleText }) => {
      beforeEach(() => {
        buildWrapper({ items: mockOptions, toggleText, multiple, selected });
      });

      it(`is ${multiple ? 'multi' : 'single'}-select, toggleText is ${
        toggleText.length ? '' : 'not '
      }provided and selected is ${selected ? 'provided' : `"${selected}"`}`, () => {
        expect(findBaseDropdown().props('toggleText')).toBe(expectedToggleText);
      });
    });
  });

  describe('toggle classes', () => {
    describe.each`
      toggleClass              | multiple | selected                  | expectedToggleClasses
      ${'customClass'}         | ${false} | ${mockOptions[0].value}   | ${['customClass']}
      ${{ customClass: true }} | ${false} | ${mockOptions[0].value}   | ${[{ customClass: true }]}
      ${['customClass']}       | ${false} | ${mockOptions[0].value}   | ${[['customClass']]}
      ${'customClass'}         | ${false} | ${undefined}              | ${['customClass', '!gl-text-subtle']}
      ${{ customClass: true }} | ${false} | ${undefined}              | ${[{ customClass: true }, '!gl-text-subtle']}
      ${['customClass']}       | ${false} | ${undefined}              | ${[['customClass'], '!gl-text-subtle']}
      ${'customClass'}         | ${true}  | ${[mockOptions[0].value]} | ${['customClass']}
      ${{ customClass: true }} | ${true}  | ${[mockOptions[0].value]} | ${[{ customClass: true }]}
      ${['customClass']}       | ${true}  | ${[mockOptions[0].value]} | ${[['customClass']]}
      ${'customClass'}         | ${true}  | ${undefined}              | ${['customClass', '!gl-text-subtle']}
      ${{ customClass: true }} | ${true}  | ${undefined}              | ${[{ customClass: true }, '!gl-text-subtle']}
      ${['customClass']}       | ${true}  | ${undefined}              | ${[['customClass'], '!gl-text-subtle']}
    `('when listbox', ({ toggleClass, multiple, selected, expectedToggleClasses }) => {
      beforeEach(() => {
        buildWrapper({ items: mockOptions, toggleClass, multiple, selected });
      });

      it(`is ${multiple ? 'multi' : 'single'}-select and ${
        selected
          ? 'has selected - does not set non-selected styles'
          : 'does not have selected - sets the non-selected styles'
      }`, () => {
        expect(findBaseDropdown().props('toggleClass')).toEqual(expectedToggleClasses);
      });
    });
  });

  describe('ARIA attributes', () => {
    it('should provide `toggleId` to the base dropdown and reference it in`aria-labelledby` attribute of the list container`', async () => {
      await buildWrapper({ items: mockOptions });
      expect(findBaseDropdown().props('toggleId')).toBe(
        findListContainer().attributes('aria-labelledby'),
      );
    });

    it('should reference `listAriaLabelledby`', async () => {
      const listAriaLabelledBy = 'first-label-id second-label-id';
      await buildWrapper({ items: mockOptions, listAriaLabelledBy });
      expect(findListContainer().attributes('aria-labelledby')).toBe(listAriaLabelledBy);
    });

    it('sets aria-busy when loading', () => {
      buildWrapper({ items: mockOptions, startOpened: true, loading: true });
      expect(findListContainer().attributes('aria-busy')).toBe('true');
    });

    it('sets aria-busy when infiniteScrollLoading', () => {
      buildWrapper({ items: mockOptions, startOpened: true, infiniteScrollLoading: true });
      expect(findListContainer().attributes('aria-busy')).toBe('true');
    });

    it.each`
      busyState                  | props                              | expectedText
      ${'searching'}             | ${{ searching: true }}             | ${'Searching'}
      ${'loading'}               | ${{ loading: true }}               | ${'Loading items'}
      ${'infiniteScrollLoading'} | ${{ infiniteScrollLoading: true }} | ${'Loading more items'}
    `('announces correct text when $busyState', ({ props, expectedText }) => {
      buildWrapper({ items: mockOptions, ...props });
      expect(wrapper.find('[data-testid="listbox-loading-announcement"]').text()).toBe(
        expectedText,
      );
    });
  });

  describe('selecting items', () => {
    describe('multi-select', () => {
      beforeEach(() => {
        buildWrapper({
          multiple: true,
          selected: [mockOptions[1].value, mockOptions[2].value],
          items: mockOptions,
        });
      });

      it('should render items as selected when `selected` provided', () => {
        expect(findListboxItems().at(1).props('isSelected')).toBe(true);
        expect(findListboxItems().at(2).props('isSelected')).toBe(true);
      });

      it('should deselect previously selected', async () => {
        findListboxItems().at(1).vm.$emit('select', false);
        await nextTick();
        expect(wrapper.emitted('select')[0][0]).toEqual([mockOptions[2].value]);
      });

      it('should add to selection', async () => {
        findListboxItems().at(0).vm.$emit('select', true);
        await nextTick();
        expect(wrapper.emitted('select')[0][0]).toEqual(
          // The first three items should now be selected.
          expect.arrayContaining(mockOptions.slice(0, 3).map(({ value }) => value)),
        );
      });

      it('should emit change event after selected prop changes', async () => {
        expect(wrapper.emitted('change')).toBeUndefined();
        await wrapper.setProps({ selected: [] });
        expect(wrapper.emitted('change')).toHaveLength(1);
      });

      it('should not emit change event after selected prop changes to new equal-by-value', async () => {
        expect(wrapper.emitted('change')).toBeUndefined();
        await wrapper.setProps({ selected: [mockOptions[1].value, mockOptions[2].value] });
        expect(wrapper.emitted('change')).toBeUndefined();
      });
    });

    describe('single-select', () => {
      beforeEach(() => {
        buildWrapper({ selected: mockOptions[1].value, items: mockOptions });
      });

      it('should throw an error when array of selections is provided', () => {
        expect(() => {
          buildWrapper({
            selected: [mockOptions[1].value, mockOptions[2].value],
            items: mockOptions,
          });
        }).toThrow('To allow multi-selection, please, set "multiple" property to "true"');
        expect(wrapper).toHaveLoggedVueErrors();
      });

      it('should render item as selected when `selected` provided', () => {
        expect(findListboxItems().at(1).props('isSelected')).toBe(true);
      });

      it('should deselect previously selected and select a new item', async () => {
        findListboxItems().at(2).vm.$emit('select', true);
        await nextTick();
        expect(wrapper.emitted('select')[0][0]).toEqual(mockOptions[2].value);
      });

      it('close dropdown for single selection', () => {
        jest.spyOn(wrapper.vm, 'closeAndFocus');
        expect(wrapper.vm.closeAndFocus).not.toHaveBeenCalled();

        findListboxItems().at(2).vm.$emit('select', true);

        expect(wrapper.vm.closeAndFocus).toHaveBeenCalled();
      });

      it('should emit change event after selected prop changes', async () => {
        expect(wrapper.emitted('change')).toBeUndefined();
        await wrapper.setProps({ selected: findListboxItems().at(2).id });
        expect(wrapper.emitted('change')).toHaveLength(1);
      });
    });

    describe('with groups', () => {
      const selected = mockGroups[1].options[1].value;

      beforeEach(() => {
        buildWrapper({ selected, items: mockGroups });
      });

      it('should render item as selected when `selected` provided', () => {
        expect(findListboxItems().at(3).props('isSelected')).toBe(true);
      });

      it('should deselect previously selected and select a new item', async () => {
        findListboxItems().at(0).vm.$emit('select', true);
        await nextTick();
        expect(wrapper.emitted('select')[0][0]).toEqual(mockGroups[0].options[0].value);
      });
    });
  });

  describe('onShow', () => {
    let focusSpy;

    const showDropdown = async (props = {}) => {
      buildWrapper({
        multiple: true,
        items: mockOptions,
        selected: [mockOptions[2].value, mockOptions[1].value],
        searchable: false,
        ...props,
      });
      if (props.searchable) {
        focusSpy = jest.spyOn(wrapper.vm.$refs.searchBox, 'focusInput');
      }
      findBaseDropdown().vm.$emit(GL_DROPDOWN_SHOWN);
      await nextTick();
      await nextTick();
    };

    it('should re-emit the event', async () => {
      await showDropdown();
      expect(wrapper.emitted(GL_DROPDOWN_SHOWN)).toHaveLength(1);
    });

    it('should focus the first selected item', async () => {
      await showDropdown();
      // eslint-disable-next-line unicorn/no-array-callback-reference
      expect(findListboxItems().at(1).find(ITEM_SELECTOR).element).toHaveFocus();
    });

    it('should focus the first item, if none are selected', async () => {
      await showDropdown({ selected: [] });
      // eslint-disable-next-line unicorn/no-array-callback-reference
      expect(findListboxItems().at(0).find(ITEM_SELECTOR).element).toHaveFocus();
    });

    it('should focus the first item, if selected option is not found', async () => {
      await showDropdown({ multiple: false, selected: 'not an option in the list' });
      // eslint-disable-next-line unicorn/no-array-callback-reference
      expect(findListboxItems().at(0).find(ITEM_SELECTOR).element).toHaveFocus();
    });

    it('should focus the search input when search is enabled', async () => {
      await showDropdown({ searchable: true });
      expect(focusSpy).toHaveBeenCalled();
    });
  });

  describe('onHide', () => {
    beforeEach(() => {
      buildWrapper();
      findBaseDropdown().vm.$emit(GL_DROPDOWN_HIDDEN);
    });

    it('should re-emit the event and emit blur', () => {
      expect(wrapper.emitted(GL_DROPDOWN_HIDDEN)).toHaveLength(1);
      expect(wrapper.emitted('blur')).toHaveLength(1);
    });
  });

  describe('navigating the items', () => {
    let firstItem;
    let secondItem;
    let thirdItem;

    beforeEach(() => {
      // These tests are more easily written with a small list of items.
      buildWrapper({ items: mockOptions.slice(0, 3) });
      findBaseDropdown().vm.$emit(GL_DROPDOWN_SHOWN);
      firstItem = findListItem(0);
      secondItem = findListItem(1);
      thirdItem = findListItem(2);
    });

    it('should move the focus down the list of items on `ARROW_DOWN` and wrap to the first item', async () => {
      expect(firstItem.element).toHaveFocus();
      await firstItem.trigger('keydown', { code: ARROW_DOWN });
      expect(secondItem.element).toHaveFocus();
      await secondItem.trigger('keydown', { code: ARROW_DOWN });
      expect(thirdItem.element).toHaveFocus();
      await thirdItem.trigger('keydown', { code: ARROW_DOWN });
      expect(firstItem.element).toHaveFocus();
    });

    it('should move the focus up the list of items on `ARROW_UP` and wrap to the last item', async () => {
      expect(firstItem.element).toHaveFocus();
      await firstItem.trigger('keydown', { code: ARROW_UP });
      expect(thirdItem.element).toHaveFocus();
      await thirdItem.trigger('keydown', { code: ARROW_UP });
      expect(secondItem.element).toHaveFocus();
      await secondItem.trigger('keydown', { code: ARROW_UP });
      expect(firstItem.element).toHaveFocus();
    });

    it('should move focus to the last item on `END` keydown', async () => {
      expect(firstItem.element).toHaveFocus();
      await firstItem.trigger('keydown', { code: END });
      expect(thirdItem.element).toHaveFocus();
      await thirdItem.trigger('keydown', { code: END });
      expect(thirdItem.element).toHaveFocus();
    });

    it('should move focus to the first item on `HOME` keydown', async () => {
      await firstItem.trigger('keydown', { code: ARROW_DOWN });
      await secondItem.trigger('keydown', { code: ARROW_DOWN });
      expect(thirdItem.element).toHaveFocus();
      await thirdItem.trigger('keydown', { code: HOME });
      expect(firstItem.element).toHaveFocus();
      await thirdItem.trigger('keydown', { code: HOME });
      expect(firstItem.element).toHaveFocus();
    });

    describe('when `searchable` is enabled', () => {
      let searchboxInput;

      beforeEach(() => {
        buildWrapper({ items: mockOptions, searchable: true });
        findBaseDropdown().vm.$emit(GL_DROPDOWN_SHOWN);
        firstItem = findListItem(0);
        searchboxInput = findSearchBox().find('input');
      });

      it('should correctly track aria-activedescendant while retaining focus on the search input', async () => {
        // Initial state check
        expect(searchboxInput.element).toHaveFocus();
        expect(searchboxInput.element.getAttribute('aria-activedescendant')).toBe(null);

        // Navigate down to first item
        await searchboxInput.trigger('keydown', { code: ARROW_DOWN });

        // Check that input retains focus
        expect(searchboxInput.element).toHaveFocus();

        // Verify aria-activedescendant is set to the first item's ID
        const firstItemId = firstItem.element.id;
        expect(firstItemId).toBeDefined();
        expect(searchboxInput.element.getAttribute('aria-activedescendant')).toBe(firstItemId);

        // Verify the component's internal state reflects this focus
        expect(wrapper.vm.activeItemId).toBe(firstItemId);

        // Navigate to second item
        await searchboxInput.trigger('keydown', { code: ARROW_DOWN });

        // Verify aria-activedescendant is updated to the second item's ID
        const secondItemId = findListItem(1).element.id;
        expect(secondItemId).toBeDefined();
        expect(searchboxInput.element.getAttribute('aria-activedescendant')).toBe(secondItemId);
        expect(wrapper.vm.activeItemId).toBe(secondItemId);

        // Input should still have focus
        expect(searchboxInput.element).toHaveFocus();
      });

      it('should not move focus away from the input on `HOME` and `END`', async () => {
        expect(searchboxInput.element).toHaveFocus();
        await searchboxInput.trigger('keydown', { code: HOME });
        expect(searchboxInput.element).toHaveFocus();
        await searchboxInput.trigger('keydown', { code: END });
        expect(searchboxInput.element).toHaveFocus();
      });

      describe('pressing Enter on the input', () => {
        const keydownSpy = jest.fn();

        beforeEach(() => {
          keydownSpy.mockClear();
          wrapper.element.addEventListener('keydown', keydownSpy);
        });

        afterEach(() => {
          wrapper.element.removeEventListener('keydown', keydownSpy);
        });

        it('does not submit any ancestor form', async () => {
          searchboxInput.trigger('keydown', { key: ENTER });

          const [event] = keydownSpy.mock.calls[0];
          expect(event.key).toBe(ENTER);
          expect(event.defaultPrevented).toBe(true);
        });
      });
    });

    describe('with disabled items', () => {
      const itemsWithDisabled = [
        { value: 'a', text: 'Item A' },
        { value: 'b', text: 'Item B', disabled: true },
        { value: 'c', text: 'Item C', disabled: true },
        { value: 'd', text: 'Item D' },
        { value: 'e', text: 'Item E' },
      ];

      beforeEach(() => {
        buildWrapper({ items: itemsWithDisabled });
        findBaseDropdown().vm.$emit(GL_DROPDOWN_SHOWN);
      });

      it('skips disabled items when navigating down with ARROW_DOWN', async () => {
        const itemA = findListItem(0);
        const itemD = findListItem(3);

        expect(itemA.element).toHaveFocus();
        await itemA.trigger('keydown', { code: ARROW_DOWN });
        expect(itemD.element).toHaveFocus();
      });

      it('skips disabled items when navigating up with ARROW_UP', async () => {
        const itemA = findListItem(0);
        const itemE = findListItem(4);

        expect(itemA.element).toHaveFocus();
        await itemA.trigger('keydown', { code: ARROW_UP });
        expect(itemE.element).toHaveFocus();
      });

      it('moves focus to last enabled item on END', async () => {
        const itemA = findListItem(0);
        const itemE = findListItem(4);

        expect(itemA.element).toHaveFocus();
        await itemA.trigger('keydown', { code: END });
        expect(itemE.element).toHaveFocus();
      });

      it('moves focus to first enabled item on HOME', async () => {
        const itemA = findListItem(0);
        const itemD = findListItem(3);

        await itemA.trigger('keydown', { code: ARROW_DOWN });
        expect(itemD.element).toHaveFocus();
        await itemD.trigger('keydown', { code: HOME });
        expect(itemA.element).toHaveFocus();
      });

      it('does not emit select event when clicking a disabled item', async () => {
        const disabledItem = findListItem(1);
        await disabledItem.trigger('click');

        expect(wrapper.emitted('select')).toBeUndefined();
      });

      it('applies disabled class to disabled items', () => {
        const disabledItem = findListItem(1);
        expect(disabledItem.classes()).toContain('disabled');
      });
    });
  });

  describe('when the header prop is provided', () => {
    const headerContent = 'Header Content';

    it('renders it', () => {
      buildWrapper({ headerText: headerContent, items: mockOptions });

      expect(findHeaderText().text()).toContain(headerContent);
    });

    it("uses the generated header ID as the list's aria-labelledby attribute", () => {
      buildWrapper({ headerText: headerContent, items: mockOptions });

      expect(findListContainer().attributes('aria-labelledby')).toBe(
        findHeaderText().attributes('id'),
      );
    });

    it('if a custom list label is passed, it overrides the header ID', () => {
      const listAriaLabelledBy = 'listAriaLabelledBy';
      buildWrapper({ listAriaLabelledBy, headerText: headerContent, items: mockOptions });

      expect(findListContainer().attributes('aria-labelledby')).toBe(listAriaLabelledBy);
    });
  });

  describe('when the footer slot content is provided', () => {
    const footerContent = 'Footer Content';
    const slots = { footer: footerContent };

    it('renders it', () => {
      buildWrapper({}, slots);
      expect(wrapper.text()).toContain(footerContent);
    });
  });

  describe('with groups', () => {
    it('renders groups of items', () => {
      buildWrapper({ items: mockGroups });

      const groups = findListboxGroups();

      expect(groups).toHaveLength(mockGroups.length);

      const expectedNameProps = mockGroups.map((group) => group.text);
      const actualNameProps = groups.wrappers.map((group) => group.props('name'));

      expect(actualNameProps).toEqual(expectedNameProps);

      mockGroups.forEach((group, i) => {
        expect(findListboxItems(groups.at(i))).toHaveLength(group.options.length);
      });
    });

    it('passes the `textSrOnly` prop', () => {
      buildWrapper({ items: mockGroupsWithTextSrOnly });

      const groups = findListboxGroups();

      const expectedTextSrOnlyProps = mockGroupsWithTextSrOnly.map(
        (group) => group.textSrOnly ?? false,
      );
      const actualTextSrOnlyProps = groups.wrappers.map((group) => group.props('textSrOnly'));

      expect(actualTextSrOnlyProps).toEqual(expectedTextSrOnlyProps);
    });
  });

  describe('when `searchable` is enabled', () => {
    it('should render the search box', () => {
      buildWrapper({ items: mockOptions, searchable: true });

      expect(findSearchBox().exists()).toBe(true);
    });

    it('should emit the search value when typing in the search box', async () => {
      buildWrapper({ items: mockOptions, searchable: true });

      const searchStr = 'search  value';
      findSearchBox().vm.$emit('input', searchStr);
      await nextTick();
      expect(wrapper.emitted('search')[0][0]).toEqual(searchStr);
    });

    it('should not render the loading icon and render the list if NOT searching', () => {
      buildWrapper({ items: mockOptions, searchable: true });

      expect(findLoadingIcon().exists()).toBe(false);
      expect(findListContainer().exists()).toBe(true);
    });

    it('should render the loading icon and NOT render the list when searching', () => {
      buildWrapper({ items: mockOptions, searchable: true, searching: true });

      expect(findLoadingIcon().exists()).toBe(true);
      expect(findListContainer().exists()).toBe(false);
    });

    it('should display `noResultText` if no items found', () => {
      const noResultsText = 'Nothing found';
      buildWrapper({ items: [], searchable: true, searching: false, noResultsText });

      expect(findLoadingIcon().exists()).toBe(false);
      expect(findListContainer().exists()).toBe(false);
      expect(findNoResultsText().text()).toBe(noResultsText);
    });

    describe('Screen reader text with number of search results', () => {
      it('when the #search-summary-sr-only slot content is empty', () => {
        buildWrapper({ items: mockOptions, searchable: true, searching: false });
        expect(findSRNumberOfResultsText().text()).toBe('13 results');
      });

      it('when the #search-summary-sr-only slot content is provided', () => {
        const searchResultsContent = 'Found 5 results';
        const slots = { 'search-summary-sr-only': searchResultsContent };
        buildWrapper({ items: mockOptions, searchable: true, searching: false }, slots);
        expect(findSRNumberOfResultsText().text()).toBe(searchResultsContent);
      });

      it('should not display SR text when no matching results', () => {
        buildWrapper({ items: [], searchable: true, searching: false });
        expect(findSRNumberOfResultsText().exists()).toBe(false);
      });
    });
  });

  describe('with a reset action', () => {
    it('throws when enabling the reset action without a header', () => {
      expect(() => {
        buildWrapper({ resetButtonLabel: 'Unassign' });
      }).toThrow(
        'The reset button cannot be rendered without a header. Either provide a header via the headerText prop, or do not provide the resetButtonLabel prop.',
      );
      expect(wrapper).toHaveLoggedVueErrors();
    });

    it.each`
      description        | props
      ${'multi-select'}  | ${{ multiple: true, selected: mockOptionsValues }}
      ${'single-select'} | ${{ multiple: false, selected: mockOptions[1].value }}
    `(
      'shows the button if the label is provided and the selection is complete in $description mode',
      ({ props }) => {
        buildWrapper({
          headerText: 'Select assignee',
          resetButtonLabel: 'Unassign',
          items: mockOptions,
          ...props,
        });

        expect(findResetButton().exists()).toBe(true);
      },
    );

    it('shows the button if the label is provided and only one option is selected in multi select', () => {
      buildWrapper({
        headerText: 'Select assignee',
        resetButtonLabel: 'Unassign',
        items: mockOptions,
        multiple: true,
        selected: mockOptionsValues.slice(0, 1),
      });

      expect(findResetButton().exists()).toBe(true);
    });

    it.each`
      description        | props
      ${'multi-select'}  | ${{ multiple: true, selected: [] }}
      ${'single-select'} | ${{ multiple: false, selected: [] }}
      ${'single-select'} | ${{ multiple: false, selected: undefined }}
    `('hides the button if the selection is empty in $description mode', ({ props }) => {
      buildWrapper({
        headerText: 'Select assignee',
        resetButtonLabel: 'Unassign',
        items: mockOptions,
        ...props,
      });

      expect(findResetButton().exists()).toBe(false);
    });

    it('hides reset button if dropdown has no items', () => {
      buildWrapper({
        headerText: 'Select assignee',
        resetButtonLabel: 'Unassign',
        selected: mockOptions[1].value,
        items: [],
        multiple: true,
      });

      expect(findResetButton().exists()).toBe(false);
    });

    it('on click, emits the `reset` event but does not call `closeAndFocus`', () => {
      buildWrapper({
        headerText: 'Select assignee',
        resetButtonLabel: 'Unassign',
        selected: mockOptionsValues,
        items: mockOptions,
        multiple: true,
      });
      jest.spyOn(wrapper.vm, 'closeAndFocus');

      expect(wrapper.emitted('reset')).toBe(undefined);
      expect(wrapper.vm.closeAndFocus).not.toHaveBeenCalled();

      findResetButton().trigger('click');

      expect(wrapper.emitted('reset')).toHaveLength(1);
      expect(wrapper.vm.closeAndFocus).not.toHaveBeenCalled();
    });

    describe('with groups', () => {
      it.each`
        description        | props
        ${'multi-select'}  | ${{ multiple: true, selected: mockGroupOptionsValues }}
        ${'single-select'} | ${{ multiple: false, selected: mockGroups[0].options[0].value }}
      `(
        'shows the button if the label is provided and the selection is complete in $description mode',
        ({ props }) => {
          buildWrapper({
            headerText: 'Select assignee',
            resetButtonLabel: 'Unassign',
            items: mockGroups,
            ...props,
          });

          expect(findResetButton().exists()).toBe(true);
        },
      );
    });
  });

  describe('with select all action', () => {
    it('throws an error when enabling the select action without a header', () => {
      expect(() => {
        buildWrapper({ showSelectAllButtonLabel: 'Select all' });
      }).toThrow(
        'The select all button cannot be rendered without a header. Either provide a header via the headerText prop, or do not provide the showSelectAllButtonLabel prop.',
      );
      expect(wrapper).toHaveLoggedVueErrors();
    });

    describe.each`
      multiple | resetVisible | selectAllVisible | selected
      ${false} | ${false}     | ${false}         | ${[]}
      ${false} | ${false}     | ${false}         | ${undefined}
      ${true}  | ${false}     | ${true}          | ${[]}
    `(
      'when label is provided, selection is empty and multiple option is $multiple',
      ({ multiple, resetVisible, selectAllVisible, selected }) => {
        beforeEach(() => {
          buildWrapper({
            headerText: 'Select assignee',
            resetButtonLabel: 'Unassign',
            showSelectAllButtonLabel: 'Select all',
            items: mockOptions,
            selected,
            multiple,
          });
        });

        it(`${selectAllVisible ? 'shows' : 'does not show'} the Select all button`, () => {
          expect(findSelectAllButton().exists()).toBe(selectAllVisible);
        });

        it(`${resetVisible ? 'shows' : 'does not show'} the Reset button`, () => {
          expect(findResetButton().exists()).toBe(resetVisible);
        });
      },
    );

    it('when label is provided and one option is selected in multiselect', () => {
      buildWrapper({
        headerText: 'Select assignee',
        resetButtonLabel: 'Unassign',
        showSelectAllButtonLabel: 'Select all',
        items: mockOptions,
        selected: mockOptionsValues.slice(0, 1),
        multiple: true,
      });

      expect(findSelectAllButton().exists()).toBe(true);
      expect(findResetButton().exists()).toBe(false);
    });

    it('hides select all button if dropdown has no items', () => {
      buildWrapper({
        headerText: 'Select assignee',
        resetButtonLabel: 'Unassign',
        showSelectAllButtonLabel: 'Select all',
        items: [],
        multiple: true,
      });

      expect(findSelectAllButton().exists()).toBe(false);
    });

    it('hides select all button if all items are selected', () => {
      buildWrapper({
        headerText: 'Select assignee',
        resetButtonLabel: 'Unassign',
        showSelectAllButtonLabel: 'Select all',
        selected: mockOptionsValues,
        items: mockOptions,
        multiple: true,
      });

      expect(findSelectAllButton().exists()).toBe(false);
    });

    it('has the label text "Select all" if the label is provided and some items are selected', () => {
      buildWrapper({
        headerText: 'Select assignee',
        resetButtonLabel: 'Unassign',
        showSelectAllButtonLabel: 'Select all',
        selected: [mockOptions[1].value],
        items: mockOptions,
        multiple: true,
      });

      expect(findSelectAllButton().text()).toBe('Select all');
    });

    it('has the label text "Select all" if the label is provided and the selection is empty', () => {
      buildWrapper({
        headerText: 'Select assignee',
        resetButtonLabel: 'Unassign',
        showSelectAllButtonLabel: 'Select all',
        selected: [],
        items: mockOptions,
        multiple: true,
      });

      expect(findSelectAllButton().text()).toBe('Select all');
    });

    it('on click, emits the `select-all` event and calls `closeAndFocus`', () => {
      buildWrapper({
        headerText: 'Select assignee',
        resetButtonLabel: 'Unassign',
        showSelectAllButtonLabel: 'Select all',
        selected: [],
        items: mockOptions,
        multiple: true,
      });

      expect(wrapper.emitted('select-all')).toBe(undefined);

      findSelectAllButton().trigger('click');

      expect(wrapper.emitted('select-all')).toHaveLength(1);
    });

    describe('with groups', () => {
      it('hides select all button if all items are selected', () => {
        buildWrapper({
          headerText: 'Select assignee',
          resetButtonLabel: 'Unassign',
          showSelectAllButtonLabel: 'Select all',
          selected: mockGroupOptionsValues,
          items: mockGroups,
          multiple: true,
        });

        expect(findSelectAllButton().exists()).toBe(false);
      });
    });
  });

  describe('when `infiniteScroll` prop is `true`', () => {
    it('should warn when items are groups', () => {
      buildWrapper({
        items: mockGroups,
        infiniteScroll: true,
      });

      expect(logWarning).toHaveBeenCalledWith(
        'When using grouped options infinite scroll can only be used on the last group.',
        { name: 'GlCollapsibleListbox' },
      );
    });

    it('renders `GlIntersectionObserver` component', () => {
      buildWrapper({
        headerText: 'Select assignee',
        items: mockOptions,
        infiniteScroll: true,
      });

      expect(findIntersectionObserver().exists()).toBe(true);
    });

    describe('when bottom of listbox is reached', () => {
      it('emits `bottom-reached` event', () => {
        buildWrapper({
          items: mockOptions,
          infiniteScroll: true,
        });

        findIntersectionObserver().vm.$emit('appear');

        expect(wrapper.emitted('bottom-reached')).toEqual([[]]);
      });
    });

    describe('when `loading` prop is `true`', () => {
      it('does not render `GlIntersectionObserver` component', () => {
        buildWrapper({
          items: mockOptions,
          infiniteScroll: true,
          loading: true,
        });

        expect(findIntersectionObserver().exists()).toBe(false);
      });
    });

    describe('when `searching` prop is `true`', () => {
      it('does not render `GlIntersectionObserver` component', () => {
        buildWrapper({
          items: mockOptions,
          infiniteScroll: true,
          searching: true,
        });

        expect(findIntersectionObserver().exists()).toBe(false);
      });
    });

    describe('when `infiniteScrollLoading` prop is `true`', () => {
      beforeEach(() => {
        buildWrapper({
          items: mockOptions,
          infiniteScroll: true,
          infiniteScrollLoading: true,
        });
      });

      it('shows loading icon', () => {
        expect(wrapper.find('[data-testid="listbox-infinite-scroll-loader"]').exists()).toBe(true);
      });

      it('does not render `GlIntersectionObserver` component', () => {
        expect(findIntersectionObserver().exists()).toBe(false);
      });
    });

    describe('when `totalItems` prop is set', () => {
      it('adds `aria-setsize` and `aria-posinset` attributes to listbox items', () => {
        const totalItems = mockOptions.length;

        buildWrapper({
          items: mockOptions,
          infiniteScroll: true,
          totalItems,
        });

        findListboxItems().wrappers.forEach((listboxItem, index) => {
          expect(listboxItem.attributes('aria-setsize')).toBe(totalItems.toString());
          expect(listboxItem.attributes('aria-posinset')).toBe((index + 1).toString());
        });
      });
    });

    describe('when `totalItems` prop is not set', () => {
      it('does not add `aria-setsize` and `aria-posinset` attributes to listbox items', () => {
        buildWrapper({
          items: mockOptions,
          infiniteScroll: true,
        });

        findListboxItems().wrappers.forEach((listboxItem) => {
          expect(listboxItem.attributes('aria-setsize')).toBe(undefined);
          expect(listboxItem.attributes('aria-posinset')).toBe(undefined);
        });
      });
    });
  });

  describe('when `infiniteScroll` prop is `false`', () => {
    it('does not render `GlIntersectionObserver` component', () => {
      buildWrapper({
        items: mockOptions,
        infiniteScroll: false,
      });

      expect(findIntersectionObserver().exists()).toBe(false);
    });
  });

  describe('items test IDs without groups', () => {
    beforeEach(() => {
      buildWrapper({
        items: mockOptions,
      });
    });

    it.each(mockOptions)('sets the test ID for %s', (option) => {
      expect(wrapper.find(`[data-testid="listbox-item-${option.value}"]`).exists()).toBe(true);
    });
  });

  describe('items test IDs with groups', () => {
    beforeEach(() => {
      buildWrapper({
        items: mockGroups,
      });
    });

    it.each([...mockGroups[0].options, ...mockGroups[1].options])(
      'sets the test ID for %s',
      (option) => {
        expect(wrapper.find(`[data-testid="listbox-item-${option.value}"]`).exists()).toBe(true);
      },
    );
  });

  describe('fluid width', () => {
    it('is disabled by default', () => {
      buildWrapper();

      expect(findBaseDropdown().props('fluidWidth')).toBe(false);
    });

    it('is enabled when `fluidWidth` is `true`', () => {
      buildWrapper({ fluidWidth: true });

      expect(findBaseDropdown().props('fluidWidth')).toBe(true);
    });
  });

  describe('panelMatchTriggerWidth', () => {
    it('is disabled by default', () => {
      buildWrapper();

      expect(findBaseDropdown().props('panelMatchTriggerWidth')).toBe(false);
    });

    it('passes true to base dropdown when enabled', () => {
      buildWrapper({ panelMatchTriggerWidth: true });

      expect(findBaseDropdown().props('panelMatchTriggerWidth')).toBe(true);
    });
  });

  describe('positioningStrategy', () => {
    it.each([POSITION_ABSOLUTE, POSITION_FIXED])(
      'passes the %s positioning strategy to the base dropdown',
      (positioningStrategy) => {
        buildWrapper({ positioningStrategy });

        expect(findBaseDropdown().props('positioningStrategy')).toBe(positioningStrategy);
      },
    );
  });

  describe('startOpened', () => {
    it('should open dropdown on render when startOpened is true', async () => {
      buildWrapper({ items: mockOptions, startOpened: true });
      await nextTick();
      expect(findDropdownMenu().classes()).toContain('!gl-block');
    });

    it('should not open dropdown on render as default', async () => {
      buildWrapper({ items: mockOptions });
      await nextTick();
      expect(findDropdownMenu().classes()).not.toContain('!gl-block');
    });
  });

  it('focuses the toggle when closed by ESC key while item had focus', async () => {
    buildWrapper({
      selected: mockOptions[1].value,
      items: mockOptions,
      startOpened: true,
    });

    await nextTick();
    findListItem(1).trigger('keydown.esc');
    await nextTick();
    expect(findDropdownToggle().element).toHaveFocus();
  });

  describe('ID placements in listbox', () => {
    describe('internal label ID placement', () => {
      it('places toggleId on button when a searchable combobox', () => {
        buildWrapper({
          searchable: true,
          toggleId: 'my-toggle',
        });
        const toggle = findDropdownToggle();
        const span = findDropdownTextSpan();

        expect(toggle.attributes('id')).toBe('my-toggle');
        expect(span.attributes('id')).toBeUndefined();
      });

      it('places toggleId on span when a non-searchable combobox', () => {
        buildWrapper({
          toggleId: 'my-toggle',
        });
        const toggle = findDropdownToggle();
        const span = findDropdownTextSpan();

        expect(toggle.attributes('id')).toBeUndefined();
        expect(span.attributes('id')).toBe('my-toggle');
      });
    });

    describe('external label ID placement', () => {
      it('places toggleId on button when a searchable combobox', () => {
        buildWrapper(
          {
            searchable: true,
            toggleId: 'my-toggle',
          },
          {},
          { getFormGroupInstance: () => ({ labelId: 'form-group-label-id' }) },
        );
        const toggle = findDropdownToggle();
        const span = findDropdownTextSpan();

        expect(toggle.attributes('id')).toBe('my-toggle');
        expect(span.attributes('id')).toBeUndefined();
      });

      it('places toggleId and listboxId when a non-searchable combobox', () => {
        buildWrapper(
          {
            toggleId: 'my-toggle',
          },
          {},
          { getFormGroupInstance: () => ({ labelId: 'form-group-label-id' }) },
        );
        const toggle = findDropdownToggle();
        const span = findDropdownTextSpan();

        expect(toggle.attributes('id')).toBe('my-toggle');
        expect(span.attributes('id')).toBe('my-toggle-span');
      });
    });
  });
});
