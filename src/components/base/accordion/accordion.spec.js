import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import { waitForAnimationFrame } from '../../../utils/test_utils';
import GlButton from '../button/button.vue';
import GlAccordion from './accordion.vue';
import GlAccordionItem from './accordion_item.vue';

describe('GlAccordion', () => {
  let wrapper;

  const createComponent = ({ headerLevel = 3, autoCollapse = false } = {}) => {
    wrapper = mount({
      components: {
        GlAccordion,
        GlAccordionItem,
      },
      data() {
        return {
          headerLevel,
          autoCollapse,
        };
      },
      template: `
        <gl-accordion :header-level="headerLevel" :auto-collapse="autoCollapse">
          <gl-accordion-item title="Item 1">
            Foo
          </gl-accordion-item>
          <gl-accordion-item title="Item 2">
            Bar
          </gl-accordion-item>
          <gl-accordion-item title="Item 3">
            Bin
          </gl-accordion-item>
        </gl-accordion>`,
    });
  };

  const findAccordionItems = () => wrapper.findAllComponents(GlAccordionItem);
  const findToggleButton = (title) =>
    wrapper.findAllComponents(GlButton).wrappers.find((button) => button.text() === title);

  describe('when autoCollapse prop is true', () => {
    beforeEach(async () => {
      createComponent({ autoCollapse: true });
      await nextTick();
      await waitForAnimationFrame();
      await findToggleButton('Item 1').trigger('click');
      await waitForAnimationFrame();
      await findToggleButton('Item 2').trigger('click');
      await waitForAnimationFrame();
    });

    it('only allows one collapse to be open', () => {
      expect(findToggleButton('Item 1').attributes('aria-expanded')).toBe('false');
      expect(findToggleButton('Item 2').attributes('aria-expanded')).toBe('true');
    });
  });

  describe('when autoCollapse prop is false', () => {
    beforeEach(async () => {
      createComponent();
      await nextTick();
      await waitForAnimationFrame();
      await findToggleButton('Item 1').trigger('click');
      await waitForAnimationFrame();
      await findToggleButton('Item 2').trigger('click');
      await waitForAnimationFrame();
    });

    it('only allows multiple collapse to be open', () => {
      expect(findToggleButton('Item 1').attributes('aria-expanded')).toBe('true');
      expect(findToggleButton('Item 2').attributes('aria-expanded')).toBe('true');
    });
  });

  it('passes a default headerLevel to children', () => {
    createComponent({ headerLevel: 4 });
    expect(wrapper.findAll('h4')).toHaveLength(findAccordionItems().length);
  });
});
