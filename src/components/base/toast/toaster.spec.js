import { nextTick } from 'vue';
import { mount } from '@vue/test-utils';
import GlToaster from './toaster.vue';

describe('GlToaster', () => {
  let wrapper;

  const findToasts = () => document.body.querySelectorAll('.gl-toast');
  const findToasterSlot = () => document.body.querySelector('.b-toaster-slot');

  async function waitForRender() {
    await nextTick();
    await nextTick();
  }

  beforeEach(() => {
    wrapper = mount(GlToaster);
  });

  it('renders the toaster container into body via MountingPortal', async () => {
    await waitForRender();

    const toaster = document.body.querySelector('#gl-toaster');
    expect(toaster).not.toBeNull();
    expect(toaster.classList.contains('b-toaster')).toBe(true);
  });

  it('renders an empty slot initially', async () => {
    await waitForRender();

    expect(findToasterSlot()).not.toBeNull();
    expect(findToasts()).toHaveLength(0);
  });

  describe('addToast', () => {
    it('renders a toast when addToast is called', async () => {
      wrapper.vm.addToast({ id: 't1', message: 'hello' });
      await waitForRender();

      expect(findToasts()).toHaveLength(1);
    });

    it('renders multiple toasts in order', async () => {
      wrapper.vm.addToast({ id: 't1', message: 'first' });
      wrapper.vm.addToast({ id: 't2', message: 'second' });
      await waitForRender();

      const toasts = findToasts();
      expect(toasts).toHaveLength(2);
      expect(toasts[0].querySelector('.toast-body').textContent).toBe('first');
      expect(toasts[1].querySelector('.toast-body').textContent).toBe('second');
    });
  });

  describe('removeToast', () => {
    it('removes a toast by id', async () => {
      wrapper.vm.addToast({ id: 't1', message: 'one' });
      wrapper.vm.addToast({ id: 't2', message: 'two' });
      await waitForRender();
      expect(findToasts()).toHaveLength(2);

      wrapper.vm.removeToast('t1');
      await waitForRender();
      expect(findToasts()).toHaveLength(1);
      expect(findToasts()[0].querySelector('.toast-body').textContent).toBe('two');
    });

    it('calls onComplete when removing a toast', async () => {
      const onComplete = jest.fn();
      wrapper.vm.addToast({ id: 't1', message: 'one', onComplete });
      await waitForRender();

      wrapper.vm.removeToast('t1');
      await waitForRender();

      expect(onComplete).toHaveBeenCalledWith({ componentId: 't1' });
    });

    it('does nothing when removing a non-existent toast', async () => {
      wrapper.vm.addToast({ id: 't1', message: 'one' });
      await waitForRender();

      wrapper.vm.removeToast('non-existent');
      await waitForRender();
      expect(findToasts()).toHaveLength(1);
    });
  });

  describe('hideToast', () => {
    it('does nothing when there are no toasts', () => {
      expect(() => wrapper.vm.hideToast('non-existent')).not.toThrow();
    });

    it('triggers hide on the matching toast component', async () => {
      wrapper.vm.addToast({ id: 't1', message: 'one' });
      await waitForRender();
      expect(findToasts()).toHaveLength(1);

      wrapper.vm.hideToast('t1');
      await waitForRender();

      expect(findToasts()).toHaveLength(0);
    });
  });
});
