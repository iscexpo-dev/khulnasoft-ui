import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import { range, mapValues } from 'lodash-es';
import { useMockResizeObserver } from '~helpers/mock_dom_observer';
import GlTab from '../tab/tab.vue';
import GlScrollableTabs from './scrollable_tabs.vue';
import GlTabs from './tabs.vue';

const { NAV_CLASS } = GlScrollableTabs;
const TEST_WIDTH = 600;
// Just a little more than double so we can test when going all the way to the right
const TEST_NAV_WIDTH = 1500;
const TEST_ACTION = {
  text: 'Lorem ipsum',
};
const TEST_DEFAULT_PROPS = {
  contentClass: 'gl-test-content-class',
  navClass: 'gl-test-nav-class',
};

describe('GlScrollableTabs', () => {
  let wrapper;
  let inputSpy;

  const { trigger } = useMockResizeObserver();

  beforeEach(() => {
    Element.prototype.scrollTo = jest.fn().mockImplementation(function scrollTo({ left }) {
      this.scrollLeft = left;
      this.dispatchEvent(new Event('scroll'));
    });
    inputSpy = jest.fn();
  });

  const findScrollRightButton = () => wrapper.find('[aria-label="Scroll right"]');
  const findScrollLeftButton = () => wrapper.find('[aria-label="Scroll left"]');
  const findNav = () => wrapper.find(`.${NAV_CLASS}`);

  const setNavScrollWidth = async (width = 0) => {
    const nav = findNav();
    Object.defineProperty(nav.element, 'scrollWidth', {
      get() {
        return width;
      },
    });

    // It's not great we're forcing an update, but this is one of the things we
    // are listening to.
    wrapper.vm.$forceUpdate();

    await nextTick();
  };

  const createComponent = async (props = {}, { tabsCount = 5 } = {}) => {
    wrapper = mount(GlScrollableTabs, {
      // Component actually passes props through so we have to set attrs
      attrs: {
        ...TEST_DEFAULT_PROPS,
        ...props,
      },
      slots: {
        default: {
          template: `<div><gl-tab v-for="tab in tabs" :key="tab.key" :title="tab.title">{{ tab.content }}</gl-tab></div>`,
        },
      },
      stubs: {
        'gl-tab': GlTab,
      },
      mocks: {
        tabs: range(tabsCount).map((i) => ({
          key: i.toString(),
          title: `Lorem ${i}`,
          content: `(${i}) Lorem ipsum dolar sit...`,
        })),
      },
      listeners: {
        input: inputSpy,
      },
    });

    await nextTick();

    trigger(wrapper.element, { entry: { contentRect: { width: TEST_WIDTH } } });

    await nextTick();
  };

  describe('with default', () => {
    beforeEach(async () => {
      await createComponent();
    });

    it('passes props through', () => {
      expect(NAV_CLASS).toBe('gl-scrollable-tabs-nav');
      expect(wrapper.findComponent(GlTabs).props()).toMatchObject({
        ...TEST_DEFAULT_PROPS,
        navClass: [NAV_CLASS, TEST_DEFAULT_PROPS.navClass],
      });
    });

    it('passes listeners through', async () => {
      const secondTab = wrapper.findAll('[role="tab"]').wrappers[1];
      await secondTab.trigger('click');

      expect(inputSpy).toHaveBeenCalledWith(1);
    });

    it.each`
      side       | finder
      ${'right'} | ${findScrollRightButton}
      ${'left'}  | ${findScrollLeftButton}
    `('hides $side button', ({ finder }) => {
      const button = finder();

      expect(button.isVisible()).toBe(false);
    });
  });

  describe('with array as nav-class', () => {
    const navClass = ['test', 'test2'];

    beforeEach(async () => {
      await createComponent({ navClass });
    });

    it('spreads the navClass array', () => {
      expect(wrapper.findComponent(GlTabs).props()).toMatchObject({
        navClass: [NAV_CLASS, ...navClass],
      });
    });
  });

  describe('with action props', () => {
    // Let's make sure we reference the same props in act + assertion
    const ACTION_PROPS = {
      actionPrimary: TEST_ACTION,
      actionSecondary: TEST_ACTION,
      actionTertiary: TEST_ACTION,
    };

    beforeEach(async () => {
      await createComponent(ACTION_PROPS);
    });

    it('ignores actions', () => {
      expect(wrapper.findComponent(GlTabs).props()).toMatchObject(
        mapValues(ACTION_PROPS, () => null),
      );
    });
  });

  describe('with nav overflow', () => {
    beforeEach(async () => {
      await createComponent();
      await setNavScrollWidth(TEST_NAV_WIDTH);
    });

    it('shows right button', () => {
      expect(findScrollRightButton().isVisible()).toBe(true);
    });

    it('hides left button', () => {
      expect(findScrollLeftButton().isVisible()).toBe(false);
    });

    describe.each([
      [
        'right clicked',
        {
          buttons: [findScrollRightButton],
          showsRight: true,
          showsLeft: true,
          scrollLeft: TEST_WIDTH,
          scrollToCalls: [
            [
              {
                behavior: 'smooth',
                left: TEST_WIDTH,
              },
            ],
          ],
        },
      ],
      [
        'right clicked then left clicked',
        {
          buttons: [findScrollRightButton, findScrollLeftButton],
          showsRight: true,
          showsLeft: false,
          scrollLeft: 0,
          scrollToCalls: [
            [
              {
                behavior: 'smooth',
                left: TEST_WIDTH,
              },
            ],
            [
              {
                behavior: 'smooth',
                left: 0,
              },
            ],
          ],
        },
      ],
      [
        'right clicked all the way',
        {
          buttons: [findScrollRightButton, findScrollRightButton],
          showsRight: false,
          showsLeft: true,
          scrollLeft: TEST_NAV_WIDTH - TEST_WIDTH,
          scrollToCalls: [
            [
              {
                behavior: 'smooth',
                left: TEST_WIDTH,
              },
            ],
            [
              {
                behavior: 'smooth',
                left: TEST_NAV_WIDTH - TEST_WIDTH,
              },
            ],
          ],
        },
      ],
    ])('with %s', (desc, { buttons, showsRight, showsLeft, scrollLeft, scrollToCalls }) => {
      beforeEach(async () => {
        for (const findButton of buttons) {
          // eslint-disable-next-line no-await-in-loop
          await findButton().trigger('click');
        }
      });

      it(`right button isVisible=${showsRight}`, () => {
        expect(findScrollRightButton().isVisible()).toBe(showsRight);
      });

      it(`left button isVisible=${showsLeft}`, () => {
        expect(findScrollLeftButton().isVisible()).toBe(showsLeft);
      });

      it('updates nav scrollLeft', () => {
        expect(findNav().element.scrollLeft).toBe(scrollLeft);
      });

      it('calls scrollTo', () => {
        expect(Element.prototype.scrollTo.mock.calls).toEqual(scrollToCalls);
      });
    });
  });
});
