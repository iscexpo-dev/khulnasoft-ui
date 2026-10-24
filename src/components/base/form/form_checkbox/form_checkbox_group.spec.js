import { nextTick } from 'vue';
import { mount } from '@vue/test-utils';
import GlFormCheckboxGroup from './form_checkbox_group.vue';

describe('GlFormCheckboxGroup', () => {
  let wrapper;

  const createWrapper = ({ propsData = {}, attachTo, attrs = {} } = {}) => {
    wrapper = mount(GlFormCheckboxGroup, {
      propsData,
      attachTo,
      attrs,
    });
  };

  it('default has structure <div></div>', async () => {
    createWrapper();
    expect(wrapper).toBeDefined();
    expect(wrapper.element.tagName).toBe('DIV');
    const { children } = wrapper.element;
    expect(children).toHaveLength(0);
  });

  it('default has only gl-form-checkbox-group and gl-outline-none classes on wrapper', async () => {
    createWrapper();
    expect(wrapper.classes()).toHaveLength(2);
    expect(wrapper.classes()).toMatchObject(['gl-form-checkbox-group', 'gl-outline-none']);
  });

  it('default has auto ID set', async () => {
    createWrapper({ attachTo: document.body });
    await nextTick();
    // Auto ID not generated until after mount
    expect(wrapper.attributes('id')).toBeDefined();
  });

  it('default has tabindex set to -1', async () => {
    createWrapper();
    expect(wrapper.attributes('tabindex')).toBeDefined();
    expect(wrapper.attributes('tabindex')).toBe('-1');
  });

  it('default does not have aria-required set', async () => {
    createWrapper();
    expect(wrapper.attributes('aria-required')).toBeUndefined();
  });

  it('default does not have aria-invalid set', async () => {
    createWrapper();
    expect(wrapper.attributes('aria-invalid')).toBeUndefined();
  });

  it('default has attribute role=group', async () => {
    createWrapper();
    expect(wrapper.attributes('role')).toBeDefined();
    expect(wrapper.attributes('role')).toBe('group');
  });

  it('default has user provided ID', async () => {
    createWrapper({
      attachTo: document.body,
      propsData: {
        id: 'test',
      },
    });

    expect(wrapper.attributes('id')).toBeDefined();
    expect(wrapper.attributes('id')).toBe('test');
  });

  it('default has attribute aria-invalid=true when state=false', async () => {
    createWrapper({
      attachTo: document.body,
      propsData: {
        state: false,
      },
    });

    expect(wrapper.attributes('aria-invalid')).toBeDefined();
    expect(wrapper.attributes('aria-invalid')).toBe('true');
  });

  it('default does not have attribute aria-invalid when state=true', async () => {
    createWrapper({
      attachTo: document.body,
      propsData: {
        state: true,
      },
    });

    expect(wrapper.attributes('aria-invalid')).toBeUndefined();
  });

  it('default does not have attribute aria-invalid when state=null', async () => {
    createWrapper({
      attachTo: document.body,
      propsData: {
        state: null,
      },
    });

    expect(wrapper.attributes('aria-invalid')).toBeUndefined();
  });

  it('default has attribute aria-invalid=true when aria-invalid=true', async () => {
    createWrapper({
      attachTo: document.body,
      propsData: {
        ariaInvalid: true,
      },
    });

    expect(wrapper.attributes('aria-invalid')).toBeDefined();
    expect(wrapper.attributes('aria-invalid')).toBe('true');
  });

  it('default has attribute aria-invalid=true when aria-invalid="true"', async () => {
    createWrapper({
      attachTo: document.body,
      propsData: {
        ariaInvalid: 'true',
      },
    });

    expect(wrapper.attributes('aria-invalid')).toBeDefined();
    expect(wrapper.attributes('aria-invalid')).toBe('true');
  });

  it('default has attribute aria-invalid=true when aria-invalid=""', async () => {
    createWrapper({
      attachTo: document.body,
      propsData: {
        ariaInvalid: '',
      },
    });

    expect(wrapper.attributes('aria-invalid')).toBeDefined();
    expect(wrapper.attributes('aria-invalid')).toBe('true');
  });

  it('default passes down aria-describedby to child checkboxes', () => {
    createWrapper({
      attachTo: document.body,
      propsData: {
        options: ['one', 'two'],
        checked: [],
        state: true,
      },
      attrs: {
        'aria-describedby': 'some-label',
      },
    });

    const checkboxes = wrapper.findAll('input[type=checkbox]');
    expect(wrapper.attributes('aria-describedby')).toBeUndefined();
    expect(
      checkboxes.wrappers.every((c) => c.attributes('aria-describedby').includes('some-label')),
    ).toBe(true);
  });

  it('default passes down aria-labelledby to child checkboxes', () => {
    createWrapper({
      attachTo: document.body,
      propsData: {
        options: ['one', 'two'],
        checked: [],
        state: true,
      },
      attrs: {
        'aria-labelledby': 'some-label',
      },
    });

    const checkboxes = wrapper.findAll('input[type=checkbox]');
    expect(wrapper.attributes('aria-labelledby')).toBeUndefined();
    expect(
      checkboxes.wrappers.every((c) => c.attributes('aria-labelledby').includes('some-label')),
    ).toBe(true);
  });

  it('has checkboxes with input validation class "is-valid" when `state` is `true`', async () => {
    createWrapper({
      attachTo: document.body,
      propsData: {
        options: ['one', 'two', 'three'],
        checked: [],
        state: true,
      },
    });

    const checkboxes = wrapper.findAll('input[type=checkbox]');
    expect(checkboxes).toHaveLength(3);
    expect(checkboxes.wrappers.every((c) => c.classes().includes('is-valid'))).toBe(true);
    expect(checkboxes.wrappers.every((c) => c.classes().includes('is-invalid'))).toBe(false);
  });

  it('has checkboxes with input validation class "is-invalid" when `state` is `false`', async () => {
    createWrapper({
      attachTo: document.body,
      propsData: {
        options: ['one', 'two', 'three'],
        checked: [],
        state: false,
      },
    });

    const checkboxes = wrapper.findAll('input[type=checkbox]');
    expect(checkboxes).toHaveLength(3);
    expect(checkboxes.wrappers.every((c) => c.classes().includes('is-valid'))).toBe(false);
    expect(checkboxes.wrappers.every((c) => c.classes().includes('is-invalid'))).toBe(true);
  });

  it('has checkboxes with no input validation class when `state` is `null`', async () => {
    createWrapper({
      attachTo: document.body,
      propsData: {
        options: ['one', 'two', 'three'],
        checked: [],
        state: null,
      },
    });

    const checkboxes = wrapper.findAll('input[type=checkbox]');
    expect(checkboxes).toHaveLength(3);
    expect(checkboxes.wrappers.every((c) => c.classes().includes('is-valid'))).toBe(false);
    expect(checkboxes.wrappers.every((c) => c.classes().includes('is-invalid'))).toBe(false);
  });

  // --- Functionality testing ---

  it('has checkboxes via options array', async () => {
    createWrapper({
      attachTo: document.body,
      propsData: {
        options: ['one', 'two', 'three'],
        checked: [],
      },
    });

    expect(wrapper.vm.localChecked).toEqual([]);

    const inputs = wrapper.findAll('input');
    expect(inputs).toHaveLength(3);
    expect(inputs.wrappers.every((c) => c.element.matches('input[type=checkbox]'))).toBe(true);
  });

  it('has checkboxes via options array which respect disabled', async () => {
    createWrapper({
      attachTo: document.body,
      propsData: {
        options: [{ text: 'one' }, { text: 'two' }, { text: 'three', disabled: true }],
        checked: [],
      },
    });

    expect(wrapper.classes()).toBeDefined();

    const inputs = wrapper.findAll('input');
    expect(inputs).toHaveLength(3);
    expect(wrapper.vm.localChecked).toEqual([]);
    expect(inputs.wrappers.every((c) => c.element.matches('input[type=checkbox]'))).toBe(true);
    expect(inputs.at(0).attributes('disabled')).toBeUndefined();
    expect(inputs.at(1).attributes('disabled')).toBeUndefined();
    expect(inputs.at(2).attributes('disabled')).toBeDefined();
  });

  it('emits change event when checkbox clicked', async () => {
    createWrapper({
      attachTo: document.body,
      propsData: {
        options: ['one', 'two', 'three'],
        checked: [],
      },
    });

    expect(wrapper.classes()).toBeDefined();

    const inputs = wrapper.findAll('input');
    expect(inputs).toHaveLength(3);
    expect(wrapper.vm.localChecked).toEqual([]);

    await inputs.at(0).trigger('click');
    expect(wrapper.vm.localChecked).toEqual(['one']);
    expect(wrapper.emitted('change')).toBeDefined();
    expect(wrapper.emitted('change')).toHaveLength(1);
    expect(wrapper.emitted('change')[0][0]).toEqual(['one']);
    expect(wrapper.emitted('input')).toBeDefined();
    expect(wrapper.emitted('input')).toHaveLength(1);
    expect(wrapper.emitted('input')[0][0]).toEqual(['one']);

    await inputs.at(2).trigger('click');
    expect(wrapper.vm.localChecked).toEqual(['one', 'three']);
    expect(wrapper.emitted('change')).toHaveLength(2);
    expect(wrapper.emitted('change')[1][0]).toEqual(['one', 'three']);
    expect(wrapper.emitted('input')).toHaveLength(2);
    expect(wrapper.emitted('input')[1][0]).toEqual(['one', 'three']);

    await inputs.at(0).trigger('click');
    expect(wrapper.vm.localChecked).toEqual(['three']);
    expect(wrapper.emitted('change')).toHaveLength(3);
    expect(wrapper.emitted('change')[2][0]).toEqual(['three']);
    expect(wrapper.emitted('input')).toHaveLength(3);
    expect(wrapper.emitted('input')[2][0]).toEqual(['three']);

    await inputs.at(1).trigger('click');
    expect(wrapper.vm.localChecked).toEqual(['three', 'two']);
    expect(wrapper.emitted('change')).toHaveLength(4);
    expect(wrapper.emitted('change')[3][0]).toEqual(['three', 'two']);
    expect(wrapper.emitted('input')).toHaveLength(4);
    expect(wrapper.emitted('input')[3][0]).toEqual(['three', 'two']);
  });

  it('does not emit "input" event when value loosely changes', async () => {
    const value = ['one', 'two', 'three'];
    createWrapper({
      attachTo: document.body,
      propsData: {
        options: value.slice(),
        checked: value.slice(),
      },
    });

    expect(wrapper.classes()).toBeDefined();

    const inputs = wrapper.findAll('input');
    expect(inputs).toHaveLength(3);
    expect(wrapper.vm.localChecked).toEqual(value);
    expect(inputs.wrappers.every((c) => c.element.matches('input[type=checkbox]'))).toBe(true);
    expect(inputs.at(0).element.checked).toBe(true);
    expect(inputs.at(1).element.checked).toBe(true);
    expect(inputs.at(2).element.checked).toBe(true);

    expect(wrapper.emitted('input')).toBeUndefined();

    // Set internal value to new array reference
    wrapper.vm.localChecked = value.slice();
    await nextTick();

    expect(wrapper.vm.localChecked).toEqual(value);
    expect(inputs.wrappers.every((c) => c.element.matches('input[type=checkbox]'))).toBe(true);
    expect(inputs.at(0).element.checked).toBe(true);
    expect(inputs.at(1).element.checked).toBe(true);
    expect(inputs.at(2).element.checked).toBe(true);

    expect(wrapper.emitted('input')).toBeUndefined();

    // Set internal value to new array (reversed order)
    wrapper.vm.localChecked = value.slice().reverse();
    await nextTick();

    expect(wrapper.vm.localChecked).toEqual(value.slice().reverse());
    expect(inputs.wrappers.every((c) => c.element.matches('input[type=checkbox]'))).toBe(true);
    expect(inputs.at(0).element.checked).toBe(true);
    expect(inputs.at(1).element.checked).toBe(true);
    expect(inputs.at(2).element.checked).toBe(true);
    expect(wrapper.emitted('input')).toBeDefined();
    expect(wrapper.emitted('input')).toHaveLength(1);
    expect(wrapper.emitted('input')[0][0]).toEqual(value.slice().reverse());
  });

  it('checkboxes reflect group checked v-model', async () => {
    createWrapper({
      attachTo: document.body,
      propsData: {
        options: ['one', 'two', 'three'],
        checked: ['two'],
      },
    });

    expect(wrapper.classes()).toBeDefined();

    const inputs = wrapper.findAll('input');
    expect(inputs).toHaveLength(3);
    expect(wrapper.vm.localChecked).toEqual(['two']);
    expect(inputs.wrappers.every((c) => c.element.matches('input[type=checkbox]'))).toBe(true);
    expect(inputs.at(0).element.checked).toBe(false);
    expect(inputs.at(1).element.checked).toBe(true);
    expect(inputs.at(2).element.checked).toBe(false);

    await wrapper.setProps({ checked: ['three', 'one'] });
    expect(wrapper.vm.localChecked).toEqual(['three', 'one']);
    expect(inputs.wrappers.every((c) => c.element.matches('input[type=checkbox]'))).toBe(true);
    expect(inputs.at(0).element.checked).toBe(true);
    expect(inputs.at(1).element.checked).toBe(false);
    expect(inputs.at(2).element.checked).toBe(true);
  });

  it('child checkboxes have is-valid classes when group state set to valid', async () => {
    createWrapper({
      attachTo: document.body,
      propsData: {
        options: ['one', 'two', 'three'],
        checked: [],
        state: true,
      },
    });

    expect(wrapper.classes()).toBeDefined();

    const inputs = wrapper.findAll('input');
    expect(inputs).toHaveLength(3);
    expect(wrapper.vm.localChecked).toEqual([]);
    expect(inputs.wrappers.every((c) => c.element.matches('input[type=checkbox]'))).toBe(true);
    expect(inputs.wrappers.every((c) => c.element.matches('input.is-valid'))).toBe(true);
  });

  it('child checkboxes have is-invalid classes when group state set to invalid', async () => {
    createWrapper({
      attachTo: document.body,
      propsData: {
        options: ['one', 'two', 'three'],
        checked: [],
        state: false,
      },
    });

    const inputs = wrapper.findAll('input');
    expect(inputs).toHaveLength(3);
    expect(wrapper.vm.localChecked).toEqual([]);
    expect(inputs.wrappers.every((c) => c.element.matches('input[type=checkbox]'))).toBe(true);
    expect(inputs.wrappers.every((c) => c.element.matches('input.is-invalid'))).toBe(true);
  });

  it('child checkboxes have disabled attribute when group disabled', async () => {
    createWrapper({
      attachTo: document.body,
      propsData: {
        options: ['one', 'two', 'three'],
        checked: [],
        disabled: true,
      },
    });

    const inputs = wrapper.findAll('input');
    expect(inputs).toHaveLength(3);
    expect(wrapper.vm.localChecked).toEqual([]);
    expect(inputs.wrappers.every((c) => c.element.matches('input[type=checkbox]'))).toBe(true);
    expect(inputs.wrappers.every((c) => c.element.matches('input[disabled]'))).toBe(true);
  });

  it('child checkboxes have required attribute when group required', async () => {
    createWrapper({
      attachTo: document.body,
      propsData: {
        name: 'group',
        options: ['one', 'two', 'three'],
        checked: [],
        required: true,
      },
    });

    await nextTick();

    const inputs = wrapper.findAll('input');
    expect(inputs).toHaveLength(3);
    expect(wrapper.vm.localChecked).toEqual([]);
    expect(inputs.wrappers.every((c) => c.element.matches('input[type=checkbox]'))).toBe(true);
    expect(inputs.wrappers.every((c) => c.element.matches('input[required]'))).toBe(true);
    expect(inputs.wrappers.every((c) => c.element.matches('input[aria-required="true"]'))).toBe(
      true,
    );
  });
});
