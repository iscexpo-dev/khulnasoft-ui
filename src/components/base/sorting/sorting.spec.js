import { mount } from '@vue/test-utils';
import { useMockIntersectionObserver } from '~/utils/use_mock_intersection_observer';
import GlCollapsibleListbox from '../new_dropdowns/listbox/listbox.vue';
import GlIcon from '../icon/icon.vue';
import GlSorting from './sorting.vue';

describe('sorting component', () => {
  let wrapper;

  const defaultDropdownText = 'Sorting component';
  const isAscending = false;

  const defaultProps = {
    text: defaultDropdownText,
    isAscending,
  };

  const selectDropdownButton = () => wrapper.find('button');
  const selectDirectionButton = () => wrapper.findAll('button').at(1);
  const findListbox = () => wrapper.findComponent(GlCollapsibleListbox);
  const findListboxItem = (text) =>
    wrapper
      .findAll('[role="option"]')
      .filter((w) => w.text().includes(text))
      .at(0);

  const createComponent = (propsData) => {
    wrapper = mount(GlSorting, {
      propsData: {
        ...defaultProps,
        ...propsData,
      },
    });
  };

  describe('using listbox', () => {
    useMockIntersectionObserver();

    it('should display given toggle text in dropdown', () => {
      createComponent({ sortOptions: [] });

      expect(selectDropdownButton().text()).toBe(defaultDropdownText);
    });

    it('should show new text value when passed in as a prop', () => {
      const newDropdownText = 'Some new text';

      createComponent({
        text: newDropdownText,
      });

      expect(selectDropdownButton().text()).toBe(newDropdownText);
    });

    it('should use the selected sort option text in dropdown if text is not given', () => {
      createComponent({ text: null, sortOptions: [{ value: 0, text: 'Foo' }], sortBy: 0 });

      expect(selectDropdownButton().text()).toBe('Foo');
    });

    it('renders the given sort options', () => {
      createComponent({
        sortOptions: [
          { value: 'foo', text: 'Foo' },
          { value: 'bar', text: 'Bar' },
        ],
      });

      expect(findListboxItem('Foo').exists()).toBe(true);
      expect(findListboxItem('Bar').exists()).toBe(true);
    });

    it('emits sort-by-change event when user changes sort option', async () => {
      createComponent({
        sortOptions: [
          { value: 'foo', text: 'Foo' },
          { value: 'bar', text: 'Bar' },
        ],
        sortBy: 'foo',
      });

      await findListboxItem('Foo').trigger('click');
      expect(wrapper.emitted('sort-by-change')).toBe(undefined);

      await findListboxItem('Bar').trigger('click');
      expect(wrapper.emitted('sort-by-change')).toEqual([['bar']]);
    });

    it('should have a default sort direction of desc and displays the descending icon', () => {
      createComponent({ sortOptions: [] });

      expect(selectDirectionButton().findComponent(GlIcon).props('name')).toBe('sort-highest');
    });

    it('should accept isAscending true as a default sort direction and display the ascending icon', () => {
      createComponent({
        sortOptions: [],
        isAscending: true,
      });

      expect(selectDirectionButton().findComponent(GlIcon).props('name')).toBe('sort-lowest');
    });

    it('should emit the sort-direction-change event when direction button is clicked', () => {
      createComponent({ sortOptions: [] });

      selectDirectionButton().trigger('click');

      expect(wrapper.emitted('sort-direction-change')[0]).toEqual([true]);
    });

    it('should allow custom sort tooltip to be applied', () => {
      const newDirectionTooltip = 'New tooltip text';

      createComponent({
        sortDirectionToolTip: newDirectionTooltip,
      });

      expect(selectDirectionButton().attributes('title')).toBe(newDirectionTooltip);
      expect(selectDirectionButton().attributes('aria-label')).toBe(newDirectionTooltip);
    });

    it('adds classes passed in `dropdownClass` prop to dropdown', () => {
      createComponent({
        sortOptions: [],
        dropdownClass: 'foo-bar',
      });

      expect(findListbox().classes()).toContain('foo-bar');
    });

    it('adds classes passed in `dropdownToggleClass` prop to dropdown toggle', () => {
      createComponent({
        sortOptions: [],
        dropdownToggleClass: 'foo-bar',
      });

      expect(selectDropdownButton().classes()).toEqual(expect.arrayContaining(['foo-bar']));
    });

    it('adds classes passed in `sortDirectionToggleClass` prop to sort direction toggle', () => {
      createComponent({
        sortOptions: [],
        sortDirectionToggleClass: 'foo-bar',
      });

      expect(selectDirectionButton().classes()).toEqual(
        expect.arrayContaining(['sorting-direction-button', 'foo-bar']),
      );
    });

    it('passes `block` prop to listbox', () => {
      createComponent({
        block: true,
      });

      expect(findListbox().props('block')).toBe(true);
    });

    describe('accessible label', () => {
      it('sets a unique toggleId on the listbox toggle', () => {
        createComponent({ sortOptions: [] });

        const { toggleId } = wrapper.vm;
        expect(toggleId).toEqual(expect.any(String));
        expect(
          selectDropdownButton().find('[data-testid="base-dropdown-span"]').attributes('id'),
        ).toBe(toggleId);
      });

      it('sets toggle-aria-labelled-by to include both sortingListboxId and toggleId', () => {
        createComponent({ sortOptions: [] });

        const { sortingListboxId, toggleId } = wrapper.vm;
        expect(findListbox().props('toggleAriaLabelledBy')).toBe(`${sortingListboxId} ${toggleId}`);
      });

      it('applies aria-labelledby on the toggle button referencing both ids', () => {
        createComponent({ sortOptions: [] });

        const { sortingListboxId, toggleId } = wrapper.vm;
        expect(selectDropdownButton().attributes('aria-labelledby')).toBe(
          `${sortingListboxId} ${toggleId}`,
        );
      });
    });

    it('sets aria-label of sort direction button', async () => {
      createComponent({ sortOptions: [] });

      expect(selectDirectionButton().attributes('aria-label')).toBe('Sort direction: descending');

      await wrapper.setProps({ isAscending: true });

      expect(selectDirectionButton().attributes('aria-label')).toBe('Sort direction: ascending');
    });

    describe('when the selected sort option has `directionToggleDisabled` set', () => {
      const sortOptions = [
        { value: 'relevant', text: 'Most relevant', directionToggleDisabled: true },
        { value: 'created', text: 'Created date' },
      ];

      it('marks the direction button as `aria-disabled` without using the native disabled attribute', () => {
        createComponent({ sortOptions, sortBy: 'relevant' });

        const button = selectDirectionButton();

        expect(button.attributes('aria-disabled')).toBe('true');
        expect(button.attributes('disabled')).toBeUndefined();
      });

      it('keeps the direction button visible and focusable', () => {
        createComponent({ sortOptions, sortBy: 'relevant' });

        const button = selectDirectionButton();

        expect(button.exists()).toBe(true);
        expect(button.attributes('tabindex')).not.toBe('-1');
      });

      it('does not emit `sort-direction-change` when the disabled direction button is clicked', async () => {
        createComponent({ sortOptions, sortBy: 'relevant' });

        await selectDirectionButton().trigger('click');

        expect(wrapper.emitted('sort-direction-change')).toBeUndefined();
      });

      it('uses the selected sort field in the accessible name to explain why the toggle is unavailable', () => {
        createComponent({ sortOptions, sortBy: 'relevant' });

        expect(selectDirectionButton().attributes('aria-label')).toBe(
          'Sorting is unavailable for Most relevant',
        );
      });

      it('falls back to a generic accessible name when the selected option has no text', () => {
        createComponent({
          sortOptions: [{ value: 'x', directionToggleDisabled: true }],
          sortBy: 'x',
        });

        expect(selectDirectionButton().attributes('aria-label')).toBe('Sorting is unavailable');
      });

      it('prefers a custom `sortDirectionToolTip` for the accessible name when provided', () => {
        createComponent({ sortOptions, sortBy: 'relevant', sortDirectionToolTip: 'Custom reason' });

        expect(selectDirectionButton().attributes('aria-label')).toBe('Custom reason');
      });

      it('keeps the direction toggle enabled for options without the flag', async () => {
        createComponent({ sortOptions, sortBy: 'created' });

        expect(selectDirectionButton().attributes('aria-disabled')).toBeUndefined();

        await selectDirectionButton().trigger('click');

        expect(wrapper.emitted('sort-direction-change')[0]).toEqual([true]);
      });

      it('re-enables the toggle when switching from a non-directional to a directional option', async () => {
        createComponent({ sortOptions, sortBy: 'relevant' });

        expect(selectDirectionButton().attributes('aria-disabled')).toBe('true');

        await wrapper.setProps({ sortBy: 'created' });

        expect(selectDirectionButton().attributes('aria-disabled')).toBeUndefined();
      });
    });

    describe('when `disabled` is true', () => {
      const sortOptions = [{ value: 'manual', text: 'Manual' }];

      beforeEach(() => {
        createComponent({ sortOptions, sortBy: 'manual', disabled: true });
      });

      it('disables the listbox and the direction toggle', () => {
        expect(findListbox().props('disabled')).toBe(true);

        const button = selectDirectionButton();
        expect(button.attributes('aria-disabled')).toBe('true');
        expect(button.attributes('disabled')).toBeUndefined();
      });

      it('keeps the direction toggle focusable', () => {
        expect(selectDirectionButton().attributes('tabindex')).not.toBe('-1');
      });

      it('blocks emit event on toggle click', async () => {
        await selectDirectionButton().trigger('click');
        expect(wrapper.emitted('sort-direction-change')).toBeUndefined();
      });

      it("sets the direction toggle's aria-label to indicate sorting is disabled", () => {
        expect(selectDirectionButton().attributes('aria-label')).toBe(
          'Sorting is unavailable for Manual',
        );
      });
    });

    describe('when `disabled` becomes true while the dropdown is open', () => {
      beforeEach(async () => {
        createComponent({
          sortOptions: [
            { value: 'foo', text: 'Foo' },
            { value: 'bar', text: 'Bar' },
          ],
          sortBy: 'foo',
        });

        await selectDropdownButton().trigger('click');
      });

      it('closes and disables the dropdown', async () => {
        expect(selectDropdownButton().attributes('aria-expanded')).toBe('true');

        await wrapper.setProps({ disabled: true });

        expect(selectDropdownButton().attributes('aria-expanded')).toBe('false');
        expect(findListbox().props('disabled')).toBe(true);
      });

      it('does not emit `sort-by-change` when an option is selected', async () => {
        await wrapper.setProps({ disabled: true });
        await findListboxItem('Bar').trigger('click');

        expect(wrapper.emitted('sort-by-change')).toBeUndefined();
      });
    });
  });
});
