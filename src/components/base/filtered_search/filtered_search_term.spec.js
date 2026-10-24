import { nextTick } from 'vue';
import { shallowMount } from '@vue/test-utils';
import GlToken from '../token/token.vue';
import FilteredSearchTerm from './filtered_search_term.vue';
import { INTENT_ACTIVATE_PREVIOUS, TERM_TOKEN_TYPE } from './filtered_search_utils';

const availableTokens = [
  { type: 'foo', title: 'test1-foo', token: 'stub', icon: 'eye' },
  { type: 'bar', title: 'test2-bar', token: 'stub', icon: 'eye' },
  { type: 'baz', title: 'test1-baz', token: 'stub', icon: 'eye' },
];

const complexAvailableTokens = [
  {
    type: 'foo',
    match: ({ query, defaultMatcher }) => defaultMatcher('my title in search term', query),
    token: 'stub',
    icon: 'eye',
  },
  {
    type: 'bar',
    match: ({ query, defaultMatcher }) => defaultMatcher('hide my bold title', query),
    token: 'stub',
    icon: 'eye',
    disabled: true,
  },
  {
    type: 'baz',
    match: ({ query, defaultMatcher }) => defaultMatcher('show my title', query),
    token: 'stub',
    icon: 'eye',
    disabled: false,
  },
  { type: 'qux', title: 'qux', token: 'stub', icon: 'eye' },
];

const pointerClass = 'gl-cursor-pointer';

describe('Filtered search term', () => {
  let wrapper;

  const searchInputAttributes = { 'data-testid': 'foo-bar', 'data-prop': 'foo-property' };

  const defaultProps = {
    availableTokens: [],
    cursorPosition: 'end',
  };

  const segmentStub = {
    name: 'gl-filtered-search-token-segment-stub',
    template: '<div><slot v-if="!active" name="view"></slot><slot name="suggestions"></slot></div>',
    props: [
      'searchInputAttributes',
      'isLastToken',
      'currentValue',
      'viewOnly',
      'options',
      'active',
    ],
  };

  const createComponent = ({ termsAsTokens = false, ...props } = {}) => {
    wrapper = shallowMount(FilteredSearchTerm, {
      propsData: { ...defaultProps, ...props },
      provide: {
        termsAsTokens: () => termsAsTokens,
      },
      stubs: {
        'gl-filtered-search-token-segment': segmentStub,
      },
    });
  };

  const findSearchInput = () => wrapper.find('input');
  const findTokenSegmentComponent = () => wrapper.findComponent(segmentStub);
  const findToken = () => wrapper.findComponent(GlToken);

  it('renders value in inactive mode', () => {
    createComponent({ value: { data: 'test-value' } });
    expect(wrapper.html()).toMatchSnapshot();
  });

  it('renders token in inactive mode with termsAsTokens', () => {
    createComponent({ value: { data: 'test value' }, termsAsTokens: true });
    expect(findToken().exists()).toBe(true);
    expect(findToken().props().viewOnly).toBe(false);
    expect(findToken().classes()).toContain(pointerClass);
    expect(findToken().text()).toBe('test value');
  });

  it('renders nothing with value in active mode (delegates to segment)', () => {
    createComponent({ value: { data: 'test-value' }, active: true });
    expect(wrapper.text()).not.toContain('test-value');
    expect(wrapper.html()).toMatchSnapshot();
  });

  it('renders input with placeholder if placeholder prop is provided', () => {
    createComponent({ placeholder: 'placeholder-stub' });
    expect(findSearchInput().attributes('placeholder')).toBe('placeholder-stub');
  });

  it('renders a focusable input when isLastToken is true, even without a placeholder', () => {
    createComponent({ isLastToken: true });
    expect(findSearchInput().exists()).toBe(true);
  });

  it('does not render an input when isLastToken is false and no placeholder is set', () => {
    createComponent({ isLastToken: false });
    expect(findSearchInput().exists()).toBe(false);
  });

  it('uses provided match functions to filter by input', async () => {
    createComponent({
      availableTokens: complexAvailableTokens,
      active: true,
      value: { data: 'title' },
    });

    await nextTick();
    expect(findTokenSegmentComponent().props('options')).toHaveLength(3);
  });

  it('filters suggestions by input', async () => {
    createComponent({ availableTokens, active: true, value: { data: 'test1' } });

    await nextTick();

    expect(findTokenSegmentComponent().props('options')).toHaveLength(2);
  });

  it('suggests text search when termsAsTokens=true', async () => {
    createComponent({
      availableTokens,
      active: true,
      value: { data: 'foo' },
      termsAsTokens: true,
    });

    await nextTick();

    expect(findTokenSegmentComponent().props('options')).toEqual([
      expect.objectContaining({
        value: 'foo',
        title: 'test1-foo',
      }),
      expect.objectContaining({
        value: TERM_TOKEN_TYPE,
        title: 'Search for this text',
      }),
    ]);
  });

  it.each`
    originalEvent   | originalPayload    | emittedEvent    | payload
    ${'activate'}   | ${undefined}       | ${'activate'}   | ${undefined}
    ${'deactivate'} | ${undefined}       | ${'deactivate'} | ${undefined}
    ${'split'}      | ${'foo'}           | ${'split'}      | ${'foo'}
    ${'submit'}     | ${undefined}       | ${'submit'}     | ${undefined}
    ${'previous'}   | ${undefined}       | ${'previous'}   | ${undefined}
    ${'next'}       | ${undefined}       | ${'next'}       | ${undefined}
    ${'complete'}   | ${'foo'}           | ${'replace'}    | ${{ type: 'foo' }}
    ${'complete'}   | ${TERM_TOKEN_TYPE} | ${'complete'}   | ${undefined}
    ${'backspace'}  | ${undefined}       | ${'destroy'}    | ${{ intent: INTENT_ACTIVATE_PREVIOUS }}
  `(
    'emits $emittedEvent when token segment emits $originalEvent',
    async ({ originalEvent, originalPayload, emittedEvent, payload }) => {
      createComponent({ active: true, value: { data: 'something' } });

      findTokenSegmentComponent().vm.$emit(originalEvent, originalPayload);

      await nextTick();

      expect(wrapper.emitted(emittedEvent)).toHaveLength(1);

      if (payload !== undefined) {
        expect(wrapper.emitted(emittedEvent)[0][0]).toEqual(payload);
      }
    },
  );

  it('passes `searchInputAttributes`, `isLastToken`, `currentValue` & `viewOnly` props to `GlFilteredSearchTokenSegment`', () => {
    const isLastToken = true;
    const viewOnly = true;
    const currentValue = [
      { type: 'filtered-search-term', value: { data: 'something' } },
      { type: 'filtered-search-term', value: { data: '' } },
    ];

    createComponent({
      value: { data: 'something' },
      searchInputAttributes,
      isLastToken,
      currentValue,
      viewOnly,
    });

    expect(findTokenSegmentComponent().props()).toEqual(
      expect.objectContaining({
        searchInputAttributes,
        isLastToken,
        currentValue,
        viewOnly,
      }),
    );
  });

  it('by default sets `viewOnly` to false on `GlFilteredSearchTokenSegment`', () => {
    createComponent();

    expect(findTokenSegmentComponent().props('viewOnly')).toBe(false);
  });

  it('sets viewOnly prop and removes pointer class on token when termsAsTokens=true', () => {
    createComponent({
      value: { data: 'foo' },
      viewOnly: true,
      termsAsTokens: true,
    });

    expect(findToken().props().viewOnly).toBe(true);
    expect(findToken().classes()).not.toContain(pointerClass);
  });

  it('adds `searchInputAttributes` prop to search term input', () => {
    createComponent({
      placeholder: 'placeholder-stub',
      searchInputAttributes,
    });

    expect(findSearchInput().attributes('data-prop')).toBe(searchInputAttributes['data-prop']);
  });

  it('activates when the input is focused', async () => {
    createComponent({ placeholder: 'placeholder-stub' });
    await nextTick();

    expect(wrapper.emitted()).toEqual({});

    await findSearchInput().trigger('focusin');

    expect(wrapper.emitted()).toEqual({ activate: [[]] });
  });

  it('does not deactivate when the input loses focus to its own replacement', async () => {
    createComponent({ placeholder: 'placeholder-stub' });
    await nextTick();

    await findSearchInput().trigger('focusin');
    await findSearchInput().trigger('focusout');

    expect(wrapper.emitted('deactivate')).toBeUndefined();
  });

  describe.each([true, false])('when `viewOnly` is %s', (viewOnly) => {
    beforeEach(() => {
      createComponent({ viewOnly, searchInputAttributes, placeholder: 'placeholder-stub' });
    });

    it(`${viewOnly ? 'disables' : 'enables'} the input`, () => {
      expect(findSearchInput().attributes('disabled')).toBe(viewOnly ? 'disabled' : undefined);
    });

    it(`${viewOnly ? 'clears' : 'does not clear'} the suggestions`, async () => {
      await nextTick();
      expect(findTokenSegmentComponent().props('options')).toEqual(
        viewOnly ? [] : expect.any(Array),
      );
    });
  });
});
