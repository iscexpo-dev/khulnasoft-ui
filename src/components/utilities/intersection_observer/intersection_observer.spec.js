import { shallowMount } from '@vue/test-utils';
import { useMockIntersectionObserver } from '~/utils/use_mock_intersection_observer';
import GlIntersectionObserver from './intersection_observer.vue';

const TEST_SLOT = '<p>Hello world! Lorem ipsum.</p>';
const ENTRY_INTERSECTING = { ratio: 0.75, isIntersecting: true };
const ENTRY_NOT_INTERSECTING = { ratio: 0, isIntersecting: false };
const TEST_OPTIONS = {};

describe('IntersectionObserver', () => {
  let wrapper;
  let allWrappers;
  const { getInstances, trigger } = useMockIntersectionObserver();

  const hasPrivateProps = (obj) => Object.keys(obj).some((x) => x.startsWith('$_gl_'));
  const triggerIntersectionObserver = (entry) => {
    trigger(getInstances()[0], null, { entry });
  };
  const createComponent = (props = {}) => {
    wrapper = shallowMount(GlIntersectionObserver, {
      propsData: {
        ...props,
      },
      slots: {
        default: TEST_SLOT,
      },
    });
    allWrappers.push(wrapper);
  };

  beforeEach(() => {
    allWrappers = [];
  });

  afterEach(() => {
    allWrappers.forEach((x) => x.destroy());
    allWrappers = null;
    wrapper = null;

    // Clear memoization for test determinism
    GlIntersectionObserver.getObserver.cache.clear();
  });

  describe('with default', () => {
    beforeEach(() => {
      createComponent();
    });

    it('renders slot', () => {
      expect(wrapper.html()).toContain(TEST_SLOT);
    });

    it('creates 1 intersection observer', () => {
      expect(getInstances()).toHaveLength(1);
    });

    it('adds some private props to element', () => {
      expect(hasPrivateProps(wrapper.vm.$el)).toBe(true);
    });

    describe('when destroyed', () => {
      beforeEach(() => {
        wrapper.destroy();
      });

      it('clears private props on element', () => {
        expect(hasPrivateProps(wrapper.vm.$el)).toBe(false);
      });

      it('stops observing on element', () => {
        triggerIntersectionObserver(ENTRY_INTERSECTING);

        expect(wrapper.emitted()).toEqual({});
      });
    });
  });

  describe('with 2 instances', () => {
    beforeEach(() => {
      createComponent();
      createComponent();
    });

    it('creates 1 IntersectionObserver', () => {
      expect(getInstances()).toHaveLength(1);
    });

    it.each`
      desc                       | entry                     | event
      ${'with interesecting'}    | ${ENTRY_INTERSECTING}     | ${'appear'}
      ${'without interesecting'} | ${ENTRY_NOT_INTERSECTING} | ${'disappear'}
    `('when triggered $desc, emits events', ({ entry, event }) => {
      const createExpectation = ({ element }) => ({
        [event]: [[]],
        update: [[{ ...entry, target: element }]],
      });

      triggerIntersectionObserver(entry);

      expect(allWrappers).toHaveLength(2);
      // eslint-disable-next-line unicorn/no-array-callback-reference
      expect(allWrappers.map((x) => x.emitted())).toEqual(allWrappers.map(createExpectation));
    });
  });

  describe('with 2 instances with different options', () => {
    beforeEach(() => {
      createComponent();
      createComponent({ options: TEST_OPTIONS });
    });

    it('creates 2 IntersectionObservers', () => {
      expect(getInstances()).toHaveLength(2);
    });
  });
});
