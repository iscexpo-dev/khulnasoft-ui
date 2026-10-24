import { nextTick } from 'vue';
import { mount } from '@vue/test-utils';
import { createMockDirective, getBinding } from '~helpers/vue_mock_directive';
import GlButton from '../../base/button/button.vue';
import GlTruncateText from './truncate_text.vue';

describe('GlTruncateText', () => {
  let wrapper;

  const showMoreText = 'Show more text';
  const showLessText = 'Show less text';

  const findContent = () => wrapper.find('article');
  const findContentEl = () => findContent().element;
  const findButton = () => wrapper.findComponent(GlButton);

  const createComponent = (propsData = { showMoreText, showLessText }) => {
    wrapper = mount(GlTruncateText, {
      propsData,
      directives: {
        GlResizeObserver: createMockDirective('gl-resize-observer'),
      },
    });
  };

  beforeEach(() => {
    createComponent();
  });

  describe('when mounted', () => {
    it('the content has class `gl-truncate-text`', () => {
      expect(findContentEl().classList).toContain('gl-truncate-text');
    });

    it('the content has style variables for `lines` and `mobile-lines` with the correct values', () => {
      const { style } = findContentEl();

      expect(style.getPropertyValue('--lines')).toBe('3');
      expect(style.getPropertyValue('--mobile-lines')).toBe('10');
    });

    it('the button is not visible', () => {
      expect(findButton().exists()).toBe(false);
    });
  });

  describe.each`
    property         | variable
    ${'lines'}       | ${'--lines'}
    ${'mobileLines'} | ${'--mobile-lines'}
  `('when mounted with a value for the $property property', ({ property, variable }) => {
    const value = 4;

    beforeEach(() => {
      createComponent({ [property]: value });
    });

    it(`the ${variable} style variable has the value of the passed ${property} property`, () => {
      expect(findContentEl().style.getPropertyValue(variable)).toBe(value.toString());
    });
  });

  describe('when resizing and the scroll height is smaller than the offset height', () => {
    beforeEach(() => {
      getBinding(findContentEl(), 'gl-resize-observer').value({
        target: { scrollHeight: 10, offsetHeight: 20 },
      });
    });

    it('the button remains invisible', () => {
      expect(findButton().exists()).toBe(false);
    });

    it('the aria-expanded property is set to `true`', () => {
      expect(findContent().attributes('aria-expanded')).toBe('true');
    });
  });

  describe.each`
    scrollHeight | offsetHeight | lessOrMore | showMoreVisible | ariaExpanded
    ${10}        | ${20}        | ${'less'}  | ${false}        | ${'true'}
    ${20}        | ${10}        | ${'more'}  | ${true}         | ${'false'}
  `(
    'when scroll height is $lessOrMore than the offset height',
    ({ scrollHeight, offsetHeight, showMoreVisible, ariaExpanded }) => {
      beforeEach(() => {
        getBinding(findContentEl(), 'gl-resize-observer').value({
          target: { scrollHeight, offsetHeight },
        });
      });

      it(`the show more button should ${showMoreVisible ? 'be' : 'not be'} visible`, () => {
        expect(findButton().exists()).toBe(showMoreVisible);
      });

      it('the content contains the "gl-truncate-text" class', () => {
        expect(findContentEl().classList).toContain('gl-truncate-text');
      });

      it(`the "aria-expanded" property is set to ${ariaExpanded}`, () => {
        expect(findContent().attributes('aria-expanded')).toBe(ariaExpanded);
      });
    },
  );

  describe('when resizing and the scroll height is greater than the offset height', () => {
    beforeEach(() => {
      getBinding(findContentEl(), 'gl-resize-observer').value({
        target: { scrollHeight: 20, offsetHeight: 10 },
      });
    });

    it('the button text displays the value for the showMoreText property', () => {
      expect(findButton().text()).toBe(showMoreText);
    });

    describe('clicking the button', () => {
      beforeEach(() => {
        findButton().trigger('click');
      });

      it('removes the `gl-truncate-text` class on the content', () => {
        expect(findContentEl().classList).not.toContain('gl-truncate-text');
      });

      it('the button text displays the value for the showLessText property', () => {
        expect(findButton().text()).toBe(showLessText);
      });

      it('the aria-expanded property is set to `true`', () => {
        expect(findContent().attributes('aria-expanded')).toBe('true');
      });
    });
  });

  it('passes `toggleButtonProps` to toggle button', async () => {
    const buttonTextClasses = 'foo-bar';

    createComponent({ toggleButtonProps: { buttonTextClasses } });

    getBinding(findContentEl(), 'gl-resize-observer').value({
      target: { scrollHeight: 20, offsetHeight: 10 },
    });
    await nextTick();

    expect(findButton().props('buttonTextClasses')).toBe(buttonTextClasses);
  });
});
