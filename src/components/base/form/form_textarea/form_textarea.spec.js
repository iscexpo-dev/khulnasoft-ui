import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import { useMockIntersectionObserver } from '~/utils/use_mock_intersection_observer';
import { resetObserver } from './visible';
import GlFormTextarea from './form_textarea.vue';

const modelEvent = GlFormTextarea.model.event;
const newValue = 'foo';

jest.useFakeTimers();

describe('GlFormTextArea', () => {
  const { getInstances, trigger } = useMockIntersectionObserver();

  let wrapper;

  beforeEach(() => {
    // Reset the directive's shared observer to ensure test isolation
    resetObserver();
  });

  const createComponent = (propsData = {}) => {
    wrapper = mount(GlFormTextarea, {
      propsData,
      scopedSlots: {
        'remaining-character-count-text': function remainingCharacterCountText({ count }) {
          return count === 1 ? `${count} character remaining.` : `${count} characters remaining.`;
        },
        'character-count-over-limit-text': function characterCountOverLimitText({ count }) {
          return count === 1 ? `${count} character over limit.` : `${count} characters over limit.`;
        },
      },
    });
  };

  const findTextarea = () => wrapper.find('textarea');

  const flushNextTickAnimationFrame = async () => {
    // setHeight and autofocus only called after $nextTick and requestAnimationFrame
    await nextTick();
    jest.runAllTimers();
  };

  const mockGetBoundingClientRect = () => {
    // isVisible uses getBoundingClientRect which returns all zeros in JSDOM;
    // mock it to simulate a visible element
    jest.spyOn(findTextarea().element, 'getBoundingClientRect').mockReturnValue({
      width: 300,
      height: 100,
      top: 0,
      left: 0,
      bottom: 100,
      right: 300,
    });
  };

  it('has class form-control', () => {
    createComponent();

    expect(findTextarea().classes()).toContain('form-control');
  });

  it('has class gl-form-textarea', () => {
    createComponent();

    expect(findTextarea().classes()).toContain('gl-form-textarea');
  });

  it('has class gl-form-input', () => {
    createComponent();

    expect(findTextarea().classes()).toContain('gl-form-input');
  });

  const itUpdatesDebouncedScreenReaderText = (expectedText) => {
    it('updates debounced screen reader text', async () => {
      jest.runOnlyPendingTimers();
      await nextTick();
      expect(wrapper.find('[data-testid="count-text-sr-only"]').text()).toBe(expectedText);
    });
  };

  describe('v-model', () => {
    describe('value binding', () => {
      beforeEach(() => {
        createComponent({ value: 'initial' });
      });

      it(`sets the textarea's value`, () => {
        expect(findTextarea().element.value).toBe('initial');
      });

      describe('when the value prop changes', () => {
        beforeEach(() => {
          wrapper.setProps({ value: newValue });
          return nextTick();
        });

        it(`updates the textarea's value`, () => {
          expect(findTextarea().element.value).toBe(newValue);
        });
      });
    });

    describe('event emission', () => {
      beforeEach(() => {
        createComponent();

        findTextarea().setValue(newValue);
      });

      it('synchronously emits update event', () => {
        expect(wrapper.emitted('update')).toEqual([[newValue]]);
      });

      it(`synchronously emits ${modelEvent} event`, () => {
        expect(wrapper.emitted(modelEvent)).toEqual([[newValue]]);
      });
    });

    describe('does not emit events when value prop changes', () => {
      it('does not emit update, input, or change events', async () => {
        createComponent({ value: '' });

        expect(wrapper.emitted('update')).toBeUndefined();
        expect(wrapper.emitted('input')).toBeUndefined();
        expect(wrapper.emitted('change')).toBeUndefined();

        await wrapper.setProps({ value: 'test' });

        expect(wrapper.emitted('update')).toBeUndefined();
        expect(wrapper.emitted('input')).toBeUndefined();
        expect(wrapper.emitted('change')).toBeUndefined();
      });
    });

    describe('only re-emits v-model when the value actually changes', () => {
      it('does not re-emit v-model on change when value not changed', async () => {
        createComponent();

        await findTextarea().setValue('test');

        expect(wrapper.emitted(modelEvent)).toBeDefined();
        expect(wrapper.emitted(modelEvent)).toHaveLength(1);
        expect(wrapper.emitted(modelEvent)[0][0]).toEqual('test');

        await findTextarea().trigger('change');

        expect(wrapper.emitted(modelEvent)).toHaveLength(1);
      });

      it('re-emits v-model on change when text changed', async () => {
        createComponent();

        await findTextarea().setValue('test');

        expect(wrapper.emitted(modelEvent)).toBeDefined();
        expect(wrapper.emitted(modelEvent)).toHaveLength(1);

        findTextarea().element.value = 'TEST';
        await findTextarea().trigger('change');

        expect(wrapper.emitted(modelEvent)).toHaveLength(2);
        expect(wrapper.emitted(modelEvent)[1][0]).toEqual('TEST');
      });
    });
  });

  describe('debounce', () => {
    describe.each([10, 100, 1000])('given a debounce of %dms', (debounce) => {
      beforeEach(() => {
        jest.useFakeTimers();

        createComponent({ debounce });

        findTextarea().setValue(newValue);
      });

      it('synchronously emits an update event', () => {
        expect(wrapper.emitted('update')).toEqual([[newValue]]);
      });

      it(`emits a ${modelEvent} event after the debounce delay`, () => {
        // Just before debounce completes
        jest.advanceTimersByTime(debounce - 1);
        expect(wrapper.emitted(modelEvent)).toBe(undefined);

        // Exactly when debounce completes
        jest.advanceTimersByTime(1);
        expect(wrapper.emitted(modelEvent)).toEqual([[newValue]]);
      });
    });
  });

  describe('submit on enter prop', () => {
    it('should be false by default', () => {
      createComponent({});

      wrapper.trigger('keyup.enter', {
        metaKey: true,
      });

      expect(wrapper.emitted('submit')).toBe(undefined);
    });

    it('should emit submit when cmd+enter is pressed', async () => {
      createComponent({ submitOnEnter: true });

      wrapper.trigger('keyup.enter', {
        metaKey: true,
      });

      expect(wrapper.emitted('submit')).toEqual([[]]);
    });
  });

  describe('rows prop', () => {
    it('binds the rows prop to the internal textarea', () => {
      const rows = 10;
      createComponent({ rows });

      expect(findTextarea().attributes('rows')).toBe(rows.toString());
    });

    it('works correctly with a string value', () => {
      const rows = '10';
      createComponent({ rows });

      expect(findTextarea().attributes('rows')).toBe(rows);
    });

    it('uses minimum value of 2 when rows is set less than 2', () => {
      createComponent({ rows: 1 });

      expect(findTextarea().attributes('rows')).toBe('2');
    });

    it('uses minimum value of 2 when rows is negative', () => {
      createComponent({ rows: -10 });

      expect(findTextarea().attributes('rows')).toBe('2');
    });

    it('sets rows attribute when maxRows is less than rows', () => {
      createComponent({ rows: 10, maxRows: 5 });

      expect(findTextarea().attributes('rows')).toBe('10');
    });
  });

  describe('when `characterCountLimit` prop is set', () => {
    const characterCountLimit = 10;

    describe('when textarea character count is under the max character count', () => {
      const textareaCharacterCount = 5;
      const expectedText = `${characterCountLimit - textareaCharacterCount} characters remaining.`;

      beforeEach(() => {
        createComponent({
          value: 'a'.repeat(textareaCharacterCount),
          characterCountLimit,
        });
      });

      it('displays remaining characters', () => {
        expect(wrapper.text()).toContain(expectedText);
      });

      itUpdatesDebouncedScreenReaderText(expectedText);
    });

    describe('when textarea character count is over the max character count', () => {
      const textareaCharacterCount = 15;
      const expectedText = `${textareaCharacterCount - characterCountLimit} characters over limit.`;

      beforeEach(() => {
        createComponent({
          value: 'a'.repeat(textareaCharacterCount),
          characterCountLimit,
        });
      });

      it('displays number of characters over', () => {
        expect(wrapper.text()).toContain(expectedText);
      });

      itUpdatesDebouncedScreenReaderText(expectedText);
    });

    describe('when textarea value is updated', () => {
      const textareaCharacterCount = 5;
      const newTextareaCharacterCount = textareaCharacterCount + 3;
      const expectedText = `${
        characterCountLimit - newTextareaCharacterCount
      } characters remaining.`;

      beforeEach(() => {
        createComponent({
          value: 'a'.repeat(textareaCharacterCount),
          characterCountLimit,
        });

        wrapper.setProps({ value: 'a'.repeat(newTextareaCharacterCount) });
      });

      it('updates character count text', () => {
        expect(wrapper.text()).toContain(expectedText);
      });

      itUpdatesDebouncedScreenReaderText(expectedText);
    });

    describe('aria-describedby wiring', () => {
      beforeEach(() => {
        createComponent({ characterCountLimit });
      });

      it('links the textarea to the rendered count via aria-describedby', () => {
        const describedBy = findTextarea().attributes('aria-describedby');
        const countId = wrapper.find('[data-testid="count-text-sr-only"]').attributes('id');

        expect(describedBy).toBeDefined();
        expect(describedBy).toBe(countId);
      });
    });

    describe('when `value` prop is `null`', () => {
      const expectedText = `${characterCountLimit} characters remaining.`;

      beforeEach(() => {
        createComponent({
          value: null,
          characterCountLimit,
        });
      });

      it('displays remaining characters', () => {
        expect(wrapper.text()).toContain(expectedText);
      });

      itUpdatesDebouncedScreenReaderText(expectedText);
    });

    describe('when `value` prop is updated to `null`', () => {
      const textareaCharacterCount = 5;
      const expectedText = `${characterCountLimit} characters remaining.`;

      beforeEach(() => {
        createComponent({
          value: 'a'.repeat(textareaCharacterCount),
          characterCountLimit,
        });

        wrapper.setProps({ value: null });
      });

      it('updates character count text', () => {
        expect(wrapper.text()).toContain(expectedText);
      });

      itUpdatesDebouncedScreenReaderText(expectedText);
    });
  });

  describe('when `textareaClasses` prop is set', () => {
    describe('with string value', () => {
      beforeEach(() => {
        createComponent({
          value: 'test',
          characterCountLimit: 10,
          textareaClasses: 'gl-rounded-lg',
        });
      });

      it('applies the class to the textarea', () => {
        expect(findTextarea().classes()).toContain('gl-rounded-lg');
      });
    });

    describe('with array value', () => {
      beforeEach(() => {
        createComponent({
          value: 'test',
          characterCountLimit: 10,
          textareaClasses: ['gl-rounded-lg', 'gl-border-solid'],
        });
      });

      it('applies all classes to the textarea', () => {
        expect(findTextarea().classes()).toContain('gl-rounded-lg');
        expect(findTextarea().classes()).toContain('gl-border-solid');
      });
    });

    describe('with object value', () => {
      beforeEach(() => {
        createComponent({
          value: 'test',
          characterCountLimit: 10,
          textareaClasses: {
            'gl-rounded-lg': true,
            'gl-border-solid': false,
          },
        });
      });

      it('applies classes based on object values', () => {
        expect(findTextarea().classes()).toContain('gl-rounded-lg');
        expect(findTextarea().classes()).not.toContain('gl-border-solid');
      });
    });
  });

  describe('formatter prop', () => {
    it('applies formatter on input', async () => {
      createComponent({
        formatter(value) {
          return value.toLowerCase();
        },
      });

      await findTextarea().setValue('TEST');

      expect(wrapper.emitted('update')).toEqual([['test']]);
      expect(wrapper.emitted(modelEvent)).toEqual([['test']]);
    });

    it('applies formatter on change', async () => {
      createComponent({
        value: '',
        formatter(value) {
          return value.toLowerCase();
        },
      });

      findTextarea().element.value = 'TEST';
      await findTextarea().trigger('change');

      expect(wrapper.emitted('change')).toBeDefined();
      expect(wrapper.emitted('change')[0][0]).toEqual('test');
    });

    it('does not apply formatter when value supplied on mount', () => {
      createComponent({
        value: 'TEST',
        formatter(value) {
          return String(value).toLowerCase();
        },
      });

      expect(findTextarea().element.value).toBe('TEST');
      expect(wrapper.emitted('update')).toBeUndefined();
      expect(wrapper.emitted(modelEvent)).toBeUndefined();
    });

    it('does not apply formatter when value prop updated', async () => {
      createComponent({
        value: '',
        formatter(value) {
          return value.toLowerCase();
        },
      });

      await wrapper.setProps({ value: 'TEST' });

      expect(findTextarea().element.value).toBe('TEST');
      expect(wrapper.emitted('update')).toBeUndefined();
      expect(wrapper.emitted(modelEvent)).toBeUndefined();
    });

    it('does not update value when formatter returns false', async () => {
      createComponent({
        value: 'abc',
        formatter() {
          return false;
        },
      });

      await findTextarea().trigger('focus');
      await findTextarea().setValue('TEST');

      expect(wrapper.emitted(modelEvent)).toBeUndefined();
      expect(wrapper.emitted('update')).toBeUndefined();
    });
  });

  describe('size prop', () => {
    it('does not add a size class by default', () => {
      createComponent();

      expect(findTextarea().classes()).not.toContain('form-control-sm');
      expect(findTextarea().classes()).not.toContain('form-control-lg');
    });

    it.each(['sm', 'lg'])('adds form-control-%s class when size is %s', (size) => {
      createComponent({ size });

      expect(findTextarea().classes()).toContain(`form-control-${size}`);
    });
  });

  describe('state prop', () => {
    it('does not add validation class when state is null', () => {
      createComponent({ state: null });

      expect(findTextarea().classes()).not.toContain('is-valid');
      expect(findTextarea().classes()).not.toContain('is-invalid');
    });

    it('adds is-valid class when state is true', () => {
      createComponent({ state: true });

      expect(findTextarea().classes()).toContain('is-valid');
      expect(findTextarea().classes()).not.toContain('is-invalid');
    });

    it('adds is-invalid class when state is false', () => {
      createComponent({ state: false });

      expect(findTextarea().classes()).toContain('is-invalid');
      expect(findTextarea().classes()).not.toContain('is-valid');
    });

    it('does not have aria-invalid attribute by default', () => {
      createComponent();

      expect(findTextarea().attributes('aria-invalid')).toBeUndefined();
    });

    it('does not have aria-invalid attribute when state is true', () => {
      createComponent({ state: true });

      expect(findTextarea().attributes('aria-invalid')).toBeUndefined();
    });

    it('sets aria-invalid to true when state is false', () => {
      createComponent({ state: false });

      expect(findTextarea().attributes('aria-invalid')).toBe('true');
    });

    it('has aria-invalid attribute when ariaInvalid="true"', () => {
      createComponent({ ariaInvalid: 'true' });

      expect(findTextarea().attributes('aria-invalid')).toBe('true');
    });

    it('has aria-invalid attribute when ariaInvalid=true', () => {
      createComponent({ ariaInvalid: true });

      expect(findTextarea().attributes('aria-invalid')).toBe('true');
    });

    it('has aria-invalid attribute when ariaInvalid="spelling"', () => {
      createComponent({ ariaInvalid: 'spelling' });

      expect(findTextarea().attributes('aria-invalid')).toBe('spelling');
    });
  });

  describe('disabled prop', () => {
    it('is not disabled by default', () => {
      createComponent();

      expect(findTextarea().attributes('disabled')).toBeUndefined();
      expect(findTextarea().element.disabled).toBe(false);
    });

    it('sets disabled attribute when disabled is true', () => {
      createComponent({ disabled: true });

      expect(findTextarea().attributes('disabled')).toBeDefined();
      expect(findTextarea().element.disabled).toBe(true);
    });
  });

  describe('readonly prop', () => {
    it('is not readonly by default', () => {
      createComponent();

      expect(findTextarea().attributes('readonly')).toBeUndefined();
    });

    it('sets readonly attribute when readonly is true', () => {
      createComponent({ readonly: true });

      expect(findTextarea().attributes('readonly')).toBeDefined();
    });
  });

  describe('placeholder prop', () => {
    it('sets placeholder attribute', () => {
      const placeholder = 'Enter text here';
      createComponent({ placeholder });

      expect(findTextarea().attributes('placeholder')).toBe(placeholder);
    });
  });

  describe('name prop', () => {
    it('sets name attribute', () => {
      const name = 'my-textarea';
      createComponent({ name });

      expect(findTextarea().attributes('name')).toBe(name);
    });
  });

  describe('form prop', () => {
    it('sets form attribute', () => {
      createComponent({ form: 'my-form-id' });

      expect(findTextarea().attributes('form')).toBe('my-form-id');
    });
  });

  describe('required prop', () => {
    it('is not required by default', () => {
      createComponent();

      expect(findTextarea().attributes('required')).toBeUndefined();
    });

    it('sets required attribute when required is true', () => {
      createComponent({ required: true });

      expect(findTextarea().attributes('required')).toBeDefined();
      expect(findTextarea().attributes('aria-required')).toBe('true');
    });
  });

  describe('autocomplete prop', () => {
    it('sets autocomplete attribute', () => {
      createComponent({ autocomplete: 'off' });

      expect(findTextarea().attributes('autocomplete')).toBe('off');
    });
  });

  describe('blur event', () => {
    it('emits a blur event with native event as only arg', async () => {
      createComponent({ value: 'TEST' });

      await findTextarea().trigger('blur');

      expect(wrapper.emitted('blur')).toBeDefined();
      expect(wrapper.emitted('blur')[0]).toHaveLength(1);
      expect(wrapper.emitted('blur')[0][0] instanceof Event).toBe(true);
      expect(wrapper.emitted('blur')[0][0].type).toEqual('blur');
    });
  });

  describe('focus event', () => {
    it('emits a native focus event', async () => {
      const spy = jest.fn();
      wrapper = mount(GlFormTextarea, {
        attachTo: document.body,
        listeners: {
          focus: spy,
        },
      });

      await findTextarea().trigger('focus');

      expect(spy).toHaveBeenCalled();
    });
  });

  describe('input event', () => {
    it('emits an input event with single arg of value', async () => {
      createComponent();

      await findTextarea().setValue('test');

      expect(wrapper.emitted('input')).toBeDefined();
      expect(wrapper.emitted('input')[0]).toHaveLength(1);
      expect(wrapper.emitted('input')[0][0]).toEqual('test');
    });
  });

  describe('change event', () => {
    it('emits a change event with single arg of value', async () => {
      createComponent();

      findTextarea().element.value = 'test';
      await findTextarea().trigger('change');

      expect(wrapper.emitted('change')).toBeDefined();
      expect(wrapper.emitted('change')[0]).toHaveLength(1);
      expect(wrapper.emitted('change')[0][0]).toEqual('test');
    });
  });

  describe('maxRows prop', () => {
    it('sets rows attribute when maxRows equals rows', () => {
      createComponent({ rows: 5, maxRows: 5 });

      expect(findTextarea().attributes('rows')).toBe('5');
    });

    it('does not set rows attribute when maxRows differs from rows (auto-height mode)', () => {
      createComponent({ rows: 2, maxRows: 10 });

      expect(findTextarea().attributes('rows')).toBeUndefined();
    });

    it('sets overflow-y to scroll in auto-height mode', () => {
      createComponent({ rows: 2, maxRows: 10 });

      expect(findTextarea().element.style.overflowY).toBe('scroll');
    });
  });

  describe('noResize prop', () => {
    it('sets resize to none by default (noResize is true by default)', () => {
      createComponent();

      expect(findTextarea().element.style.resize).toBe('none');
    });

    it('does not set resize to none when noResize is false and rows equals maxRows', () => {
      createComponent({ noResize: false, rows: 5, maxRows: 5 });

      expect(findTextarea().element.style.resize).toBe('');
    });
  });

  describe('focus and blur methods', () => {
    it('focus() and blur() methods work', () => {
      wrapper = mount(GlFormTextarea, {
        attachTo: document.body,
      });

      expect(typeof wrapper.vm.focus).toBe('function');
      expect(typeof wrapper.vm.blur).toBe('function');

      expect(document.activeElement).not.toBe(findTextarea().element);
      wrapper.vm.focus();
      expect(document.activeElement).toBe(findTextarea().element);
      wrapper.vm.blur();
      expect(document.activeElement).not.toBe(findTextarea().element);
    });
  });

  describe('id prop', () => {
    it('sets id attribute when provided', () => {
      createComponent({ id: 'my-textarea-id' });

      expect(findTextarea().attributes('id')).toBe('my-textarea-id');
    });

    it('generates an id when not provided', async () => {
      createComponent();

      await nextTick();
      await nextTick(); // Extra tick needed for Vue 3

      expect(findTextarea().attributes('id')).toMatch(/^gl-form-textarea-/);
    });
  });

  describe('autofocus prop', () => {
    it('focuses the textarea when autofocus is true', async () => {
      wrapper = mount(GlFormTextarea, {
        attachTo: document.body,
        propsData: { autofocus: true },
      });

      mockGetBoundingClientRect();
      await flushNextTickAnimationFrame();

      expect(document.activeElement).toBe(findTextarea().element);
    });

    it('does not focus the textarea when autofocus is false', async () => {
      wrapper = mount(GlFormTextarea, {
        attachTo: document.body,
        propsData: { autofocus: false },
      });

      await flushNextTickAnimationFrame();

      expect(document.activeElement).not.toBe(findTextarea().element);
    });
  });

  describe('attribute pass-through', () => {
    it('forwards extra attributes to the native textarea', () => {
      wrapper = mount(GlFormTextarea, {
        attrs: {
          'data-testid': 'my-textarea',
          maxlength: '2048',
          'data-custom': 'value',
        },
      });

      expect(findTextarea().attributes('data-testid')).toBe('my-textarea');
      expect(findTextarea().attributes('maxlength')).toBe('2048');
      expect(findTextarea().attributes('data-custom')).toBe('value');
    });

    it('forwards extra attributes when characterCountLimit is set', () => {
      wrapper = mount(GlFormTextarea, {
        propsData: { characterCountLimit: 10 },
        attrs: {
          'data-testid': 'my-textarea',
          maxlength: '2048',
        },
      });

      expect(findTextarea().attributes('data-testid')).toBe('my-textarea');
      expect(findTextarea().attributes('maxlength')).toBe('2048');
    });
  });

  describe('visibility observer', () => {
    const mountAutoHeight = () => {
      wrapper = mount(GlFormTextarea, {
        attachTo: document.body,
        propsData: {
          rows: 2,
          maxRows: 6,
        },
      });
    };

    it('sets the textarea height when the textarea becomes visible', async () => {
      mountAutoHeight();

      expect(findTextarea().element.style.height).toBe('');

      mockGetBoundingClientRect();
      const [observer] = getInstances();
      trigger(observer, findTextarea().element, { entry: { isIntersecting: true } });
      await flushNextTickAnimationFrame();

      expect(findTextarea().element.style.height).toMatch(/^\d+px$/);
    });

    it('does not set the textarea height when the textarea is not visible', async () => {
      mountAutoHeight();

      const [observer] = getInstances();
      trigger(observer, findTextarea().element, { entry: { isIntersecting: false } });
      await flushNextTickAnimationFrame();

      expect(findTextarea().element.style.height).toBe('');
    });

    it('re-observes the textarea after characterCountLimit toggles', async () => {
      mountAutoHeight();

      await wrapper.setProps({ characterCountLimit: 10 });

      mockGetBoundingClientRect();
      const observers = getInstances();
      const latestObserver = observers.at(-1);
      trigger(latestObserver, findTextarea().element, { entry: { isIntersecting: true } });
      await flushNextTickAnimationFrame();

      expect(findTextarea().element.style.height).toMatch(/^\d+px$/);
    });
  });
});
