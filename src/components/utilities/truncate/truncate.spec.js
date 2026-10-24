import { nextTick } from 'vue';
import { shallowMount } from '@vue/test-utils';
import {
  getBinding,
  createMockDirective as mockDirectiveCreator,
} from '~helpers/vue_mock_directive';
import { POSITION, ZERO_WIDTH_SPACE } from './constants';
import Truncate from './truncate.vue';

jest.mock('../../../directives/resize_observer/resize_observer', () => ({
  GlResizeObserverDirective: mockDirectiveCreator('gl-resize-observer'),
}));

const LEFT_TO_RIGHT_MARK = '\u200e';

const removeSpecialChar = (text) => {
  return text.replaceAll(LEFT_TO_RIGHT_MARK, '');
};

const positionOptions = Object.values(POSITION);

describe('Truncate component', () => {
  let wrapper;

  const defaultProps = {
    text: 'ee/app/assets/javascripts/vue_shared/src/utils_reports/components/utils/index.js',
  };

  const createComponent = ({ classes, ...props } = {}) => {
    wrapper = shallowMount(Truncate, {
      propsData: { ...defaultProps, ...props },
      attrs: {
        class: classes,
      },
    });
  };

  const findChildSpan = (index) => wrapper.findAll('.gl-truncate-component span').at(index);
  const findFirstSpan = () => findChildSpan(0);
  const findSecondSpan = () => findChildSpan(1);

  const forceTruncate = () => {
    // We check that scrollWidth > offsetWidth so we can force this in our test environment by overriding the properties.
    const child = wrapper.findComponent({ ref: 'text' }).element;

    Object.defineProperties(child, {
      scrollWidth: {
        get() {
          return 9001;
        },
      },
      offsetWidth: {
        get() {
          return 1;
        },
      },
    });
  };

  const triggerResizeObserver = async () => {
    const callback = getBinding(
      wrapper.find('.gl-truncate-component').element,
      'gl-resize-observer',
    ).value;

    callback();

    await nextTick();
  };

  describe('All', () => {
    beforeEach(() => {
      createComponent();
    });

    it.each(positionOptions)(
      '%s truncation: should class, original text, and no title',
      (position) => {
        createComponent({ position });
        const element = wrapper.find('span');
        expect(element.attributes('title')).toBeUndefined();
        expect(element.attributes('class')).toBe('gl-truncate-component');
        expect(removeSpecialChar(wrapper.text())).toBe(defaultProps.text);
      },
    );

    it('should have the default position', () => {
      expect(wrapper.props('position')).toBe('end');
    });

    it('disables the tooltip by default', () => {
      expect(
        getBinding(wrapper.find('.gl-truncate-component').element, 'gl-tooltip').value.disabled,
      ).toBe(true);
    });
  });

  describe('with tooltip', () => {
    beforeEach(() => {
      createComponent({ withTooltip: true });
    });

    it('enables the tooltip', async () => {
      forceTruncate();
      await triggerResizeObserver();

      expect(
        getBinding(wrapper.find('.gl-truncate-component').element, 'gl-tooltip').value.disabled,
      ).toBe(false);
    });

    it('has title', () => {
      const element = wrapper.find('span');

      expect(element.attributes('title')).toBe(defaultProps.text);
    });
  });

  describe('start truncation', () => {
    beforeEach(() => {
      createComponent({ position: 'start' });
    });

    it('should have the truncate-start class', () => {
      expect(wrapper.find('.gl-truncate-start').exists()).toBe(true);
    });

    it('should have the special char surrounded', () => {
      const spanTag = wrapper.findAll('.gl-truncate-component span').at(0).text();

      expect(spanTag.charAt(0)).toBe(LEFT_TO_RIGHT_MARK);
      expect(spanTag.charAt(spanTag.length - 1)).toBe(LEFT_TO_RIGHT_MARK);
    });
  });

  describe('middle truncation', () => {
    it('should contain the expected text', () => {
      createComponent({ position: 'middle' });
      expect(findFirstSpan().text()).toContain('ee/app/assets/javascripts/vue_shared/src');
      expect(findSecondSpan().text()).toContain('/utils_reports/components/utils/index.js');
    });

    it('last part should be surrounded with left-to-right marks', () => {
      createComponent({ position: 'middle' });
      const lastPart = findSecondSpan().text();

      expect(lastPart.charAt(0)).toBe(LEFT_TO_RIGHT_MARK);
      expect(lastPart.charAt(lastPart.length - 1)).toBe(LEFT_TO_RIGHT_MARK);
    });

    it('should prevent whitespace collapse at end of first span', () => {
      createComponent({ text: 'Gap here', position: 'middle' });
      const firstPart = findFirstSpan().text();
      expect(firstPart.charAt(firstPart.length - 1)).toBe(ZERO_WIDTH_SPACE);
    });

    it('should not prevent whitespace collapse twice', () => {
      createComponent({ text: 'Gap        here', position: 'middle' });
      const firstPart = findFirstSpan().text();
      expect(firstPart.charAt(firstPart.length - 1)).not.toBe(ZERO_WIDTH_SPACE);
    });

    it('should have descriptive label', () => {
      const text = 'long-no-whitespace-text';
      createComponent({ text, position: 'middle' });
      expect(wrapper.find('.gl-truncate-component').attributes('aria-label')).toBe(text);
    });
  });

  describe('end truncation', () => {
    beforeEach(() => {
      createComponent();
    });

    it('should not have the special char', () => {
      expect(wrapper.text()).not.toContain(LEFT_TO_RIGHT_MARK);
    });

    it('should have the truncate-end class', () => {
      expect(wrapper.find('.gl-truncate-end').exists()).toBe(true);
    });
  });

  // This tests a workaround for a subtle Vue 2/3 compiler difference.
  // See https://github.com/vuejs/core/issues/7909.
  describe('parent classes', () => {
    beforeEach(() => {
      createComponent({ classes: 'test-class' });
    });

    it('applies classes from parent', () => {
      expect(wrapper.classes()).toContain('test-class');
    });
  });
});
