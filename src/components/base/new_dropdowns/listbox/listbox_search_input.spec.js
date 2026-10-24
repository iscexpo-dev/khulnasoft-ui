import { mount, shallowMount } from '@vue/test-utils';
import { nextTick } from 'vue';
import ClearIcon from '~/components/shared_components/clear_icon_button/clear_icon_button.vue';
import ListboxSearchInput from './listbox_search_input.vue';

const modelEvent = ListboxSearchInput.model.event;
const newSearchValue = 'new value';

describe('listbox search input component', () => {
  let wrapper;
  const searchValue = 'some value';

  const createComponent = ({ listeners, ...propsData }, mountFn = shallowMount) => {
    wrapper = mountFn(ListboxSearchInput, { propsData, listeners });
  };

  const findClearIcon = () => wrapper.findComponent(ClearIcon);
  const findInput = () => wrapper.findComponent({ ref: 'input' });

  describe('clear icon component', () => {
    beforeEach(() => {
      createComponent({ value: searchValue });
    });

    it('is not rendered when value is empty', () => {
      createComponent({ value: '' });

      expect(findClearIcon().exists()).toBe(false);
    });

    it('is rendered when value is provided', () => {
      expect(findClearIcon().exists()).toBe(true);
    });

    it('emits empty value when clicked', () => {
      findClearIcon().vm.$emit('click', { stopPropagation: jest.fn() });

      expect(wrapper.emitted('input')).toEqual([['']]);
    });
  });

  describe('v-model', () => {
    beforeEach(() => {
      jest.useFakeTimers();
      createComponent({ value: searchValue }, mount);
    });

    it('syncs value prop to input value', async () => {
      expect(findInput().element.value).toEqual(searchValue);
      wrapper.setProps({ value: newSearchValue });
      await nextTick();

      expect(findInput().element.value).toEqual(newSearchValue);
    });

    it(`emits ${modelEvent} event when input value changes`, async () => {
      findInput().setValue(newSearchValue);
      await nextTick();
      expect(wrapper.emitted('input')).toEqual([[newSearchValue]]);
    });
  });
});
