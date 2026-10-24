import { nextTick } from 'vue';
import { shallowMount } from '@vue/test-utils';
import GlFormCharacterCount from './form_character_count.vue';

jest.useFakeTimers();

describe('GlFormCharacterCount', () => {
  let wrapper;

  const defaultPropsData = {
    limit: 10,
    countTextId: 'character-count-text',
  };

  const createComponent = (propsData = {}) => {
    wrapper = shallowMount(GlFormCharacterCount, {
      propsData: {
        ...defaultPropsData,
        ...propsData,
      },
      scopedSlots: {
        'remaining-count-text': function remainingCountText({ count }) {
          return count === 1 ? `${count} character remaining.` : `${count} characters remaining.`;
        },
        'over-limit-text': function overLimitText({ count }) {
          return count === 1 ? `${count} character over limit.` : `${count} characters over limit.`;
        },
      },
    });
  };

  const itUpdatesDebouncedScreenReaderText = (expectedText) => {
    it('updates debounced screen reader text', async () => {
      jest.runOnlyPendingTimers();
      await nextTick();
      expect(wrapper.find('[data-testid="count-text-sr-only"]').text()).toBe(expectedText);
    });
  };

  describe('when textarea character count is under the max character count', () => {
    const textareaCharacterCount = 5;
    const expectedText = `${defaultPropsData.limit - textareaCharacterCount} characters remaining.`;

    beforeEach(() => {
      createComponent({
        value: 'a'.repeat(textareaCharacterCount),
      });
    });

    it('displays remaining characters', () => {
      expect(wrapper.text()).toContain(expectedText);
    });

    itUpdatesDebouncedScreenReaderText(expectedText);
  });

  describe('when textarea character count is over the max character count', () => {
    const textareaCharacterCount = 15;
    const expectedText = `${textareaCharacterCount - defaultPropsData.limit} characters over limit.`;

    beforeEach(() => {
      createComponent({
        value: 'a'.repeat(textareaCharacterCount),
      });
    });

    it('displays number of characters over', () => {
      expect(wrapper.text()).toContain(expectedText);
    });

    itUpdatesDebouncedScreenReaderText(expectedText);
  });

  describe('when textarea value is updated', () => {
    const textareaCharacterCount = 5;
    const newTextareaCharacterCount = textareaCharacterCount + 3;
    const expectedText = `${
      defaultPropsData.limit - newTextareaCharacterCount
    } characters remaining.`;

    beforeEach(() => {
      createComponent({
        value: 'a'.repeat(textareaCharacterCount),
      });

      wrapper.setProps({ value: 'a'.repeat(newTextareaCharacterCount) });
    });

    it('updates character count text', () => {
      expect(wrapper.text()).toContain(expectedText);
    });

    itUpdatesDebouncedScreenReaderText(expectedText);
  });

  describe('when `value` prop is `null`', () => {
    const expectedText = `${defaultPropsData.limit} characters remaining.`;

    beforeEach(() => {
      createComponent({
        value: null,
      });
    });

    it('displays remaining characters', () => {
      expect(wrapper.text()).toContain(expectedText);
    });

    itUpdatesDebouncedScreenReaderText(expectedText);
  });

  describe('when `value` prop is updated to `null`', () => {
    const textareaCharacterCount = 5;
    const expectedText = `${defaultPropsData.limit} characters remaining.`;

    beforeEach(() => {
      createComponent({
        value: 'a'.repeat(textareaCharacterCount),
      });

      wrapper.setProps({ value: null });
    });

    it('updates character count text', () => {
      expect(wrapper.text()).toContain(expectedText);
    });

    itUpdatesDebouncedScreenReaderText(expectedText);
  });
});
