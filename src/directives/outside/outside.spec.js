import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import { merge } from 'lodash-es';
import { OutsideDirective } from './outside';

describe('outside directive', () => {
  let wrapper;
  let onClick;
  let onFocusin;

  const find = (testid) => wrapper.find(`[data-testid="${testid}"]`);

  const defaultTemplate = `
    <div data-testid="outside">
      <div v-outside="onClick" data-testid="bound">
        <div data-testid="inside"></div>
      </div>
      <button v-outside.focusin="onFocusin" data-testid="bound-focusin">
        <span data-testid="inside-focusin" tabindex="0"></span>
      </button>
    </div>
  `;

  const createComponent = async (component) => {
    wrapper = mount(
      merge(
        {
          directives: {
            outside: OutsideDirective,
          },
          methods: {
            onClick,
            onFocusin,
          },
          template: defaultTemplate,
        },
        component,
      ),
      {
        attachTo: document.body,
      },
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
    onClick = jest.fn();
    onFocusin = jest.fn();
  });

  describe('given a callback for click', () => {
    it.each`
      target       | expectedCalls
      ${'outside'} | ${[[expect.any(MouseEvent)]]}
      ${'bound'}   | ${[]}
      ${'inside'}  | ${[]}
    `(
      'is called with $expectedCalls when clicking on $target element',
      async ({ target, expectedCalls }) => {
        await createComponent();

        find(target).trigger('click');

        expect(onClick.mock.calls).toEqual(expectedCalls);
      },
    );
  });

  describe('given a callback for focusin', () => {
    it.each`
      target              | expectedCalls
      ${'outside'}        | ${[[expect.any(FocusEvent)]]}
      ${'bound-focusin'}  | ${[]}
      ${'inside-focusin'} | ${[]}
    `(
      'is called with $expectedCalls when focusing on $target element',
      async ({ target, expectedCalls }) => {
        await createComponent();

        find(target).trigger('focusin');

        expect(onFocusin.mock.calls).toEqual(expectedCalls);
      },
    );
  });

  describe('given multiple instances', () => {
    let onClickSibling;

    beforeEach(async () => {
      onClickSibling = jest.fn();

      await createComponent({
        methods: {
          onClickSibling,
        },
        template: `
          <div data-testid="outside">
            <div v-outside="onClick" data-testid="first"></div>
            <div v-outside="onClickSibling" data-testid="sibling"></div>
          </div>
        `,
      });
    });

    it.each`
      target       | onClickCalls                  | onClickSiblingCalls
      ${'outside'} | ${[[expect.any(MouseEvent)]]} | ${[[expect.any(MouseEvent)]]}
      ${'first'}   | ${[]}                         | ${[[expect.any(MouseEvent)]]}
      ${'sibling'} | ${[[expect.any(MouseEvent)]]} | ${[]}
    `(
      'calls the expected callbacks when $target is clicked',
      ({ target, onClickCalls, onClickSiblingCalls }) => {
        find(target).trigger('click');

        expect(onClick.mock.calls).toEqual(onClickCalls);
        expect(onClickSibling.mock.calls).toEqual(onClickSiblingCalls);
      },
    );
  });

  describe('global event binding', () => {
    beforeEach(() => {
      jest.spyOn(document, 'addEventListener');
      jest.spyOn(document, 'removeEventListener');
    });

    it('throws if not passed a callback', async () => {
      await expect(
        createComponent({
          data: () => ({ foo: null }),
          template: '<div v-outside="foo"></div>',
        }),
      ).rejects.toThrow('must be a function');

      expect(wrapper).toHaveLoggedVueErrors();
      expect(document.addEventListener).not.toHaveBeenCalled();
    });

    it('throws if passed an argument', async () => {
      await expect(
        createComponent({
          template: '<div v-outside:click="onFocusin"></div>',
        }),
      ).rejects.toThrow('Arguments are not supported.');

      expect(wrapper).toHaveLoggedVueErrors();
      expect(document.addEventListener).not.toHaveBeenCalled();
    });

    it('attaches the global listener when binding', async () => {
      await createComponent();

      expect(document.addEventListener).toHaveBeenCalledTimes(4);
      expect(document.addEventListener.mock.calls[0][0]).toBe('mousedown');
      expect(document.addEventListener.mock.calls[1][0]).toBe('mouseup');
      expect(document.addEventListener.mock.calls[2][0]).toBe('click');
      expect(document.addEventListener.mock.calls[3][0]).toBe('focusin');
    });

    it('detaches the global listener when last binding is removed', async () => {
      await createComponent();

      wrapper.destroy();

      document.body.dispatchEvent(new MouseEvent('click'));

      expect(onClick).not.toHaveBeenCalled();

      expect(document.removeEventListener).toHaveBeenCalledTimes(4);
      expect(document.removeEventListener.mock.calls[0]).toEqual([
        'click',
        expect.any(Function),
        { capture: true },
      ]);
      expect(document.removeEventListener.mock.calls[1][0]).toBe('focusin');
      expect(document.removeEventListener.mock.calls[2][0]).toBe('mousedown');
      expect(document.removeEventListener.mock.calls[3][0]).toBe('mouseup');
    });

    it('only unbinds once there are no instances', async () => {
      await createComponent({
        data: () => ({
          instances: 2,
        }),
        template: `
          <div>
            <div v-if="instances >= 1" v-outside="onClick"></div>
            <div v-if="instances >= 2" v-outside="onClick"></div>
          </div>
        `,
      });

      wrapper.setData({ instances: 1 });
      await nextTick();

      document.body.dispatchEvent(new MouseEvent('click'));

      expect(onClick).toHaveBeenCalledTimes(1);

      wrapper.setData({ instances: 0 });
      await nextTick();

      document.body.dispatchEvent(new MouseEvent('click'));

      expect(onClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('given modifiers', () => {
    beforeEach(() => {
      jest.spyOn(document, 'addEventListener');
    });

    const templateWitModifiersForFocusIn = (eventTypes) => `
      <div data-testid='outside' tabindex='0'>
        <button v-outside.${eventTypes.join('.')}="onFocusin" data-testid='bound'>
          <span data-testid='inside' tabindex='0'></span>
        </button>
      </div>`;

    it('works with focusin', async () => {
      await createComponent({
        template: templateWitModifiersForFocusIn(['focusin'], onFocusin),
      });

      find('outside').trigger('focusin');

      expect(onFocusin.mock.calls).toEqual([[expect.any(FocusEvent)]]);
    });

    it('works with multiple event types', async () => {
      await createComponent({
        template: templateWitModifiersForFocusIn(['click', 'focusin']),
      });

      find('outside').trigger('focusin');
      find('outside').trigger('click');

      expect(onFocusin.mock.calls).toEqual([[expect.any(FocusEvent)], [expect.any(MouseEvent)]]);
    });

    it.each(['mousedown', 'keyup', 'foo'])(
      'does not work with any other event, like %s',
      async (eventType) => {
        await expect(
          createComponent({
            template: `<div data-testid="outside">
              <div v-outside.${eventType}="onClick" data-testid="bound"></div>
            </div>`,
          }),
        ).rejects.toThrow(`Cannot bind ${eventType} events`);

        expect(wrapper).toHaveLoggedVueErrors();
        expect(document.addEventListener).not.toHaveBeenCalled();
      },
    );

    it('only prints unsupported modifiers in the error message', async () => {
      await expect(
        createComponent({
          template: templateWitModifiersForFocusIn(['focusin', 'mouseup', 'click', 'mousedown']),
        }),
      ).rejects.toThrow(`Cannot bind mouseup, mousedown events`);

      expect(wrapper).toHaveLoggedVueErrors();
      expect(document.addEventListener).not.toHaveBeenCalled();
    });
  });

  describe('multiple instances on the same element', () => {
    let onClickInner;

    beforeEach(async () => {
      onClickInner = jest.fn();

      const HigherOrder = {
        directives: {
          outside: OutsideDirective,
        },
        methods: {
          onClickInner,
        },
        template: '<div v-outside="onClickInner"></div>',
      };

      await createComponent({
        components: {
          HigherOrder,
        },
        template: `
          <div data-testid="outside">
            <higher-order v-outside="onClick" />
          </div>
        `,
      });
    });

    it('calls only the inner-most instance', () => {
      find('outside').trigger('click');

      expect(onClickInner.mock.calls).toEqual([[expect.any(MouseEvent)]]);
      expect(onClick.mock.calls).toEqual([]);
    });
  });

  describe('given a callback that throws', () => {
    let onClickThrow;

    beforeEach(async () => {
      onClickThrow = jest.fn(() => {
        throw new Error('mock error');
      });

      jest.spyOn(global.console, 'error');
      await createComponent({
        methods: {
          onClickThrow,
        },
        template: `
          <div data-testid="outside">
            <div v-outside="onClickThrow" data-testid="sibling"></div>
            <div v-outside="onClick" data-testid="first"></div>
          </div>
        `,
      });

      find('outside').trigger('click');
    });

    it('still calls other listeners', () => {
      expect(onClick.mock.calls).toEqual([[expect.any(MouseEvent)]]);
    });

    it('logs the error to the console', () => {
      expect(onClickThrow).toHaveBeenCalledTimes(1);

      const thrownError = onClickThrow.mock.results[0].value;
      expect(global.console.error.mock.calls).toEqual([[thrownError]]);
    });
  });

  describe('mousedown before click', () => {
    it('respects mousedown event before click', async () => {
      await createComponent();

      find('inside').trigger('mousedown');
      find('outside').trigger('click');

      expect(onClick).not.toHaveBeenCalled();
    });

    it('respects mousedown event before a focusin fired on an unrelated element, mimicking Safari not focusing <button>s on click', async () => {
      await createComponent();

      find('inside-focusin').trigger('mousedown');
      find('outside').trigger('focusin');

      expect(onFocusin).not.toHaveBeenCalled();
    });

    it('still calls the callback for a focusin unrelated to any recent mousedown inside the bound element', async () => {
      await createComponent();

      find('outside').trigger('focusin');

      expect(onFocusin).toHaveBeenCalledTimes(1);
    });

    it('respects mousedown event before click, even when a focusin fires mid-selection', async () => {
      await createComponent();

      find('inside').trigger('mousedown');
      find('inside').trigger('focusin');
      find('outside').trigger('mouseup');
      find('outside').trigger('click');

      expect(onClick).not.toHaveBeenCalled();
    });

    it('ignores the mousedown event for a focusin fired after the mouse button was released', async () => {
      await createComponent();

      find('inside-focusin').trigger('mousedown');
      find('inside-focusin').trigger('mouseup');
      find('outside').trigger('focusin');

      expect(onFocusin).toHaveBeenCalledTimes(1);
    });

    it('does not call the callback for a focusin inside the element after a mousedown outside it', async () => {
      await createComponent();

      find('outside').trigger('mousedown');
      find('outside').trigger('mouseup');
      find('inside-focusin').trigger('focusin');

      expect(onFocusin).not.toHaveBeenCalled();
    });
  });
});
