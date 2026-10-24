import { shallowMount } from '@vue/test-utils';
import Vue, { nextTick } from 'vue';
import GlIcon from '../icon/icon.vue';
import { waitForAnimationFrame } from '../../../utils/test_utils';
import FilteredSearchSuggestion from './filtered_search_suggestion.vue';

describe('Filtered search suggestion component', () => {
  let wrapper;
  let listMock;

  const createComponent = ({ props, ...options } = {}) => {
    wrapper = shallowMount(FilteredSearchSuggestion, {
      propsData: {
        value: 'myValue',
        ...props,
      },
      provide: {
        filteredSearchSuggestionListInstance: listMock,
      },
      ...options,
    });
  };

  const findSuggestion = () => wrapper.find("[data-testid='filtered-search-suggestion']");

  beforeEach(() => {
    listMock = Vue.observable({
      register: jest.fn(),
      unregister: jest.fn(),
      $emit: jest.fn(),
      activeItem: null,
    });
  });

  beforeAll(() => {
    if (!HTMLElement.prototype.scrollIntoView) {
      HTMLElement.prototype.scrollIntoView = () => {};
    }
  });

  afterAll(() => {
    if (HTMLElement.prototype.scrollIntoView.mock) {
      delete HTMLElement.prototype.scrollIntoView;
    }
  });

  it('registers in list instance when mounted', () => {
    createComponent();
    expect(listMock.register).toHaveBeenCalledWith(wrapper.vm);
  });

  it('unregisters in list instance when unmounted', () => {
    createComponent();
    wrapper.destroy();
    expect(listMock.unregister).toHaveBeenCalledWith(wrapper.vm);
  });

  it('emits suggestion event on list instance when clicked', async () => {
    const value = 'demo';
    createComponent({ props: { value } });
    await findSuggestion().trigger('mousedown');

    expect(listMock.$emit).toHaveBeenCalledWith('suggestion', value);
  });

  describe('when is active item', () => {
    let mockScollIntoView;

    beforeEach(() => {
      createComponent();
      mockScollIntoView = jest.spyOn(wrapper.element, 'scrollIntoView');
      listMock.activeItem = wrapper.vm;
    });

    it('adds active class', async () => {
      await nextTick();

      expect(wrapper.classes()).toContain('gl-filtered-search-suggestion-active');
    });

    it('scrolls element into view', async () => {
      await waitForAnimationFrame();

      expect(mockScollIntoView).toHaveBeenCalledTimes(1);
      expect(mockScollIntoView).toHaveBeenCalledWith({ block: 'nearest', inline: 'end' });
    });
  });

  it('renders icon', () => {
    createComponent({ props: { iconName: 'pause' } });

    expect(wrapper.findComponent(GlIcon).props('name')).toBe('pause');
  });
});
