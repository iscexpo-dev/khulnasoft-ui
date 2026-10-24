import Vue, { nextTick } from 'vue';
import { mount } from '@vue/test-utils';
import { TEST_HOST } from '../../../../tests/__helpers__/constants';
import { GlToastPlugin } from '.';

Vue.use(GlToastPlugin);
const Component = {
  template: `<div />`,
};

function cleanupDom() {
  document.body.querySelectorAll('.gl-toast').forEach((el) => el.remove());
  document.body.querySelectorAll('.b-toaster').forEach((el) => el.remove());
}

async function waitForRender() {
  // Two ticks are needed: one for Vue to process the reactive toasts array
  // change, and one for MountingPortal to render the content into document.body.
  await nextTick();
  await nextTick();
}

describe('GlToast', () => {
  let wrapper;

  const findToasts = () => document.body.querySelectorAll('.gl-toast');

  async function showToast(message = 'foo', options) {
    const toast = wrapper.vm.$toast.show(message, options);
    await waitForRender();
    return toast;
  }

  beforeEach(() => {
    cleanupDom();
    wrapper = mount(Component);
  });

  afterEach(() => {
    cleanupDom();
  });

  it('attaches $toast property', () => {
    expect(wrapper.vm.$toast).toEqual({
      show: expect.any(Function),
    });
  });

  it('shows a toast', async () => {
    expect(findToasts()).toHaveLength(0);

    const toast = await showToast();
    expect(toast).toEqual({
      id: expect.any(String),
      hide: expect.any(Function),
    });

    expect(findToasts()).toHaveLength(1);
  });

  it('renders the message in the toast body', async () => {
    await showToast('hello world');

    const toastBody = document.querySelector('.toast-body');
    expect(toastBody.textContent).toBe('hello world');
  });

  it('has correct accessibility attributes', async () => {
    const { id } = await showToast();

    const outer = document.getElementById(`${id}_toast_outer`);
    expect(outer.getAttribute('role')).toBe('status');
    expect(outer.getAttribute('aria-live')).toBe('polite');
    expect(outer.getAttribute('aria-atomic')).toBe('true');
  });

  describe('action', () => {
    it('shows href', async () => {
      expect(findToasts()).toHaveLength(0);

      const onClick = jest.fn();
      const href = '/link';
      const text = 'action';

      const { id } = await showToast('with action', {
        action: {
          onClick,
          href,
          text,
        },
      });

      const toast = document.getElementById(id);
      const action = toast.querySelector('a');
      action.click();
      expect(onClick).toHaveBeenCalled();
      expect(action.href).toBe(`${TEST_HOST}${href}`);
      expect(action.textContent).toBe(text);
      expect(action.role).toBe(null);
    });

    it('shows button', async () => {
      expect(findToasts()).toHaveLength(0);

      const onClick = jest.fn();
      const text = 'action';

      const { id } = await showToast('with action', {
        action: {
          onClick,
          text,
        },
      });

      const toast = document.getElementById(id);
      const action = toast.querySelector('a');
      action.click();
      expect(onClick).toHaveBeenCalled();
      expect(action.textContent).toBe(text);
      expect(action.role).toBe('button');
    });
  });

  it('closes the toast when clicking on the close button', async () => {
    await showToast();

    const toasts = findToasts();
    expect(toasts).toHaveLength(1);

    const closeButton = toasts[0].querySelector('.gl-toast-close-button');
    expect(closeButton).not.toBeNull();

    closeButton.click();
    await waitForRender();

    expect(findToasts()).toHaveLength(0);
  });

  it('hides programmatically via toast.hide()', async () => {
    const toast = await showToast();
    expect(findToasts()).toHaveLength(1);

    toast.hide();
    await waitForRender();
    expect(findToasts()).toHaveLength(0);
  });

  it('stacks multiple toasts', async () => {
    await showToast('first');
    await showToast('second');
    await showToast('third');

    expect(findToasts()).toHaveLength(3);
  });

  describe('auto-hide timer', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('auto-hides after default delay', async () => {
      await showToast();
      expect(findToasts()).toHaveLength(1);

      jest.advanceTimersByTime(4999);
      await waitForRender();
      expect(findToasts()).toHaveLength(1);

      jest.advanceTimersByTime(1);
      await waitForRender();
      expect(findToasts()).toHaveLength(0);
    });

    it('respects custom autoHideDelay', async () => {
      await showToast('custom', { autoHideDelay: 2000 });
      expect(findToasts()).toHaveLength(1);

      jest.advanceTimersByTime(1999);
      await waitForRender();
      expect(findToasts()).toHaveLength(1);

      jest.advanceTimersByTime(1);
      await waitForRender();
      expect(findToasts()).toHaveLength(0);
    });

    it('enforces minimum duration of 1000ms', async () => {
      await showToast('short', { autoHideDelay: 100 });
      expect(findToasts()).toHaveLength(1);

      jest.advanceTimersByTime(999);
      await waitForRender();
      expect(findToasts()).toHaveLength(1);

      jest.advanceTimersByTime(1);
      await waitForRender();
      expect(findToasts()).toHaveLength(0);
    });
  });

  describe('hover pause/resume', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('pauses auto-hide on mouseenter and resumes on mouseleave', async () => {
      await showToast();
      const toastEl = findToasts()[0];
      expect(findToasts()).toHaveLength(1);

      jest.advanceTimersByTime(3000);
      toastEl.dispatchEvent(new MouseEvent('mouseenter'));

      jest.advanceTimersByTime(10000);
      await waitForRender();
      expect(findToasts()).toHaveLength(1);

      toastEl.dispatchEvent(new MouseEvent('mouseleave'));

      jest.advanceTimersByTime(1999);
      await waitForRender();
      expect(findToasts()).toHaveLength(1);

      jest.advanceTimersByTime(1);
      await waitForRender();
      expect(findToasts()).toHaveLength(0);
    });
  });

  describe('onComplete callback', () => {
    it('calls onComplete callback when toast is hidden', async () => {
      const onCompleteSpy = jest.fn();
      const toast = await showToast('foo', { onComplete: onCompleteSpy });

      expect(onCompleteSpy).not.toHaveBeenCalled();

      toast.hide();
      await waitForRender();
      expect(onCompleteSpy).toHaveBeenCalledTimes(1);
      expect(onCompleteSpy).toHaveBeenCalledWith({ componentId: toast.id });
    });

    describe('on auto-hide', () => {
      beforeEach(() => {
        jest.useFakeTimers();
      });

      afterEach(() => {
        jest.useRealTimers();
      });

      it('calls onComplete on auto-hide', async () => {
        const onCompleteSpy = jest.fn();
        await showToast('foo', { onComplete: onCompleteSpy });

        jest.advanceTimersByTime(5000);
        await waitForRender();
        expect(onCompleteSpy).toHaveBeenCalledTimes(1);
      });
    });

    it('does not call onComplete more than once', async () => {
      const onCompleteSpy = jest.fn();
      const toast = await showToast('foo', { onComplete: onCompleteSpy });

      toast.hide();
      await waitForRender();
      toast.hide();
      await waitForRender();
      expect(onCompleteSpy).toHaveBeenCalledTimes(1);
    });
  });
});
