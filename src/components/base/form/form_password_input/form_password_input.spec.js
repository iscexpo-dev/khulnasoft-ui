import { mount, shallowMount } from '@vue/test-utils';
import GlButton from '../../button/button.vue';
import GlFormInput from '../form_input/form_input.vue';
import GlFormPasswordInput from './form_password_input.vue';

describe('GlFormPasswordInput', () => {
  let wrapper;

  const createComponent = ({ propsData = {}, mountFn = shallowMount, ...options } = {}) => {
    wrapper = mountFn(GlFormPasswordInput, {
      propsData,
      ...options,
    });
  };

  const findInput = () => wrapper.findComponent(GlFormInput);
  const findToggleButton = () => wrapper.findComponent(GlButton);

  describe('masking', () => {
    it('masks the value by default and renders a toggle', () => {
      createComponent();

      expect(findInput().props('type')).toBe('password');
      expect(findToggleButton().props('icon')).toBe('eye');
      expect(findToggleButton().attributes('aria-label')).toBe('Reveal password');
    });

    it('reveals the value when initialVisibility is true', () => {
      createComponent({ propsData: { initialVisibility: true } });

      expect(findInput().props('type')).toBe('text');
      expect(findToggleButton().props('icon')).toBe('eye-slash');
      expect(findToggleButton().attributes('aria-label')).toBe('Hide password');
    });

    it('toggles visibility and emits visibility-change when the button is clicked', async () => {
      createComponent();

      await findToggleButton().vm.$emit('click');

      expect(findInput().props('type')).toBe('text');
      expect(findToggleButton().props('icon')).toBe('eye-slash');
      expect(findToggleButton().attributes('aria-label')).toBe('Hide password');
      expect(wrapper.emitted('visibility-change')).toStrictEqual([[true]]);

      await findToggleButton().vm.$emit('click');

      expect(findInput().props('type')).toBe('password');
      expect(findToggleButton().attributes('aria-label')).toBe('Reveal password');
      expect(wrapper.emitted('visibility-change')).toStrictEqual([[true], [false]]);
    });
  });

  describe('labels', () => {
    it('uses the provided reveal and hide labels', async () => {
      createComponent({ propsData: { revealLabel: 'Reveal token', hideLabel: 'Hide token' } });

      expect(findToggleButton().attributes('aria-label')).toBe('Reveal token');

      await findToggleButton().vm.$emit('click');

      expect(findToggleButton().attributes('aria-label')).toBe('Hide token');
    });
  });

  describe('disabled', () => {
    it('disables both the input and the toggle', () => {
      createComponent({ propsData: { disabled: true } });

      expect(findInput().props('disabled')).toBe(true);
      expect(findToggleButton().props('disabled')).toBe(true);
    });

    it('disables the toggle natively, so it leaves the tab order with the input', () => {
      createComponent({ propsData: { disabled: true }, mountFn: mount });

      expect(wrapper.find('button').attributes('disabled')).toBeDefined();
      expect(wrapper.find('button').attributes('aria-disabled')).toBeUndefined();
    });

    it('does not announce the input as disabled via ARIA, which the native attribute already does', () => {
      createComponent({ propsData: { disabled: true }, mountFn: mount });

      expect(wrapper.find('input').attributes('aria-disabled')).toBeUndefined();
    });
  });

  describe('readonly', () => {
    // `readonly` is deliberately not a prop: it reaches the input through
    // `$attrs` and leaves the toggle alone, because revealing a value is a
    // read rather than an edit.
    it('makes the input read-only without disabling the toggle', () => {
      createComponent({ attrs: { readonly: true }, mountFn: mount });

      expect(wrapper.find('input').element.readOnly).toBe(true);
      expect(wrapper.find('button').attributes('disabled')).toBeUndefined();
    });

    it('does not announce the input as disabled', () => {
      createComponent({ attrs: { readonly: true }, mountFn: mount });

      expect(wrapper.find('input').attributes('aria-disabled')).toBeUndefined();
    });

    it('still reveals the value when the toggle is clicked', async () => {
      createComponent({ attrs: { readonly: true } });

      await findToggleButton().vm.$emit('click');

      expect(findInput().props('type')).toBe('text');
      expect(wrapper.emitted('visibility-change')).toStrictEqual([[true]]);
    });
  });

  describe('forwarding to the inner input', () => {
    it('binds the value to the input', () => {
      createComponent({ propsData: { value: 'hunter2' } });

      expect(findInput().props('value')).toBe('hunter2');
    });

    it('forwards attributes to the input', () => {
      createComponent({ attrs: { id: 'password', name: 'user[password]' } });

      expect(findInput().attributes('id')).toBe('password');
      expect(findInput().attributes('name')).toBe('user[password]');
    });

    it('keeps control of the input type when a consumer passes one', () => {
      createComponent({ attrs: { type: 'text' }, mountFn: mount });

      expect(wrapper.find('input').attributes('type')).toBe('password');
    });

    it('forwards listeners to the input so v-model passes through', () => {
      const input = jest.fn();
      createComponent({ listeners: { input } });

      findInput().vm.$emit('input', 'new value');

      expect(input).toHaveBeenCalledWith('new value');
    });

    it('applies inputClass to the input, not the wrapper', () => {
      createComponent({ propsData: { inputClass: 'js-hook' }, mountFn: mount });

      expect(wrapper.find('input').classes()).toContain('js-hook');
      expect(wrapper.find('.gl-form-password-input').classes()).not.toContain('js-hook');
    });
  });
});
