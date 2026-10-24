import { nextTick } from 'vue';
import { shallowMount, mount } from '@vue/test-utils';
import FilteredSearchSuggestion from './filtered_search_suggestion.vue';
import FilteredSearchSuggestionList from './filtered_search_suggestion_list.vue';

describe('Filtered search suggestion list component', () => {
  let wrapper;

  beforeAll(() => {
    if (!HTMLElement.prototype.scrollIntoView) {
      HTMLElement.prototype.scrollIntoView = jest.fn();
    }
  });

  afterAll(() => {
    if (HTMLElement.prototype.scrollIntoView.mock) {
      delete HTMLElement.prototype.scrollIntoView;
    }
  });

  describe('suggestions API', () => {
    const createComponent = ({ termsAsTokens = false } = {}) => {
      wrapper = shallowMount(FilteredSearchSuggestionList, {
        provide: { suggestionsListClass: () => 'custom-class', termsAsTokens: () => termsAsTokens },
      });
    };

    it('hides the scroll sentinel from assistive technology', () => {
      createComponent();
      const sentinel = wrapper.find('li');
      expect(sentinel.attributes('aria-hidden')).toBe('true');
      expect(sentinel.attributes('role')).toBe('presentation');
    });

    it('has expected public methods', () => {
      createComponent();
      expect(wrapper.vm.register).toBeInstanceOf(Function);
      expect(wrapper.vm.unregister).toBeInstanceOf(Function);
      expect(wrapper.vm.getValue).toBeInstanceOf(Function);
      expect(wrapper.vm.nextItem).toBeInstanceOf(Function);
      expect(wrapper.vm.prevItem).toBeInstanceOf(Function);
    });

    describe('navigation', () => {
      const stubs = [{ value: 'stub1' }, { value: 'stub2' }, { value: 'stub3' }];
      beforeEach(() => {
        createComponent();
        stubs.forEach((s) => {
          wrapper.vm.register(s);
        });
      });

      it('does not select item by default', () => {
        expect(wrapper.vm.getValue()).toBe(null);
      });

      it('selects first item on nextItem call', async () => {
        wrapper.vm.nextItem();
        await nextTick();
        expect(wrapper.vm.getValue()).toBe(stubs[0].value);
      });

      it('deselects first item on prevItem call', async () => {
        wrapper.vm.nextItem();
        wrapper.vm.prevItem();
        await nextTick();
        expect(wrapper.vm.getValue()).toBe(null);
      });

      it('deselects last item on nextItem call', async () => {
        stubs.forEach(() => wrapper.vm.nextItem());
        wrapper.vm.nextItem();
        await nextTick();
        expect(wrapper.vm.getValue()).toBe(null);
      });

      it('remove selection if suggestion is unregistered', async () => {
        wrapper.vm.nextItem();
        await nextTick();
        wrapper.vm.unregister(stubs[0]);
        await nextTick();
        expect(wrapper.vm.getValue()).toBe(null);
      });

      it('selects correct suggestion when item (un)registration is late', async () => {
        // Initially stub2 is at index 1.
        await wrapper.setProps({ initialValue: 'stub2' });
        // Remove item at index 0, so stub2 moves to index 0
        wrapper.vm.unregister(stubs[0]);
        await nextTick();
        // stub2 should still be selected
        expect(wrapper.vm.getValue()).toBe('stub2');
      });
    });

    describe('navigation with termsAsTokens', () => {
      const stubs = [{ value: 'stub1' }, { value: 'stub2' }, { value: 'stub3' }];
      beforeEach(() => {
        createComponent({ termsAsTokens: true });
        stubs.forEach((s) => {
          wrapper.vm.register(s);
        });
      });

      it('does not select item by default', () => {
        expect(wrapper.vm.getValue()).toBe(null);
      });

      it('selects first item on nextItem call', async () => {
        wrapper.vm.nextItem();
        await nextTick();
        expect(wrapper.vm.getValue()).toBe(stubs[0].value);
      });

      it('wraps to last item on prevItem call', async () => {
        wrapper.vm.nextItem();
        wrapper.vm.prevItem();
        await nextTick();
        expect(wrapper.vm.getValue()).toBe(stubs[2].value);
      });

      it('wraps to first item on nextItem call', async () => {
        stubs.forEach(() => wrapper.vm.nextItem());
        wrapper.vm.nextItem();
        await nextTick();
        expect(wrapper.vm.getValue()).toBe(stubs[0].value);
      });

      it('remove selection if suggestion is unregistered', async () => {
        wrapper.vm.nextItem();
        await nextTick();
        wrapper.vm.unregister(stubs[0]);
        await nextTick();
        expect(wrapper.vm.getValue()).toBe(null);
      });

      it('selects correct suggestion when item (un)registration is late', async () => {
        // Initially stub2 is at index 1.
        await wrapper.setProps({ initialValue: 'stub2' });
        // Remove item at index 0, so stub2 moves to index 0
        wrapper.vm.unregister(stubs[0]);
        await nextTick();
        // stub2 should still be selected
        expect(wrapper.vm.getValue()).toBe('stub2');
      });
    });
  });

  describe('integration tests', () => {
    const list = {
      components: {
        GlFilteredSearchSuggestion: FilteredSearchSuggestion,
      },
      template: `
        <div>
          <gl-filtered-search-suggestion value="One">One</gl-filtered-search-suggestion>
          <gl-filtered-search-suggestion value="Two">Two</gl-filtered-search-suggestion>
          <gl-filtered-search-suggestion :value="false">Three</gl-filtered-search-suggestion>
        </div>
      `,
    };

    const createComponent = ({ termsAsTokens = false } = {}) => {
      wrapper = mount(FilteredSearchSuggestionList, {
        provide: { suggestionsListClass: () => 'custom-class', termsAsTokens: () => termsAsTokens },
        slots: {
          default: list,
        },
      });
    };

    const findActiveSuggestion = () => wrapper.find('.gl-filtered-search-suggestion-active');

    describe('with termsAsTokens = false', () => {
      beforeEach(() => {
        createComponent();
      });

      it('selects first suggestion', async () => {
        wrapper.vm.nextItem();
        await nextTick();
        expect(wrapper.vm.getValue()).toBe('One');
      });

      it('selects second suggestion', async () => {
        wrapper.vm.nextItem();
        wrapper.vm.nextItem();
        await nextTick();
        expect(wrapper.vm.getValue()).toBe('Two');
      });

      it('deselects first suggestion after list end', async () => {
        wrapper.vm.nextItem();
        wrapper.vm.nextItem();
        wrapper.vm.nextItem();
        wrapper.vm.nextItem();
        await nextTick();
        expect(wrapper.vm.getValue()).toBe(null);
      });

      it('deselects first suggestion after list start', async () => {
        wrapper.vm.nextItem();
        wrapper.vm.prevItem();
        await nextTick();
        expect(wrapper.vm.getValue()).toBe(null);
      });

      it('selects last suggestion in circle when selecting previous item', async () => {
        wrapper.vm.nextItem();
        wrapper.vm.prevItem();
        wrapper.vm.prevItem();
        await nextTick();
        expect(wrapper.vm.getValue()).toBe(false);
      });

      it('selects first suggestion in circle when selecting next item', async () => {
        wrapper.vm.nextItem();
        wrapper.vm.nextItem();
        wrapper.vm.nextItem();
        wrapper.vm.nextItem();
        wrapper.vm.nextItem();
        await nextTick();
        expect(wrapper.vm.getValue()).toBe('One');
      });

      it('highlights suggestion if initial-value is provided', async () => {
        await wrapper.setProps({ initialValue: 'Two' });
        expect(findActiveSuggestion().text()).toBe('Two');
      });

      it('highlights suggestion if initial-value is provided, regardless of case sensitivity', async () => {
        await wrapper.setProps({ initialValue: 'two' });
        expect(findActiveSuggestion().text()).toBe('Two');
      });

      it('highlights suggestion if initial-value is provided, regardless of falsiness', async () => {
        await wrapper.setProps({ initialValue: false });
        expect(findActiveSuggestion().text()).toBe('Three');
      });

      it('highlights first suggestion if initial-value is provided, deselected then selected', async () => {
        await wrapper.setProps({ initialValue: 'One' });
        wrapper.vm.prevItem();
        wrapper.vm.nextItem();
        await nextTick();
        expect(findActiveSuggestion().text()).toBe('One');
      });

      it('does not highlight anything if initial-value matches nothing', async () => {
        await wrapper.setProps({ initialValue: 'missing' });
        expect(findActiveSuggestion().exists()).toBe(false);
      });

      it('applies the injected suggestion-list-class to the dropdown', () => {
        expect(wrapper.classes()).toContain('custom-class');
      });
    });

    describe('with termsAsTokens = true', () => {
      beforeEach(() => {
        createComponent({ termsAsTokens: true });
      });

      it('selects first suggestion', async () => {
        wrapper.vm.nextItem();
        await nextTick();
        expect(wrapper.vm.getValue()).toBe('One');
      });

      it('selects second suggestion', async () => {
        wrapper.vm.nextItem();
        wrapper.vm.nextItem();
        await nextTick();
        expect(wrapper.vm.getValue()).toBe('Two');
      });

      it('wraps to first suggestion after list end', async () => {
        wrapper.vm.nextItem();
        wrapper.vm.nextItem();
        wrapper.vm.nextItem();
        wrapper.vm.nextItem();
        await nextTick();
        expect(wrapper.vm.getValue()).toBe('One');
      });

      it('wraps to last suggestion before list start', async () => {
        wrapper.vm.nextItem();
        wrapper.vm.prevItem();
        await nextTick();
        expect(wrapper.vm.getValue()).toBe(false);
      });

      it('selects second-to-last suggestion in circle when selecting previous item', async () => {
        wrapper.vm.nextItem();
        wrapper.vm.prevItem();
        wrapper.vm.prevItem();
        await nextTick();
        expect(wrapper.vm.getValue()).toBe('Two');
      });

      it('selects second suggestion in circle when selecting next item', async () => {
        wrapper.vm.nextItem();
        wrapper.vm.nextItem();
        wrapper.vm.nextItem();
        wrapper.vm.nextItem();
        wrapper.vm.nextItem();
        await nextTick();
        expect(wrapper.vm.getValue()).toBe('Two');
      });

      it('highlights suggestion if initial-value is provided', async () => {
        await wrapper.setProps({ initialValue: 'Two' });
        expect(findActiveSuggestion().text()).toBe('Two');
      });

      it('highlights suggestion if initial-value is provided, regardless of case sensitivity', async () => {
        await wrapper.setProps({ initialValue: 'two' });
        expect(findActiveSuggestion().text()).toBe('Two');
      });

      it('highlights suggestion if initial-value is provided, regardless of falsiness', async () => {
        await wrapper.setProps({ initialValue: false });
        expect(findActiveSuggestion().text()).toBe('Three');
      });

      it('highlights first suggestion if initial-value is provided, deselected then selected', async () => {
        await wrapper.setProps({ initialValue: 'One' });
        wrapper.vm.prevItem();
        wrapper.vm.nextItem();
        await nextTick();
        expect(findActiveSuggestion().text()).toBe('One');
      });

      it('does not highlight anything if initial-value matches nothing', async () => {
        await wrapper.setProps({ initialValue: 'missing' });
        expect(findActiveSuggestion().exists()).toBe(false);
      });

      it('applies the injected suggestion-list-class to the dropdown', () => {
        expect(wrapper.classes()).toContain('custom-class');
      });
    });
  });
});
