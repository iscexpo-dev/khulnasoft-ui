import { mount } from '@vue/test-utils';
import { isVnodeEmpty, isSlotEmpty } from './is_slot_empty';

describe('is slot empty', () => {
  let wrapper;

  const TestComponent = {
    template: `
      <div>
        <slot></slot>
      </div>
    `,
  };

  const createWrapper = (content) => {
    wrapper = mount({
      components: { TestComponent },
      template: `<test-component>${content}</test-component>`,
    });
  };

  describe('isVnodeEmpty', () => {
    const findSlot = () => {
      const slot = wrapper.findComponent(TestComponent).vm.$slots.default;
      return slot instanceof Function ? slot() : slot;
    };

    it('should return true for empty slot', () => {
      createWrapper('');

      expect(isVnodeEmpty(findSlot())).toBe(true);
    });

    it('should return true for a comment', () => {
      createWrapper('<!-- comment -->');

      expect(isVnodeEmpty(findSlot())).toBe(true);
    });

    it('should return true for comment fragments', () => {
      createWrapper('<!-- comment 1 --><!-- comment 2 -->');

      expect(isVnodeEmpty(findSlot())).toBe(true);
    });

    it('should return true for a conditional that evaluates to false', () => {
      createWrapper('<span v-if="false">hidden</span>');

      expect(isVnodeEmpty(findSlot())).toBe(true);
    });

    it('should return true for conditionals that evaluate to false', () => {
      createWrapper('<span v-if="false">text 1</span><span v-if="false">text 2</span>');

      expect(isVnodeEmpty(findSlot())).toBe(true);
    });

    it('should return false for a text node', () => {
      createWrapper('text node');

      expect(isVnodeEmpty(findSlot())).toBe(false);
    });

    it('should return false for a conditional that evaluates to true', () => {
      createWrapper('<span v-if="true">shown</span>');

      expect(isVnodeEmpty(findSlot())).toBe(false);
    });

    it('should return false for a conditional that evaluates to false with text', () => {
      createWrapper('<span v-if="false">hidden</span>shown');

      expect(isVnodeEmpty(findSlot())).toBe(false);
    });
  });

  describe('isSlotEmpty', () => {
    it('should return true for empty slot', () => {
      createWrapper('');

      expect(isSlotEmpty(wrapper.findComponent(TestComponent).vm, 'default')).toBe(true);
    });

    it('should return true for slot with comment', () => {
      createWrapper('<!-- comment -->');

      expect(isSlotEmpty(wrapper.findComponent(TestComponent).vm, 'default')).toBe(true);
    });

    it('should return true for slot with multiple comments', () => {
      createWrapper('<!-- comment --><!-- comment2 -->');

      expect(isSlotEmpty(wrapper.findComponent(TestComponent).vm, 'default')).toBe(true);
    });

    it('should return false for non-empty slot', () => {
      createWrapper('non-empty');

      expect(isSlotEmpty(wrapper.findComponent(TestComponent).vm, 'default')).toBe(false);
    });

    it.each([true, false])(
      'should return %s for conditional slot contents based on slot-scope',
      (shouldRender) => {
        const PassesComment = {
          components: { TestComponent },
          template:
            '<test-component><template #default="{ shouldRender }"><span v-if="shouldRender">empty</span></template></test-component>',
        };

        wrapper = mount(PassesComment);

        expect(
          isSlotEmpty(wrapper.findComponent(TestComponent).vm, 'default', { shouldRender }),
        ).toBe(!shouldRender);
      },
    );
  });
});
