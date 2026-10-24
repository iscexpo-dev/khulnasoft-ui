import { shallowMount } from '@vue/test-utils';
import { nextTick } from 'vue';
import ClearIcon from '~/components/shared_components/clear_icon_button/clear_icon_button.vue';
import GlDisclosureDropdown from '../new_dropdowns/disclosure/disclosure_dropdown.vue';
import GlDisclosureDropdownItem from '../new_dropdowns/disclosure/disclosure_dropdown_item.vue';
import GlFormInput from '../form/form_input/form_input.vue';
import SearchBoxByClick from './search_box_by_click.vue';

const GlFormInputGroupStub = {
  props: ['wrapperAttributes'],
  template: `
    <div v-bind="wrapperAttributes">
      <slot name="prepend"></slot>
      <slot></slot>
      <slot name="append"></slot>
    </div>
  `,
};

describe('search box by click component', () => {
  let wrapper;

  const createComponent = (propsData) => {
    wrapper = shallowMount(SearchBoxByClick, {
      propsData,
      stubs: {
        GlDisclosureDropdown,
        GlFormInputGroup: GlFormInputGroupStub,
      },
    });
  };

  const findClearIcon = () => wrapper.findComponent(ClearIcon);
  const findSearchButton = () => wrapper.find('[data-testid="search-button"]');

  it('emits input event when input changes', async () => {
    createComponent({ value: 'somevalue' });

    wrapper.findComponent({ ref: 'input' }).vm.$emit('input', 'new value');

    await nextTick();
    expect(wrapper.emitted('input')).toEqual([['new value']]);
  });

  it('does not emit an input event when input is updated to the same value', async () => {
    createComponent({ value: 'somevalue' });

    await wrapper.setProps({ value: 'another value' });

    expect(wrapper.emitted('input')).toBe(undefined);
  });

  it('does not displays history dropdown by default', () => {
    createComponent();
    expect(wrapper.findComponent({ ref: 'historyDropdown' }).exists()).toBe(false);
  });

  describe('clear button', () => {
    it('is not rendered when value is empty', () => {
      createComponent({ value: '' });
      expect(findClearIcon().exists()).toBe(false);
    });

    it('is not rendered when clearable is false', () => {
      createComponent({ value: 'some', clearable: false });
      expect(findClearIcon().exists()).toBe(false);
    });

    it('is rendered when value is provided', () => {
      createComponent({ value: 'somevalue' });
      expect(findClearIcon().exists()).toBe(true);
    });

    it('emits empty string when clicked', async () => {
      createComponent({ value: 'somevalue' });
      findClearIcon().vm.$emit('click');

      await nextTick();
      expect(wrapper.emitted('input')).toEqual([['']]);
    });

    it('emits clear event when clicked', async () => {
      createComponent({ value: 'somevalue' });
      findClearIcon().vm.$emit('click');
      await nextTick();

      expect(wrapper.emitted('clear')).toHaveLength(1);
    });
  });

  describe('when historyItems prop is provided', () => {
    beforeEach(() => {
      createComponent({ historyItems: ['one', 'two', 'three'] });
    });

    it('displays history dropdown', () => {
      expect(wrapper.findComponent({ ref: 'historyDropdown' }).exists()).toBe(true);
    });

    it('emits clear-history event when clear button is clicked', () => {
      wrapper.findComponent({ ref: 'clearHistory' }).vm.$emit('click');

      expect(wrapper.emitted()['clear-history']).toHaveLength(1);
    });

    it('emits proper events when history item is clicked', async () => {
      wrapper.findComponent(GlDisclosureDropdownItem).vm.$emit('action');

      await nextTick();
      expect(wrapper.emitted('input')[0]).toEqual(['one']);
      expect(wrapper.emitted()['history-item-selected'][0]).toEqual(['one']);
    });
  });

  describe('accessibility', () => {
    it('has proper aria-labels on history items', () => {
      createComponent({ historyItems: ['test search'] });
      const dropdownItem = wrapper.findComponent(GlDisclosureDropdownItem);

      expect(dropdownItem.attributes('aria-label')).toBe('Select recent search: test search');
    });

    // New test case for empty search string
    it('has proper aria-label on history items with empty search string', () => {
      createComponent({ historyItems: [''] });
      const dropdownItem = wrapper.findComponent(GlDisclosureDropdownItem);

      expect(dropdownItem.attributes('aria-label')).toBe('Select recent search: empty search');
    });
  });

  describe('disabled state', () => {
    beforeEach(() => {
      createComponent({
        value: 'somevalue',
        historyItems: ['one', 'two', 'three'],
        disabled: true,
      });
    });

    it('displays disabled history dropdown', () => {
      expect(wrapper.findComponent({ ref: 'historyDropdown' }).exists()).toBe(true);
      expect(
        wrapper.findComponent({ ref: 'historyDropdown' }).attributes('disabled'),
      ).toBeDefined();
    });

    it('displays disabled input', () => {
      expect(wrapper.findComponent({ ref: 'input' }).exists()).toBe(true);
      expect(wrapper.findComponent({ ref: 'input' }).attributes('disabled')).toBeDefined();
    });

    it('displays disabled search button', () => {
      expect(findSearchButton().exists()).toBe(true);
      expect(findSearchButton().attributes('disabled')).toBeDefined();
    });

    it('does not render clear icon even with value', () => {
      expect(findClearIcon().exists()).toBe(false);
    });
  });

  it('emits submit event when Enter key is pressed', async () => {
    createComponent({ value: 'some-input' });

    await wrapper.findComponent(GlFormInput).trigger('keydown.enter');

    expect(wrapper.emitted('submit')[0]).toEqual(['some-input']);
  });

  it('emits submit event when search button is pressed', async () => {
    createComponent({ value: 'some-input' });
    findSearchButton().vm.$emit('click');

    await nextTick();
    expect(wrapper.emitted('submit')[0]).toEqual(['some-input']);
  });

  it('adds `searchButtonAttributes` prop to search button', () => {
    const searchButtonAttributes = { 'data-prop': 'foo-bar' };

    createComponent({ searchButtonAttributes });

    expect(findSearchButton().attributes('data-prop')).toBe(searchButtonAttributes['data-prop']);
  });

  it('passes `wrapperAttributes` prop to the form input group', () => {
    const wrapperAttributes = { 'data-testid': 'my-search-box' };

    createComponent({ wrapperAttributes });

    expect(wrapper.attributes('data-testid')).toBe('my-search-box');
  });

  describe('showSearchButton', () => {
    describe('when false', () => {
      beforeEach(() => {
        createComponent({ showSearchButton: false, value: 'some-value' });
      });

      it('does not render the search button', () => {
        expect(findSearchButton().exists()).toBe(false);
      });

      it('overrides the border style of the input', () => {
        expect(wrapper.findComponent(GlFormInput).classes()).toContain('!gl-rounded-control');
      });

      it('does not add *-with-search-button css modifier', () => {
        expect(wrapper.find('.gl-search-box-by-click').classes()).not.toContain(
          'gl-search-box-by-click-with-search-button',
        );
      });
    });

    describe('when true', () => {
      beforeEach(() => {
        createComponent({ showSearchButton: true, value: 'some-value' });
      });

      it('does render the search button', () => {
        expect(findSearchButton().exists()).toBe(true);
      });

      it('does not override the border style of the input', () => {
        expect(wrapper.findComponent(GlFormInput).classes()).not.toContain('!gl-rounded-control');
      });

      it('adds *-with-search-button css modifier', () => {
        expect(wrapper.find('.gl-search-box-by-click').classes()).toContain(
          'gl-search-box-by-click-with-search-button',
        );
      });
    });
  });
});
