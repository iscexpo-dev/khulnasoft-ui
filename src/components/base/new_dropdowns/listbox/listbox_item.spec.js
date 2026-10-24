import { mount } from '@vue/test-utils';
import GLIcon from '../../icon/icon.vue';

import { ENTER, SPACE } from '../constants';
import GlListboxItem from './listbox_item.vue';

describe('GlListboxItem', () => {
  let wrapper;

  const buildWrapper = (propsData, slots = {}) => {
    wrapper = mount(GlListboxItem, {
      propsData: {
        id: 'test-listbox-item',
        ...propsData,
      },
      slots,
    });
  };
  const findItem = () => wrapper.find('[role="option"]');
  const findCheckIcon = () => findItem().findComponent(GLIcon);

  describe('toggleSelection', () => {
    describe('when selected', () => {
      beforeEach(() => {
        buildWrapper({ isSelected: true });
      });

      it('should set `aria-selected` attribute on the list item to `true`', () => {
        expect(findItem().attributes('aria-selected')).toBe('true');
      });

      it('should display check icon', () => {
        expect(findCheckIcon().classes()).not.toContain('gl-invisible');
      });

      it('should emit the `select` event when clicked', async () => {
        await findItem().trigger('click');
        expect(wrapper.emitted('select')[0][0]).toBe(false);
      });

      it('should emit the `select` event on `ENTER` keydown event', async () => {
        await findItem().trigger('click');
        findItem().trigger('keydown', { code: SPACE });
        expect(wrapper.emitted('select')[0][0]).toBe(false);
      });

      it('should emit the `select` event on `SPACE` keydown event', async () => {
        await findItem().trigger('click');
        findItem().trigger('keydown', { code: SPACE });
        expect(wrapper.emitted('select')[0][0]).toBe(false);
      });
    });

    describe('when not selected', () => {
      beforeEach(() => {
        buildWrapper({ isSelected: false });
      });

      it('should set `aria-selected` attribute on the list item to `false`', () => {
        expect(findItem().attributes('aria-selected')).toBeUndefined();
      });

      it('should not  display check icon', () => {
        expect(findCheckIcon().classes()).toContain('gl-invisible');
      });

      it('should emit the `select` event when clicked', async () => {
        await findItem().trigger('click');
        expect(wrapper.emitted('select')[0][0]).toBe(true);
      });

      it('should emit the `select` event on `ENTER` keydown event', async () => {
        await findItem().trigger('click');
        findItem().trigger('keydown', { code: ENTER });
        expect(wrapper.emitted('select')[0][0]).toBe(true);
      });

      it('should emit the `select` event on `SPACE` keydown event', async () => {
        await findItem().trigger('click');
        findItem().trigger('keydown', { code: SPACE });
        expect(wrapper.emitted('select')[0][0]).toBe(true);
      });
    });
  });

  describe('checkbox', () => {
    describe('is NOT centered', () => {
      beforeEach(() => {
        buildWrapper({ isSelected: true });
      });

      it('should not center check icon by default', () => {
        expect(findCheckIcon().classes()).toEqual(
          expect.arrayContaining(['gl-mt-3', 'gl-self-start']),
        );
      });
    });

    describe('is centered', () => {
      beforeEach(() => {
        buildWrapper({ isSelected: true, isCheckCentered: true });
      });
      it('should center the check icon', () => {
        expect(findCheckIcon().classes()).not.toEqual(
          expect.arrayContaining(['gl-mt-3', 'gl-self-start']),
        );
      });
    });
  });

  describe('tabindex', () => {
    it('should set tabindex to `-1` when item is not focused', () => {
      buildWrapper({ isFocused: false });
      expect(wrapper.attributes('tabindex')).toBe('-1');
    });

    it('should set tabindex to `0` when item is focused', () => {
      buildWrapper({ isFocused: true });
      expect(wrapper.attributes('tabindex')).toBe('0');
    });
  });

  describe('when default slot content provided', () => {
    const content = 'This is an item';
    const slots = { default: content };

    it('renders it', () => {
      buildWrapper({}, slots);
      expect(wrapper.text()).toContain(content);
    });
  });

  describe('when disabled', () => {
    beforeEach(() => {
      buildWrapper({ isDisabled: true });
    });

    it('adds the disabled class', () => {
      expect(findItem().classes()).toContain('disabled');
    });

    it('sets aria-disabled to true', () => {
      expect(findItem().attributes('aria-disabled')).toBe('true');
    });

    it('does not emit select event on click', async () => {
      await findItem().trigger('click');
      expect(wrapper.emitted('select')).toBeUndefined();
    });

    it('does not emit select event on ENTER keydown', async () => {
      await findItem().trigger('keydown', { code: ENTER });
      expect(wrapper.emitted('select')).toBeUndefined();
    });

    it('does not emit select event on SPACE keydown', async () => {
      await findItem().trigger('keydown', { code: SPACE });
      expect(wrapper.emitted('select')).toBeUndefined();
    });
  });
});
