import { nextTick } from 'vue';
import { mount } from '@vue/test-utils';
import GlFormRadioGroup from './form_radio_group.vue';

describe('GlFormRadioGroup', () => {
  let wrapper;

  const createWrapper = ({ propsData = {}, attachTo } = {}) => {
    wrapper = mount(GlFormRadioGroup, {
      propsData,
      attachTo,
    });
  };

  const findRadio = (value) => wrapper.find(`input[type="radio"][value="${value}"]`);

  describe('basic', () => {
    let options;
    const firstOption = {
      text: 'One',
      value: 'one',
    };
    const secondOption = {
      text: 'Two',
      value: 'two',
    };

    beforeEach(() => {
      options = [firstOption, secondOption];

      createWrapper({
        propsData: {
          checked: firstOption.value,
          options,
        },
      });
    });

    it('checks the radio button correctly on mount', () => {
      const radio = findRadio(firstOption.value);
      expect(radio.element.checked).toBe(true);
    });

    describe('when the selected value is changed programmatically', () => {
      beforeEach(() => {
        wrapper.vm.localChecked = secondOption.value;
      });

      it('emits an input event, but not a change event', () => {
        expect(wrapper.findComponent(GlFormRadioGroup).emitted()).toEqual({
          input: [[secondOption.value]],
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

      it('emits an input event and a change event', () => {
        expect(wrapper.findComponent(GlFormRadioGroup).emitted()).toEqual({
          input: [[secondOption.value]],
          change: [[secondOption.value]],
        });
      });

      it('updates the bound value', () => {
        expect(wrapper.vm.localChecked).toBe(secondOption.value);
      });

      it('checks the radio', () => {
        expect(radio.element.checked).toBe(true);
      });
    });
  });

  describe('form-radio-group', () => {
    it('default has structure <div></div>', () => {
      createWrapper();
      expect(wrapper.element.tagName).toBe('DIV');
      const { children } = wrapper.element;
      expect(children).toHaveLength(0);
    });

    it('default has only gl-form-radio-group and gl-outline-none classes on wrapper', () => {
      createWrapper();
      expect(wrapper.classes()).toHaveLength(2);
      expect(wrapper.classes()).toMatchObject(['gl-form-radio-group', 'gl-outline-none']);
    });

    it('default has auto ID set', async () => {
      createWrapper({ attachTo: document.body });
      await nextTick();
      // Auto ID not generated until after mount
      expect(wrapper.attributes('id')).toBeDefined();
    });

    it('default has tabindex set to -1', () => {
      createWrapper();
      expect(wrapper.attributes('tabindex')).toBe('-1');
    });

    it('default does not have aria-required set', () => {
      createWrapper();
      expect(wrapper.attributes('aria-required')).toBeUndefined();
    });

    it('default does not have aria-invalid set', () => {
      createWrapper();
      expect(wrapper.attributes('aria-invalid')).toBeUndefined();
    });

    it('default has attribute role=radiogroup', () => {
      createWrapper();
      expect(wrapper.attributes('role')).toBe('radiogroup');
    });

    it('default has user provided ID', () => {
      createWrapper({
        attachTo: document.body,
        propsData: {
          id: 'test',
        },
      });

      expect(wrapper.attributes('id')).toBe('test');
    });

    it('default has attribute aria-invalid=true when state=false', () => {
      createWrapper({
        attachTo: document.body,
        propsData: {
          state: false,
        },
      });
      expect(wrapper.attributes('aria-invalid')).toBe('true');
    });

    it('default does not have attribute aria-invalid when state=true', () => {
      createWrapper({
        attachTo: document.body,
        propsData: {
          state: true,
        },
      });
      expect(wrapper.attributes('aria-invalid')).toBeUndefined();
    });

    it('default does not have attribute aria-invalid when state=null', () => {
      createWrapper({
        attachTo: document.body,
        propsData: {
          state: null,
        },
      });
      expect(wrapper.attributes('aria-invalid')).toBeUndefined();
    });

    it('default has attribute aria-invalid=true when aria-invalid=true', () => {
      createWrapper({
        attachTo: document.body,
        propsData: {
          ariaInvalid: true,
        },
      });
      expect(wrapper.attributes('aria-invalid')).toBe('true');
    });

    it('default has attribute aria-invalid=true when aria-invalid="true"', () => {
      createWrapper({
        attachTo: document.body,
        propsData: {
          ariaInvalid: 'true',
        },
      });
      expect(wrapper.attributes('aria-invalid')).toBe('true');
    });

    it('default has attribute aria-invalid=true when aria-invalid=""', () => {
      createWrapper({
        attachTo: document.body,
        propsData: {
          ariaInvalid: '',
        },
      });
      expect(wrapper.attributes('aria-invalid')).toBe('true');
    });

    it('has radios with input validation class "is-valid" when `state` is `true`', () => {
      createWrapper({
        attachTo: document.body,
        propsData: {
          options: ['one', 'two', 'three'],
          checked: '',
          state: true,
        },
      });

      const radios = wrapper.findAll('input[type=radio]');
      expect(radios).toHaveLength(3);
      expect(radios.wrappers.every((c) => c.classes().includes('is-valid'))).toBe(true);
      expect(radios.wrappers.every((c) => c.classes().includes('is-invalid'))).toBe(false);
    });

    it('has radios with input validation class "is-invalid" when `state` is `false`', () => {
      createWrapper({
        attachTo: document.body,
        propsData: {
          options: ['one', 'two', 'three'],
          checked: '',
          state: false,
        },
      });

      const radios = wrapper.findAll('input[type=radio]');
      expect(radios).toHaveLength(3);
      expect(radios.wrappers.every((c) => c.classes().includes('is-valid'))).toBe(false);
      expect(radios.wrappers.every((c) => c.classes().includes('is-invalid'))).toBe(true);
    });

    it('has radios with no input validation class when `state` is `null`', () => {
      createWrapper({
        attachTo: document.body,
        propsData: {
          options: ['one', 'two', 'three'],
          checked: '',
          state: null,
        },
      });

      const radios = wrapper.findAll('input[type=radio]');
      expect(radios).toHaveLength(3);
      expect(radios.wrappers.every((c) => c.classes().includes('is-valid'))).toBe(false);
      expect(radios.wrappers.every((c) => c.classes().includes('is-invalid'))).toBe(false);
    });

    // --- Functionality testing ---

    it('has radios via options array', () => {
      createWrapper({
        attachTo: document.body,
        propsData: {
          options: ['one', 'two', 'three'],
          checked: '',
        },
      });

      expect(wrapper.vm.localChecked).toEqual('');

      const radios = wrapper.findAll('input');
      expect(radios).toHaveLength(3);
      expect(radios.wrappers.every((c) => c.element.matches('input[type=radio]'))).toBe(true);
    });

    it('has radios via options array which respect disabled', () => {
      createWrapper({
        attachTo: document.body,
        propsData: {
          options: [{ text: 'one' }, { text: 'two' }, { text: 'three', disabled: true }],
          checked: '',
        },
      });

      expect(wrapper.classes()).toBeDefined();
      const radios = wrapper.findAll('input');
      expect(radios).toHaveLength(3);
      expect(wrapper.vm.localChecked).toEqual('');
      expect(radios.wrappers.every((c) => c.element.matches('input[type=radio]'))).toBe(true);
      expect(radios.at(0).attributes('disabled')).toBeUndefined();
      expect(radios.at(1).attributes('disabled')).toBeUndefined();
      expect(radios.at(2).attributes('disabled')).toBeDefined();
    });

    it('has radios with attribute required when prop required set', async () => {
      createWrapper({
        attachTo: document.body,
        propsData: {
          options: ['one', 'two', 'three'],
          checked: '',
          required: true,
        },
      });

      // We need `$nextTick()` here since auto generated name is
      // computed in a `$nextTick()` on mount
      await nextTick();

      expect(wrapper.classes()).toBeDefined();
      const radios = wrapper.findAll('input');
      expect(radios).toHaveLength(3);
      expect(wrapper.vm.localChecked).toEqual('');
      expect(radios.wrappers.every((c) => c.find('input[type=radio]'))).toBe(true);
      expect(radios.wrappers.every((c) => c.find('input[required]'))).toBe(true);
      expect(radios.wrappers.every((c) => c.find('input[aria-required="true"]'))).toBe(true);
    });

    it('emits change event when radio clicked', async () => {
      createWrapper({
        attachTo: document.body,
        propsData: {
          options: ['one', 'two', 'three'],
          checked: '',
        },
      });

      expect(wrapper.classes()).toBeDefined();
      const radios = wrapper.findAll('input');
      expect(radios).toHaveLength(3);
      expect(wrapper.vm.localChecked).toEqual('');

      await radios.at(0).trigger('click');
      expect(wrapper.vm.localChecked).toEqual('one');
      expect(wrapper.emitted('change')).toHaveLength(1);
      expect(wrapper.emitted('change')[0][0]).toEqual('one');
      expect(wrapper.emitted('input')).toHaveLength(1);
      expect(wrapper.emitted('input')[0][0]).toEqual('one');

      await radios.at(2).trigger('click');
      expect(wrapper.vm.localChecked).toEqual('three');
      expect(wrapper.emitted('change')).toHaveLength(2);
      expect(wrapper.emitted('change')[1][0]).toEqual('three');
      expect(wrapper.emitted('input')).toHaveLength(2);
      expect(wrapper.emitted('input')[1][0]).toEqual('three');

      await radios.at(0).trigger('click');
      expect(wrapper.vm.localChecked).toEqual('one');
      expect(wrapper.emitted('change')).toHaveLength(3);
      expect(wrapper.emitted('change')[2][0]).toEqual('one');
      expect(wrapper.emitted('input')).toHaveLength(3);
      expect(wrapper.emitted('input')[2][0]).toEqual('one');
    });

    it('radios reflect group checked v-model', async () => {
      createWrapper({
        attachTo: document.body,
        propsData: {
          options: ['one', 'two', 'three'],
          checked: 'two',
        },
      });

      expect(wrapper.classes()).toBeDefined();
      const radios = wrapper.findAll('input');
      expect(radios).toHaveLength(3);
      expect(wrapper.vm.localChecked).toEqual('two');
      expect(radios.wrappers.every((w) => w.attributes('type') === 'radio')).toBe(true);
      expect(radios.at(0).element.checked).toBe(false);
      expect(radios.at(1).element.checked).toBe(true);
      expect(radios.at(2).element.checked).toBe(false);

      await wrapper.setProps({ checked: 'three' });
      await nextTick();

      expect(wrapper.vm.localChecked).toEqual('three');
      expect(radios.wrappers.every((w) => w.attributes('type') === 'radio')).toBe(true);
      expect(radios.at(0).element.checked).toBe(false);
      expect(radios.at(1).element.checked).toBe(false);
      expect(radios.at(2).element.checked).toBe(true);
    });
  });
});
