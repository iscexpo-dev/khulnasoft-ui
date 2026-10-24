import { shallowMount, mount } from '@vue/test-utils';
import { nextTick } from 'vue';

import GlDropdownItem from '../dropdown/dropdown_item.vue';
import GlTokenSelectorDropdown from './token_selector_dropdown.vue';

describe('GlTokenSelectorDropdown', () => {
  const dropdownItems = [
    {
      id: 1,
      name: 'Vue.js',
    },
    {
      id: 2,
      name: 'Ruby On Rails',
    },
    {
      id: 3,
      name: 'GraphQL',
    },
    {
      id: 4,
      name: 'Redis',
    },
  ];

  const firstDropdownItemIndex = 0;
  const lastDropdownItemIndex = dropdownItems.length - 1;
  const userDefinedTokenIndex = dropdownItems.length;

  const mockRegisterDropdownEventHandlers = jest.fn();
  const mockRegisterResetFocusedDropdownItem = jest.fn();

  const defaultProps = {
    show: false,
    dropdownItems,
    inputText: '',
    userDefinedTokenCanBeAdded: true,
    componentId: 'token-selector1',
    registerDropdownEventHandlers: mockRegisterDropdownEventHandlers,
    registerResetFocusedDropdownItem: mockRegisterResetFocusedDropdownItem,
  };

  let wrapper;

  const createComponent = (options, shallow = true) => {
    const mountFunction = shallow ? shallowMount : mount;

    wrapper = mountFunction(GlTokenSelectorDropdown, {
      ...options,
      propsData: {
        ...defaultProps,
        ...(options?.propsData || {}),
      },
    });
  };

  const findDropdownMenu = () => wrapper.findComponent({ ref: 'dropdownMenu' });

  let originalScrollIntoView;

  beforeAll(() => {
    originalScrollIntoView = HTMLElement.prototype.scrollIntoView;
    HTMLElement.prototype.scrollIntoView = jest.fn();
  });

  afterAll(() => {
    HTMLElement.prototype.scrollIntoView = originalScrollIntoView;
  });

  beforeEach(() => {
    HTMLElement.prototype.scrollIntoView.mockClear();
  });

  describe('props', () => {
    describe('show', () => {
      it('displays dropdown when `true`', () => {
        createComponent({
          propsData: { show: true },
        });

        expect(wrapper.classes()).toContain('show');
        expect(findDropdownMenu().classes()).toContain('show');
      });
    });

    describe('menuClass', () => {
      describe.each`
        menuClass
        ${'foo-bar-baz'}
        ${['foo-bar-baz']}
        ${{ 'foo-bar-baz': true }}
      `('when `menuClass` is $menuClass', ({ menuClass }) => {
        it('adds `foo-bar-baz` to CSS classes', () => {
          createComponent({
            propsData: { menuClass },
          });

          expect(findDropdownMenu().classes()).toContain('foo-bar-baz');
        });
      });
    });

    describe('loading', () => {
      it('displays loading message when `true`', () => {
        createComponent({
          propsData: { show: true, loading: true },
        });

        expect(wrapper.findComponent(GlDropdownItem).text()).toBe('Searching...');
      });
    });

    describe('dropdownItems', () => {
      describe('when dropdown items are provided', () => {
        describe('with `userDefinedTokenCanBeAdded` is false', () => {
          it('displays passed in dropdown items', () => {
            createComponent({ propsData: { userDefinedTokenCanBeAdded: false, dropdownItems } });

            expect(wrapper.findAllComponents(GlDropdownItem)).toHaveLength(dropdownItems.length);
          });
        });

        describe('with `userDefinedTokenCanBeAdded` is true', () => {
          it('displays passed in dropdown items and the user defined token', () => {
            createComponent({ propsData: { userDefinedTokenCanBeAdded: true, dropdownItems } });

            expect(wrapper.findAllComponents(GlDropdownItem)).toHaveLength(
              dropdownItems.length + 1,
            );
          });
        });
      });

      describe('when dropdown items are not provided', () => {
        it('displays add user defined token message when `userDefinedTokenCanBeAdded` is `true` and `inputText` is not empty', () => {
          createComponent({
            propsData: {
              userDefinedTokenCanBeAdded: true,
              inputText: 'foo bar',
              dropdownItems: [],
            },
          });

          expect(wrapper.findComponent(GlDropdownItem).text()).toBe('Add "foo bar"');
        });

        it('displays no results message when `userDefinedTokenCanBeAdded` is `false`', () => {
          createComponent({
            propsData: {
              userDefinedTokenCanBeAdded: false,
              inputText: 'foo bar',
              dropdownItems: [],
            },
          });

          expect(wrapper.findComponent(GlDropdownItem).text()).toBe('No matches found');
        });

        it('displays no results message when `inputText` is empty', () => {
          createComponent({
            propsData: {
              userDefinedTokenCanBeAdded: false,
              inputText: '',
              dropdownItems: [],
            },
          });

          expect(wrapper.findComponent(GlDropdownItem).text()).toBe('No matches found');
        });

        it('does not display no results message when `loading` is `true`', () => {
          createComponent({
            propsData: {
              userDefinedTokenCanBeAdded: false,
              inputText: 'foo bar',
              dropdownItems: [],
              loading: true,
            },
          });

          const dropdownItemWrappers = wrapper.findAllComponents(GlDropdownItem);

          expect(dropdownItemWrappers).toHaveLength(1);
          expect(dropdownItemWrappers.at(0).text()).toBe('Searching...');
        });
      });
    });

    describe('registerDropdownEventHandlers', () => {
      it('calls passed method', () => {
        createComponent();

        expect(mockRegisterDropdownEventHandlers).toHaveBeenCalled();
      });
    });

    describe('registerResetFocusedDropdownItem', () => {
      it('calls passed method', () => {
        createComponent();

        expect(mockRegisterResetFocusedDropdownItem).toHaveBeenCalled();
      });
    });
  });

  describe('slots', () => {
    it('renders `loading-content` slot', () => {
      createComponent({
        propsData: {
          loading: true,
        },
        slots: {
          'loading-content': '<span id="custom-loading-content">Loading</span>',
        },
      });

      expect(wrapper.find('#custom-loading-content').exists()).toBe(true);
    });

    it('renders `dropdown-item-content` slot', () => {
      createComponent({
        propsData: {
          userDefinedTokenCanBeAdded: false,
          inputText: 'example.com',
        },
        scopedSlots: {
          'dropdown-item-content': '<span>Dropdown item id: {{ props.dropdownItem.id }}</span>',
        },
      });

      const dropdownItemWrappers = wrapper.findAllComponents(GlDropdownItem);

      expect(
        dropdownItemWrappers.wrappers.every(
          (dropdownItem, index) =>
            `Dropdown item id: ${dropdownItems[index].id}` === dropdownItem.text(),
        ),
      ).toBe(true);
    });

    it('renders `user-defined-token-content` slot', () => {
      createComponent({
        propsData: {
          userDefinedTokenCanBeAdded: true,
          inputText: 'example.com',
          dropdownItems: [],
        },
        scopedSlots: {
          'user-defined-token-content':
            '<span id="custom-user-defined-token-content">Add "{{ props.inputText }}" to domain allowlist</span>',
        },
      });

      expect(wrapper.find('#custom-user-defined-token-content').text()).toBe(
        'Add "example.com" to domain allowlist',
      );
    });

    it('renders `no-results-content` slot', () => {
      createComponent({
        propsData: {
          userDefinedTokenCanBeAdded: false,
          inputText: 'foo bar',
          dropdownItems: [],
        },
        slots: {
          'no-results-content': '<span id="custom-no-results-content">No results found</span>',
        },
      });

      expect(wrapper.find('#custom-no-results-content').exists()).toBe(true);
    });

    it('renders `dropdown-footer` slot', () => {
      createComponent({
        slots: {
          'dropdown-footer': '<span id="loading-text">Loading more results</span>',
        },
      });

      expect(wrapper.find('#loading-text').exists()).toBe(true);
    });
  });

  describe('keyboard navigation', () => {
    let expectedFocusedDropdownItem = null;

    let dropdownEventHandlers = {
      handleUpArrow: () => {},
      handleDownArrow: () => {},
      handleHomeKey: () => {},
      handleEndKey: () => {},
    };

    const registerDropdownEventHandlers = (handlers) => {
      dropdownEventHandlers = handlers;
    };

    const setup = async ({
      focusedDropdownItemIndex,
      expectedFocusedDropdownItemIndex,
      handler,
      handlerArgs,
    } = {}) => {
      wrapper.setData({ focusedDropdownItemIndex });
      await nextTick();
      // Clear mock after setData as it may have triggered scrollIntoView via the watcher
      HTMLElement.prototype.scrollIntoView.mockClear();
      dropdownEventHandlers[handler](handlerArgs);

      expectedFocusedDropdownItem = wrapper
        .findAllComponents(GlDropdownItem)
        .at(expectedFocusedDropdownItemIndex);
      await nextTick();
    };

    describe.each`
      testName                                                                                                  | userDefinedTokenCanBeAdded | focusedDropdownItemIndex  | expectedFocusedDropdownItemIndex | expectedScrollCalls
      ${'starting at bottom, focuses on previous dropdown item'}                                                | ${false}                   | ${lastDropdownItemIndex}  | ${lastDropdownItemIndex - 1}     | ${1}
      ${'does not change focus if there is no previous dropdown item'}                                          | ${false}                   | ${firstDropdownItemIndex} | ${firstDropdownItemIndex}        | ${0}
      ${'starting on user defined dropdown item, focuses on the previous dropdown item'}                        | ${true}                    | ${userDefinedTokenIndex}  | ${lastDropdownItemIndex}         | ${1}
      ${'with user defined dropdown item in list, does not change focus if there is no previous dropdown item'} | ${true}                    | ${firstDropdownItemIndex} | ${firstDropdownItemIndex}        | ${0}
    `(
      'when up arrow is pressed',
      ({
        userDefinedTokenCanBeAdded,
        focusedDropdownItemIndex,
        expectedFocusedDropdownItemIndex,
        expectedScrollCalls,
        testName,
      }) => {
        beforeEach(async () => {
          createComponent(
            {
              propsData: { registerDropdownEventHandlers, show: true, userDefinedTokenCanBeAdded },
            },
            false,
          );

          await setup({
            focusedDropdownItemIndex,
            expectedFocusedDropdownItemIndex,
            handler: 'handleUpArrow',
          });
        });

        it(`${testName}`, () => {
          expect(expectedFocusedDropdownItem.find('button').classes()).toContain('is-focused');
        });

        it('scrolls focused dropdown item into view', () => {
          expect(expectedFocusedDropdownItem.vm.$el.scrollIntoView).toHaveBeenCalledTimes(
            expectedScrollCalls,
          );
        });
      },
    );

    describe.each`
      testName                                                                                     | userDefinedTokenCanBeAdded | focusedDropdownItemIndex  | expectedFocusedDropdownItemIndex | expectedScrollCalls
      ${'starting at top, focuses on next dropdown item'}                                          | ${false}                   | ${firstDropdownItemIndex} | ${1}                             | ${1}
      ${'does not change focus if there is no next dropdown item'}                                 | ${false}                   | ${lastDropdownItemIndex}  | ${lastDropdownItemIndex}         | ${0}
      ${'with user defined dropdown item in list, starting at top, focuses on next dropdown item'} | ${true}                    | ${firstDropdownItemIndex} | ${1}                             | ${1}
      ${'starting on last created token, changes focus to the user defined dropdown item'}         | ${true}                    | ${lastDropdownItemIndex}  | ${userDefinedTokenIndex}         | ${1}
    `(
      'when down arrow is pressed',
      ({
        userDefinedTokenCanBeAdded,
        focusedDropdownItemIndex,
        expectedFocusedDropdownItemIndex,
        expectedScrollCalls,
        testName,
      }) => {
        beforeEach(async () => {
          createComponent(
            {
              propsData: { registerDropdownEventHandlers, show: true, userDefinedTokenCanBeAdded },
            },
            false,
          );

          await setup({
            focusedDropdownItemIndex,
            expectedFocusedDropdownItemIndex,
            handler: 'handleDownArrow',
          });
        });

        it(`${testName}`, () => {
          expect(expectedFocusedDropdownItem.find('button').classes()).toContain('is-focused');
          expect(expectedFocusedDropdownItem.find('button').attributes('aria-selected')).toBe(
            'true',
          );
        });

        it('scrolls focused dropdown item into view', () => {
          expect(expectedFocusedDropdownItem.vm.$el.scrollIntoView).toHaveBeenCalledTimes(
            expectedScrollCalls,
          );
        });
      },
    );

    describe.each`
      testName                                                                                     | userDefinedTokenCanBeAdded | focusedDropdownItemIndex  | expectedFocusedDropdownItemIndex | expectedScrollCalls
      ${'starting at bottom, focuses on first dropdown item'}                                      | ${false}                   | ${lastDropdownItemIndex}  | ${firstDropdownItemIndex}        | ${1}
      ${'does not change focus if already on first item'}                                          | ${false}                   | ${firstDropdownItemIndex} | ${firstDropdownItemIndex}        | ${0}
      ${'starting on the user defined dropdown item, focuses on first dropdown item'}              | ${true}                    | ${userDefinedTokenIndex}  | ${firstDropdownItemIndex}        | ${1}
      ${'with user defined dropdown item in list, does not change focus if already on first item'} | ${true}                    | ${firstDropdownItemIndex} | ${firstDropdownItemIndex}        | ${0}
    `(
      'when home key is pressed',
      ({
        userDefinedTokenCanBeAdded,
        focusedDropdownItemIndex,
        expectedFocusedDropdownItemIndex,
        expectedScrollCalls,
        testName,
      }) => {
        beforeEach(async () => {
          createComponent(
            {
              propsData: { registerDropdownEventHandlers, show: true, userDefinedTokenCanBeAdded },
            },
            false,
          );

          await setup({
            focusedDropdownItemIndex,
            expectedFocusedDropdownItemIndex,
            handler: 'handleHomeKey',
            handlerArgs: { preventDefault: () => {} },
          });
        });

        it(`${testName}`, () => {
          expect(expectedFocusedDropdownItem.find('button').classes()).toContain('is-focused');
        });

        it('scrolls focused dropdown item into view', () => {
          expect(expectedFocusedDropdownItem.vm.$el.scrollIntoView).toHaveBeenCalledTimes(
            expectedScrollCalls,
          );
        });
      },
    );

    describe.each`
      testName                                                            | userDefinedTokenCanBeAdded | focusedDropdownItemIndex  | expectedFocusedDropdownItemIndex | expectedScrollCalls
      ${'starting at top, focuses on last dropdown item'}                 | ${false}                   | ${firstDropdownItemIndex} | ${lastDropdownItemIndex}         | ${1}
      ${'does not change focus if already on last item'}                  | ${false}                   | ${lastDropdownItemIndex}  | ${lastDropdownItemIndex}         | ${0}
      ${'starting at top, focuses the user defined dropdown item'}        | ${true}                    | ${firstDropdownItemIndex} | ${userDefinedTokenIndex}         | ${1}
      ${'does not change focus if already on user defined dropdown item'} | ${true}                    | ${userDefinedTokenIndex}  | ${userDefinedTokenIndex}         | ${0}
    `(
      'when end key is pressed',
      ({
        userDefinedTokenCanBeAdded,
        focusedDropdownItemIndex,
        expectedFocusedDropdownItemIndex,
        expectedScrollCalls,
        testName,
      }) => {
        beforeEach(async () => {
          createComponent(
            {
              propsData: { registerDropdownEventHandlers, show: true, userDefinedTokenCanBeAdded },
            },
            false,
          );

          await setup({
            focusedDropdownItemIndex,
            expectedFocusedDropdownItemIndex,
            handler: 'handleEndKey',
            handlerArgs: { preventDefault: () => {} },
          });
        });

        it(`${testName}`, () => {
          expect(expectedFocusedDropdownItem.find('button').classes()).toContain('is-focused');
        });

        it('scrolls focused dropdown item into view', () => {
          expect(expectedFocusedDropdownItem.vm.$el.scrollIntoView).toHaveBeenCalledTimes(
            expectedScrollCalls,
          );
        });
      },
    );

    describe('when show is false', () => {
      beforeEach(() => {
        createComponent(
          {
            propsData: { registerDropdownEventHandlers, show: false },
          },
          false,
        );
      });

      it('emits `show` event and does not focus next dropdown item', async () => {
        await setup({
          focusedDropdownItemIndex: 2,
          expectedFocusedDropdownItemIndex: 2,
          handler: 'handleDownArrow',
        });

        expect(wrapper.emitted('show')).toHaveLength(1);
        expect(expectedFocusedDropdownItem.find('button').classes()).toContain('is-focused');
      });

      it('does not emit `show` event and does not focus next dropdown item', async () => {
        await setup({
          focusedDropdownItemIndex: 2,
          expectedFocusedDropdownItemIndex: 2,
          handler: 'handleUpArrow',
        });

        expect(wrapper.emitted('show')).toBeUndefined();
        expect(expectedFocusedDropdownItem.find('button').classes()).toContain('is-focused');
      });
    });
  });
});
