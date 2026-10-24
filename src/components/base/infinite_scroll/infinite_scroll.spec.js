import { mount, shallowMount } from '@vue/test-utils';
import { nextTick } from 'vue';
import InfiniteScroll, { adjustScrollGap } from './infinite_scroll.vue';

const INITIAL_HEIGHT = 500;
const INITIAL_SCROLL_TOP = 0;
const ADJUST_SCROLL_GAP = adjustScrollGap;

describe('Infinite Scroll component', () => {
  let wrapper;
  let mockScrollHeight;
  let mockScrollTop;
  let mockScrollTo;

  const findInfiniteContainer = () => wrapper.findComponent({ ref: 'infiniteContainer' });

  const props = {
    fetchedItems: 2,
    totalItems: 10,
  };

  const createComponent = ({ propsData = props, listeners = {} } = {}) => {
    wrapper = shallowMount(InfiniteScroll, {
      propsData,
      listeners,
      attachTo: document.body,
    });

    // Mock properties on the container that are not in JSDOM
    mockScrollTo = jest.fn(({ top }) => {
      mockScrollTop = top;
      findInfiniteContainer().trigger('scroll');
    });

    Object.defineProperties(findInfiniteContainer().element, {
      scrollTo: {
        get: () => mockScrollTo,
      },
      scrollTop: {
        get: () => mockScrollTop,
      },
      scrollHeight: {
        get: () => mockScrollHeight,
        set: (val) => {
          mockScrollHeight = val;
        },
      },
    });
  };

  beforeEach(() => {
    mockScrollHeight = INITIAL_HEIGHT;
    mockScrollTop = INITIAL_SCROLL_TOP;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('emits nothing on creation', async () => {
    createComponent();

    await nextTick();
    expect(wrapper.emitted('bottom-reached')).toBe(undefined);
    expect(wrapper.emitted('top-reached')).toBe(undefined);
  });

  it('emits bottom-reached when scrolled to the bottom', () => {
    createComponent();

    expect(wrapper.emitted('bottom-reached')).toBe(undefined);

    mockScrollTo({ top: INITIAL_HEIGHT - 0.5 });
    expect(wrapper.emitted('bottom-reached')).toHaveLength(1);
  });

  it('emits top-reached when scrolled to the top', () => {
    mockScrollTop = mockScrollHeight;

    createComponent();

    expect(wrapper.emitted('top-reached')).toBe(undefined);

    mockScrollTo({ top: 0 });
    expect(wrapper.emitted('top-reached')).toHaveLength(1);
  });

  it('scrolls to the bottom when `top-reached` is defined', async () => {
    createComponent({
      listeners: {
        'top-reached': () => {},
      },
    });

    await nextTick();
    expect(mockScrollTo).toHaveBeenCalledWith({ top: INITIAL_HEIGHT - ADJUST_SCROLL_GAP });
  });

  it('does not scroll to the bottom when `top-reached` and `bottom-reached` are defined', async () => {
    createComponent({
      listeners: {
        'bottom-reached': () => {},
        'top-reached': () => {},
      },
    });

    await nextTick();
    expect(mockScrollTo).not.toHaveBeenCalled();
  });

  it('scrolls to the bottom when a parent template listens for `top-reached`', async () => {
    const scrollDown = jest
      .spyOn(InfiniteScroll.methods, 'scrollDown')
      .mockImplementation(() => {});

    // Use mount to test event listeners camelized by @vue/compat
    mount({
      components: { InfiniteScroll },
      methods: { onTop() {} },
      template: '<infinite-scroll :total-items="10" :fetched-items="2" @top-reached="onTop" />',
    });
    await nextTick();

    expect(scrollDown).toHaveBeenCalled();
  });

  it('scroll past loaded items', async () => {
    createComponent();

    const BATCH_HEIGHT = 100;

    // Mock more items are loaded
    wrapper.setProps({ fetchedItems: 4 });

    // Wait for the watcher to capture the old height before the tick
    await nextTick();
    // Mock list was expanded in height by BATCH_HEIGHT px
    mockScrollHeight = INITIAL_HEIGHT + BATCH_HEIGHT;

    // Wait for the watcher's deferred scroll adjustment
    await nextTick();
    expect(mockScrollTo).toHaveBeenCalledWith({
      top: BATCH_HEIGHT - ADJUST_SCROLL_GAP,
    });
  });

  describe('the legend', () => {
    describe.each`
      totalItems   | expectedLegend
      ${99}        | ${'Showing 2 of 99 items'}
      ${2}         | ${'Showing 2 of 2 items'}
      ${0}         | ${'Showing 2 items'}
      ${-1}        | ${'Showing 2 items'}
      ${undefined} | ${'Showing 2 items'}
    `('given $totalItems total items', ({ totalItems, expectedLegend }) => {
      beforeEach(() => {
        createComponent({
          propsData: {
            fetchedItems: 2,
            totalItems,
          },
        });
      });

      it('displays the expected text', () => {
        expect(wrapper.text()).toContain(expectedLegend);
      });
    });
  });

  describe('public methods via $ref', () => {
    it('scrollUp', () => {
      createComponent();
      wrapper.vm.scrollUp();

      expect(mockScrollTo).toHaveBeenCalledWith({ top: ADJUST_SCROLL_GAP });
    });

    it('scrollDown', () => {
      createComponent();
      wrapper.vm.scrollDown();

      expect(mockScrollTo).toHaveBeenCalledWith({ top: INITIAL_HEIGHT - ADJUST_SCROLL_GAP });
    });

    it('scrollTo', () => {
      createComponent();
      wrapper.vm.scrollTo({ top: 250, behavior: 'instant' });

      expect(mockScrollTo).toHaveBeenCalledWith({ top: 250, behavior: 'instant' });
    });
  });
});
