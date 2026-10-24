import { shallowMount } from '@vue/test-utils';
import GlButton from '../button/button.vue';
import GlIllustration from '../illustration/illustration.vue';
import GlBanner from './banner.vue';

describe('banner component', () => {
  const propsData = {
    title: 'Test Title',
    buttonText: 'Button text',
    buttonLink: 'http://khulnasoft.com',
  };
  const svgPath = 'https://about.khulnasoft.com/images/press/logo/svg/khulnasoft-icon-rgb.svg';
  const illustrationName = 'status-success-sm';
  let wrapper;

  const createWrapper = ({ props, slots = {} } = {}) => {
    wrapper = shallowMount(GlBanner, {
      propsData: { ...propsData, ...props },
      slots,
    });
  };

  const findButton = () => wrapper.findComponent(GlButton);
  const findIllustration = () => wrapper.findComponent(GlIllustration);

  describe('Promotion', () => {
    describe('with only the required props', () => {
      beforeEach(() => {
        createWrapper();
      });

      it('should render the correct title', () => {
        expect(wrapper.find('h2').text()).toEqual(propsData.title);
      });

      it('should render the button', () => {
        const button = findButton();

        expect(button.text()).toEqual(propsData.buttonText);
        expect(button.attributes('href')).toEqual(propsData.buttonLink);
      });

      it('should not render the illustration', () => {
        expect(wrapper.find('img').exists()).toBe(false);
        expect(findIllustration().exists()).toBe(false);
      });

      it('should emit a `close` event after the close button is clicked', () => {
        expect(wrapper.emitted('close')).toBe(undefined);
        wrapper.find('.gl-banner-close').vm.$emit('click');
        expect(wrapper.emitted('close')).toHaveLength(1);
      });

      it('should emit a `primary` event when the primary button is clicked', () => {
        expect(wrapper.emitted('primary')).toBe(undefined);
        wrapper.find('[data-testid="gl-banner-primary-button"]').vm.$emit('click');
        expect(wrapper.emitted('primary')).toHaveLength(1);
      });
    });

    describe('with image', () => {
      it('should render GlIllustration component', () => {
        createWrapper({
          props: { illustrationName },
        });

        expect(findIllustration().exists()).toBe(true);
        expect(wrapper.find('img').exists()).toBe(false);
      });

      it('should render the custom illustration', () => {
        createWrapper({
          props: { svgPath },
        });

        expect(wrapper.find('img').exists()).toBe(true);
        expect(findIllustration().exists()).toBe(false);
      });
    });

    describe('with buttonAttributes', () => {
      beforeEach(() => {
        createWrapper({
          props: {
            buttonAttributes: {
              target: '_blank',
            },
          },
        });
      });

      it('should pass the attributes to the button', () => {
        expect(findButton().attributes('target')).toBe('_blank');
      });
    });
  });

  describe('Introduction', () => {
    beforeEach(() => {
      createWrapper({
        props: { variant: 'introduction' },
      });
    });

    it('should add the `gl-banner-introduction` class', () => {
      expect(wrapper.classes()).toContain('gl-banner-introduction');
    });
  });

  describe('custom actions', () => {
    it('shows the custom actions', () => {
      const mockAction = {
        name: 'MockAction',
        template: '<span>Mock Action</span>',
      };

      createWrapper({
        slots: { actions: mockAction },
      });

      expect(wrapper.findComponent(mockAction).exists()).toBe(true);
    });
  });
});
