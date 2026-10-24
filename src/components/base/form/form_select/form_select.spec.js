import { nextTick } from 'vue';
import { mount } from '@vue/test-utils';
import { formStateOptions, formInputWidths } from '../../../../utils/constants';
import { waitForAnimationFrame } from '../../../../utils/test_utils';
import { formSelectOptions } from './constants';
import GlFormSelect from './form_select.vue';

const SELECT_WRAPPER_CLASS = 'gl-form-select-wrapper';
const DEFAULT_SELECT_CLASSES = ['gl-form-select', 'custom-select'];
const excludeDefaultNull = (values) => Object.values(values).filter((value) => value !== null);

describe('GlFormSelect', () => {
  let wrapper;

  const createComponent = (propsData = {}, mountFn = mount, options = {}) => {
    wrapper = mountFn(GlFormSelect, {
      propsData,
      ...options,
    });
  };
  const findSelect = () => wrapper.find('.gl-form-select');

  describe('state prop', () => {
    it.each`
      state                       | expectedClasses
      ${formStateOptions.valid}   | ${['is-valid']}
      ${formStateOptions.invalid} | ${['is-invalid']}
      ${formStateOptions.default} | ${[]}
      ${undefined}                | ${[]}
    `('adds $expectedClass class for state $state', ({ state, expectedClasses }) => {
      createComponent({ state });

      expect(findSelect().classes().sort()).toEqual(
        [...DEFAULT_SELECT_CLASSES, ...expectedClasses].sort(),
      );
    });
  });

  describe('width prop', () => {
    // Exclude the default null value
    const nonNullWidths = excludeDefaultNull(formInputWidths);

    it.each(nonNullWidths)('adds correct class for width %s', (width) => {
      createComponent({ width });

      expect(wrapper.classes().sort()).toEqual(
        [SELECT_WRAPPER_CLASS, `gl-form-select-${width}`].sort(),
      );
    });

    it('does not add a width class if not given the width prop', () => {
      createComponent();

      expect(wrapper.classes()).toEqual([SELECT_WRAPPER_CLASS]);
    });

    it('does not add a width class if passed null', () => {
      createComponent({ width: null });

      expect(wrapper.classes()).toEqual([SELECT_WRAPPER_CLASS]);
    });
  });

  describe('selectClass prop', () => {
    const selectClass = 'select-class';
    const anotherClass = 'another-class';

    it.each`
      type        | selectClassProp
      ${'String'} | ${'select-class'}
      ${'Array'}  | ${['select-class']}
      ${'Object'} | ${{ [selectClass]: true, [anotherClass]: false }}
    `('adds class for select using $type', ({ selectClassProp }) => {
      createComponent({ selectClass: selectClassProp });

      expect(findSelect().classes()).toContain(selectClass);
      expect(findSelect().classes()).not.toContain(anotherClass);
    });

    it('does not add a select class if not given the prop', () => {
      createComponent();

      expect(findSelect().classes()).not.toContain(selectClass);
    });

    it('does not add a select class if passed null', () => {
      createComponent({ selectClass: null });

      expect(findSelect().classes()).not.toContain(selectClass);
    });
  });

  describe('v-model', () => {
    it('should select an option element and update the v-model bound data', async () => {
      createComponent({ options: formSelectOptions });
      const options = wrapper.findAll('option');

      await options.at(1).setSelected();

      expect(wrapper.find('option:checked').element.value).toBe(formSelectOptions[1].value);
    });
  });

  describe('default slot', () => {
    it('renders after options prop options', () => {
      createComponent({ options: formSelectOptions }, undefined, {
        slots: {
          default: {
            template: '<option value="default-slot-option">Default</option>',
          },
        },
      });

      const options = wrapper.findAll('option').wrappers;

      expect(options).toHaveLength(1 + formSelectOptions.length);
      expect(options.at(-1).element.value).toBe('default-slot-option');
    });
  });

  describe('"first" slot', () => {
    describe('with options prop', () => {
      beforeEach(() => {
        createComponent({ options: formSelectOptions }, undefined, {
          slots: {
            first: {
              template: '<option value="first-slot-option">First</option>',
            },
          },
        });
      });

      it('should render option before options prop options', () => {
        const [firstOption, ...otherOptions] = wrapper.findAll('option').wrappers;

        expect(firstOption.element.value).toBe('first-slot-option');

        expect(otherOptions).toHaveLength(formSelectOptions.length);
      });

      it('should have selectable options', async () => {
        await wrapper.find('select').setValue('first-slot-option');

        expect(wrapper.find('option:checked').element.value).toBe('first-slot-option');
      });
    });

    describe('with default slot', () => {
      beforeEach(() => {
        createComponent(undefined, undefined, {
          slots: {
            default: {
              template: '<option value="default-slot-option">Default</option>',
            },
            first: {
              template: '<option value="first-slot-option">First</option>',
            },
          },
        });
      });

      it('should render before default slot options', () => {
        const [firstOption, defaultOption] = wrapper.findAll('option').wrappers;

        expect(firstOption.element.value).toBe('first-slot-option');
        expect(defaultOption.element.value).toBe('default-slot-option');
      });
    });
  });

  it('passes arbitrary attributes to select element', () => {
    createComponent(undefined, undefined, { attrs: { 'data-foo': 'bar' } });

    expect(wrapper.find('select').attributes('data-foo')).toBe('bar');
  });

  // NOTE: These tests ensure that `v-on="$listeners"` is not set on the underlying select element.
  // This preserves behaviors present before the `BFormSelect` removal.
  // Add `v-on="$listeners"` to the implementation to see these tests fail.
  describe('event forwarding', () => {
    it('arbitrary listeners are not passed down', async () => {
      const eventSpy = jest.fn();

      createComponent(undefined, undefined, {
        listeners: {
          mouseenter: eventSpy,
        },
      });

      const select = wrapper.find('select');

      await select.trigger('mouseenter');

      expect(eventSpy).not.toHaveBeenCalled();
    });

    it('nested v-model works correctly', async () => {
      const modelSpy = jest.fn();

      const harnessWrapper = mount({
        components: {
          GlFormSelect,
        },
        data() {
          return {
            modelValue: 'foo',
          };
        },
        watch: {
          modelValue: modelSpy,
        },
        // The explicit use of `v-model` is important for this test.
        template: `
          <gl-form-select v-model="modelValue">
            <option>foo</option>
            <option>bar</option>
          </gl-form-select>
       `,
      });

      const select = harnessWrapper.find('select');
      expect(select.element.value).toBe('foo');

      // Simulate a real interaction which changes the select's value. Using
      // `select.setValue('bar')` isn't sufficient, since it only triggers a
      // `change` event, whereas in reality the element will emit both an
      // `input` event (which the internal `v-model` listens to) *and* a
      // `change` event.
      select.element.value = 'bar';
      await Promise.all([select.trigger('input'), select.trigger('change')]);

      const [watcherNewValue, watcherOldValue] = modelSpy.mock.calls[0];
      expect([watcherNewValue, watcherOldValue]).toEqual(['bar', 'foo']);
    });
  });
});

describe('form-select', () => {
  // TODO: this test probably can be removed. Or do we need a test for the surrounding span?
  it('has select as root element', async () => {
    const wrapper = mount(GlFormSelect);
    expect(wrapper.find('select').element.tagName).toBe('SELECT');
  });

  it('has class custom-select', async () => {
    const wrapper = mount(GlFormSelect);
    expect(wrapper.find('select').classes()).toContain('custom-select');
  });

  it('does not have attr multiple by default', async () => {
    const wrapper = mount(GlFormSelect);
    expect(wrapper.find('select').attributes('multiple')).toBeUndefined();
  });

  it('does not have attr required by default', async () => {
    const wrapper = mount(GlFormSelect);
    expect(wrapper.find('select').attributes('required')).toBeUndefined();
  });

  it('has attr required when required=true', async () => {
    const wrapper = mount(GlFormSelect, {
      propsData: {
        required: true,
      },
    });
    expect(wrapper.find('select').attributes('required')).toBeDefined();
  });

  it('does not have attr form by default', async () => {
    const wrapper = mount(GlFormSelect);
    expect(wrapper.find('select').attributes('form')).toBeUndefined();
  });

  it('has attr form when form is set', async () => {
    const wrapper = mount(GlFormSelect, {
      propsData: {
        form: 'foobar',
      },
    });
    expect(wrapper.find('select').attributes('form')).toBeDefined();
    expect(wrapper.find('select').attributes('form')).toBe('foobar');
  });

  it('has attr multiple when multiple=true', async () => {
    const wrapper = mount(GlFormSelect, {
      propsData: {
        multiple: true,
        value: [],
      },
    });
    expect(wrapper.find('select').attributes('multiple')).toBeDefined();
  });

  it('has attr size when select-size is set', async () => {
    const wrapper = mount(GlFormSelect, {
      propsData: {
        selectSize: 4,
      },
    });
    expect(wrapper.find('select').attributes('size')).toBeDefined();
    expect(wrapper.find('select').attributes('size')).toBe('4');
    expect(wrapper.find('select').attributes('multiple')).toBeUndefined();
  });

  it('has auto ID attr by default', async () => {
    const wrapper = mount(GlFormSelect);
    await nextTick(); // Auto-ID assigned after mount
    await nextTick(); // Extra tick needed for Vue 3
    expect(wrapper.find('select').attributes('id')).toBeDefined();
  });

  it('has user supplied ID attr when id is set', async () => {
    const wrapper = mount(GlFormSelect, {
      propsData: {
        id: 'foobar',
      },
    });
    expect(wrapper.find('select').attributes('id')).toBeDefined();
    expect(wrapper.find('select').attributes('id')).toBe('foobar');
  });

  it('does not have attr size by default', async () => {
    const wrapper = mount(GlFormSelect);
    expect(wrapper.find('select').attributes('size')).toBeUndefined();
  });

  it('does have attr size when plain=true', async () => {
    const wrapper = mount(GlFormSelect, {
      propsData: {
        plain: true,
      },
    });
    expect(wrapper.find('select').attributes('size')).toBeDefined();
    expect(wrapper.find('select').attributes('size')).toBe('0');
  });

  it('has class custom-select-sm when size=sm and plain=false', async () => {
    const wrapper = mount(GlFormSelect, {
      propsData: {
        size: 'sm',
      },
    });
    expect(wrapper.find('select').classes()).toContain('custom-select-sm');
    expect(wrapper.find('select').classes()).toContain('custom-select');
  });

  it('has class custom-select-lg when size=lg and plain=false', async () => {
    const wrapper = mount(GlFormSelect, {
      propsData: {
        size: 'lg',
      },
    });
    expect(wrapper.find('select').classes()).toContain('custom-select-lg');
    expect(wrapper.find('select').classes()).toContain('custom-select');
  });

  it('has class custom-select-foo when size=foo and plain=false', async () => {
    const wrapper = mount(GlFormSelect, {
      propsData: {
        size: 'foo',
      },
    });
    expect(wrapper.find('select').classes()).toContain('custom-select-foo');
    expect(wrapper.find('select').classes()).toContain('custom-select');
  });

  it('has class is-invalid and attr aria-invalid="true" when state=false', async () => {
    const wrapper = mount(GlFormSelect, {
      propsData: {
        state: false,
      },
    });
    expect(wrapper.find('select').attributes('aria-invalid')).toBe('true');
    expect(wrapper.find('select').classes()).toContain('is-invalid');
    expect(wrapper.find('select').classes()).toContain('custom-select');
  });

  it('has class is-valid when state=true', async () => {
    const wrapper = mount(GlFormSelect, {
      propsData: {
        state: true,
      },
    });
    expect(wrapper.find('select').attributes('aria-invalid')).toBeUndefined();
    expect(wrapper.find('select').classes()).toContain('is-valid');
    expect(wrapper.find('select').classes()).toContain('custom-select');
  });

  it('has attr aria-invalid="true" when aria-invalid="true"', async () => {
    const wrapper = mount(GlFormSelect, {
      propsData: {
        ariaInvalid: 'true',
      },
    });
    expect(wrapper.find('select').attributes('aria-invalid')).toBe('true');
    expect(wrapper.find('select').classes()).toContain('custom-select');
  });

  it('has attr aria-invalid="true" when aria-invalid=true', async () => {
    const wrapper = mount(GlFormSelect, {
      propsData: {
        ariaInvalid: true,
      },
    });
    expect(wrapper.find('select').attributes('aria-invalid')).toBe('true');
    expect(wrapper.find('select').classes()).toContain('custom-select');
  });

  it('has class form-control when plain=true', async () => {
    const wrapper = mount(GlFormSelect, {
      propsData: {
        plain: true,
      },
    });
    expect(wrapper.find('select').classes()).toContain('form-control');
    expect(wrapper.find('select').element.tagName).toBe('SELECT');
  });

  it('has class form-control-lg when size=lg and plain=true', async () => {
    const wrapper = mount(GlFormSelect, {
      propsData: {
        size: 'lg',
        plain: true,
      },
    });
    expect(wrapper.find('select').classes()).toContain('form-control-lg');
    expect(wrapper.find('select').classes()).toContain('form-control');
  });

  it('has class form-control-sm when size=sm and plain=true', async () => {
    const wrapper = mount(GlFormSelect, {
      propsData: {
        size: 'sm',
        plain: true,
      },
    });
    expect(wrapper.find('select').classes()).toContain('form-control-sm');
    expect(wrapper.find('select').classes()).toContain('form-control');
  });

  it('has class form-control-foo when size=foo and plain=true', async () => {
    const wrapper = mount(GlFormSelect, {
      propsData: {
        size: 'foo',
        plain: true,
      },
    });
    expect(wrapper.find('select').classes()).toContain('form-control-foo');
    expect(wrapper.find('select').classes()).toContain('form-control');
  });

  it('focus() and blur() methods work', async () => {
    const wrapper = mount(GlFormSelect, {
      attachTo: document.body,
    });

    expect(document.activeElement).not.toBe(wrapper.find('select').element);

    wrapper.vm.focus();
    await nextTick();

    expect(document.activeElement).toBe(wrapper.find('select').element);

    wrapper.vm.blur();
    await nextTick();

    expect(document.activeElement).not.toBe(wrapper.find('select').element);
  });

  it('has option elements from simple options array', async () => {
    const wrapper = mount(GlFormSelect, {
      propsData: {
        options: ['one', 'two', 'three'],
      },
    });
    const $options = wrapper.find('select').findAll('option');
    expect($options).toHaveLength(3);
    expect($options.at(0).text()).toBe('one');
    expect($options.at(1).text()).toBe('two');
    expect($options.at(2).text()).toBe('three');
    expect($options.at(0).attributes('value')).toBe('one');
    expect($options.at(1).attributes('value')).toBe('two');
    expect($options.at(2).attributes('value')).toBe('three');
    expect($options.wrappers.every((o) => o.find('[disabled]').exists())).toBe(false);
  });

  it('has option elements from options array of objects', async () => {
    const wrapper = mount(GlFormSelect, {
      propsData: {
        options: [
          { text: 'one', value: 1 },
          { text: 'two', value: 2, disabled: true },
          { text: 'three', value: 3 },
        ],
      },
    });

    const $options = wrapper.find('select').findAll('option');
    expect($options).toHaveLength(3);
    expect($options.at(0).text()).toBe('one');
    expect($options.at(1).text()).toBe('two');
    expect($options.at(2).text()).toBe('three');
    expect($options.at(0).attributes('value')).toBe('1');
    expect($options.at(1).attributes('value')).toBe('2');
    expect($options.at(2).attributes('value')).toBe('3');
    expect($options.at(0).element.matches('[disabled]')).toBe(false);
    expect($options.at(1).element.matches('[disabled]')).toBe(true);
    expect($options.at(2).element.matches('[disabled]')).toBe(false);
  });

  it('has option elements from options array of objects with custom field names', async () => {
    const wrapper = mount(GlFormSelect, {
      propsData: {
        options: [
          { price: 1.5, display: { text: '1,50 €' } },
          {
            price: 5,
            display: { text: '5,00 €', html: '<span class="lowest-price">5,00 €</span>' },
          },
          { price: 50.75, display: { text: '50,75 €' }, notAvailable: true },
        ],
        valueField: 'price',
        textField: 'display.text',
        htmlField: 'display.html',
        disabledField: 'notAvailable',
      },
    });

    const $options = wrapper.find('select').findAll('option');
    expect($options).toHaveLength(3);
    expect($options.at(0).text()).toBe('1,50 €');
    expect($options.at(1).text()).toBe('5,00 €');
    expect($options.at(2).text()).toBe('50,75 €');
    expect($options.at(0).find('span').exists()).toBe(false);
    expect($options.at(1).find('span').exists()).toBe(true);
    expect($options.at(2).find('span').exists()).toBe(false);
    expect($options.at(0).attributes('value')).toBe('1.5');
    expect($options.at(1).attributes('value')).toBe('5');
    expect($options.at(2).attributes('value')).toBe('50.75');
    expect($options.at(0).element.matches('[disabled]')).toBe(false);
    expect($options.at(1).element.matches('[disabled]')).toBe(false);
    expect($options.at(2).element.matches('[disabled]')).toBe(true);
  });

  it('has option group elements with options from options array of objects', async () => {
    const wrapper = mount(GlFormSelect, {
      propsData: {
        options: [
          {
            label: 'group one',
            options: [
              { text: 'one', value: 1 },
              { text: 'two', value: 2 },
            ],
          },
          {
            label: 'group two',
            options: [
              { text: 'three', value: 3 },
              { text: 'four', value: 4, disabled: true },
            ],
          },
        ],
      },
    });

    const $groups = wrapper.find('select').findAll('optgroup');
    expect($groups).toHaveLength(2);
    expect($groups.at(0).attributes('label')).toBe('group one');
    expect($groups.at(1).attributes('label')).toBe('group two');
    expect($groups.at(0).findAll('option')).toHaveLength(2);
    expect($groups.at(1).findAll('option')).toHaveLength(2);

    const $options = wrapper.find('select').findAll('option');
    expect($options).toHaveLength(4);
    expect($options.at(0).text()).toBe('one');
    expect($options.at(1).text()).toBe('two');
    expect($options.at(2).text()).toBe('three');
    expect($options.at(3).text()).toBe('four');
    expect($options.at(0).attributes('value')).toBe('1');
    expect($options.at(1).attributes('value')).toBe('2');
    expect($options.at(2).attributes('value')).toBe('3');
    expect($options.at(3).attributes('value')).toBe('4');
    expect($options.at(0).element.matches('[disabled]')).toBe(false);
    expect($options.at(1).element.matches('[disabled]')).toBe(false);
    expect($options.at(2).element.matches('[disabled]')).toBe(false);
    expect($options.at(3).element.matches('[disabled]')).toBe(true);
  });

  it('has option group and option elements from options array of objects', async () => {
    const wrapper = mount(GlFormSelect, {
      propsData: {
        options: [
          { text: 'one', value: 1 },
          {
            label: 'group',
            options: [
              { text: 'two', value: 2 },
              { text: 'three', value: 3 },
            ],
          },
          { text: 'four', value: 4, disabled: true },
        ],
      },
    });

    const $groups = wrapper.find('select').findAll('optgroup');
    expect($groups).toHaveLength(1);
    expect($groups.at(0).attributes('label')).toBe('group');
    expect($groups.at(0).findAll('option')).toHaveLength(2);

    const $options = wrapper.find('select').findAll('option');
    expect($options).toHaveLength(4);
    expect($options.at(0).text()).toBe('one');
    expect($options.at(1).text()).toBe('two');
    expect($options.at(2).text()).toBe('three');
    expect($options.at(3).text()).toBe('four');
    expect($options.at(0).attributes('value')).toBe('1');
    expect($options.at(1).attributes('value')).toBe('2');
    expect($options.at(2).attributes('value')).toBe('3');
    expect($options.at(3).attributes('value')).toBe('4');
    expect($options.at(0).element.matches('[disabled]')).toBe(false);
    expect($options.at(1).element.matches('[disabled]')).toBe(false);
    expect($options.at(2).element.matches('[disabled]')).toBe(false);
    expect($options.at(3).element.matches('[disabled]')).toBe(true);
  });

  it('has option elements from options legacy object format', async () => {
    const spyWarn = jest.spyOn(console, 'warn').mockImplementationOnce(() => {});
    const wrapper = mount(GlFormSelect, {
      propsData: {
        options: { one: 1, two: { value: 2, text: 'Two' }, three: 'three' },
      },
    });

    const $options = wrapper.find('select').findAll('option');
    expect($options).toHaveLength(3);
    expect($options.at(0).text()).toBe('1');
    expect($options.at(1).text()).toBe('Two');
    expect($options.at(2).text()).toBe('three');
    expect($options.at(0).attributes('value')).toBe('one');
    expect($options.at(1).attributes('value')).toBe('2');
    expect($options.at(2).attributes('value')).toBe('three');

    expect(spyWarn).toHaveBeenCalledWith(
      '[@khulnasoft/ui] GlFormSelect - Setting prop "options" to an object is deprecated. Use the array format instead.',
    );
  });

  it('has option elements from default slot', async () => {
    const wrapper = mount(GlFormSelect, {
      slots: {
        default: [
          '<option value="1">one</option>',
          '<option value="2">two</option>',
          '<option value="3">three</option>',
        ],
      },
    });

    const $options = wrapper.find('select').findAll('option');
    expect($options).toHaveLength(3);
    expect($options.at(0).text()).toBe('one');
    expect($options.at(1).text()).toBe('two');
    expect($options.at(2).text()).toBe('three');
    expect($options.at(0).attributes('value')).toBe('1');
    expect($options.at(1).attributes('value')).toBe('2');
    expect($options.at(2).attributes('value')).toBe('3');
  });

  it('updates v-model when option selected in single mode', async () => {
    const wrapper = mount(GlFormSelect, {
      propsData: {
        options: ['one', 'two', 'three'],
      },
    });

    const $options = wrapper.find('select').findAll('option');
    expect($options).toHaveLength(3);

    expect(wrapper.emitted('input')).toBeUndefined();
    expect(wrapper.emitted('change')).toBeUndefined();

    // select 3rd option
    $options.at(2).setSelected();
    await nextTick();

    expect(wrapper.emitted('input')).toBeDefined();
    expect(wrapper.emitted('change')).toBeDefined();
    expect(wrapper.emitted('input')[0][0]).toBe('three');
    expect(wrapper.emitted('change')[0][0]).toBe('three');
  });

  it('updating v-model (value) when selects correct option', async () => {
    const wrapper = mount(GlFormSelect, {
      propsData: {
        options: ['one', 'two', { text: 'three', value: { three: 3 } }],
        value: 'one',
      },
    });
    const $options = wrapper.find('select').findAll('option');
    expect($options).toHaveLength(3);

    expect($options.at(0).element.selected).toBe(true);

    // Select 2nd option
    await wrapper.setProps({
      value: 'two',
    });

    expect($options.at(1).element.selected).toBe(true);

    // Select 3rd option
    await wrapper.setProps({
      value: { three: 3 },
    });

    expect($options.at(2).element.selected).toBe(true);
  });

  it('updates v-model when option selected in single mode with complex values', async () => {
    const wrapper = mount(GlFormSelect, {
      propsData: {
        options: [
          { text: 'one', value: { a: 1 } },
          { text: 'two', value: { b: 2 } },
          { text: 'three', value: { c: 3 } },
        ],
      },
    });

    const $options = wrapper.find('select').findAll('option');
    expect($options).toHaveLength(3);

    expect(wrapper.emitted('input')).toBeUndefined();
    expect(wrapper.emitted('change')).toBeUndefined();

    // Select 3rd option
    $options.at(2).setSelected();
    await nextTick();

    expect(wrapper.emitted('input')).toBeDefined();
    expect(wrapper.emitted('change')).toBeDefined();
    expect(wrapper.emitted('input')[0][0]).toEqual({ c: 3 });
    expect(wrapper.emitted('change')[0][0]).toEqual({ c: 3 });
  });

  it('updates v-model when option selected in multiple mode', async () => {
    const wrapper = mount(GlFormSelect, {
      propsData: {
        multiple: true,
        selectSize: 3,
        options: ['one', 'two', 'three'],
        value: [],
      },
    });

    const $options = wrapper.find('select').findAll('option');
    expect($options).toHaveLength(3);

    expect(wrapper.emitted('input')).toBeUndefined();
    expect(wrapper.emitted('change')).toBeUndefined();

    // Select 2nd and 3rd option
    $options.at(1).element.selected = true;
    $options.at(2).element.selected = true;
    await wrapper.find('select').trigger('change');
    expect(wrapper.emitted('input')).toBeDefined();
    expect(wrapper.emitted('change')).toBeDefined();
    expect(wrapper.emitted('input')[0][0]).toEqual(['two', 'three']);
    expect(wrapper.emitted('change')[0][0]).toEqual(['two', 'three']);
  });

  it('updates v-model when option selected in multiple mode with complex values', async () => {
    const wrapper = mount(GlFormSelect, {
      propsData: {
        multiple: true,
        selectSize: 3,
        value: [],
        options: [
          { text: 'one', value: { a: 1 } },
          { text: 'two', value: { b: 2 } },
          { text: 'three', value: { c: 3 } },
        ],
      },
    });

    const $options = wrapper.find('select').findAll('option');
    expect($options).toHaveLength(3);

    expect(wrapper.emitted('input')).toBeUndefined();
    expect(wrapper.emitted('change')).toBeUndefined();

    // Select 2nd and 3rd option
    $options.at(1).element.selected = true;
    $options.at(2).element.selected = true;
    await wrapper.find('select').trigger('change');
    expect(wrapper.emitted('input')).toBeDefined();
    expect(wrapper.emitted('change')).toBeDefined();
    expect(wrapper.emitted('input')[0][0]).toEqual([{ b: 2 }, { c: 3 }]);
    expect(wrapper.emitted('change')[0][0]).toEqual([{ b: 2 }, { c: 3 }]);
  });

  // These tests are wrapped in a new describe to limit the scope of the getBCR Mock
  describe('prop `autofocus`', () => {
    const origGetBCR = Element.prototype.getBoundingClientRect;

    beforeEach(() => {
      // Mock `getBoundingClientRect()` so that the `isVisible(el)` test returns `true`
      // In our test below, all pagination buttons would normally be visible
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
    });

    it('works when true', async () => {
      const wrapper = mount(GlFormSelect, {
        attachTo: document.body,
        propsData: {
          autofocus: true,
          options: ['a', 'b', 'c'],
        },
      });
      await nextTick();
      await waitForAnimationFrame();

      const input = wrapper.find('select');
      expect(input.exists()).toBe(true);
      expect(document).toBeDefined();
      expect(document.activeElement).toBe(input.element);
    });

    it('does not autofocus when false', async () => {
      const wrapper = mount(GlFormSelect, {
        attachTo: document.body,
        propsData: {
          autofocus: false,
          options: ['a', 'b', 'c'],
        },
      });
      await nextTick();
      await waitForAnimationFrame();

      const input = wrapper.find('select');
      expect(input.exists()).toBe(true);
      expect(document).toBeDefined();
      expect(document.activeElement).not.toBe(input.element);
    });
  });
});
