import { shallowMount } from '@vue/test-utils';
import GlFilteredSearchTokenSegment from './filtered_search_token_segment.vue';
import GlFilteredSearchSuggestion from './filtered_search_suggestion.vue';
import { TERM_TOKEN_TYPE } from './filtered_search_utils';

const OPTIONS = [
  { value: '=', title: 'is' },
  { value: '!=', title: 'is not' },
];

describe('Filtered search token segment', () => {
  let wrapper;

  const searchInputAttributes = { 'data-prop': 'foo-bar' };

  beforeAll(() => {
    if (!HTMLElement.prototype.scrollIntoView) {
      HTMLElement.prototype.scrollIntoView = jest.fn();
    }
  });

  afterAll(() => {
    if (HTMLElement.prototype.scrollIntoView.mock) {
      delete HTMLElement.prototype.scrollIntoView;
    }
  });

  let alignSuggestionsMock;
  let suggestionsMock;

  const createComponent = ({ termsAsTokens = false, ...props } = {}) => {
    alignSuggestionsMock = jest.fn();
    suggestionsMock = {
      methods: {
        nextItem: jest.fn(),
        prevItem: jest.fn(),
        getValue: () => 'notnull',
      },
      template: `<div class="ololosha"><slot></slot></div>`,
    };

    wrapper = shallowMount(GlFilteredSearchTokenSegment, {
      propsData: { ...props, cursorPosition: 'end' },
      provide: {
        portalName: 'fakePortal',
        alignSuggestions: alignSuggestionsMock,
        termsAsTokens: () => termsAsTokens,
      },
      stubs: {
        Portal: { template: '<div><slot></slot></div>' },
        GlFilteredSearchSuggestionList: suggestionsMock,
      },
    });
  };

  const createWrappedComponent = ({ value, termsAsTokens = false, ...otherProps } = {}) => {
    // We need to create fake parent due to https://github.com/vuejs/vue-test-utils/issues/1140
    const fakeParent = {
      inheritAttrs: false,
      data: () => ({ value }),
      components: {
        GlFilteredSearchTokenSegment,
      },
      provide: {
        portalName: 'fakePortal',
        alignSuggestions: () => {},
      },
      template:
        '<gl-filtered-search-token-segment v-bind="$attrs" v-model="value" v-on="$listeners" />',
    };

    wrapper = shallowMount(fakeParent, {
      propsData: { ...otherProps, cursorPosition: 'end' },
      provide: {
        termsAsTokens: () => termsAsTokens,
      },
      stubs: { GlFilteredSearchTokenSegment },
    });
  };

  const findFilteredSearchSuggestion = () => wrapper.findComponent(GlFilteredSearchSuggestion);
  const findFilteredSearchSegment = () => wrapper.findComponent(GlFilteredSearchTokenSegment);
  const findSectionHeader = () => wrapper.findAll('[data-testid="filtered-search-section-header"]');

  it('emits activate on left button click if inactive', () => {
    createComponent({ value: '' });

    wrapper.trigger('mousedown.left');

    expect(wrapper.emitted('activate')).toHaveLength(1);
  });

  it('does not emit activate when view-only is true', () => {
    createComponent({ viewOnly: true, value: '' });

    wrapper.trigger('mousedown.left');

    expect(wrapper.emitted('activate')).toBeUndefined();
  });

  it('ignores mousedown if active', () => {
    createComponent({ value: '', active: true });

    wrapper.trigger('mousedown');

    expect(wrapper.emitted('mousedown')).toBeUndefined();
  });

  it('selects next suggestion if down arrow is pressed', () => {
    createComponent({ active: true, options: OPTIONS, value: false });
    wrapper.find('input').trigger('keydown', { key: 'ArrowDown' });

    expect(suggestionsMock.methods.nextItem).toHaveBeenCalled();
  });

  it('selects previous suggestion if down arrow is pressed', () => {
    createComponent({ active: true, options: OPTIONS, value: false });
    wrapper.find('input').trigger('keydown', { key: 'ArrowUp' });

    expect(suggestionsMock.methods.prevItem).toHaveBeenCalled();
  });

  it('emits submit if Enter is pressed', () => {
    createComponent({ active: true, value: false });
    wrapper.find('input').trigger('keydown', { key: 'Enter' });

    expect(wrapper.emitted('submit')).toHaveLength(1);
  });

  it('emits complete if Escape is pressed', () => {
    createComponent({ active: true, value: false });

    wrapper.find('input').trigger('keydown', { key: 'Escape' });

    expect(wrapper.emitted('complete')).toEqual([[]]);
  });

  it('emits backspace event if value is empty and Backspace is pressed', () => {
    createComponent({ active: true, value: '' });
    wrapper.find('input').trigger('keydown', { key: 'Backspace' });

    expect(wrapper.emitted('backspace')).toHaveLength(1);
  });

  it('does not emit backspace event if value is not empty and Backspace is pressed', () => {
    createComponent({ active: true, value: 'something' });
    wrapper.find('input').trigger('keydown', { key: 'Backspace' });

    expect(wrapper.emitted('backspace')).toBeUndefined();
  });

  it('invokes custom input handler if provided', () => {
    const customInputKeydownHandler = jest.fn();
    createComponent({
      active: true,
      value: 'something',
      customInputKeydownHandler,
    });
    wrapper.find('input').trigger('keydown', { key: 's' });

    expect(customInputKeydownHandler).toHaveBeenCalledWith(
      expect.any(Event),
      expect.objectContaining({
        applySuggestion: expect.any(Function),
        inputValue: 'something',
        suggestedValue: undefined,
      }),
    );
  });

  it('sets tabindex="-1" on the suggestion list to prevent focus trapping', () => {
    createComponent({ active: true, options: OPTIONS, value: false });

    const suggestionList = wrapper.find('[data-testid="filtered-search-suggestion-list"]');
    expect(suggestionList.attributes('tabindex')).toBe('-1');
  });

  it('deactivates when input is blurred', () => {
    createComponent({ active: true, value: 'something' });

    wrapper.find('input').trigger('blur');

    expect(wrapper.emitted('deactivate')).toHaveLength(1);
    expect(wrapper.emitted('complete')).toBeUndefined();
  });

  it('deactivates when input is blurred with a non-element relatedTarget', () => {
    createComponent({ active: true, value: 'something' });

    // jsdom fires blur with relatedTarget = document when the focused input
    // unmounts; document has no classList, unlike any Element.
    const dispatchBlur = () =>
      wrapper
        .find('input')
        .element.dispatchEvent(new FocusEvent('blur', { relatedTarget: document }));

    expect(dispatchBlur).not.toThrow();
    expect(wrapper.emitted('deactivate')).toHaveLength(1);
  });

  it('emits complete when multi-select input is blurred with a non-element relatedTarget', () => {
    createComponent({ active: true, value: 'something', multiSelect: true });

    const dispatchBlur = () =>
      wrapper
        .find('input')
        .element.dispatchEvent(new FocusEvent('blur', { relatedTarget: document }));

    expect(dispatchBlur).not.toThrow();
    expect(wrapper.emitted('complete')).toHaveLength(1);
  });

  it('resets value to previously selected if options are provided and input is invalid', async () => {
    const originalValue = '!=';
    createWrappedComponent({
      value: originalValue,
      title: 'Test',
      options: OPTIONS,
      active: true,
    });

    await wrapper.setData({ value: 'invalid' });
    await wrapper.setProps({ active: false });

    expect(findFilteredSearchSegment().emitted().input[0][0]).toBe(originalValue);
  });

  it('leaves value as-is if options are provided and isTerm=true', async () => {
    const originalValue = '!=';
    createWrappedComponent({
      value: originalValue,
      title: 'Test',
      options: OPTIONS,
      isTerm: true,
      active: true,
    });

    await wrapper.setData({ value: 'invalid' });
    await wrapper.setProps({ active: false });

    expect(findFilteredSearchSegment().emitted().input).toBe(undefined);
  });

  it('works as expected when the value is set to `null`', async () => {
    createWrappedComponent({
      active: true,
      value: 'something',
    });

    await wrapper.setData({ value: null });

    // Shouldn't emit anything
    expect(wrapper.emitted('input')).toBeUndefined();
  });

  describe('applySuggestion', () => {
    it('emits original token when no spaces are present', () => {
      createComponent({ value: '' });

      const token = 'token';

      wrapper.vm.applySuggestion(token);

      expect(wrapper.emitted('input')[0][0]).toBe(token);
      expect(wrapper.emitted('complete')[0][0]).toBe(token);
    });

    it('emits wrapped token when spaces are present', () => {
      createComponent({ value: '' });

      const token = 'token with spaces';
      const formattedToken = `"${token}"`;

      wrapper.vm.applySuggestion(token);

      expect(wrapper.emitted('input')[0][0]).toBe(formattedToken);
      expect(wrapper.emitted('select')[0][0]).toBe(formattedToken);
      expect(wrapper.emitted('complete')[0][0]).toBe(formattedToken);
    });

    it('emits token as-is when spaces are present and termsAsTokens=true', () => {
      createComponent({ value: '', termsAsTokens: true });

      const token = 'token with spaces';

      wrapper.vm.applySuggestion(token);

      expect(wrapper.emitted('input')[0][0]).toBe(token);
      expect(wrapper.emitted('select')[0][0]).toBe(token);
      expect(wrapper.emitted('complete')[0][0]).toBe(token);
    });

    it('emits input value when term token suggestion is chosen and termsAsTokens=true', () => {
      const value = `some text with 'spaces and' "quotes"`;
      createComponent({ value, termsAsTokens: true });

      wrapper.vm.applySuggestion(TERM_TOKEN_TYPE);

      expect(wrapper.emitted('input')[0][0]).toBe(value);
      expect(wrapper.emitted('select')[0][0]).toBe(TERM_TOKEN_TYPE);
      expect(wrapper.emitted('complete')[0][0]).toBe(TERM_TOKEN_TYPE);
    });

    it('selects suggestion on press Enter', () => {
      createComponent({ active: true, options: OPTIONS, value: false });
      wrapper.find('input').trigger('keydown', { key: 'ArrowDown' });

      wrapper.find('input').trigger('keydown', { key: 'Enter' });
      expect(wrapper.emitted('select')).toHaveLength(1);
    });

    it('selects suggestion on press Colon', () => {
      createComponent({ active: true, options: OPTIONS, value: false });
      wrapper.find('input').trigger('keydown', { key: 'ArrowDown' });

      wrapper.find('input').trigger('keydown', { key: ':' });
      expect(wrapper.emitted('select')).toHaveLength(1);
    });
  });

  describe('when multi select', () => {
    beforeEach(() => {
      createComponent({
        active: true,
        multiSelect: true,
        value: ['alpha', 'beta'],
      });
    });

    describe('when blurring the input field', () => {
      it('completes selection', () => {
        wrapper.find('input').trigger('blur');

        expect(wrapper.emitted('complete')).toEqual([[]]);
        expect(wrapper.emitted('deactivate')).toBeUndefined();
      });
    });

    describe('when selecting suggestion from suggestions list', () => {
      const token = 'gamma';

      beforeEach(() => {
        wrapper.vm.applySuggestion(token);
      });

      it('emits "select" event', () => {
        expect(wrapper.emitted('select')).toEqual([[token]]);
      });

      it('does not emit "input" event, to prevent list from filtering', () => {
        expect(wrapper.emitted('input')).toBeUndefined();
      });

      it('does not emit "complete" event, to keep the list open', () => {
        expect(wrapper.emitted('complete')).toBeUndefined();
      });
    });
  });

  const currentValueNoTokens = [{ type: 'filtered-search-term', value: { data: '' } }];
  const currentValueOneToken = [
    { type: 'filtered-search-term', value: { data: 'one' } },
    { type: 'filtered-search-term', value: { data: '' } },
  ];

  describe.each`
    active   | isLastToken | currentValue
    ${true}  | ${true}     | ${currentValueNoTokens}
    ${true}  | ${false}    | ${currentValueNoTokens}
    ${false} | ${true}     | ${currentValueNoTokens}
    ${true}  | ${true}     | ${currentValueOneToken}
    ${true}  | ${false}    | ${currentValueOneToken}
  `(
    'when `active` is `$active`, `isLastToken` is `$isLastToken` and `currentValue` is `$currentValue`',
    ({ active, isLastToken, currentValue }) => {
      beforeEach(() => {
        createComponent({
          value: 'something',
          active,
          isLastToken,
          currentValue,
          searchInputAttributes,
        });
      });

      it('does not add `searchInputAttributes` prop to search token segment', () => {
        expect(wrapper.attributes('data-prop')).toBe(undefined);
      });
    },
  );

  describe('when `active` is `false`, `isLastToken` is `true` and there is one or more tokens', () => {
    beforeEach(() => {
      createComponent({
        value: 'something',
        active: false,
        isLastToken: true,
        currentValue: currentValueOneToken,
        searchInputAttributes,
      });
    });

    it('adds `searchInputAttributes` prop to search token segment', () => {
      expect(wrapper.attributes('data-prop')).toBe(searchInputAttributes['data-prop']);
    });
  });

  describe('slot', () => {
    it('renders custom input slot', () => {
      const customSlotContent = 'Custom slot content';
      wrapper = shallowMount(GlFilteredSearchTokenSegment, {
        propsData: { value: '', active: true, cursorPosition: 'end' },
        provide: {
          portalName: 'fakePortal',
          alignSuggestions: jest.fn(),
          termsAsTokens: () => false,
        },
        slots: {
          input: customSlotContent,
        },
        stubs: {
          Portal: { template: '<div><slot></slot></div>' },
          GlFilteredSearchSuggestionList: suggestionsMock,
        },
      });

      expect(wrapper.html()).toContain('Custom slot content');
    });
  });

  describe('when input is active', () => {
    it('adds `searchInputAttributes` prop to search token segment input', () => {
      createComponent({ active: true, value: 'something', searchInputAttributes });

      expect(wrapper.find('input').attributes('data-prop')).toBe(
        searchInputAttributes['data-prop'],
      );
    });

    it('sets the input `disabled` attribute when viewOnly is true', () => {
      createWrappedComponent({ value: 'test', active: true, viewOnly: true });
      expect(wrapper.find('input').attributes('disabled')).toBeDefined();
    });

    it('does not set the input `disabled` attribute when viewOnly is false', () => {
      createWrappedComponent({ value: 'test', active: true, viewOnly: false });
      expect(wrapper.find('input').attributes('disabled')).toBeUndefined();
    });

    it.each`
      context       | isTerm   | eventPayloads
      ${'does'}     | ${false} | ${[['!=']]}
      ${'does not'} | ${true}  | ${undefined}
    `(
      '$context revert to fallback value on deactivation when no-fallback is $isTerm',
      async ({ isTerm, eventPayloads }) => {
        createComponent({ value: '!=', active: true, options: OPTIONS, isTerm });

        await wrapper.setProps({ value: 'foo', active: false });
        expect(wrapper.emitted('input')).toEqual(eventPayloads);
      },
    );

    it('displays section header when option value starts with gl-filtered-search-suggestion-group-', () => {
      createWrappedComponent({
        value: 'test',
        active: true,
        options: [
          {
            title: 'My header',
            value: 'gl-filtered-search-suggestion-group-test',
          },
        ],
      });

      expect(findFilteredSearchSuggestion().exists()).toBe(false);
      expect(findSectionHeader().exists()).toBe(true);
    });
  });
});
