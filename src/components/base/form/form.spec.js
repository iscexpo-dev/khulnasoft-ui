import { mount } from '@vue/test-utils';
import Form from './form.vue';

describe('form component', () => {
  let wrapper;

  const createWrapper = (options) => {
    wrapper = mount(Form, options);
  };

  it('renders form with no classes', async () => {
    createWrapper();

    expect(wrapper.element.tagName).toBe('FORM');
    expect(wrapper.classes()).toHaveLength(0);
  });

  it('renders default slot content', async () => {
    createWrapper({
      slots: {
        default: 'foobar',
      },
    });

    expect(wrapper.text()).toEqual('foobar');
  });

  it('renders id attribute', async () => {
    createWrapper({
      attrs: {
        id: 'foo',
      },
    });

    expect(wrapper.attributes('id')).toEqual('foo');
  });

  it('renders novalidate attribute', async () => {
    createWrapper({
      attrs: {
        novalidate: true,
      },
    });

    expect(wrapper.attributes('novalidate')).toBeDefined();
  });

  it('emits submit event that can be prevented', () => {
    const onSubmit = jest.fn().mockImplementation((event) => {
      event.preventDefault();
    });
    const submitEvent = new Event('submit', {
      bubbles: true,
      cancelable: true,
    });
    const preventDefaultSpy = jest.spyOn(submitEvent, 'preventDefault');

    createWrapper({ listeners: { submit: onSubmit } });
    wrapper.find('form').element.dispatchEvent(submitEvent);

    expect(onSubmit).toHaveBeenCalled();
    expect(preventDefaultSpy).toHaveBeenCalled();
  });

  it('emits reset event that can be prevented', () => {
    const onReset = jest.fn().mockImplementation((event) => {
      event.preventDefault();
    });
    const submitEvent = new Event('reset', {
      bubbles: true,
      cancelable: true,
    });
    const preventDefaultSpy = jest.spyOn(submitEvent, 'preventDefault');

    createWrapper({ listeners: { reset: onReset } });
    wrapper.find('form').element.dispatchEvent(submitEvent);

    expect(onReset).toHaveBeenCalled();
    expect(preventDefaultSpy).toHaveBeenCalled();
  });
});
