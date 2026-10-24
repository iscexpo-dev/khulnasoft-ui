import { shallowMount } from '@vue/test-utils';
import LoadingIcon from './loading_icon.vue';

describe('loading icon component', () => {
  let wrapper;
  const createComponent = ({ attrs, ...propsData } = {}) => {
    wrapper = shallowMount(LoadingIcon, { propsData, attrs });
  };

  const spinnerBaseCssClass = 'gl-spinner';
  const findSpinnerEl = () => wrapper.find(`.${spinnerBaseCssClass}`);
  const getSpinnerClasses = () => findSpinnerEl().classes();

  const dotsLoaderBaseCssClass = 'gl-dots-loader';
  const findDotsLoaderEl = () => wrapper.find(`.${dotsLoaderBaseCssClass}`);
  const getDotsLoaderClasses = () => findDotsLoaderEl().classes();

  describe.each`
    variant      | baseCssClass              | getLoaderClasses
    ${'spinner'} | ${spinnerBaseCssClass}    | ${getSpinnerClasses}
    ${'dots'}    | ${dotsLoaderBaseCssClass} | ${getDotsLoaderClasses}
  `('variant $variant', ({ variant, baseCssClass, getLoaderClasses }) => {
    describe('display', () => {
      it('should render as a block by default', () => {
        createComponent({ variant });
        expect(wrapper.element.tagName).toBe('DIV');
      });

      it('should render inline using prop', () => {
        createComponent({ variant, inline: true });
        expect(wrapper.element.tagName).toBe('SPAN');
      });
    });

    describe('css class', () => {
      const supportedSizes = ['sm', 'md', 'lg'];
      const supportedColors = ['dark', 'light'];
      const sizeColorCombinations = supportedSizes.reduce(
        (combinations, size) => combinations.concat(supportedColors.map((color) => [size, color])),
        [],
      );

      it('should render the loader css class by default', () => {
        createComponent({ variant });
        const loaderClasses = getLoaderClasses();

        expect(loaderClasses).toContain(baseCssClass);
      });

      it.each(supportedSizes)('should render loader properly for size %s', (size) => {
        createComponent({ variant, size });
        const loaderClasses = getLoaderClasses();

        expect(loaderClasses).toContain(baseCssClass);
        expect(loaderClasses).toContain(`${baseCssClass}-${size}`);
      });

      it.each(supportedColors)('should render loader properly for color %s', (color) => {
        createComponent({ variant, color });
        const loaderClasses = getLoaderClasses();

        expect(loaderClasses).toContain(baseCssClass);
        expect(loaderClasses).toContain(`${baseCssClass}-${color}`);
      });

      it.each(sizeColorCombinations)(
        'should render loader properly for combination of size: "%s" and color: "%s"',
        (size, color) => {
          createComponent({ variant, size, color });
          const loaderClasses = getLoaderClasses();

          expect(loaderClasses).toContain(baseCssClass);
          expect(loaderClasses).toContain(`${baseCssClass}-${size}`);
          expect(loaderClasses).toContain(`${baseCssClass}-${color}`);
        },
      );
    });

    describe('aria label', () => {
      it('should default to loading', () => {
        createComponent({ variant });

        expect(wrapper.attributes('aria-label')).toBe('Loading');
      });

      it('should change using prop', () => {
        const label = 'label';
        createComponent({ variant, label });

        expect(wrapper.attributes('aria-label')).toBe(label);
      });
    });

    describe('role', () => {
      it('should have default role value as status', () => {
        createComponent({ variant });

        expect(wrapper.attributes('role')).toBe('status');
      });

      it('should have role value as custom value passed', () => {
        const role = 'dialog';
        createComponent({ variant, attrs: { role } });

        expect(wrapper.attributes('role')).toBe(role);
      });
    });
  });
});
