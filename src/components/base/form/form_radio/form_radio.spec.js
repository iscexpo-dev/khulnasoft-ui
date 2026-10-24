import { mount } from '@vue/test-utils';
import GlFormRadio from './form_radio.vue';

describe('GlFormRadio', () => {
  let wrapper;

  const createComponent = (options = {}) => {
    wrapper = mount(GlFormRadio, options);
  };

  const findInput = () => wrapper.find('input');
  const findLabel = () => wrapper.find('label');

  it('can start checked', () => {
    createComponent({
      propsData: {
        checked: 'checked_value',
        value: 'checked_value',
        name: 'foo',
      },
    });

    expect(wrapper.find('input[name="foo"]').element.checked).toBe(true);
  });

  it('default has structure <div><input><label></label></div>', () => {
    createComponent({
      propsData: {
        checked: '',
        value: 'a',
      },
      slots: {
        default: 'foobar',
      },
    });

    expect(wrapper).toBeDefined();
    expect(wrapper.element.tagName).toBe('DIV');

    const { children } = wrapper.element;
    expect(children).toHaveLength(2);
    expect(children[0].tagName).toBe('INPUT');
    expect(children[1].tagName).toBe('LABEL');
  });

  it('default has wrapper class custom-control and custom-radio', () => {
    createComponent({
      propsData: {
        checked: '',
        value: 'a',
      },
      slots: {
        default: 'foobar',
      },
    });

    expect(wrapper.classes()).toEqual(['gl-form-radio', 'custom-radio', 'custom-control']);
  });

  it('default has input type radio', () => {
    createComponent({
      propsData: {
        checked: '',
        value: 'a',
      },
      slots: {
        default: 'foobar',
      },
    });

    const input = findInput();
    expect(input.attributes('type')).toBe('radio');
  });

  it('default has input class custom-control-input', () => {
    createComponent({
      propsData: {
        checked: false,
      },
      slots: {
        default: 'foobar',
      },
    });

    expect(findInput().classes()).toEqual(['custom-control-input']);
  });

  it('default has label class custom-control-label', () => {
    createComponent({
      propsData: {
        checked: false,
      },
      slots: {
        default: 'foobar',
      },
    });

    expect(findLabel().classes()).toEqual(['custom-control-label']);
  });

  it('has default slot content in label', () => {
    createComponent({
      propsData: {
        checked: false,
      },
      slots: {
        default: 'foobar',
      },
    });

    expect(findLabel().text()).toBe('foobar');
  });

  it('default has no disabled attribute on input', () => {
    createComponent({
      propsData: {
        checked: false,
      },
      slots: {
        default: 'foobar',
      },
    });

    expect(findInput().attributes('disabled')).toBeUndefined();
  });

  it('has disabled attribute on input when prop disabled set', () => {
    createComponent({
      propsData: {
        checked: false,
        disabled: true,
      },
      slots: {
        default: 'foobar',
      },
    });

    expect(findInput().attributes('disabled')).toBeDefined();
  });

  it('default has no required attribute on input', () => {
    createComponent({
      propsData: {
        checked: false,
      },
      slots: {
        default: 'foobar',
      },
    });

    expect(findInput().attributes('required')).toBeUndefined();
  });

  it('does not have required attribute on input when prop required set and name prop not provided', () => {
    createComponent({
      propsData: {
        checked: false,
        required: true,
      },
      slots: {
        default: 'foobar',
      },
    });

    expect(findInput().attributes('required')).toBeUndefined();
  });

  it('has required attribute on input when prop required and name set', () => {
    createComponent({
      propsData: {
        checked: false,
        name: 'test',
        required: true,
      },
      slots: {
        default: 'foobar',
      },
    });

    expect(findInput().attributes('required')).toBeDefined();
  });

  it('default has no name attribute on input', () => {
    createComponent({
      propsData: {
        checked: false,
      },
      slots: {
        default: 'foobar',
      },
    });

    expect(findInput().attributes('name')).toBeUndefined();
  });

  it('has name attribute on input when name prop set', () => {
    createComponent({
      propsData: {
        checked: false,
        name: 'test',
      },
      slots: {
        default: 'foobar',
      },
    });

    const input = findInput();
    expect(input.attributes('name')).toBeDefined();
    expect(input.attributes('name')).toBe('test');
  });

  it('has custom attributes transferred to input element', () => {
    createComponent({
      propsData: {
        id: 'foo',
        foo: 'bar',
      },
    });

    const input = findInput();
    expect(input.attributes('foo')).toBeDefined();
    expect(input.attributes('foo')).toBe('bar');
  });

  it.each(['', undefined, null])('falls back to a generated ID if the provided one is %s', (id) => {
    createComponent({
      propsData: {
        id,
      },
    });

    expect(findInput().attributes('id')).toMatch(/khulnasoft_ui_radio_\d+/);
  });

  it('default has no input validation classes by default', () => {
    createComponent({
      propsData: {
        checked: false,
      },
      slots: {
        default: 'foobar',
      },
    });

    const input = findInput();
    expect(input).toBeDefined();
    expect(input.classes()).not.toContain('is-invalid');
    expect(input.classes()).not.toContain('is-valid');
  });

  it('default has no input validation classes when state=null', () => {
    createComponent({
      propsData: {
        state: null,
        checked: false,
      },
      slots: {
        default: 'foobar',
      },
    });

    const input = findInput();
    expect(input).toBeDefined();
    expect(input.classes()).not.toContain('is-invalid');
    expect(input.classes()).not.toContain('is-valid');
  });

  it('default has input validation class is-valid when state=true', () => {
    createComponent({
      propsData: {
        state: true,
        checked: false,
      },
      slots: {
        default: 'foobar',
      },
    });

    const input = findInput();
    expect(input).toBeDefined();
    expect(input.classes()).not.toContain('is-invalid');
    expect(input.classes()).toContain('is-valid');
  });

  it('default has input validation class is-invalid when state=false', () => {
    createComponent({
      propsData: {
        state: false,
        checked: false,
      },
      slots: {
        default: 'foobar',
      },
    });

    const input = findInput();
    expect(input).toBeDefined();
    expect(input.classes()).toContain('is-invalid');
    expect(input.classes()).not.toContain('is-valid');
  });

  it('emits a change event when clicked', async () => {
    createComponent({
      attachTo: document.body,
      propsData: {
        value: 'bar',
        checked: 'foo',
      },
      slots: {
        default: 'foobar',
      },
    });

    expect(wrapper.emitted('change')).toBeUndefined();

    const input = findInput();
    expect(input).toBeDefined();

    await input.trigger('click');
    expect(wrapper.emitted('change')).toBeDefined();
    expect(wrapper.emitted('change')).toHaveLength(1);
    expect(wrapper.emitted('change')[0][0]).toEqual('bar');
  });

  // The `value` prop defaults to `true` so that checking a radio without an explicit value
  // will set the bound v-model to `true`. This differs from the HTML spec default of "on".
  // See: https://github.com/khulnasoft/khulnasoft-ui/-/merge_requests/5455#note_3052052657
  it('has a default value of `true`', () => {
    createComponent({
      propsData: {
        checked: null,
      },
    });

    expect(findInput().attributes('value')).toBe('true');
  });

  it('focus() and blur() methods work', () => {
    createComponent({
      propsData: {
        checked: true,
      },
      slots: {
        default: 'foobar',
      },
      attachTo: document.body,
    });

    const input = findInput();

    expect(typeof wrapper.vm.focus).toBe('function');
    expect(typeof wrapper.vm.blur).toBe('function');

    expect(document.activeElement).not.toBe(input.element);
    wrapper.vm.focus();
    expect(document.activeElement).toBe(input.element);
    wrapper.vm.blur();
    expect(document.activeElement).not.toBe(input.element);
  });

  describe('when used with multiple radios', () => {
    let eventHandlers;

    const firstOption = {
      text: 'One',
      value: 'one',
    };
    const secondOption = {
      text: 'Two',
      value: 'two',
    };

    const createWrapper = () => {
      const options = [firstOption, secondOption];
      eventHandlers = {
        input: jest.fn(),
        change: jest.fn(),
      };

      wrapper = mount({
        data() {
          return {
            selected: firstOption.value,
            options,
          };
        },
        components: { GlFormRadio },
        template: `
          <div>
            <gl-form-radio
              v-for="option in options"
              :key="option.value"
              v-model="selected"
              :value="option.value"
              @change="changeHandler"
              @input="inputHandler"
            >{{ option.text }}</gl-form-radio>
          </div>
        `,
        methods: {
          changeHandler: eventHandlers.change,
          inputHandler: eventHandlers.input,
        },
      });
    };

    const findRadio = (value) => wrapper.find(`input[type="radio"][value="${value}"]`);

    beforeEach(() => {
      createWrapper();
    });

    it('checks the radio button correctly on mount', () => {
      const radio = findRadio(firstOption.value);
      expect(radio.element.checked).toBe(true);
    });

    describe('when the selected value is changed programmatically', () => {
      beforeEach(() => {
        wrapper.vm.selected = secondOption.value;
      });

      it('emits an input event, but not a change event on each radio', () => {
        wrapper.findAllComponents(GlFormRadio).wrappers.forEach((radio) => {
          expect(radio.emitted()).toEqual({
            input: [[secondOption.value]],
          });
        });
      });

      it('checks the correct radio', () => {
        expect(findRadio(secondOption.value).element.checked).toBe(true);
      });
    });

    describe('when the selected value is changed by the user', () => {
      let radio;

      beforeEach(async () => {
        radio = findRadio(secondOption.value);

        // NOTE: We can't use "setChecked" here because
        // it sets value programmatically under the hood and this
        // does not pass value for the "change" event.
        await radio.trigger('click');
        await radio.trigger('change');
      });

      it('emits an input event on each radio, and a change event on the newly selected radio', () => {
        const { input, change } = eventHandlers;
        const { value: clickedRadioValue } = secondOption;

        // The input handler is called twice because each radio emits one input event.
        expect(input).toHaveBeenCalledTimes(2);
        expect(input).toHaveBeenNthCalledWith(1, clickedRadioValue);
        expect(input).toHaveBeenNthCalledWith(2, clickedRadioValue);

        // The change handler is only called once, since only the newly selected radio emits a change event.
        expect(change).toHaveBeenCalledTimes(1);
        expect(change).toHaveBeenCalledWith(clickedRadioValue);
      });

      it('updates the bound value', () => {
        expect(wrapper.vm.selected).toBe(secondOption.value);
      });

      it('checks the radio', () => {
        expect(radio.element.checked).toBe(true);
      });
    });
  });
});
