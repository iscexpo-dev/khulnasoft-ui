import Vue, { markRaw, nextTick } from 'vue';
import { omit } from 'lodash-es';
import { shallowMount, mount } from '@vue/test-utils';
import GlFilteredSearch from './filtered_search.vue';
import GlFilteredSearchSuggestion from './filtered_search_suggestion.vue';
import GlFilteredSearchSuggestionList from './filtered_search_suggestion_list.vue';
import GlFilteredSearchTerm from './filtered_search_term.vue';
import GlFilteredSearchToken from './filtered_search_token.vue';
import GlFilteredSearchTokenSegment from './filtered_search_token_segment.vue';
import { TERM_TOKEN_TYPE, INTENT_ACTIVATE_PREVIOUS } from './filtered_search_utils';

jest.mock('~/directives/tooltip/tooltip');

const FakeToken = {
  props: ['active'],
  inheritAttrs: false,
  render: (h) => h('div'),
};

const AppliedTokensTestFakeToken = {
  props: ['appliedTokens'],
  render: (h) => h('div'),
};

Vue.directive('GlTooltip', () => {});

let wrapper;

const findFilteredSearchInput = () => wrapper.find('[data-testid="filtered-search-input"]');
const stripId = (token) => (typeof token === 'object' ? omit(token, 'id') : token);

describe('Filtered search', () => {
  const defaultProps = {
    availableTokens: [{ type: 'faketoken', token: FakeToken }],
  };

  const findSearchBox = () => wrapper.findComponent({ name: 'GlSearchBoxByClickStub' });

  const createComponent = (props) => {
    wrapper = shallowMount(GlFilteredSearch, {
      propsData: { ...defaultProps, ...props },
      stubs: {
        GlSearchBoxByClick: {
          name: 'GlSearchBoxByClickStub',
          props: ['clearable', 'searchButtonAttributes', 'showSearchButton', 'wrapperAttributes'],
          template: '<div v-bind="wrapperAttributes"><slot name="input"></slot></div>',
        },
      },
    });
  };

  afterEach(() => {
    wrapper = null;
  });

  describe('value manipulation', () => {
    it('creates term when empty', () => {
      createComponent();
      // eslint-disable-next-line unicorn/no-array-callback-reference
      expect(wrapper.emitted().input[0][0].map(stripId)).toStrictEqual([
        { type: TERM_TOKEN_TYPE, value: { data: '' } },
      ]);
    });

    it('passes clearable false when empty', () => {
      createComponent();
      expect(findSearchBox().props('clearable')).toBe(false);
    });

    it('adds empty term to the end when not empty', () => {
      createComponent({
        value: [{ type: 'faketoken', value: { data: '' } }],
      });

      expect(stripId(wrapper.emitted().input[0][0].pop())).toStrictEqual({
        type: TERM_TOKEN_TYPE,
        value: { data: '' },
      });
    });

    it('passes clearable true when not empty', async () => {
      createComponent({
        value: [{ type: 'faketoken', value: { data: '' } }],
      });
      await nextTick();

      expect(findSearchBox().props('clearable')).toBe(true);
    });

    it('denormalizes strings if needed', async () => {
      createComponent({
        value: ['one', 'two'],
      });
      await nextTick();

      const [inputEventArgs] = wrapper.emitted().input.at(-1);
      expect(inputEventArgs.every((t) => t.type === TERM_TOKEN_TYPE)).toBe(true);
      expect(inputEventArgs.map((t) => t.value.data)).toStrictEqual(['one', 'two', '']);
    });

    it('splits strings if needed', async () => {
      createComponent({
        value: ['one two'],
      });
      await nextTick();

      const [inputEventArgs] = wrapper.emitted().input.at(-1);
      expect(inputEventArgs.every((t) => t.type === TERM_TOKEN_TYPE)).toBe(true);
      expect(inputEventArgs.map((t) => t.value.data)).toStrictEqual(['one', 'two', '']);
    });

    it('does not split strings with termsAsTokens', async () => {
      createComponent({
        termsAsTokens: true,
        value: ['one two'],
      });
      await nextTick();

      const [inputEventArgs] = wrapper.emitted().input.at(-1);
      expect(inputEventArgs.every((t) => t.type === TERM_TOKEN_TYPE)).toBe(true);
      expect(inputEventArgs.map((t) => t.value.data)).toStrictEqual(['one two', '']);
    });
  });

  describe('event handling', () => {
    it.each`
      eventName                  | payload
      ${'submit'}                | ${[[]]}
      ${'clear'}                 | ${[]}
      ${'history-item-selected'} | ${['item']}
      ${'clear-history'}         | ${[]}
    `('passes through $eventName', async ({ eventName, payload }) => {
      createComponent();
      findSearchBox().vm.$emit(eventName, payload[0]);
      await nextTick();

      expect(wrapper.emitted()[eventName][0]).toStrictEqual(payload);
    });

    it('activates token when requested', async () => {
      createComponent({
        value: [{ type: 'faketoken', value: '' }],
      });
      await nextTick();

      wrapper.findComponent(FakeToken).vm.$emit('activate');

      await nextTick();

      expect(wrapper.findComponent(FakeToken).props('active')).toBe(true);
    });

    it('deactivates token when requested', async () => {
      createComponent({
        value: [{ type: 'faketoken', value: '' }],
      });
      await nextTick();

      wrapper.findComponent(FakeToken).vm.$emit('activate');
      wrapper.findComponent(FakeToken).vm.$emit('deactivate');

      await nextTick();

      expect(
        wrapper.findAllComponents({ ref: 'tokens' }).filter((w) => w.props('active') === true),
      ).toHaveLength(0);
    });

    it('ignores deactivate requests from non-active tokens', async () => {
      createComponent({
        value: [
          { type: 'faketoken', value: { data: '1' } },
          { type: 'faketoken', value: { data: '2' } },
        ],
      });
      await nextTick();

      wrapper.findComponent(FakeToken).vm.$emit('activate');
      wrapper.findAllComponents(FakeToken).at(1).vm.$emit('deactivate');

      await nextTick();

      expect(wrapper.findComponent(FakeToken).props('active')).toBe(true);
    });

    it('removes empty term tokens on deactivate', async () => {
      const findSecondTerm = () => wrapper.findAllComponents(GlFilteredSearchTerm).at(1);
      createComponent({
        value: [{ type: 'faketoken', value: { data: '' } }, 'one', 'two', 'three'],
      });

      await nextTick();

      findSecondTerm().vm.$emit('activate');
      findSecondTerm().vm.$emit('input', { data: '' });

      await nextTick();

      findSecondTerm().vm.$emit('deactivate');

      await nextTick();

      // eslint-disable-next-line unicorn/no-array-callback-reference
      expect(wrapper.emitted().input.pop()[0].map(stripId)).toStrictEqual([
        { type: 'faketoken', value: { data: '' } },
        { type: TERM_TOKEN_TYPE, value: { data: 'one' } },
        { type: TERM_TOKEN_TYPE, value: { data: 'three' } },
        { type: TERM_TOKEN_TYPE, value: { data: '' } },
      ]);
    });

    it('destroys token if requested', async () => {
      createComponent({
        value: [{ type: 'faketoken', value: '' }, 'one'],
      });
      await nextTick();

      wrapper.findComponent(FakeToken).vm.$emit('destroy');

      await nextTick();

      // eslint-disable-next-line unicorn/no-array-callback-reference
      expect(wrapper.emitted().input.pop()[0].map(stripId)).toStrictEqual([
        { type: TERM_TOKEN_TYPE, value: { data: 'one' } },
        { type: TERM_TOKEN_TYPE, value: { data: '' } },
      ]);
    });

    it('makes previous token active if user intends it on token destruction', async () => {
      createComponent({
        value: [{ type: 'faketoken', value: '' }, ''],
      });
      await nextTick();

      wrapper
        .findComponent(GlFilteredSearchTerm)
        .vm.$emit('destroy', { intent: INTENT_ACTIVATE_PREVIOUS });

      await nextTick();

      expect(wrapper.findComponent(FakeToken).props('active')).toBe(true);
    });

    it('keeps first token active on first token destruction with backspace', async () => {
      createComponent({
        value: ['foo', { type: 'faketoken', value: '' }],
      });
      await nextTick();
      wrapper.findComponent(FakeToken).vm.$emit('activate');
      await nextTick();

      expect(wrapper.findComponent(FakeToken).props('active')).toBe(true);

      wrapper
        .findAllComponents(GlFilteredSearchTerm)
        .at(0)
        .vm.$emit('destroy', { intent: INTENT_ACTIVATE_PREVIOUS });

      await nextTick();

      expect(wrapper.findComponent(FakeToken).props('active')).toBe(true);
    });

    it('keeps active token active if later one destroyed', async () => {
      createComponent({
        value: [
          { type: 'faketoken', value: '' },
          { type: 'faketoken', value: '' },
          { type: 'faketoken', value: '' },
        ],
      });
      await nextTick();
      wrapper.findAllComponents(FakeToken).at(0).vm.$emit('activate');
      await nextTick();

      wrapper.findAllComponents(FakeToken).at(2).vm.$emit('destroy');

      await nextTick();

      expect(wrapper.findAllComponents(FakeToken).at(0).props('active')).toBe(true);
    });

    it('keeps active token active if earlier one destroyed', async () => {
      createComponent({
        value: [
          { type: 'faketoken', value: '' },
          { type: 'faketoken', value: '' },
          { type: 'faketoken', value: '' },
        ],
      });
      await nextTick();
      wrapper.findAllComponents(FakeToken).at(2).vm.$emit('activate');
      await nextTick();

      wrapper.findAllComponents(FakeToken).at(0).vm.$emit('destroy');

      await nextTick();

      expect(wrapper.findAllComponents(FakeToken).at(1).props('active')).toBe(true);
    });

    it('activates the last token when the active token is destroyed', async () => {
      createComponent({
        value: ['one', { type: 'faketoken', value: '' }],
      });
      await nextTick();
      wrapper.findComponent(FakeToken).vm.$emit('activate');
      await nextTick();

      wrapper.findComponent(FakeToken).vm.$emit('destroy');

      await nextTick();

      const terms = wrapper.findAllComponents(GlFilteredSearchTerm).wrappers;
      const lastTerm = terms[terms.length - 1];
      expect(lastTerm.props('active')).toBe(true);
    });

    it('activates the last token when an inactive token is destroyed', async () => {
      createComponent({
        value: ['one', { type: 'faketoken', value: '' }],
      });
      await nextTick();

      wrapper.findComponent(FakeToken).vm.$emit('destroy');

      await nextTick();

      const terms = wrapper.findAllComponents(GlFilteredSearchTerm).wrappers;
      const lastTerm = terms[terms.length - 1];
      expect(lastTerm.props('active')).toBe(true);
    });

    it('does not destroy last token', async () => {
      createComponent();
      wrapper.findComponent(GlFilteredSearchTerm).vm.$emit('destroy');

      await nextTick();

      // eslint-disable-next-line unicorn/no-array-callback-reference
      expect(wrapper.emitted().input.pop()[0].map(stripId)).toStrictEqual([
        { type: TERM_TOKEN_TYPE, value: { data: '' } },
      ]);
    });

    it('replaces token when requested', async () => {
      createComponent();
      wrapper
        .findComponent(GlFilteredSearchTerm)
        .vm.$emit('replace', { type: 'faketoken', value: { data: 'test' } });

      await nextTick();

      // eslint-disable-next-line unicorn/no-array-callback-reference
      expect(wrapper.emitted().input.pop()[0].map(stripId)).toStrictEqual([
        { type: 'faketoken', value: { data: 'test' } },
        { type: TERM_TOKEN_TYPE, value: { data: '' } },
      ]);
    });

    it('replaces token after clear when requested', async () => {
      createComponent({
        value: ['one', { type: 'faketoken', value: '' }, 'two'],
      });

      findSearchBox().vm.$emit('input', '');

      await nextTick();

      wrapper
        .findComponent(GlFilteredSearchTerm)
        .vm.$emit('replace', { type: 'faketoken', value: { data: 'test' } });

      await nextTick();

      // eslint-disable-next-line unicorn/no-array-callback-reference
      expect(wrapper.emitted().input.pop()[0].map(stripId)).toStrictEqual([
        { type: 'faketoken', value: { data: 'test' } },
        { type: TERM_TOKEN_TYPE, value: { data: '' } },
      ]);
    });

    it('inserts single token when requested', async () => {
      createComponent({ value: ['one'] });
      wrapper.findComponent(GlFilteredSearchTerm).vm.$emit('activate');
      wrapper.findComponent(GlFilteredSearchTerm).vm.$emit('split');

      await nextTick();

      // eslint-disable-next-line unicorn/no-array-callback-reference
      expect(wrapper.emitted().input.pop()[0].map(stripId)).toStrictEqual([
        { type: TERM_TOKEN_TYPE, value: { data: 'one' } },
        { type: TERM_TOKEN_TYPE, value: { data: '' } },
      ]);
    });

    it('jumps to last token when insert of empty term requested', async () => {
      createComponent({ value: ['one', 'two'] });
      await nextTick();

      wrapper.findComponent(GlFilteredSearchTerm).vm.$emit('activate');
      wrapper.findComponent(GlFilteredSearchTerm).vm.$emit('split');

      await nextTick();

      expect(wrapper.findAllComponents(GlFilteredSearchTerm).at(2).props('active')).toBe(true);
      // eslint-disable-next-line unicorn/no-array-callback-reference
      expect(wrapper.emitted().input.pop()[0].map(stripId)).toStrictEqual([
        { type: TERM_TOKEN_TYPE, value: { data: 'one' } },
        { type: TERM_TOKEN_TYPE, value: { data: 'two' } },
        { type: TERM_TOKEN_TYPE, value: { data: '' } },
      ]);
    });

    it('inserts multiple tokens when requested', async () => {
      createComponent({ value: ['one'] });
      wrapper.findComponent(GlFilteredSearchTerm).vm.$emit('activate');

      await nextTick();

      wrapper.findComponent(GlFilteredSearchTerm).vm.$emit('split', ['foo', 'bar']);

      await nextTick();

      // eslint-disable-next-line unicorn/no-array-callback-reference
      expect(wrapper.emitted().input.pop()[0].map(stripId)).toStrictEqual([
        { type: TERM_TOKEN_TYPE, value: { data: 'one' } },
        { type: TERM_TOKEN_TYPE, value: { data: 'foo' } },
        { type: TERM_TOKEN_TYPE, value: { data: 'bar' } },
        { type: TERM_TOKEN_TYPE, value: { data: '' } },
      ]);
    });

    it('submits entire search when submit is requested', () => {
      createComponent();
      wrapper.findComponent(GlFilteredSearchTerm).vm.$emit('submit');
      expect(wrapper.emitted('submit')).toBeDefined();
    });

    it('emits "token-complete" event when token is complete', async () => {
      const token = { type: 'faketoken', value: '' };
      createComponent({
        value: ['one', token],
      });

      await nextTick();
      wrapper.findComponent(FakeToken).vm.$emit('activate');
      await nextTick();

      expect(wrapper.emitted('token-complete')).toBeUndefined();
      wrapper.findComponent(FakeToken).vm.$emit('complete');
      expect(wrapper.emitted('token-complete')).toMatchObject([[token]]);
    });

    it('emits "token-destroy" event when token is destroyed', async () => {
      const token = { type: 'faketoken', value: '' };
      createComponent({
        value: ['one', token],
      });

      await nextTick();
      wrapper.findComponent(FakeToken).vm.$emit('activate');
      await nextTick();

      expect(wrapper.emitted('token-destroy')).toBeUndefined();
      wrapper.findComponent(FakeToken).vm.$emit('destroy');
      expect(wrapper.emitted('token-destroy')).toMatchObject([[token]]);
    });
  });

  it('normalizes term tokens to strings on submit', () => {
    createComponent({
      value: ['one'],
    });
    wrapper.findComponent(GlFilteredSearchTerm).vm.$emit('submit');
    expect(wrapper.emitted('submit')).toBeDefined();
    expect(wrapper.emitted('submit')[0][0]).toStrictEqual(['one']);
  });

  it('concatenates strings on submit', () => {
    createComponent({
      value: ['one', 'two', { type: 'faketoken', value: { data: 'smth' } }, 'four', 'five'],
    });
    wrapper.findComponent(GlFilteredSearchTerm).vm.$emit('submit');
    expect(wrapper.emitted('submit')).toBeDefined();
    // eslint-disable-next-line unicorn/no-array-callback-reference
    expect(wrapper.emitted().submit[0][0].map(stripId)).toStrictEqual([
      'one two',
      { type: 'faketoken', value: { data: 'smth' } },
      'four five',
    ]);
  });

  it('passes required props to tokens', async () => {
    createComponent({
      value: [{ type: 'faketoken', value: '' }],
    });
    await nextTick();

    const fakeTokenInstance = wrapper.findComponent(FakeToken);
    expect(fakeTokenInstance.exists()).toBe(true);
    expect(Object.keys(fakeTokenInstance.attributes())).toEqual(
      expect.arrayContaining(['current-value', 'index', 'config', 'value']),
    );
  });

  it('passes appliedTokens prop to the token component', async () => {
    const value = [{ type: 'faketoken', value: 'foo' }];
    const expectedAppliedTokens = [{ type: 'faketoken', value: 'foo', id: expect.anything() }];
    createComponent({
      value,
      availableTokens: [{ type: 'faketoken', token: AppliedTokensTestFakeToken }],
    });
    await nextTick();

    const fakeTokenInstance = wrapper.findComponent(AppliedTokensTestFakeToken);
    expect(fakeTokenInstance.exists()).toBe(true);
    expect(fakeTokenInstance.props('appliedTokens')).toEqual(expectedAppliedTokens);
  });

  it('passes `searchButtonAttributes` prop to `GlSearchBoxByClick`', () => {
    const searchButtonAttributes = { 'data-prop': 'foo-bar' };

    createComponent({ searchButtonAttributes });

    expect(findSearchBox().props('searchButtonAttributes')).toEqual(searchButtonAttributes);
  });

  it('passes `searchInputAttributes` prop to search term', async () => {
    const searchInputAttributes = { 'data-prop': 'foo-bar' };

    createComponent({
      value: ['one'],
      searchInputAttributes,
    });
    await nextTick();

    expect(wrapper.findComponent(GlFilteredSearchTerm).props('searchInputAttributes')).toEqual(
      searchInputAttributes,
    );
  });

  it('passes `isLastToken` prop to search terms', async () => {
    createComponent({
      value: ['one'],
    });
    await nextTick();

    const filteredSearchTerms = wrapper.findAllComponents(GlFilteredSearchTerm);

    expect(filteredSearchTerms.at(0).props('isLastToken')).toBe(false);
    expect(filteredSearchTerms.at(1).props('isLastToken')).toBe(true);
  });

  it('passes `currentValue` prop to search terms', async () => {
    createComponent({
      value: ['one'],
    });
    await nextTick();

    // eslint-disable-next-line unicorn/no-array-callback-reference
    expect(wrapper.findComponent(GlFilteredSearchTerm).props('currentValue').map(stripId)).toEqual([
      { type: 'filtered-search-term', value: { data: 'one' } },
      { type: 'filtered-search-term', value: { data: '' } },
    ]);
  });

  it('the search input is enabled by default', () => {
    createComponent();

    expect(findFilteredSearchInput().attributes('disabled')).toBe(undefined);
  });

  describe('view-only state', () => {
    const createViewOnlyComponent = (viewOnly) =>
      createComponent({
        value: ['one', { type: 'faketoken', value: '' }],
        viewOnly,
      });

    it.each([true, false])(
      'passes the value of viewOnly to the search term when view-only is %s',
      (viewOnly) => {
        createViewOnlyComponent(viewOnly);

        expect(wrapper.findComponent(GlFilteredSearchTerm).props('viewOnly')).toBe(viewOnly);
      },
    );

    describe('when view-only is true', () => {
      beforeEach(() => {
        createViewOnlyComponent(true);
      });

      it('disables the search input', () => {
        expect(findFilteredSearchInput().attributes('disabled')).toBe('disabled');
      });

      it('prevents tokens from activating', async () => {
        await wrapper.findComponent(FakeToken).vm.$emit('activate');

        wrapper.findAll(`.gl-filtered-search-item`).wrappers.forEach((searchTermWrapper) => {
          expect(searchTermWrapper.props('active')).toBe(false);
        });
      });

      it('does not apply the last token class', async () => {
        expect(wrapper.find('.gl-filtered-search-last-item').exists()).toBe(false);
      });
    });
  });

  describe('showSearchButton', () => {
    it('sets showSearchButton on the SearchBox component', () => {
      createComponent({ showSearchButton: true });

      expect(findSearchBox().props('showSearchButton')).toBe(true);
    });

    it('adds the *-with-search-button css modifier if true', () => {
      createComponent({ showSearchButton: true });

      expect(wrapper.find('.gl-filtered-search-scrollable-container').classes()).toContain(
        'gl-filtered-search-scrollable-container-with-search-button',
      );
    });

    it('does not add the *-with-search-button css modifier if false', () => {
      createComponent({ showSearchButton: false });

      expect(wrapper.find('.gl-filtered-search-scrollable-container').classes()).not.toContain(
        'gl-filtered-search-scrollable-container-with-search-button',
      );
    });
  });
});

describe('Filtered search integration tests', () => {
  const testTokens = [
    {
      type: 'static',
      icon: 'label',
      token: GlFilteredSearchToken,
      title: 'Static-token',
      segmentTitle: 'Static',
      options: [
        { title: 'first', value: 'one' },
        { title: 'second', value: 'two' },
        { title: 'third', value: 'three' },
      ],
    },
    { type: 'dynamic!token', icon: 'rocket', title: 'Fake-token', token: FakeToken },
    {
      type: 'unique',
      unique: true,
      icon: 'document',
      token: GlFilteredSearchToken,
      title: 'Unique-token',
      options: [
        { title: 'first', value: 'one' },
        { title: 'second', value: 'two' },
      ],
    },
    {
      type: 'disabled',
      icon: 'document',
      title: 'Disabled-token',
      token: FakeToken,
      disabled: true,
    },
    {
      type: 'gl-filtered-search-suggestion-group-enabled',
      title: 'Section-header-token',
    },
    {
      type: 'gl-filtered-search-suggestion-group-disabled',
      title: 'Disabled-section-header-token',
      disabled: true,
    },
  ];

  const mountComponent = (props) => {
    wrapper = mount(GlFilteredSearch, {
      propsData: {
        availableTokens: testTokens,
        ...props,
      },
      attachTo: document.body,
    });
  };

  const activate = (idx) =>
    wrapper
      .findAllComponents(GlFilteredSearchTerm)
      .at(idx)
      .find('div.gl-filtered-search-token-segment')
      .trigger('mousedown');

  const findInput = () =>
    wrapper
      .findAllComponents(GlFilteredSearchTerm)
      .filter((t) => t.props().active)
      .at(0)
      .find('input');

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

  describe('when first term is clicked', () => {
    beforeEach(async () => {
      mountComponent();
      activate(0);
      await nextTick();
    });

    it('brings focus to term element input', () => {
      const input = findInput();
      expect(input.exists()).toBe(true);
      expect(document.activeElement).toBe(input.element);
    });

    it('displays suggestions list', () => {
      const suggestions = wrapper.findComponent(GlFilteredSearchSuggestionList);
      expect(suggestions.exists()).toBe(true);
      expect(suggestions.findAllComponents(GlFilteredSearchSuggestion)).toHaveLength(
        testTokens.filter(
          (t) => !t.type.startsWith('gl-filtered-search-suggestion-group-') && !t.disabled,
        ).length,
      );
    });

    it('renders enabled tokens without types as section headers', () => {
      const suggestions = wrapper.findComponent(GlFilteredSearchSuggestionList);
      const sectionHeaders = suggestions.findAll('[data-testid="filtered-search-section-header"]');
      expect(sectionHeaders).toHaveLength(1);
    });

    it('renders customized segment text when provided', async () => {
      const input = findInput();
      input.trigger('keydown', { key: 'ArrowDown' });

      await nextTick();

      input.trigger('keydown', { key: 'Enter' });

      await nextTick();

      expect(wrapper.findAllComponents(GlFilteredSearchTokenSegment).at(0).props('value')).toBe(
        'Static',
      );
    });

    it('updates suggestions list as you type', async () => {
      const input = findInput();
      input.setValue('sta'); // partial of "static"

      await nextTick();

      const suggestions = wrapper.findComponent(GlFilteredSearchSuggestionList);
      expect(suggestions.exists()).toBe(true);
      expect(suggestions.findAllComponents(GlFilteredSearchSuggestion)).toHaveLength(1);
    });

    it('resets suggestions list as you press Space', async () => {
      const input = findInput();
      input.setValue('--wrong-- ');

      await nextTick();

      const suggestions = wrapper.findComponent(GlFilteredSearchSuggestionList);
      expect(suggestions.exists()).toBe(true);
      expect(suggestions.findAllComponents(GlFilteredSearchSuggestion)).toHaveLength(3);
    });

    it('does not render suggestions list if there are no suggestions available', async () => {
      const input = findInput();
      input.setValue('--wrong--');

      await nextTick();

      const suggestions = wrapper.findComponent(GlFilteredSearchSuggestionList);
      expect(suggestions.exists()).toBe(false);
    });

    it('replaces term with token when suggestion is selected', async () => {
      const input = findInput();
      input.trigger('keydown', { key: 'ArrowDown' });

      await nextTick();

      input.trigger('keydown', { key: 'Enter' });

      await nextTick();

      const token = wrapper.findComponent(GlFilteredSearchToken);
      expect(token.exists()).toBe(true);
    });

    it('does not mutate the `value` prop when the search input changes', async () => {
      const initialValue = [...wrapper.props('value')];

      const input = findInput();
      input.trigger('keydown', { key: 'ArrowDown' });
      await nextTick();
      input.trigger('keydown', { key: 'Enter' });
      await nextTick();

      expect(wrapper.props('value')).toEqual(initialValue);
    });

    it('calls alignSuggestion for new tokens', async () => {
      const input = findInput();
      input.trigger('keydown', { key: 'ArrowDown' });
      const alignSuggestionsSpy = jest.spyOn(wrapper.vm, 'alignSuggestions');

      await nextTick();

      await input.trigger('keydown', { key: 'Enter' });

      await nextTick();

      expect(alignSuggestionsSpy).toHaveBeenCalled();
    });
  });

  it('sets the gl-filtered-search-last-item class only when no token is active', async () => {
    mountComponent({ value: ['one', 'two'] });
    await nextTick();

    expect(wrapper.findAll('.gl-filtered-search-last-item')).toHaveLength(1);

    activate(0);

    await nextTick();

    expect(wrapper.findAll('.gl-filtered-search-last-item')).toHaveLength(0);
  });

  it('does not render unique token in suggestions list if it is already present', async () => {
    mountComponent({ value: ['token', { type: 'unique', value: { data: 'something' } }] });
    activate(0);

    await nextTick();

    const suggestions = wrapper.findComponent(GlFilteredSearchSuggestionList);
    expect(suggestions.exists()).toBe(true);
    expect(suggestions.findAllComponents(GlFilteredSearchSuggestion)).toHaveLength(2);
  });

  it('correctly handles switching from one token to another', async () => {
    mountComponent({ value: ['one two'] });
    activate(0);

    await nextTick();

    activate(1);

    await nextTick();

    expect(wrapper.findAllComponents(GlFilteredSearchTerm).at(1).find('input').exists()).toBe(true);
  });

  it('activates previous token when backspacing on empty search term', async () => {
    mountComponent({ value: ['zero one two'] });
    await nextTick();

    activate(1);

    await nextTick();
    await nextTick();

    // Make sure we have the expected search term
    const inputWrapper = wrapper.find('input');
    expect(inputWrapper.element.value).toBe('one');

    // Mimic backspace behavior for jsdom
    await inputWrapper.setValue('');
    await inputWrapper.trigger('keydown', { key: 'Backspace' });

    await nextTick();

    // Make sure the previous token/search term is now active
    const input = wrapper.find('input').element;
    expect(input.value).toBe('zero');
    expect(document.activeElement).toBe(input);
  });

  it('clicking clear button clears component input', async () => {
    mountComponent({ value: ['one two three'] });
    await nextTick();

    wrapper
      .findAll('button')
      .wrappers.find((b) => b.attributes('name') === 'clear')
      .trigger('click');

    await nextTick();

    expect(wrapper.findAllComponents(GlFilteredSearchTerm)).toHaveLength(1);
  });

  // Regression test for https://github.com/khulnasoft/khulnasoft-ui/-/issues/1761
  it('does not incorrectly activate next token of the same type after token destruction', async () => {
    mountComponent({
      value: [
        { type: 'static', value: { data: 'first', operator: '=' } },
        { type: 'static', value: { data: 'second', operator: '=' } },
        { type: 'unique', value: { data: 'something' } },
      ],
    });
    await nextTick();

    expect(
      wrapper.findAllComponents(GlFilteredSearchToken).wrappers.map((cmp) => cmp.props('active')),
    ).toEqual([false, false, false]);

    await wrapper.find('.gl-token-close').trigger('click');

    expect(
      wrapper.findAllComponents(GlFilteredSearchToken).wrappers.map((cmp) => cmp.props('active')),
    ).toEqual([false, false]);
  });

  it('updates tokens list when value is passed dynamically', async () => {
    mountComponent({ value: ['one'] });
    await nextTick();

    expect(wrapper.findAllComponents(GlFilteredSearchTerm)).toHaveLength(2);

    await wrapper.setProps({
      value: ['one two'],
    });

    const termComponents = wrapper.findAllComponents(GlFilteredSearchTerm).wrappers;
    expect(termComponents).toHaveLength(3);
    expect(termComponents.map((termComponent) => termComponent.props('value'))).toEqual([
      { data: 'one' },
      { data: 'two' },
      { data: '' },
    ]);
  });

  it('updates tokens list when empty value is passed dynamically', async () => {
    mountComponent({ value: ['one'] });
    await nextTick();

    expect(wrapper.findAllComponents(GlFilteredSearchTerm)).toHaveLength(2);

    await wrapper.setProps({
      value: [],
    });

    const termComponents = wrapper.findAllComponents(GlFilteredSearchTerm).wrappers;
    expect(termComponents).toHaveLength(1);
    expect(termComponents.map((termComponent) => termComponent.props('value'))).toEqual([
      { data: '' },
    ]);
  });

  it('has data-testid attribute on the form input group wrapper', () => {
    mountComponent();

    const formInputGroup = wrapper.find('[role="group"]');
    expect(formInputGroup.exists()).toBe(true);
    expect(formInputGroup.attributes('data-testid')).toBe('filtered-search-input');
  });
});

describe('Filtered search with reactive availableTokens', () => {
  const PlainToken = {
    props: ['active'],
    render: (h) => h('div', { attrs: { 'data-testid': 'plain-token' } }),
  };

  // Tokens in data() are deeply reactive, like a consumer's component state.
  // On Vue 3 the token component comes back as a proxy.
  const createParent = (token) => ({
    components: { GlFilteredSearch },
    data() {
      return {
        tokens: [{ type: 'plain', icon: 'user', title: 'Plain', token }],
        value: [{ type: 'plain', value: { data: 'x' } }],
      };
    },
    template: '<gl-filtered-search :available-tokens="tokens" :value="value" />',
  });

  it.each`
    description             | token
    ${'not marked raw'}     | ${PlainToken}
    ${'wrapped in markRaw'} | ${markRaw({ ...PlainToken })}
  `('renders token components that are $description', ({ token }) => {
    const parent = mount(createParent(token));

    expect(parent.find('[data-testid="plain-token"]').exists()).toBe(true);
    expect(parent).not.toHaveLoggedVueErrors();
  });
});
