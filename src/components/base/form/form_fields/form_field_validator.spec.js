import { mount } from '@vue/test-utils';
import GlFormFieldValidator from './form_field_validator.vue';
import { required } from './validators';

const TEST_VALUE = 'root';
const TEST_MESSAGE = 'this is a required field';

describe('GlFormFieldValidators', () => {
  let wrapper;

  const createWrapper = (props = {}) => {
    wrapper = mount(GlFormFieldValidator, {
      propsData: {
        value: TEST_VALUE,
        validators: [required(TEST_MESSAGE)],
        shouldValidate: true,
        ...props,
      },
    });
  };
  it('should call validators with value prop', () => {
    const validators = [jest.fn(), jest.fn(), jest.fn()];

    createWrapper({ validators });

    validators.forEach((validator) => expect(validator).toHaveBeenCalledWith(TEST_VALUE));
  });
  it('should not call validators when told not to', () => {
    const validators = [jest.fn(), jest.fn(), jest.fn()];

    createWrapper({ validators, shouldValidate: false });

    validators.forEach((validator) => expect(validator).not.toHaveBeenCalledWith(TEST_VALUE));
  });

  it('should not render anything ever forever', () => {
    createWrapper();

    expect(wrapper.html()).toBe('');
  });

  it('should emit update with result of validator', async () => {
    createWrapper();

    expect(wrapper.emitted('update')).toBeUndefined();

    await wrapper.setProps({ value: '' });

    expect(wrapper.emitted('update')).toEqual([[TEST_MESSAGE]]);
  });
});
