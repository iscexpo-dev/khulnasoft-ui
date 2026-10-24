import { mount, shallowMount } from '@vue/test-utils';
import { BFormGroup } from '../../../../vendor/bootstrap-vue/src/components/form-group/form-group';
import GlFormGroup from './form_group.vue';

describe('Form group component', () => {
  let wrapper;

  const findByTestId = (testId) => wrapper.find(`[data-testid="${testId}"]`);

  const findLabelDescription = () => findByTestId('label-description');
  const findOptionalLabel = () => findByTestId('optional-label');
  const findLabel = () => wrapper.find('label');

  const createComponent = (options) => {
    wrapper = shallowMount(GlFormGroup, {
      ...options,
      stubs: { BFormGroup },
      attrs: {
        label: 'Test label',
        ...options?.attrs,
      },
    });
  };

  it('provides getFormGroupInstance function that returns the component instance', () => {
    let instance;

    wrapper = mount(GlFormGroup, {
      slots: {
        default: {
          inject: ['getFormGroupInstance'],
          render() {
            instance = this.getFormGroupInstance();
            return null;
          },
        },
      },
    });

    expect(instance).toBe(wrapper.vm);
  });

  it.each`
    labelClass                      | expectedProp
    ${'additional-class'}           | ${'additional-class col-form-label'}
    ${['additional-class']}         | ${['additional-class', 'col-form-label']}
    ${{ 'additional-class': true }} | ${{ 'additional-class': true, 'col-form-label': true }}
    ${undefined}                    | ${'col-form-label'}
  `(
    'computed label class is $expectedProp when labelClass is $labelClass',
    ({ labelClass, expectedProp }) => {
      createComponent({
        propsData: {
          labelClass,
        },
      });

      expect(wrapper.findComponent(BFormGroup).props('labelClass')).toEqual(expectedProp);
    },
  );

  describe('label rendering', () => {
    it('renders label element when $attrs.label is provided', () => {
      createComponent({
        attrs: { label: 'Test label from attrs', 'label-for': 'test-id' },
      });

      expect(findLabel().exists()).toBe(true);
      expect(findLabel().text()).toContain('Test label from attrs');
    });

    it('renders label element when label slot is provided', () => {
      createComponent({
        slots: { label: 'Test label from slot' },
        attrs: { 'label-for': 'test-id' },
      });

      expect(findLabel().exists()).toBe(true);
      expect(findLabel().text()).toContain('Test label from slot');
    });

    it('renders label element when both $attrs.label and label slot are provided (slot takes precedence)', () => {
      createComponent({
        slots: { label: 'Label from slot' },
        attrs: { label: 'Label from attrs', 'label-for': 'test-id' },
      });

      expect(findLabel().exists()).toBe(true);
      expect(findLabel().text()).toContain('Label from slot');
      expect(findLabel().text()).not.toContain('Label from attrs');
    });

    it('does not render label element when neither $attrs.label nor label slot is provided', () => {
      createComponent();

      expect(findLabel().exists()).toBe(false);
    });
  });

  describe('label-description slot', () => {
    const labelDescriptionFromPropOptions = {
      propsData: { labelDescription: 'label-description from props' },
      attrs: { label: 'Test label' },
    };
    const labelDescriptionFromSlotOptions = {
      slots: { 'label-description': 'label-description from slots' },
      attrs: { label: 'Test label' },
    };

    it.each`
      labelDescriptionFrom | options
      ${'prop'}            | ${labelDescriptionFromPropOptions}
      ${'prop'}            | ${labelDescriptionFromPropOptions}
      ${'slot'}            | ${labelDescriptionFromSlotOptions}
      ${'slot'}            | ${labelDescriptionFromSlotOptions}
    `(
      'when label-description is provided from $labelDescriptionFrom',
      ({ labelDescriptionFrom, options }) => {
        createComponent({
          ...options,
        });

        expect(findLabelDescription().text()).toContain(
          `label-description from ${labelDescriptionFrom}`,
        );
      },
    );
  });

  describe('label slot', () => {
    const labelFromPropOptions = {
      propsData: { label: 'label from props' },
    };
    const labelFromSlotOptions = {
      slots: { label: 'label from slots' },
    };

    it.each`
      labelFrom | options                 | optional | expectedOptional
      ${'prop'} | ${labelFromPropOptions} | ${true}  | ${true}
      ${'prop'} | ${labelFromPropOptions} | ${false} | ${false}
      ${'slot'} | ${labelFromSlotOptions} | ${true}  | ${false}
      ${'slot'} | ${labelFromSlotOptions} | ${false} | ${false}
    `(
      'when label is provided from $labelFrom, `optional` is $optional',
      ({ labelFrom, options, optional, expectedOptional }) => {
        createComponent({
          ...options,
          propsData: {
            ...options.propsData,
            optional,
          },
        });

        expect(wrapper.text()).toContain(`label from ${labelFrom}`);
        expect(findOptionalLabel().exists()).toBe(expectedOptional);
      },
    );

    it('renders optionalText when `optional` is true', () => {
      const optionalText = '(not required)';

      createComponent({
        propsData: {
          optional: true,
          optionalText,
        },
        attrs: { label: 'Test label' },
      });

      expect(findOptionalLabel().text()).toBe(optionalText);
    });
  });
});
