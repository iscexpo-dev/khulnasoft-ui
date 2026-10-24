import { mount } from '@vue/test-utils';
import GlLink from '../../link/link.vue';
import GlIcon from '../../icon/icon.vue';
import { ENTER, SPACE } from '../constants';
import { mockItems } from './mock_data';

import GlDisclosureDropdownItem from './disclosure_dropdown_item.vue';

describe('GlDisclosureDropdownItem', () => {
  let wrapper;

  const clone = (i) => JSON.parse(JSON.stringify(i));

  const buildWrapper = (propsData, slots = {}) => {
    wrapper = mount(GlDisclosureDropdownItem, {
      propsData,
      slots,
    });
  };
  const findItem = () => wrapper.find('[data-testid="disclosure-dropdown-item"]');

  const actionItem = mockItems.find((mockItem) => typeof mockItem.action !== 'undefined');

  describe('when default slot content provided', () => {
    const content = 'This is an item';
    const slots = { default: content };
    const item = clone(mockItems[1]);

    beforeEach(() => {
      buildWrapper({ item }, slots);
    });

    it('renders it', () => {
      expect(wrapper.text()).toContain(content);
    });

    it.each`
      trigger                                                 | event
      ${() => findItem().trigger('click')}                    | ${'click'}
      ${() => findItem().trigger('keydown', { code: ENTER })} | ${'ENTER'}
      ${() => findItem().trigger('keydown', { code: SPACE })} | ${'SPACE'}
    `(`$event should emit 'action' event`, ({ trigger }) => {
      trigger();
      const emittedAction = wrapper.emitted('action');
      expect(emittedAction).toHaveLength(1);
      expect(emittedAction).toEqual([[item]]);
    });

    it('sets tabIndex on li element', () => {
      expect(findItem().attributes('tabindex')).toBe('0');
    });
  });

  describe.each`
    prop      | mockItem
    ${'href'} | ${0}
    ${'to'}   | ${2}
  `('when item has a `$prop`', ({ prop, mockItem }) => {
    const item = mockItems[mockItem];

    beforeEach(() => {
      buildWrapper({ item });
    });

    const findLink = () => wrapper.findComponent(GlLink);

    it('should render a link', () => {
      expect(findLink().exists()).toBe(true);
    });

    it('should set correct class', () => {
      expect(findLink().classes()).toContain('gl-new-dropdown-item-content');
    });

    it('should set correct props', () => {
      expect(findLink().props(prop)).toBe(item[prop]);
    });

    it('should set correct attributes', () => {
      Object.entries(item.extraAttrs).forEach(([key, value]) => {
        expect(findLink().props(key) || findLink().attributes(key)).toBe(value);
      });
    });

    it('should apply the default classes to the item wrapper', () => {
      expect(findItem().classes()).toEqual(['gl-new-dropdown-item']);
    });

    it('should emit `action` on `click`', () => {
      findLink().trigger('click');
      const emittedAction = wrapper.emitted('action');
      expect(emittedAction).toHaveLength(1);
      expect(emittedAction).toEqual([[item]]);
    });

    it.each`
      trigger                                                 | event
      ${() => findItem().trigger('keydown', { code: ENTER })} | ${'ENTER'}
      ${() => findItem().trigger('keydown', { code: SPACE })} | ${'SPACE'}
    `(`$event on parent will execute 'action' event`, ({ trigger }) => {
      trigger();
      const emittedAction = wrapper.emitted('action');
      expect(emittedAction).toHaveLength(1);
      expect(emittedAction).toEqual([[item]]);
    });

    it('sets tabIndex on link element', () => {
      expect(findLink().attributes('tabindex')).toBe('-1');
    });
  });

  describe('when item has an `action`', () => {
    const action = jest.spyOn(actionItem, 'action');

    beforeEach(() => {
      buildWrapper({ item: actionItem });
      action.mockClear();
    });

    const findButton = () => wrapper.find('button[type="button"].gl-new-dropdown-item-content');

    it('should render a button', () => {
      expect(findButton().exists()).toBe(true);
    });

    it('should set correct attributes', () => {
      const attrs = { ...actionItem.extraAttrs };
      delete attrs.class;
      expect(findButton().classes()).toContain('gl-new-dropdown-item-content');
      expect(findButton().attributes()).toMatchObject(attrs);
    });

    it('should call `action` on `click` and emit `action` event', () => {
      findButton().trigger('click');
      expect(action).toHaveBeenCalledTimes(1);

      const actionThisArg = action.mock.contexts[0];
      expect(actionThisArg).toBe(undefined);

      const actionArgs = action.mock.calls[0];
      expect(actionArgs).toEqual([actionItem]);

      const emittedAction = wrapper.emitted('action');
      expect(emittedAction).toHaveLength(1);
      expect(emittedAction).toEqual([[actionItem]]);
    });

    it.each`
      trigger                                                 | event
      ${() => findItem().trigger('keydown', { code: ENTER })} | ${'ENTER'}
      ${() => findItem().trigger('keydown', { code: SPACE })} | ${'SPACE'}
    `(`$event on parent will execute action and emit 'action' event`, ({ trigger }) => {
      trigger();
      expect(action).toHaveBeenCalledTimes(1);
      expect(action.mock.calls[0]).toEqual([actionItem]);

      const emittedAction = wrapper.emitted('action');
      expect(emittedAction).toHaveLength(1);
      expect(emittedAction).toEqual([[actionItem]]);
    });

    it.each`
      variant      | expectedClasses
      ${'default'} | ${['gl-new-dropdown-item']}
      ${'danger'}  | ${['gl-new-dropdown-item', 'gl-new-dropdown-item-danger']}
    `(
      'should add the correct class when $variant variant is used',
      ({ variant, expectedClasses }) => {
        buildWrapper({
          item: {
            ...mockItems[0],
          },
          variant,
        });

        expect(findItem().classes()).toEqual(expectedClasses);
      },
    );

    it('sets tabIndex on link element', () => {
      expect(findButton().attributes('tabindex')).toBe('-1');
    });
  });

  describe('when item has an `icon`', () => {
    beforeEach(() => {
      buildWrapper({
        item: {
          text: 'item with icon',
          icon: 'close',
        },
      });
    });

    const findButton = () => wrapper.find('button[type="button"].gl-new-dropdown-item-content');

    it('should render an icon', () => {
      expect(findButton().findComponent(GlIcon).exists()).toBe(true);
      expect(findButton().findComponent(GlIcon).props('name')).toBe('close');
    });
  });

  describe('when item has wrapperClass', () => {
    const TEST_CLASS = 'just-a-test-class';
    beforeEach(() => {
      buildWrapper({
        item: {
          ...mockItems[0],
          wrapperClass: TEST_CLASS,
        },
      });
    });

    it('should add the extra class to the item wrapper', () => {
      expect(findItem().classes()).toContain(TEST_CLASS);
    });
  });

  describe('when variant is set', () => {
    it('item variant', () => {
      buildWrapper({
        item: {
          text: 'Close merge request',
          variant: 'danger',
        },
      });

      expect(findItem().attributes()).toMatchObject({
        class: 'gl-new-dropdown-item gl-new-dropdown-item-danger',
        tabindex: '0',
      });
    });

    it('overrides item variant when variant prop is set', () => {
      buildWrapper({
        item: {
          text: 'Close merge request',
          variant: 'danger',
        },
        variant: 'default',
      });

      expect(findItem().attributes()).toMatchObject({
        class: 'gl-new-dropdown-item',
        tabindex: '0',
      });
    });
  });

  describe('when item has disabled attribute', () => {
    const extraAttrs = {
      disabled: true,
    };
    beforeEach(() => {
      buildWrapper({
        item: {
          ...actionItem,
          extraAttrs,
        },
      });
    });

    it('should not set tabIndex to elements', () => {
      const findButton = () => wrapper.find('button[type="button"].gl-new-dropdown-item-content');

      expect(findItem().attributes('tabindex')).toBeUndefined();
      expect(findButton().attributes('tabindex')).toBeUndefined();
    });
  });
});
