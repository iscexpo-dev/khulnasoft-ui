import { cloneDeep, mapValues } from 'lodash-es';
import { nextTick } from 'vue';
import { shallowMount, mount } from '@vue/test-utils';
import GlFormGroup from '../form_group/form_group.vue';
import GlInput from '../form_input/form_input.vue';
import GlFormFields from './form_fields.vue';
import GlFormFieldValidator from './form_field_validator.vue';
import GlFormFieldsLoop from './form_fields_loop.vue';
import * as formMappers from './mappers';
import * as formValidators from './validators';

const TEST_FIELDS = {
  username: {
    label: 'User name',
    validators: [formValidators.required('User name is required')],
  },
  evenCount: {
    label: 'Count',
    mapValue: formMappers.mapToNumber,
    validators: [
      formValidators.factory('Count is required', Boolean),
      (val) => (val % 2 === 1 ? 'Count must be even' : ''),
    ],
    inputAttrs: { type: 'number' },
    groupAttrs: { class: 'unique-class' },
  },
  allCaps: {
    label: 'All caps (optional)',
    mapValue: (x) => x?.toUpperCase(),
  },
  fieldWithCustomId: { label: 'Field with custom ID', id: 'custom-id' },
  fieldset: {
    label: 'Fieldset',
    fieldset: true,
  },
};
const TEST_VALUES = {
  username: 'root',
  evenCount: 8,
  allCaps: '',
};

const TEST_FORM_ID = 'test-form-id';

describe('GlFormFields', () => {
  let wrapper;

  // region: factory --------------------------------------------------
  const createComponent = (props = {}, options = {}, mountFn = shallowMount) => {
    // why: Clone the constant so Vue doesn't turn it reactive
    const fields = cloneDeep(TEST_FIELDS);

    wrapper = mountFn(GlFormFields, {
      propsData: {
        fields,
        values: {},
        formId: TEST_FORM_ID,
        ...props,
      },
      stubs: {
        GlFormFieldValidator,
        GlFormFieldsLoop,
        ...options.stubs,
      },
      ...options,
    });
  };

  // region: finders --------------------------------------------------
  const mapFormGroupToData = (formGroup) => {
    const input = formGroup.findComponent(GlInput);

    return {
      label: formGroup.attributes('label'),
      state: formGroup.attributes('state'),
      invalidFeedback: formGroup.attributes('invalid-feedback'),
      class: formGroup.attributes('class'),
      input: {
        // Ensure that "value" is present even if undefined
        value: input.attributes('value'),
        id: input.attributes('id'),
        type: input.attributes('type'),
      },
    };
  };
  const findFormGroups = () => wrapper.findAllComponents(GlFormGroup).wrappers;
  // eslint-disable-next-line unicorn/no-array-callback-reference
  const findFormGroupsAsData = () => findFormGroups().map(mapFormGroupToData);
  const findFormGroupFromLabel = (label) =>
    wrapper.findAllComponents(GlFormGroup).wrappers.find((x) => x.vm.$attrs.label === label);
  const findInputFromLabel = (label) => findFormGroupFromLabel(label).findComponent(GlInput);
  const findCustomInputFromLabel = (label) =>
    findFormGroupFromLabel(label).find('[data-testid="test-custom-input"]');

  // region: actions ---------------------------------------------------
  const submitForm = async () => {
    const form = document.getElementById(TEST_FORM_ID);

    form.requestSubmit();

    // Submit form waits for a tick
    await nextTick();
  };

  // region: setup -----------------------------------------------------
  beforeEach(() => {
    document.body.innerHTML = `<form id="${TEST_FORM_ID}"></form>`;
  });

  // region: tests -----------------------------------------------------
  describe('default', () => {
    beforeEach(() => {
      createComponent();
    });

    it('renders form groups for each field', () => {
      expect(findFormGroupsAsData()).toStrictEqual([
        {
          label: TEST_FIELDS.username.label,
          state: undefined,
          invalidFeedback: '',
          class: undefined,
          input: {
            id: expect.stringMatching(/gl-form-field-\d+/),
            type: 'text',
            value: '',
          },
        },
        {
          label: TEST_FIELDS.evenCount.label,
          state: undefined,
          invalidFeedback: '',
          class: TEST_FIELDS.evenCount.groupAttrs.class,
          input: {
            id: expect.stringMatching(/gl-form-field-\d+/),
            value: '0',
            ...TEST_FIELDS.evenCount.inputAttrs,
          },
        },
        {
          label: TEST_FIELDS.allCaps.label,
          state: undefined,
          invalidFeedback: '',
          class: undefined,
          input: {
            value: '',
            type: 'text',
            id: expect.stringMatching(/gl-form-field-\d+/),
          },
        },
        {
          label: TEST_FIELDS.fieldWithCustomId.label,
          state: undefined,
          invalidFeedback: '',
          class: undefined,
          input: {
            id: 'custom-id',
            type: 'text',
            value: '',
          },
        },
        {
          label: TEST_FIELDS.fieldset.label,
          state: undefined,
          invalidFeedback: '',
          class: undefined,
          input: {
            value: '',
            type: 'text',
            id: expect.stringMatching(/gl-form-field-\d+/),
          },
        },
      ]);
    });

    describe('when component re-renders', () => {
      it('does not change the input id attributes', async () => {
        const input = findInputFromLabel(TEST_FIELDS.username.label);
        const inputIdAttribute = input.attributes('id');

        await wrapper.setProps({ fields: { ...TEST_FIELDS, newField: { label: 'New field' } } });

        expect(inputIdAttribute).toBe(input.attributes('id'));
      });
    });

    it('emits initial values on mount', () => {
      expect(wrapper.emitted('input')).toEqual([
        [
          {
            username: undefined,
            evenCount: 0,
            allCaps: undefined,
          },
        ],
      ]);
    });

    it('does not emit input-field', () => {
      expect(wrapper.emitted('input-field')).toBeUndefined();
    });

    it('does not emit submit', () => {
      expect(wrapper.emitted('submit')).toBeUndefined();
    });

    it('on field blur, it updates validation for field', async () => {
      const input = findInputFromLabel(TEST_FIELDS.username.label);
      input.vm.$emit('blur');

      await nextTick();

      expect(wrapper.emitted('field-validation')).toEqual([
        [
          {
            fieldName: 'username',
            invalidFeedback: 'User name is required',
            state: false,
          },
        ],
      ]);

      expect(findFormGroupsAsData()).toMatchObject([
        {
          label: TEST_FIELDS.username.label,
          invalidFeedback: 'User name is required',
        },
        // why: Include others fields to assert that the validation is not run for them
        {
          label: TEST_FIELDS.evenCount.label,
          invalidFeedback: '',
        },
        {
          label: TEST_FIELDS.allCaps.label,
          invalidFeedback: '',
        },
        {
          label: TEST_FIELDS.fieldWithCustomId.label,
          invalidFeedback: '',
        },
        {
          label: TEST_FIELDS.fieldset.label,
          invalidFeedback: '',
        },
      ]);
    });

    describe('on field input', () => {
      beforeEach(() => {
        const input = findInputFromLabel(TEST_FIELDS.username.label);
        input.vm.$emit('input', 'New value');
      });

      it('emits input event', () => {
        expect(wrapper.emitted('input')).toEqual([
          // Initial value we already test here
          expect.anything(),
          // New emitted event
          [
            {
              username: 'New value',
            },
          ],
        ]);
      });

      it('emits input-field event', () => {
        expect(wrapper.emitted('input-field')).toEqual([
          [
            {
              name: 'username',
              value: 'New value',
            },
          ],
        ]);
      });
    });

    describe('when form submits', () => {
      beforeEach(async () => {
        await submitForm();
      });

      it('runs validations', () => {
        expect(findFormGroupsAsData()).toEqual([
          {
            label: TEST_FIELDS.username.label,
            invalidFeedback: 'User name is required',
            state: undefined,
            class: undefined,
            input: expect.objectContaining({
              value: '',
              id: expect.stringMatching(/gl-form-field-\d+/),
            }),
          },
          {
            label: TEST_FIELDS.evenCount.label,
            invalidFeedback: 'Count is required',
            state: undefined,
            class: TEST_FIELDS.evenCount.groupAttrs.class,
            input: expect.objectContaining({
              value: '0',
              id: expect.stringMatching(/gl-form-field-\d+/),
            }),
          },
          {
            label: TEST_FIELDS.allCaps.label,
            invalidFeedback: '',
            state: undefined,
            class: undefined,
            input: expect.objectContaining({
              value: '',
              id: expect.stringMatching(/gl-form-field-\d+/),
            }),
          },
          {
            label: TEST_FIELDS.fieldWithCustomId.label,
            invalidFeedback: '',
            state: undefined,
            class: undefined,
            input: expect.objectContaining({
              value: '',
              id: 'custom-id',
            }),
          },
          {
            label: TEST_FIELDS.fieldset.label,
            invalidFeedback: '',
            state: undefined,
            class: undefined,
            input: expect.objectContaining({
              value: '',
              id: expect.stringMatching(/gl-form-field-\d+/),
            }),
          },
        ]);
      });

      it('emits field-validation for each input', () => {
        expect(wrapper.emitted('field-validation')).toEqual([
          [
            {
              fieldName: 'username',
              invalidFeedback: 'User name is required',
              state: false,
            },
          ],
          [
            {
              fieldName: 'evenCount',
              invalidFeedback: 'Count is required',
              state: false,
            },
          ],
        ]);
      });

      it('does not emit submit', () => {
        expect(wrapper.emitted('submit')).toBeUndefined();
      });
    });
  });

  // why: Let's test that multiple validators work as expected
  describe('with non-empty but invalid "count"', () => {
    beforeEach(() => {
      createComponent({
        values: {
          evenCount: 7,
        },
      });
    });

    it('on blur, it runs remaining validators for "count" field', async () => {
      const input = findInputFromLabel(TEST_FIELDS.evenCount.label);
      input.vm.$emit('blur');

      await nextTick();

      expect(findFormGroupsAsData().find((x) => x.label === TEST_FIELDS.evenCount.label)).toEqual({
        label: TEST_FIELDS.evenCount.label,
        invalidFeedback: 'Count must be even',
        state: undefined,
        class: TEST_FIELDS.evenCount.groupAttrs.class,
        input: {
          ...TEST_FIELDS.evenCount.inputAttrs,
          id: expect.stringMatching(/gl-form-field-\d+/),
          value: '7',
        },
      });
    });
  });

  describe('with valid values', () => {
    beforeEach(() => {
      const values = cloneDeep(TEST_VALUES);

      createComponent({
        values,
      });
    });

    it('when form submits, emits submit', async () => {
      await submitForm();

      expect(wrapper.emitted('submit')).toEqual([[expect.any(Event)]]);
    });

    describe.each`
      fieldName      | inputValue   | expectedValue
      ${'allCaps'}   | ${'foo bar'} | ${'FOO BAR'}
      ${'evenCount'} | ${'123'}     | ${123}
    `(
      'when input ("$fieldName") with mapValue changes',
      ({ fieldName, inputValue, expectedValue }) => {
        beforeEach(() => {
          const input = findInputFromLabel(TEST_FIELDS[fieldName].label);
          input.vm.$emit('input', inputValue);
        });

        it('emits input with mapped value', () => {
          expect(wrapper.emitted('input')).toEqual([
            // Ignore initial inputted value (already tested)
            expect.anything(),
            [
              {
                ...TEST_VALUES,
                [fieldName]: expectedValue,
              },
            ],
          ]);
        });

        it('emits input-field with mapped value', () => {
          expect(wrapper.emitted('input-field')).toEqual([
            [
              {
                name: fieldName,
                value: expectedValue,
              },
            ],
          ]);
        });
      },
    );

    describe('when there is a server validation message', () => {
      beforeEach(async () => {
        await submitForm();

        wrapper.setProps({
          serverValidations: { username: 'Username has already been taken.' },
        });
      });

      it('renders error message', () => {
        expect(
          findFormGroupFromLabel(TEST_FIELDS.username.label).attributes('invalid-feedback'),
        ).toBe('Username has already been taken.');
      });
    });
  });

  describe('with input scoped slot', () => {
    beforeEach(() => {
      createComponent(
        {
          values: {
            evenCount: 5,
          },
        },
        {
          scopedSlots: {
            'input(evenCount)':
              '<button data-testid="test-custom-input" @click="props.input(props.value + 1)" @blur="props.blur">{{ props.value }}</button>',
          },
        },
      );
    });

    it('renders scoped slot for field input', () => {
      expect(findInputFromLabel(TEST_FIELDS.evenCount.label).exists()).toBe(false);
      expect(findCustomInputFromLabel(TEST_FIELDS.evenCount.label).exists()).toBe(true);
    });

    it('passes down "blur" callback', async () => {
      // what: We'll test this by emitting the "blur" we attached in the scopedSlot
      //       and asserting that validation was ran.
      expect(
        findFormGroupFromLabel(TEST_FIELDS.evenCount.label).attributes('invalid-feedback'),
      ).toBe('');

      findCustomInputFromLabel(TEST_FIELDS.evenCount.label).trigger('blur');
      await nextTick();

      expect(
        findFormGroupFromLabel(TEST_FIELDS.evenCount.label).attributes('invalid-feedback'),
      ).toBe('Count must be even');
    });

    it('passes down "input" callback', () => {
      // what: We'll test this by checking that the input-field event
      //       is emitted when triggered by our scoped slot.
      expect(wrapper.emitted('input-field')).toBeUndefined();

      findCustomInputFromLabel(TEST_FIELDS.evenCount.label).trigger('click');

      expect(wrapper.emitted('input-field')).toEqual([[{ name: 'evenCount', value: 6 }]]);
    });

    it('passes down "value"', () => {
      expect(findCustomInputFromLabel(TEST_FIELDS.evenCount.label).text()).toEqual('5');
    });
  });

  describe('with form group scoped slots', () => {
    it('renders description slot', () => {
      createComponent(
        {},
        {
          scopedSlots: {
            'group(username)-description': '<div data-testid="group-description-slot"></div>',
          },
        },
        mount,
      );

      expect(
        findFormGroupFromLabel(TEST_FIELDS.username.label)
          .find('[data-testid="group-description-slot"]')
          .exists(),
      ).toBe(true);
    });

    it('renders label slot', () => {
      createComponent(
        {},
        {
          scopedSlots: {
            'group(username)-label': `<div data-testid="group-label-slot">${TEST_FIELDS.username.label}</div>`,
          },
        },
        mount,
      );

      expect(
        wrapper
          .findAllComponents(GlFormGroup)
          .wrappers.find((x) => x.text().includes(TEST_FIELDS.username.label))
          .find('[data-testid="group-label-slot"]')
          .exists(),
      ).toBe(true);
    });

    it('renders label description slot', () => {
      createComponent(
        {},
        {
          scopedSlots: {
            'group(username)-label-description':
              '<div data-testid="group-label-description-slot"></div>',
          },
        },
        mount,
      );

      expect(
        findFormGroupFromLabel(TEST_FIELDS.username.label)
          .find('[data-testid="group-label-description-slot"]')
          .exists(),
      ).toBe(true);
    });
  });

  describe('label prop', () => {
    it('is null suppresses the label', () => {
      createComponent(
        {
          fields: {
            username: {
              label: null,
              validators: [formValidators.required('User name is required')],
            },
          },
        },
        {},
        mount,
      );

      expect(wrapper.find('label').exists()).toBe(false);
    });

    it('is not provided falls back to field name', () => {
      createComponent(
        {
          fields: {
            username: {},
          },
        },
        {},
        mount,
      );

      expect(findFormGroupFromLabel('username').exists()).toBe(true);
    });

    it('is undefined falls back to field name', () => {
      createComponent(
        {
          fields: { username: { label: undefined } },
        },
        {},
        mount,
      );

      expect(findFormGroupFromLabel('username').exists()).toBe(true);
    });

    it('is a non-empty string', () => {
      createComponent(
        {
          fields: {
            username: {
              label: 'Custom Username Label',
            },
          },
        },
        {},
        mount,
      );

      expect(findFormGroupFromLabel('Custom Username Label').exists()).toBe(true);
    });

    it('is an empty string falls back to fieldName', () => {
      createComponent(
        {
          fields: { username: { label: '' } },
        },
        {},
        mount,
      );

      expect(findFormGroupFromLabel('username').exists()).toBe(true);
    });
  });

  describe('with after slot', () => {
    beforeEach(() => {
      createComponent(
        {},
        {
          scopedSlots: {
            'after(username)': '<div data-testid="after-slot"></div>',
          },
        },
      );
    });

    it('renders after slot', () => {
      expect(
        findFormGroupFromLabel(TEST_FIELDS.username.label).element.nextElementSibling.getAttribute(
          'data-testid',
        ),
      ).toBe('after-slot');
    });
  });

  // why: We have to do some manual reactivity to optimize how often we call
  //      field validators. Let's test that here.
  describe('validation performance', () => {
    let validationSpy;

    beforeEach(async () => {
      validationSpy = jest.fn().mockReturnValue('Not valid!');

      createComponent({
        fields: mapValues(TEST_FIELDS, (field) => ({
          ...field,
          validators: [validationSpy],
        })),
      });

      // Trigger validation on all fields so that the fields are "dirty"
      await submitForm();

      // Clear validationSpy so we can assert on *new* validation calls
      validationSpy.mockClear();
    });

    it('when input changes, only triggers validation for changed value', async () => {
      expect(validationSpy).not.toHaveBeenCalled();

      wrapper.setProps({ values: { username: 'root' } });
      await nextTick();

      expect(validationSpy).toHaveBeenCalledTimes(1);
      expect(validationSpy).toHaveBeenCalledWith('root');
    });
  });

  describe('validateOnBlur prop', () => {
    describe('when validateOnBlur is true (default)', () => {
      beforeEach(() => {
        createComponent();
      });

      it('validates field on blur', async () => {
        const input = findInputFromLabel(TEST_FIELDS.username.label);
        input.vm.$emit('blur');

        await nextTick();

        expect(wrapper.emitted('field-validation')).toEqual([
          [
            {
              fieldName: 'username',
              invalidFeedback: 'User name is required',
              state: false,
            },
          ],
        ]);

        expect(findFormGroupsAsData()).toMatchObject([
          {
            label: TEST_FIELDS.username.label,
            invalidFeedback: 'User name is required',
          },
          // why: Include others fields to assert that the validation is not run for them
          {
            label: TEST_FIELDS.evenCount.label,
            invalidFeedback: '',
          },
          {
            label: TEST_FIELDS.allCaps.label,
            invalidFeedback: '',
          },
          {
            label: TEST_FIELDS.fieldWithCustomId.label,
            invalidFeedback: '',
          },
          {
            label: TEST_FIELDS.fieldset.label,
            invalidFeedback: '',
          },
        ]);
      });
    });

    describe('when validateOnBlur is false', () => {
      beforeEach(() => {
        createComponent({ validateOnBlur: false });
      });

      it('does not validate field on blur', async () => {
        const input = findInputFromLabel(TEST_FIELDS.username.label);
        input.vm.$emit('blur');

        await nextTick();

        expect(wrapper.emitted('field-validation')).toBeUndefined();

        expect(findFormGroupsAsData()).toMatchObject([
          {
            label: TEST_FIELDS.username.label,
            invalidFeedback: '',
          },
          {
            label: TEST_FIELDS.evenCount.label,
            invalidFeedback: '',
          },
          {
            label: TEST_FIELDS.allCaps.label,
            invalidFeedback: '',
          },
          {
            label: TEST_FIELDS.fieldWithCustomId.label,
            invalidFeedback: '',
          },
          {
            label: TEST_FIELDS.fieldset.label,
            invalidFeedback: '',
          },
        ]);
      });
    });
  });

  describe('when multiple fields emit input event in rapid succession', () => {
    it('batches emitting input event', async () => {
      const ParentComponent = {
        name: 'ParentComponent',
        TEST_FIELDS,
        TEST_FORM_ID,
        components: { GlFormFields },
        data() {
          return { formValues: {} };
        },
        template:
          '<gl-form-fields v-model="formValues" :fields="$options.TEST_FIELDS" :form-id="$options.TEST_FORM_ID" />',
      };

      wrapper = mount(ParentComponent);
      const formFieldsComponent = wrapper.findComponent(GlFormFields);

      await nextTick();

      const userNameInput = findInputFromLabel('User name');
      const allCapsInput = findInputFromLabel('All caps (optional)');
      const fieldWithCustomIdInput = findInputFromLabel('Field with custom ID');

      userNameInput.setValue('foo');
      allCapsInput.setValue('bar');
      fieldWithCustomIdInput.setValue('baz');

      // Wait for `input` event
      await nextTick();
      // Wait for `values` prop to be updated
      await nextTick();

      expect(formFieldsComponent.props('values')).toMatchObject({
        username: 'foo',
        evenCount: 0,
        allCaps: 'BAR',
        fieldWithCustomId: 'baz',
      });
    });
  });

  describe('with fieldset property', () => {
    it('does not bind label-for prop on form group when fieldset is true', () => {
      createComponent();
      expect(
        findFormGroupFromLabel(TEST_FIELDS.fieldset.label).attributes('label-for'),
      ).toBeUndefined();
    });

    it('binds label-for prop on form group when fieldset is undefined', () => {
      createComponent();
      expect(findFormGroupFromLabel(TEST_FIELDS.username.label).attributes('label-for')).toMatch(
        /gl-form-field-\d+/,
      );
    });
  });
});
