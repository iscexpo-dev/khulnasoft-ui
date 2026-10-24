import { shallowMount, mount } from '@vue/test-utils';
import GlSkeletonLoader from './skeleton_loader.vue';

describe('GlSkeletonLoader', () => {
  let wrapper;

  const findDefaultLines = () => wrapper.findAll('clipPath rect');
  const findSvg = () => wrapper.find('svg');

  const setupMatchMedia = (reducedMotion = false) => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation(() => ({
        matches: reducedMotion,
      })),
    });
  };

  const createComponent = ({ propsData, slots, reducedMotion, attrs } = {}) => {
    setupMatchMedia(reducedMotion);
    wrapper = shallowMount(GlSkeletonLoader, { propsData, slots, attrs });
  };

  describe('when default skeleton is used', () => {
    it('adds `gl-w-full` and `gl-h-full` CSS classes', () => {
      createComponent();

      const svgClasses = findSvg().classes();

      expect(svgClasses).toContain('gl-w-full');
      expect(svgClasses).toContain('gl-h-full');
    });

    it('applies classes to root element', () => {
      setupMatchMedia();

      const ParentComponent = {
        template: '<gl-skeleton-loader class="static-class" :class="classNames" />',
        components: { GlSkeletonLoader },
        data() {
          return {
            classNames: ['gl-mb-3', 'gl-mt-3'],
          };
        },
      };

      wrapper = mount(ParentComponent);
      const loader = wrapper.findComponent(GlSkeletonLoader);

      const classNames = loader.classes();

      expect(classNames).toContain('static-class');
      expect(classNames).toContain('gl-mb-3');
      expect(classNames).toContain('gl-mt-3');
      expect(classNames).toContain('gl-skeleton-loader-default-container');
    });

    it('renders 3 lines by default', () => {
      createComponent();

      expect(findDefaultLines()).toHaveLength(3);
    });

    it('renders the number of lines passed', () => {
      createComponent({
        propsData: {
          lines: 5,
        },
      });

      expect(findDefaultLines()).toHaveLength(5);
    });

    it('spaces the lines out evenly', () => {
      createComponent();

      const lines = findDefaultLines().wrappers;

      expect(lines[0].attributes('y')).toBe('0');
      expect(lines[1].attributes('y')).toBe('14');
      expect(lines[2].attributes('y')).toBe('28');
    });

    it('sets svg viewBox to the combined size of the lines', () => {
      createComponent({
        propsData: {
          lines: 5,
        },
      });

      expect(findSvg().attributes('viewBox')).toBe('0 0 235 66');
    });

    describe('when equal-width-lines is `true`', () => {
      it('renders all the lines with 100% width', () => {
        createComponent({
          propsData: {
            equalWidthLines: true,
          },
        });

        findDefaultLines().wrappers.forEach((defaultLine) => {
          expect(defaultLine.attributes('width')).toBe('100%');
        });
      });
    });

    describe('when `width` and `height` props are set', () => {
      it('overrides the calculated container size and svg viewBox', () => {
        createComponent({
          propsData: {
            width: 500,
            height: 400,
          },
        });

        expect(wrapper.element.style.width).toBe('500px');
        expect(wrapper.element.style.height).toBe('400px');
        expect(findSvg().attributes('viewBox')).toBe('0 0 500 400');
      });
    });
  });

  describe('when skeleton is passed via the slot', () => {
    it('does not render a container around the svg', () => {
      createComponent({
        slots: {
          default: '<rect width="86" height="24" rx="4" />',
        },
      });

      expect(wrapper.element.tagName).toBe('svg');
    });

    describe('when `width` and `height` props are set', () => {
      it('sets the viewBox to those values', () => {
        createComponent({
          slots: {
            default: '<rect width="86" height="24" rx="4" />',
          },
          propsData: {
            width: 500,
            height: 300,
          },
        });

        expect(wrapper.attributes('viewBox')).toBe('0 0 500 300');
      });
    });

    describe('when `width` and `height` props are not set', () => {
      it('sets the viewBox to the default values', () => {
        createComponent({
          slots: {
            default: '<rect width="86" height="24" rx="4" />',
          },
        });

        expect(wrapper.attributes('viewBox')).toBe('0 0 400 130');
      });
    });
  });

  it.each`
    reducedMotion | hasLinearGradient
    ${false}      | ${'has'}
    ${true}       | ${'does not have'}
  `(
    '$hasLinearGradient linear-gradient when reduced motion is $reducedMotion',
    ({ reducedMotion }) => {
      createComponent({ reducedMotion });

      const gradient = wrapper.find('linearGradient');

      expect(gradient.exists()).toBe(!reducedMotion);
    },
  );
});
