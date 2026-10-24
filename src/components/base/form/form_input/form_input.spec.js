import { nextTick } from 'vue';
import { mount, shallowMount } from '@vue/test-utils';
import { formInputWidths } from '../../../../utils/constants';
import { waitForAnimationFrame } from '../../../../utils/test_utils';
import GlFormInput from './form_input.vue';

const modelEvent = GlFormInput.model.event;
const newValue = 'foo';

describe('GlFormInput', () => {
  let wrapper;

  const createComponent = ({ propsData = {}, mountFn = shallowMount, attrs = {} } = {}) => {
    wrapper = mountFn(GlFormInput, {
      propsData,
      attrs,
    });
  };

  describe('width prop', () => {
    describe('when number is passed', () => {
      // Exclude the default null value
      const widths = Object.values(formInputWidths).filter(Boolean);

      it.each(widths)('adds correct class for width %s', (width) => {
        createComponent({ propsData: { width } });

        expect(wrapper.classes()).toEqual([
          'gl-form-input',
          `gl-form-input-${width}`,
          'form-control',
        ]);
      });

      it('does not add a width class if not given the width prop', () => {
        createComponent();

        expect(wrapper.classes()).toEqual(['gl-form-input', 'form-control']);
      });

      it('does not add a width class if passed null', () => {
        createComponent({ propsData: { width: null } });

        expect(wrapper.classes()).toEqual(['gl-form-input', 'form-control']);
      });
    });

    describe('when object is passed', () => {
      describe('when `default` key is provided', () => {
        it('adds responsive CSS classes and base class', () => {
          createComponent({ propsData: { width: { default: 'md', md: 'lg', lg: 'xl' } } });

          expect(wrapper.classes()).toEqual([
            'gl-form-input',
            'gl-form-input-md',
            'gl-md-form-input-lg',
            'gl-lg-form-input-xl',
            'form-control',
          ]);
        });
      });

      describe('when `default` key is not provided', () => {
        it('adds responsive CSS classes', () => {
          createComponent({ propsData: { width: { md: 'lg', lg: 'xl' } } });

          expect(wrapper.classes()).toEqual([
            'gl-form-input',
            'gl-md-form-input-lg',
            'gl-lg-form-input-xl',
            'form-control',
          ]);
        });
      });
    });
  });

  describe('v-model', () => {
    beforeEach(() => {
      createComponent({ mountFn: mount });

      wrapper.setValue(newValue);
    });

    it('synchronously emits an update event', () => {
      expect(wrapper.emitted('update')).toEqual([[newValue]]);
    });

    it('synchronously updates model', () => {
      expect(wrapper.emitted(modelEvent)).toEqual([[newValue]]);
    });
  });

  describe('debounce', () => {
    describe.each([10, 100, 1000])('given a debounce of %dms', (debounce) => {
      beforeEach(() => {
        jest.useFakeTimers();

        createComponent({ propsData: { debounce }, mountFn: mount });

        wrapper.setValue(newValue);
      });

      it('synchronously emits an update event', () => {
        expect(wrapper.emitted('update')).toEqual([[newValue]]);
      });

      it('emits a model event after the debounce delay', () => {
        // Just before debounce completes
        jest.advanceTimersByTime(debounce - 1);
        expect(wrapper.emitted(modelEvent)).toBe(undefined);

        // Exactly when debounce completes
        jest.advanceTimersByTime(1);
        expect(wrapper.emitted(modelEvent)).toEqual([[newValue]]);
      });
    });
  });

  describe('lazy', () => {
    beforeEach(() => {
      createComponent({ propsData: { lazy: true }, mountFn: mount });

      wrapper.setValue(newValue);
    });

    it('synchronously emits an update event', () => {
      expect(wrapper.emitted('update')).toEqual([[newValue]]);
    });

    it.each(['change', 'blur'])('updates model after %s event', (event) => {
      expect(wrapper.emitted(modelEvent)).toBe(undefined);

      wrapper.trigger(event);

      expect(wrapper.emitted(modelEvent)).toEqual([[newValue]]);
    });
  });
});

describe('form-input', () => {
  it('has class form-control', () => {
    const wrapper = mount(GlFormInput);

    const input = wrapper.find('input');
    expect(input.classes()).toContain('form-control');
  });

  it('does not have class form-control-plaintext when plaintext not set', () => {
    const wrapper = mount(GlFormInput);

    const input = wrapper.find('input');
    expect(input.classes()).not.toContain('form-control-plaintext');
    expect(input.attributes('readonly')).toBeUndefined();
  });

  it('has class form-control-plaintext when plaintext=true', () => {
    const wrapper = mount(GlFormInput, {
      propsData: {
        plaintext: true,
      },
    });

    const input = wrapper.find('input');
    expect(input.classes()).toContain('form-control-plaintext');
  });

  it('has attribute read-only when plaintext=true', () => {
    const wrapper = mount(GlFormInput, {
      propsData: {
        plaintext: true,
      },
    });

    const input = wrapper.find('input');
    expect(input.classes()).toContain('form-control-plaintext');
    expect(input.attributes('readonly')).toBeDefined();
  });

  it('has class custom-range instead of form-control when type=range', () => {
    const wrapper = mount(GlFormInput, {
      propsData: {
        type: 'range',
      },
    });

    const input = wrapper.find('input');
    expect(input.classes()).toContain('custom-range');
    expect(input.classes()).not.toContain('form-control');
  });

  it('does not have class form-control-plaintext when type=range and plaintext=true', () => {
    const wrapper = mount(GlFormInput, {
      propsData: {
        type: 'range',
        plaintext: true,
      },
    });

    const input = wrapper.find('input');
    expect(input.classes()).toContain('custom-range');
    expect(input.classes()).not.toContain('form-control');
    expect(input.classes()).not.toContain('form-control-plaintext');
  });

  it('does not have class form-control-plaintext when type=color and plaintext=true', () => {
    const wrapper = mount(GlFormInput, {
      propsData: {
        type: 'color',
        plaintext: true,
      },
    });

    const input = wrapper.find('input');
    expect(input.classes()).not.toContain('custom-range');
    expect(input.classes()).not.toContain('form-control-plaintext');
    expect(input.classes()).toContain('form-control');
  });

  it('has user supplied id', () => {
    const wrapper = mount(GlFormInput, {
      propsData: {
        id: 'foobar',
      },
    });

    const input = wrapper.find('input');
    expect(input.attributes('id')).toBe('foobar');
  });

  it('has localId after mount when no id provided', async () => {
    const wrapper = mount(GlFormInput, {
      attachTo: document.body,
    });

    // We need to wait a tick for `localId` to be generated
    await nextTick();
    await nextTick(); // Extra tick needed for Vue 3

    const input = wrapper.find('input');
    expect(input.attributes('id')).toBe('gl-form-input-1');
  });

  it('has form attribute when form prop set', () => {
    const wrapper = mount(GlFormInput, {
      propsData: {
        form: 'foobar',
      },
    });

    const input = wrapper.find('input');
    expect(input.attributes('form')).toBe('foobar');
  });

  it('does not have list attribute when list prop not set', () => {
    const wrapper = mount(GlFormInput);

    const input = wrapper.find('input');
    expect(input.attributes('list')).toBeUndefined();
  });

  it('has list attribute when list prop set', () => {
    const wrapper = mount(GlFormInput, {
      propsData: {
        list: 'foobar',
      },
    });

    const input = wrapper.find('input');
    expect(input.attributes('list')).toBe('foobar');
  });

  it('does not have list attribute when list prop set and type=password', () => {
    const wrapper = mount(GlFormInput, {
      propsData: {
        list: 'foobar',
        type: 'password',
      },
    });

    const input = wrapper.find('input');
    expect(input.attributes('list')).toBeUndefined();
  });

  it('renders text input by default', () => {
    const wrapper = mount(GlFormInput);

    const input = wrapper.find('input');
    expect(input.attributes('type')).toBe('text');
  });

  it('renders number input when type set to number', () => {
    const wrapper = mount(GlFormInput, {
      propsData: {
        type: 'number',
      },
    });

    const input = wrapper.find('input');
    expect(input.attributes('type')).toBe('number');
  });

  it('renders text input when type not supported', () => {
    const wrapper = mount(GlFormInput, {
      propsData: {
        type: 'foobar',
      },
    });

    const input = wrapper.find('input');
    expect(input.attributes('type')).toBe('text');

    expect(wrapper).toHaveLoggedVueWarnings();
  });

  it('does not have is-valid or is-invalid classes when state is default', () => {
    const wrapper = mount(GlFormInput);

    const input = wrapper.find('input');
    expect(input.classes()).not.toContain('is-valid');
    expect(input.classes()).not.toContain('is-invalid');
  });

  it('has class is-valid when state=true', () => {
    const wrapper = mount(GlFormInput, {
      propsData: {
        state: true,
      },
    });

    const input = wrapper.find('input');
    expect(input.classes()).toContain('is-valid');
    expect(input.classes()).not.toContain('is-invalid');
  });

  it('has class is-invalid when state=false', () => {
    const wrapper = mount(GlFormInput, {
      propsData: {
        state: false,
      },
    });

    const input = wrapper.find('input');
    expect(input.classes()).toContain('is-invalid');
    expect(input.classes()).not.toContain('is-valid');
  });

  it('does not have aria-invalid attribute by default', () => {
    const wrapper = mount(GlFormInput);

    expect(wrapper.attributes('aria-invalid')).toBeUndefined();
  });

  it('does not have aria-invalid attribute when state is true', () => {
    const wrapper = mount(GlFormInput, {
      propsData: {
        state: true,
      },
    });

    expect(wrapper.attributes('aria-invalid')).toBeUndefined();
  });

  it('has aria-invalid attribute when state=false', () => {
    const wrapper = mount(GlFormInput, {
      propsData: {
        state: false,
      },
    });

    const input = wrapper.find('input');
    expect(input.attributes('aria-invalid')).toBe('true');
  });

  it('has aria-invalid attribute when aria-invalid="true"', () => {
    const wrapper = mount(GlFormInput, {
      propsData: {
        ariaInvalid: 'true',
      },
    });

    const input = wrapper.find('input');
    expect(input.attributes('aria-invalid')).toBe('true');
  });

  it('has aria-invalid attribute when aria-invalid=true', () => {
    const wrapper = mount(GlFormInput, {
      propsData: {
        ariaInvalid: true,
      },
    });

    const input = wrapper.find('input');
    expect(input.attributes('aria-invalid')).toBe('true');
  });

  it('has aria-invalid attribute when aria-invalid="spelling"', () => {
    const wrapper = mount(GlFormInput, {
      propsData: {
        ariaInvalid: 'spelling',
      },
    });

    const input = wrapper.find('input');
    expect(input.attributes('aria-invalid')).toBe('spelling');
  });

  it('is disabled when disabled=true', () => {
    const wrapper = mount(GlFormInput, {
      propsData: {
        disabled: true,
      },
    });

    const input = wrapper.find('input');
    expect(Boolean(input.attributes('disabled'))).toBe(true);
    expect(input.element.disabled).toBe(true);
  });

  it('is not disabled when disabled=false', () => {
    const wrapper = mount(GlFormInput, {
      propsData: {
        disabled: false,
      },
    });

    const input = wrapper.find('input');
    expect(Boolean(input.attributes('disabled'))).toBe(false);
    expect(input.element.disabled).toBe(false);
  });

  it('emits an input event', async () => {
    const wrapper = mount(GlFormInput);

    const input = wrapper.find('input');
    await input.setValue('test');

    expect(wrapper.emitted('input')).toEqual([['test']]);
  });

  it('emits a native focus event', async () => {
    const spy = jest.fn();
    const wrapper = mount(GlFormInput, {
      attachTo: document.body,
      listeners: {
        focus: spy,
      },
    });

    const input = wrapper.find('input');

    await input.trigger('focus');
    expect(wrapper.emitted()).toMatchObject({});
    expect(spy).toHaveBeenCalled();
  });

  it('emits a blur event with native event as only arg', async () => {
    const wrapper = mount(GlFormInput, {
      propsData: {
        value: 'TEST',
      },
    });

    const input = wrapper.find('input');
    await input.trigger('blur');

    expect(wrapper.emitted('blur')).toBeDefined();
    expect(wrapper.emitted('blur')[0]).toHaveLength(1);
    expect(wrapper.emitted('blur')[0][0] instanceof Event).toBe(true);
    expect(wrapper.emitted('blur')[0][0].type).toEqual('blur');
  });

  it('applies formatter on input when not lazy', async () => {
    const wrapper = mount(GlFormInput, {
      propsData: {
        formatter(value) {
          return value.toLowerCase();
        },
      },
      attachTo: document.body,
    });

    const input = wrapper.find('input');
    await input.setValue('TEST');

    expect(wrapper.emitted('update')).toEqual([['test']]);
    expect(wrapper.emitted('input')).toEqual([['test']]);
  });

  it('does not apply formatter on input when lazy', async () => {
    const wrapper = mount(GlFormInput, {
      propsData: {
        formatter(value) {
          return value.toLowerCase();
        },
        lazyFormatter: true,
      },
      attachTo: document.body,
    });

    const input = wrapper.findComponent('input');
    await input.setValue('TEST');

    expect(wrapper.emitted('update')).toEqual([['TEST']]);
    expect(wrapper.emitted('input')).toEqual([['TEST']]);
    expect(wrapper.emitted('change')).toBeUndefined();
    expect(input.element.value).toEqual('TEST');
  });

  it('applies formatter on blur when lazy', async () => {
    const wrapper = mount(GlFormInput, {
      propsData: {
        value: '',
        formatter(value) {
          return value.toLowerCase();
        },
        lazyFormatter: true,
      },
      attachTo: document.body,
    });

    const input = wrapper.findComponent('input');

    // Input event needed to set initial value
    await input.setValue('TEST');

    expect(input.element.value).toEqual('TEST');
    expect(wrapper.emitted('input')).toEqual([['TEST']]);

    await input.trigger('blur');

    expect(wrapper.emitted('input')).toEqual([['TEST'], ['test']]);
    expect(wrapper.emitted('update')).toBeDefined();
    expect(wrapper.emitted('change')).toBeUndefined();
    expect(wrapper.emitted('blur')).toBeDefined();
    expect(wrapper.emitted('blur')).toHaveLength(1);
    expect(input.element.value).toEqual('test');
  });

  it('does not apply formatter when value supplied on mount and not lazy', async () => {
    const wrapper = mount(GlFormInput, {
      propsData: {
        value: 'TEST',
        formatter(value) {
          return String(value).toLowerCase();
        },
      },
      attachTo: document.body,
    });

    const input = wrapper.findComponent('input');
    expect(input.element.value).toEqual('TEST');
    expect(wrapper.emitted('update')).toBeUndefined();
    expect(wrapper.emitted('input')).toBeUndefined();
    expect(wrapper.emitted('change')).toBeUndefined();
    expect(wrapper.emitted('blur')).toBeUndefined();
  });

  it('does not apply formatter when value prop updated and not lazy', async () => {
    const wrapper = mount(GlFormInput, {
      propsData: {
        value: '',
        formatter(value) {
          return value.toLowerCase();
        },
      },
      attachTo: document.body,
    });

    const input = wrapper.find('input');
    await wrapper.setProps({ value: 'TEST' });

    expect(input.element.value).toEqual('TEST');
    expect(wrapper.emitted('update')).toBeUndefined(); // Note emitted as value hasn't changed
    expect(wrapper.emitted('input')).toBeUndefined();
    expect(wrapper.emitted('change')).toBeUndefined();
    expect(wrapper.emitted('blur')).toBeUndefined();
  });

  it('does not apply formatter when value prop updated and lazy', async () => {
    const wrapper = mount(GlFormInput, {
      propsData: {
        value: '',
        formatter(value) {
          return value.toLowerCase();
        },
        lazyFormatter: true,
      },
      attachTo: document.body,
    });

    const input = wrapper.find('input');
    await wrapper.setProps({ value: 'TEST' });

    expect(input.element.value).toEqual('TEST');
    expect(wrapper.emitted('update')).toBeUndefined(); // Not emitted when value doesnt change
    expect(wrapper.emitted('input')).toBeUndefined();
    expect(wrapper.emitted('change')).toBeUndefined();
    expect(wrapper.emitted('blur')).toBeUndefined();
  });

  it('does not update value when non-lazy formatter returns false', async () => {
    const wrapper = mount(GlFormInput, {
      propsData: {
        value: 'abc',
        formatter() {
          return false;
        },
      },
      attachTo: document.body,
    });

    const input = wrapper.find('input');
    expect(input.exists()).toBe(true);

    // Wait for the mounted hook's deferred work to settle
    await nextTick();

    await input.trigger('focus');
    await input.setValue('TEST');

    expect(wrapper.emitted('input')).toBeUndefined();
    expect(wrapper.emitted('update')).toBeUndefined();
    // Value in input should remain the same as entered
    expect(input.element.value).toEqual('TEST');
  });

  it('focused number input calls blur event when wheel is fired', async () => {
    const spy = jest.fn();
    const wrapper = mount(GlFormInput, {
      propsData: {
        type: 'number',
        value: '123',
      },
      listeners: {
        blur: spy,
      },
      attachTo: document.body,
    });

    expect(wrapper.element.type).toBe('number');

    wrapper.element.focus();
    await wrapper.trigger('focus');
    await wrapper.trigger('wheel', { deltaY: 33.33, deltaX: 0, deltaZ: 0, deltaMode: 0 });

    // will fire a blur event on the input when wheel fired
    expect(spy).toHaveBeenCalled();
  });

  it('changing type handles wheel event', async () => {
    const spy = jest.fn(() => {});
    const wrapper = mount(GlFormInput, {
      attachTo: document.body,
      propsData: {
        type: 'text',
        value: '123',
      },
      listeners: {
        blur: spy,
      },
    });

    expect(wrapper.element.type).toBe('text');
    expect(document.activeElement).not.toBe(wrapper.element);

    wrapper.element.focus();
    await wrapper.trigger('focus');
    expect(document.activeElement).toBe(wrapper.element);
    await wrapper.trigger('wheel', { deltaY: 33.33, deltaX: 0, deltaZ: 0, deltaMode: 0 });

    // will not fire a blur event on the input when wheel fired
    expect(spy).not.toHaveBeenCalled();

    await wrapper.setProps({ type: 'number' });
    expect(wrapper.element.type).toBe('number');

    wrapper.element.focus();
    await wrapper.trigger('focus');
    expect(document.activeElement).toBe(wrapper.element);

    // will fire a blur event on the input when wheel fired
    wrapper.element.blur();
    await wrapper.trigger('wheel', { deltaY: 33.33, deltaX: 0, deltaZ: 0, deltaMode: 0 });
    expect(document.activeElement).not.toBe(wrapper.element);
    expect(spy).toHaveBeenCalled();
  });

  it('"number" modifier prop works', async () => {
    const wrapper = mount(GlFormInput, {
      propsData: {
        type: 'text',
        number: true,
      },
    });

    const input = wrapper.find('input');
    await input.setValue('123.450');

    expect(input.element.value).toBe('123.450');
    // `v-model` input event (should emit a numerical value)
    expect(wrapper.emitted('input')).toBeDefined();
    expect(wrapper.emitted('input')).toHaveLength(1);
    expect(wrapper.emitted('input')[0]).toHaveLength(1);
    expect(wrapper.emitted('input')[0][0]).toBeCloseTo(123.45);
    // Pre converted value as string (raw input value)
    expect(wrapper.emitted('update')).toMatchObject([['123.450']]);

    // Update the input to be different string-wise, but same numerically
    await input.setValue('123.4500');

    expect(input.element.value).toBe('123.4500');
    // Should emit a new input event
    expect(wrapper.emitted('update')).toHaveLength(2);
    expect(wrapper.emitted('update')[1][0]).toEqual('123.4500');
    // `v-model` value stays the same and update event shouldn't be emitted again
    expect(wrapper.emitted('input')).toHaveLength(1);
    expect(wrapper.emitted('input')[0][0]).toBeCloseTo(123.45);

    // Updating the `v-model` to new numeric value
    await wrapper.setProps({ value: 45.6 });
    expect(input.element.value).toBe('45.6');
  });

  it('"lazy" modifier prop works', async () => {
    const wrapper = mount(GlFormInput, {
      propsData: {
        type: 'text',
        lazy: true,
      },
    });

    const input = wrapper.find('input');
    await input.setValue('a');
    expect(input.element.value).toBe('a');
    // `v-model` input event should not have emitted
    expect(wrapper.emitted('input')).toBeUndefined();

    await input.setValue('ab');
    expect(input.element.value).toBe('ab');
    // `v-model` input event should not have emitted
    expect(wrapper.emitted('input')).toBeUndefined();

    // trigger a change event
    await input.trigger('change');
    expect(input.element.value).toBe('ab');
    // `v-model` input event should have emitted
    expect(wrapper.emitted('input')).toMatchObject([['ab']]);

    await input.setValue('abc');
    expect(input.element.value).toBe('abc');
    // `v-model` input event should not have emitted new event
    expect(wrapper.emitted('input')).toHaveLength(1);

    await input.setValue('abcd');
    expect(input.element.value).toBe('abcd');
    // `v-model` input event should not have emitted new event
    expect(wrapper.emitted('input')).toHaveLength(1);

    // Trigger a blur event
    await input.trigger('blur');
    expect(input.element.value).toBe('abcd');
    // `v-model` input event should have emitted
    expect(wrapper.emitted('input')).toHaveLength(2);
    expect(wrapper.emitted('input')[1][0]).toBe('abcd');
  });

  it('"debounce" prop works', async () => {
    jest.useFakeTimers();
    const wrapper = mount(GlFormInput, {
      propsData: {
        type: 'text',
        value: '',
        debounce: 100,
      },
    });

    const input = wrapper.find('input');
    await input.setValue('a');
    expect(input.element.value).toBe('a');
    // `v-model` input event should not have emitted
    expect(wrapper.emitted('input')).toBeUndefined();
    // `update` event should be emitted
    expect(wrapper.emitted('update')).toMatchObject([['a']]);

    await input.setValue('ab');
    expect(input.element.value).toBe('ab');
    // `v-model` input event should not have emitted
    expect(wrapper.emitted('input')).toBeUndefined();
    // `update` event should be emitted
    expect(wrapper.emitted('update')).toHaveLength(2);
    expect(wrapper.emitted('update')[1][0]).toBe('ab');

    // Advance timer
    jest.runOnlyPendingTimers();
    // Should update the v-model
    expect(input.element.value).toBe('ab');
    // `v-model` input event should have emitted
    expect(wrapper.emitted('input')).toMatchObject([['ab']]);
    // `update` event should not have emitted new event
    expect(wrapper.emitted('update')).toHaveLength(2);

    // Update input
    await input.setValue('abc');
    expect(input.element.value).toBe('abc');
    // `v-model` input event should not have emitted new event
    expect(wrapper.emitted('input')).toHaveLength(1);
    // `update` event should be emitted
    expect(wrapper.emitted('update')).toHaveLength(3);
    expect(wrapper.emitted('update')[2][0]).toBe('abc');

    // Update input
    await input.setValue('abcd');
    expect(input.element.value).toBe('abcd');
    // `v-model` input event should not have emitted new event
    expect(wrapper.emitted('input')).toHaveLength(1);
    // `update` event should be emitted
    expect(wrapper.emitted('update')).toHaveLength(4);
    expect(wrapper.emitted('update')[3][0]).toBe('abcd');

    // Trigger a `change` event
    await input.trigger('change');
    expect(input.element.value).toBe('abcd');
    // `v-model` input event should have emitted (change overrides debounce)
    expect(wrapper.emitted('input')).toHaveLength(2);
    expect(wrapper.emitted('input')[1][0]).toBe('abcd');
    // `update` event should not have emitted new event
    expect(wrapper.emitted('update')).toHaveLength(4);

    await input.setValue('abc');
    expect(input.element.value).toBe('abc');
    // `v-model` input event should not have emitted new event
    expect(wrapper.emitted('input')).toHaveLength(2);
    // `update` event should be emitted
    expect(wrapper.emitted('update')).toHaveLength(5);
    expect(wrapper.emitted('update')[4][0]).toBe('abc');

    await input.setValue('abcd');
    expect(input.element.value).toBe('abcd');
    // `v-model` input event should not have emitted new event
    expect(wrapper.emitted('input')).toHaveLength(2);
    // `update` event should be emitted
    expect(wrapper.emitted('update')).toHaveLength(6);
    expect(wrapper.emitted('update')[5][0]).toBe('abcd');

    // Advance timer
    jest.runOnlyPendingTimers();
    // Should update the v-model
    expect(input.element.value).toBe('abcd');
    // `v-model` input event should not have emitted new event
    expect(wrapper.emitted('input')).toHaveLength(2);
    // `update` event should not have emitted new event
    expect(wrapper.emitted('update')).toHaveLength(6);
  });

  it('focus() and blur() methods work', () => {
    const wrapper = mount(GlFormInput, {
      attachTo: document.body,
    });

    const input = wrapper.find('input');

    expect(typeof wrapper.vm.focus).toBe('function');
    expect(typeof wrapper.vm.blur).toBe('function');

    expect(document.activeElement).not.toBe(input.element);
    wrapper.vm.focus();
    expect(document.activeElement).toBe(input.element);
    wrapper.vm.blur();
    expect(document.activeElement).not.toBe(input.element);
  });

  // These tests are wrapped in a new describe to limit the scope of the getBCR Mock
  describe('prop `autofocus`', () => {
    const origGetBCR = Element.prototype.getBoundingClientRect;

    beforeEach(() => {
      // @khulnasoft-ui: In order to get these tests passing we needed to use real timers
      jest.useRealTimers();
      // Mock `getBoundingClientRect()` so that the `isVisible(el)` test returns `true`
      Element.prototype.getBoundingClientRect = jest.fn(() => ({
        width: 24,
        height: 24,
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
      }));
    });

    afterEach(() => {
      // Restore prototype
      Element.prototype.getBoundingClientRect = origGetBCR;
      jest.useFakeTimers();
    });

    it('works when true', async () => {
      const wrapper = mount(GlFormInput, {
        attachTo: document.body,
        propsData: {
          autofocus: true,
        },
      });

      expect(wrapper.vm).toBeDefined();
      await nextTick();
      await waitForAnimationFrame();

      const input = wrapper.find('input');
      expect(input.exists()).toBe(true);
      expect(document).toBeDefined();
      expect(document.activeElement).toBe(input.element);
    });

    it('does not autofocus when false', async () => {
      const wrapper = mount(GlFormInput, {
        attachTo: document.body,
        propsData: {
          autofocus: false,
        },
      });

      expect(wrapper.vm).toBeDefined();
      await nextTick();
      await waitForAnimationFrame();

      const input = wrapper.find('input');
      expect(input.exists()).toBe(true);
      expect(document).toBeDefined();
      expect(document.activeElement).not.toBe(input.element);
    });
  });
});
