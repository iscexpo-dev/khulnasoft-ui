import { shallowMount } from '@vue/test-utils';
import { nextTick } from 'vue';
import GlFormInput from '../form_input/form_input.vue';
import GlDropdownItem from '../../dropdown/dropdown_item.vue';
import InputGroup from './form_input_group.vue';

describe('Input Group', () => {
  let wrapper;

  const createWrapper = (options) => {
    wrapper = shallowMount(InputGroup, {
      ...options,
    });
  };

  it('renders wrapper with role of group', () => {
    createWrapper();
    expect(wrapper.attributes('role')).toBe('group');
  });

  it('renders prepend and append texts properly in the slots', () => {
    const prependText = 'Foo';
    const appendText = 'Bar';
    createWrapper({
      slots: {
        prepend: `<p id="prepend">${prependText}</p>`,
        append: `<p id="append">${appendText}</p>>`,
      },
    });
    expect(wrapper.find('#prepend').exists()).toBe(true);
    expect(wrapper.find('#prepend').text()).toBe(prependText);

    expect(wrapper.find('#append').exists()).toBe(true);
    expect(wrapper.find('#append').text()).toBe(appendText);
  });

  it('selects text on click if appropriate prop is set up', () => {
    const mock = jest.fn();
    createWrapper({
      propsData: { selectOnClick: true },
    });
    wrapper.vm.$refs.input.$el.select = mock;
    wrapper.vm.handleClick();

    expect(mock).toHaveBeenCalled();
  });

  it('does not emit input event if predefinedOptions are not set', () => {
    createWrapper();
    expect(wrapper.emitted('input')).toBeUndefined();
  });

  describe('`wrapperAttributes` prop', () => {
    it('applies attributes to the wrapper element', () => {
      createWrapper({
        propsData: { wrapperAttributes: { 'data-testid': 'my-input-group', 'aria-label': 'Test' } },
      });

      expect(wrapper.attributes('data-testid')).toBe('my-input-group');
      expect(wrapper.attributes('aria-label')).toBe('Test');
    });
  });

  describe('`inputClass` prop', () => {
    it.each`
      inputClass
      ${'foo-bar baz'}
      ${['foo-bar', 'baz']}
      ${{ 'foo-bar': true, baz: true }}
    `('correctly adds classes to input when `inputClass` prop is $inputClass', ({ inputClass }) => {
      createWrapper({
        propsData: { inputClass },
      });

      expect(wrapper.findComponent(GlFormInput).classes()).toEqual(
        expect.arrayContaining(['foo-bar', 'baz']),
      );
    });
  });

  describe('predefined options', () => {
    const options = [
      { name: 'Foo', value: 'foo.com' },
      { name: 'Bar', value: 'bar.com' },
    ];
    let items;

    beforeEach(() => {
      createWrapper({
        propsData: { predefinedOptions: options },
      });
      items = wrapper.findAllComponents(GlDropdownItem);
    });

    it('throws an error if the options format does not match the required one', () => {
      createWrapper({
        propsData: { predefinedOptions: [{ foo: 'bar' }] },
      });

      expect(wrapper).toHaveLoggedVueWarnings();
    });

    it('are rendered when supplied', () => {
      expect(items).toHaveLength(2);
      expect(items.at(0).text()).toEqual(options[0].name);
      expect(items.at(1).text()).toEqual(options[1].name);
    });

    it('set input value to the value of the first option by default', () => {
      expect(wrapper.vm.activeOption).toEqual(options[0].name);
      expect(wrapper.vm.localValue).toEqual(options[0].value);
    });

    it('populate input with correct value when selected', () => {
      items.at(1).vm.$emit('click');
      expect(wrapper.vm.localValue).toEqual(options[1].value);
    });

    it('emits event with default options value to enable reactive updates outside of the component', () => {
      expect(wrapper.emitted('input')).toHaveLength(1);
      expect(wrapper.emitted('input')[0]).toEqual([options[0].value]);
    });

    it('emits event when an active option is changed to enable reactive updates outside of the component', async () => {
      items.at(1).vm.$emit('click');
      await nextTick();

      expect(wrapper.emitted('input')).toHaveLength(2);
      expect(wrapper.emitted('input')[1]).toEqual([options[1].value]);
    });
  });
});
