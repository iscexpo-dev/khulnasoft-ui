import { shallowMount } from '@vue/test-utils';
import GlLink from '../link/link.vue';
import { linkVariantUnstyled } from '../../../utils/constants';
import BreadcrumbItem from './breadcrumb_item.vue';

describe('Breadcrumb Item Component', () => {
  let wrapper;

  const item = { href: 'http://about.khulnasoft.com', to: { name: 'about' }, ariaCurrent: 'page' };

  const findGlLink = () => wrapper.findComponent(GlLink);
  const findDefaultSlot = () => wrapper.find('[data-testid="default-slot"]');

  const createComponent = (propsData) => {
    wrapper = shallowMount(BreadcrumbItem, {
      propsData: {
        href: item.href,
        to: item.to,
        ariaCurrent: item.ariaCurrent,
        ...propsData,
      },
      slots: {
        default: '<div data-testid="default-slot"></div>',
      },
    });
  };

  describe('slots', () => {
    it('renders provided content to default slot', () => {
      createComponent();

      expect(findDefaultSlot().exists()).toBe(true);
    });
  });

  describe('size', () => {
    it('has default size of "sm"', () => {
      createComponent();
      expect(wrapper.classes()).toContain('gl-breadcrumb-item-sm');
    });

    it('applies correct class for "md" size', () => {
      createComponent({ size: 'md' });
      expect(wrapper.classes()).toContain('gl-breadcrumb-item-md');
    });
  });

  describe('bindings', () => {
    it('passes provided props down to GlLink', () => {
      createComponent();

      const glLink = findGlLink();

      expect(glLink.props('to')).toMatchObject(item.to);
      expect(glLink.props('href')).toBe(item.href);
      expect(glLink.attributes('aria-current')).toBe(item.ariaCurrent);
    });

    it('uses unstyled GlLink variant', () => {
      createComponent();

      expect(findGlLink().props('variant')).toBe(linkVariantUnstyled);
    });
  });
});
