import { shallowMount } from '@vue/test-utils';
import GlBroadcastMessage from './broadcast_message.vue';
import { TYPE_NOTIFICATION } from './constants';

describe('Broadcast message component', () => {
  let wrapper;

  const createComponent = (propsData = {}) => {
    wrapper = shallowMount(GlBroadcastMessage, {
      slots: { default: 'some message' },
      propsData,
    });
  };

  const findDismissButton = () => wrapper.findComponent({ ref: 'dismiss' });

  it('clicking on dismiss button emits a dismiss event', () => {
    createComponent();
    findDismissButton().vm.$emit('click');
    expect(wrapper.emitted('dismiss')).toHaveLength(1);
  });

  it('dismiss button does not appear when dismissible is false', () => {
    createComponent({ dismissible: false });
    expect(findDismissButton().exists()).toBe(false);
  });

  it('dismiss button always appears for notification broadcast messages', () => {
    createComponent({ dismissible: false, type: TYPE_NOTIFICATION });
    expect(findDismissButton().exists()).toBe(true);
  });
});
