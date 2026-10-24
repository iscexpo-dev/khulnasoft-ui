import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import { setWindowLocation } from '~helpers/set_window_location';
import GlButton from '../../button/button.vue';
import { tabsButtonDefaults } from '../../../../utils/constants';
import GlTab from '../tab/tab.vue';
import GlTabs from './tabs.vue';

const getActionButtonProp = ({ type, text = `${type} action!` }) => ({
  [`action${type}`]: {
    text,
  },
});

describe('tabs component', () => {
  let wrapper;

  const buildTabs = ({ props = {}, mountFn = mount, options = {} } = {}) => {
    wrapper = mountFn(GlTabs, {
      propsData: {
        ...props,
      },
      components: { GlTab },
      slots: {
        default: `
          <gl-tab title="First">
            first tab content
          </gl-tab>
          <gl-tab title="Second">
            second tab content
          </gl-tab>
          <gl-tab title="Third" query-param-value="third">
            second tab content
          </gl-tab>
        `,
      },
      ...options,
    });
  };

  const findNav = () => wrapper.find('.gl-tabs-nav');
  const findContent = () => wrapper.find('.gl-tab-content');
  const findActiveTab = () => wrapper.find('[role="tab"][aria-selected="true"]');
  const findTabByText = (text) =>
    wrapper.findAll('[role="tab"]').wrappers.find((tabWrapper) => tabWrapper.text() === text);

  describe('default', () => {
    it('the active tab should be styled', async () => {
      buildTabs();

      await nextTick();

      expect(findActiveTab().classes()).toContain('gl-tab-nav-item-active');
    });
  });

  describe('nav', () => {
    it('should have class "gl-tabs-nav"', () => {
      buildTabs();
      expect(findNav().exists()).toBe(true);
    });

    it.each`
      type        | navClass
      ${'string'} | ${'my-nav-class my-nav-class-2'}
      ${'array'}  | ${['my-nav-class', 'my-nav-class-2']}
      ${'object'} | ${{ 'my-nav-class': true, 'my-nav-class-2': true }}
    `('should have custom $type classes', ({ navClass }) => {
      buildTabs({ props: { navClass } });

      expect(findNav().classes('my-nav-class')).toBe(true);
      expect(findNav().classes('my-nav-class-2')).toBe(true);
    });
  });

  describe('content', () => {
    it('should have class "gl-tab-content"', () => {
      buildTabs();
      expect(findContent().exists()).toBe(true);
    });

    it.each`
      type        | contentClass
      ${'string'} | ${'my-class my-class-2'}
      ${'array'}  | ${['my-class', 'my-class-2']}
      ${'object'} | ${{ 'my-class': true, 'my-class-2': true }}
    `('should have custom $type classes', ({ contentClass }) => {
      buildTabs({ props: { contentClass } });

      expect(findContent().classes('my-class')).toBe(true);
      expect(findContent().classes('my-class-2')).toBe(true);
    });
  });

  describe('actions buttons', () => {
    describe('when no actions are provided', () => {
      it('does not render the actions tabs', () => {
        buildTabs();

        expect(wrapper.find('[data-testid="actions-tabs-start"').exists()).toBe(false);
        expect(wrapper.find('[data-testid="actions-tabs-end"').exists()).toBe(false);
      });

      it('renders BV tabs slots', async () => {
        buildTabs({
          options: {
            slots: {
              'tabs-start': `<div class="tabs-start-slot"></div>`,
              'tabs-end': `<div class="tabs-end-slot"></div>`,
            },
          },
        });

        expect(wrapper.find('.tabs-start-slot').exists()).toBe(true);
        expect(wrapper.find('.tabs-end-slot').exists()).toBe(true);
      });
    });

    describe('when the actions are provided', () => {
      describe.each`
        buttonType
        ${'Primary'}
        ${'Secondary'}
        ${'Tertiary'}
      `('renders the $buttonType action buttons', ({ buttonType }) => {
        beforeEach(() => {
          const props = getActionButtonProp({ type: buttonType });
          buildTabs({ props });
        });

        it('renders two of a kind', () => {
          expect(wrapper.findAllComponents(GlButton)).toHaveLength(2);
        });

        it('passes the correct defaults attributes', () => {
          const testId = `action-${buttonType.toLowerCase()}`;

          expect(wrapper.find(`[data-testid="${testId}"]`).exists()).toBe(true);
          expect(wrapper.find(`[data-testid="${testId}"]`).props()).toMatchObject(
            tabsButtonDefaults[`action${buttonType}`],
          );
        });
      });

      it('correctly passes the props to the button', () => {
        buildTabs({
          props: {
            actionPrimary: {
              text: 'A button!',
              attributes: {
                variant: 'confirm',
                category: 'primary',
              },
            },
          },
        });

        expect(wrapper.findComponent(GlButton).props()).toMatchObject({
          variant: 'confirm',
          category: 'primary',
        });
      });

      it.each`
        buttonType
        ${'Primary'}
        ${'Secondary'}
        ${'Tertiary'}
      `('emits the $buttonType event when clicked', async ({ buttonType }) => {
        const testId = `action-${buttonType.toLowerCase()}`;
        const props = getActionButtonProp({ type: buttonType });

        buildTabs({ props });
        wrapper.find(`[data-testid="${testId}"]`).vm.$emit('click');
        await nextTick();

        expect(wrapper.emitted(`${buttonType.toLowerCase()}`)).toHaveLength(1);
      });

      it('only renders action buttons', () => {
        buildTabs({
          props: {
            actionPrimary: {
              text: 'Primary action!',
            },
          },
          options: {
            slots: {
              'toolbar-start': `<div class="toolbar-start-slot"></div>`,
              'toolbar-end': `<div class="toolbar-end-slot"></div>`,
            },
          },
        });

        expect(wrapper.find('.toolbar-start-slot').exists()).toBe(false);
        expect(wrapper.find('.toolbar-end-slot').exists()).toBe(false);
      });
    });
  });

  describe('`syncActiveTabWithQueryParams` prop', () => {
    beforeEach(() => {
      setWindowLocation('https://localhost');
    });

    describe('when set to `true`', () => {
      jest.spyOn(window.history, 'pushState');

      afterEach(() => {
        window.history.pushState.mockClear();
      });

      describe.each`
        queryParamName | queryString           | expectedActiveTabText | expectedActiveTabIndex
        ${undefined}   | ${'?tab=1'}           | ${'Second'}           | ${1}
        ${undefined}   | ${'?tab=third'}       | ${'Third'}            | ${2}
        ${undefined}   | ${'?tab=2'}           | ${'First'}            | ${0}
        ${'activeTab'} | ${'?activeTab=third'} | ${'Third'}            | ${2}
        ${undefined}   | ${''}                 | ${'First'}            | ${0}
        ${undefined}   | ${'?activeTab=forth'} | ${'First'}            | ${0}
      `(
        'when `queryParamName` prop is $queryParamName and query string is $queryString',
        ({ queryParamName, queryString, expectedActiveTabText, expectedActiveTabIndex }) => {
          it('sets active tab based on query string when component is mounted', async () => {
            setWindowLocation(queryString);

            buildTabs({
              props: { syncActiveTabWithQueryParams: true, queryParamName },
            });

            await nextTick();
            await nextTick();

            expect(findActiveTab().text()).toBe(expectedActiveTabText);

            // `input` event should only be fired if the active tab changes.
            if (expectedActiveTabIndex > 0) {
              expect(wrapper.emitted('input')[1]).toEqual([expectedActiveTabIndex]);
            } else {
              expect(wrapper.emitted('input')[1]).toBeUndefined();
            }
          });
        },
      );

      describe('when active tab is changed', () => {
        describe.each`
          queryParamName | tabTitleToActivate | expectedQueryString
          ${undefined}   | ${'Second'}        | ${'/?foo-bar=baz&tab=1'}
          ${undefined}   | ${'Third'}         | ${'/?foo-bar=baz&tab=third'}
          ${'activeTab'} | ${'Second'}        | ${'/?foo-bar=baz&activeTab=1'}
        `(
          'when `queryParamName` prop is $queryParamName and "$tabTitleToActivate" tab is activated',
          ({ queryParamName, tabTitleToActivate, expectedQueryString }) => {
            beforeEach(() => {
              setWindowLocation('?foo-bar=baz');
            });

            it(`sets query string to ${expectedQueryString}`, async () => {
              buildTabs({
                props: { syncActiveTabWithQueryParams: true, queryParamName },
              });

              await nextTick();
              await findTabByText(tabTitleToActivate).trigger('click');

              expect(window.history.pushState).toHaveBeenCalledWith({}, '', expectedQueryString);
              expect(window.history.pushState).toHaveBeenCalledTimes(1);
            });
          },
        );
      });

      describe('when `popstate` event is fired', () => {
        beforeEach(async () => {
          buildTabs({
            props: { syncActiveTabWithQueryParams: true },
          });

          await nextTick();

          setWindowLocation('?tab=1');
          window.dispatchEvent(new PopStateEvent('popstate', {}));
        });

        it('updates active tab based on query string', () => {
          expect(findActiveTab().text()).toBe('Second');
        });

        it('does not call `window.history.pushState`', () => {
          expect(window.history.pushState).not.toHaveBeenCalled();
        });
      });

      describe('when `value` prop is changed', () => {
        it('updates active tab and query string', async () => {
          buildTabs({
            props: { syncActiveTabWithQueryParams: true, value: 0 },
          });

          await nextTick();

          expect(findActiveTab().text()).toBe('First');

          await wrapper.setProps({ value: 1 });

          expect(findActiveTab().text()).toBe('Second');
          expect(window.history.pushState).toHaveBeenCalledWith({}, '', '/?tab=1');
        });
      });

      describe('when component is mounted', () => {
        it('emits `input` event', async () => {
          setWindowLocation('?tab=1');

          buildTabs({
            props: { syncActiveTabWithQueryParams: true },
          });

          await nextTick();
          await nextTick();

          expect(wrapper.emitted().input.pop()).toEqual([1]);
        });
      });
    });

    describe('when set to `false`', () => {
      describe('when component is mounted', () => {
        it('emits `input` event', async () => {
          buildTabs();

          await nextTick();

          expect(wrapper.emitted('input')[0]).toEqual([0]);
        });
      });

      describe('when tab is changed', () => {
        it('emits `input` event', async () => {
          buildTabs();

          await nextTick();
          await findTabByText('Second').trigger('click');

          expect(wrapper.emitted('input')[1]).toEqual([1]);
        });
      });

      describe('when `value` prop is changed', () => {
        it('updates active tab', async () => {
          buildTabs();

          await nextTick();

          expect(findActiveTab().text()).toBe('First');

          await wrapper.setProps({ value: 1 });

          expect(findActiveTab().text()).toBe('Second');
          expect(window.history.pushState).not.toHaveBeenCalled();
        });
      });
    });
  });
});
