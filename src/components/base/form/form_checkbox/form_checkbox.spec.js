import { mount } from '@vue/test-utils';
import GlFormCheckbox from './form_checkbox.vue';

describe('GlFormCheckbox', () => {
  let wrapper;

  const createComponent = (options) => {
    wrapper = mount(GlFormCheckbox, options);
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

  it('default has wrapper class custom-control and custom-checkbox', () => {
    createComponent({
      propsData: {
        checked: '',
        value: 'a',
      },
      slots: {
        default: 'foobar',
      },
    });

    expect(wrapper.classes()).toEqual(['gl-form-checkbox', 'custom-checkbox', 'custom-control']);
  });

  it('default has input type checkbox', () => {
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
    expect(input.attributes('type')).toBeDefined();
    expect(input.attributes('type')).toBe('checkbox');
  });

  it('default does not have aria-label attribute on input', () => {
    createComponent({
      propsData: {
        checked: false,
      },
      slots: {
        default: 'foobar',
      },
    });

    expect(findInput().attributes('aria-label')).toBeUndefined();
  });

  it('has aria-label attribute on input when aria-label provided', () => {
    createComponent({
      propsData: {
        checked: false,
        ariaLabel: 'bar',
      },
      slots: {
        default: 'foo',
      },
    });

    expect(findInput().attributes('aria-label')).toBe('bar');
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

    expect(findInput().attributes('id')).toBe('khulnasoft_ui_checkbox_1');
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

  it('does not have input indeterminate set by default', () => {
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
    expect(input.element.indeterminate).toBe(false);
  });

  it('has input indeterminate set by when indeterminate=true', () => {
    createComponent({
      propsData: {
        checked: false,
        indeterminate: true,
      },
      slots: {
        default: 'foobar',
      },
    });

    const input = findInput();
    expect(input).toBeDefined();
    expect(input.element.indeterminate).toBe(true);
  });

  it('has input indeterminate set by when indeterminate set to true after mount', async () => {
    createComponent({
      propsData: {
        checked: false,
        indeterminate: false,
      },
      slots: {
        default: 'foobar',
      },
    });

    const input = findInput();
    expect(input).toBeDefined();
    expect(input.element.indeterminate).toBe(false);

    await wrapper.setProps({ indeterminate: true });
    expect(input.element.indeterminate).toBe(true);

    await wrapper.setProps({ indeterminate: false });
    expect(input.element.indeterminate).toBe(false);
  });

  it('emits a change event when clicked', async () => {
    createComponent({
      attachTo: document.body,
      propsData: {
        uncheckedValue: 'foo',
        value: 'bar',
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

    await input.trigger('click');
    expect(wrapper.emitted('change')).toBeDefined();
    expect(wrapper.emitted('change')).toHaveLength(2);
    expect(wrapper.emitted('change')[1][0]).toEqual('foo');
  });

  it('works when v-model bound to an array', async () => {
    createComponent({
      attachTo: document.body,
      propsData: {
        value: 'bar',
        checked: ['foo'],
      },
      slots: {
        default: 'foobar',
      },
    });

    const input = findInput();
    expect(input).toBeDefined();

    await input.trigger('click');
    expect(wrapper.emitted('change')).toBeDefined();
    expect(wrapper.emitted('change')).toHaveLength(1);
    expect(wrapper.emitted('change')[0][0]).toEqual(['foo', 'bar']);

    await input.trigger('click');
    expect(wrapper.emitted('change')).toBeDefined();
    expect(wrapper.emitted('change')).toHaveLength(2);
    expect(wrapper.emitted('change')[1][0]).toEqual(['foo']);

    await wrapper.setProps({ checked: [] });
    expect(wrapper.emitted('change')).toBeDefined();
    expect(wrapper.emitted('change')).toHaveLength(2);

    await input.trigger('click');
    expect(wrapper.emitted('change')).toBeDefined();
    expect(wrapper.emitted('change')).toHaveLength(3);
    expect(wrapper.emitted('change')[2][0]).toEqual(['bar']);

    await input.trigger('click');
    expect(wrapper.emitted('change')).toBeDefined();
    expect(wrapper.emitted('change')).toHaveLength(4);
    expect(wrapper.emitted('change')[3][0]).toEqual([]);
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
});
