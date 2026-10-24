import { shallowMount, mount } from '@vue/test-utils';
import Vue from 'vue';
import GlLink from '../../components/base/link/link.vue';
import { absoluteUrls, javascriptUrls, encodedJavaScriptUrls, relativeUrls } from './mock_data';
import { SafeLinkDirective } from './safe_link';

const httpLink = 'https://khulnasoft.com';

describe('safe link directive', () => {
  let wrapper;

  const createComponent = ({
    href,
    safeLinkConfig = {},
    components,
    template = `<a v-safe-link :href="href" target="_blank">Click</a>`,
    mountFn = shallowMount,
  } = {}) => {
    const component = {
      props: {
        href: { type: String },
        safeLinkConfig: { type: Object },
      },
      directives: {
        SafeLink: SafeLinkDirective,
      },
      components,
      template,
    };

    wrapper = mountFn(component, { propsData: { href, safeLinkConfig } });
  };

  describe('default', () => {
    it('should render the anchor tag with given href', () => {
      createComponent({
        href: httpLink,
      });

      expect(wrapper.element.tagName).toBe('A');
      expect(wrapper.attributes('href')).toBe(httpLink);
    });

    it('should render the element with secure rel attr', () => {
      createComponent({
        href: httpLink,
      });

      expect(wrapper.attributes('rel')).toBe(`noopener noreferrer`);
    });
  });

  describe('invalid urls', () => {
    it.each(javascriptUrls)('%s should be sanitized', (url) => {
      createComponent({
        href: url,
      });
      expect(wrapper.attributes('href')).toBe('about:blank');
    });
  });

  describe('valid urls', () => {
    const validUrls = [...absoluteUrls, ...relativeUrls, ...encodedJavaScriptUrls];
    /* Note:
    /* Encoded JavaScript URLs are safe urls in Vue context, since
    /* Vue attribute bindings are also automatically escaped
    /* https://vuejs.org/v2/guide/security.html#Injecting-URLs
    */
    it.each(validUrls)('%s should be rendered', (url) => {
      createComponent({
        href: url,
      });
      expect(wrapper.attributes('href')).toBe(url);
    });
  });

  describe('`skipSanitization` arg', () => {
    it.each(javascriptUrls)('%s should be rendered', (url) => {
      createComponent({
        href: url,
        safeLinkConfig: { skipSanitization: true },
        template: '<a v-safe-link:[safeLinkConfig] :href="href" target="_blank">Click</a>',
      });
      expect(wrapper.attributes('href')).toBe(url);
    });
  });

  describe('reactivity', () => {
    it('should sanitize the updated url', async () => {
      createComponent({
        mountFn: mount,
        components: { GlLink },
        template: '<gl-link :href="href" target="_blank">Click</gl-link>',
        href: javascriptUrls[0],
      });

      expect(wrapper.attributes('href')).toBe('about:blank');

      // set href to a valid url
      await wrapper.setProps({ href: 'https://khulnasoft.com' });
      expect(wrapper.attributes('href')).toBe('https://khulnasoft.com');

      // set href to back to an invalid url
      await wrapper.setProps({ href: javascriptUrls[1] });
      await Vue.nextTick();

      expect(wrapper.attributes('href')).toBe('about:blank');
    });

    describe('`skipSanitization` arg', () => {
      it('should not sanitize the updated url', async () => {
        const url = javascriptUrls[0];

        createComponent({
          mountFn: mount,
          components: { GlLink },
          template: '<gl-link is-unsafe-link :href="href" target="_blank">Click</gl-link>',
          href: url,
        });

        expect(wrapper.attributes('href')).toBe(url);

        // set href to a valid url
        await wrapper.setProps({ href: 'https://khulnasoft.com' });
        await Vue.nextTick();
        expect(wrapper.attributes('href')).toBe('https://khulnasoft.com');

        // set href to back to an invalid url
        await wrapper.setProps({ href: url });
        await Vue.nextTick();
        expect(wrapper.attributes('href')).toBe(url);
      });
    });
  });
});
