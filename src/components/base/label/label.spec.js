import { mount, shallowMount } from '@vue/test-utils';
import GlLink from '../link/link.vue';
import GlTooltip from '../tooltip/tooltip.vue';
import Label from './label.vue';

// Light color
const grey = {
  hex: '#CCCCCC',
  rgb: 'rgb(204, 204, 204)',
};
// Dark color
const navy = {
  hex: '#000080',
  rgb: 'rgb(0, 0, 128)',
};

const white = {
  shorthex: '#FFF',
  rgb: 'rgb(255, 255, 255)',
  rgba: 'rgba(255, 255, 255, 1)',
};

const defaultProps = {
  title: 'title',
  backgroundColor: grey.rgb,
};

describe('Label component', () => {
  let wrapper;

  const createComponent = (propsData, { mountFn = shallowMount } = {}) => {
    wrapper = mountFn(Label, {
      propsData,
    });
  };

  const findLink = () => wrapper.findComponent(GlLink);
  const findContent = () => wrapper.find('.gl-label-link');
  const findTitle = () => wrapper.find('.gl-label-text');
  const findSubTitle = () => wrapper.find('.gl-label-text-scoped');
  const findTooltip = () => wrapper.findComponent(GlTooltip);
  const findTooltipText = () => findTooltip().text();
  const findCloseButton = () => wrapper.find('.gl-label-close');

  describe('basic label', () => {
    it('renders the label title', () => {
      const title = 'Label Title';
      createComponent({ ...defaultProps, title });
      expect(findTitle().text()).toEqual(title);
    });

    it('renders the title without an href when there is no target', () => {
      createComponent({ ...defaultProps });

      expect(findContent().attributes('href')).toBeUndefined();
    });

    it('renders a title with two colons as a basic label', () => {
      createComponent({ ...defaultProps, title: 'scoped::label' });

      expect(findTitle().text()).toEqual('scoped::label');
      expect(findSubTitle().exists()).toBe(false);
    });

    it('renders a black label', () => {
      createComponent({ ...defaultProps });

      expect(wrapper.classes()).toContain('gl-label-text-dark');
    });

    it('renders a white label if background color is dark', () => {
      createComponent({ ...defaultProps, backgroundColor: navy.hex });

      expect(wrapper.classes()).toContain('gl-label-text-light');
    });

    it('renders the label description without "Scoped label"', () => {
      const props = { ...defaultProps, description: 'lorem ipsum' };

      createComponent(props);

      expect(findTooltipText()).toContain(props.description);
      expect(findTooltipText()).not.toContain('Scoped label');
    });

    it('supports short hex for background color to infer text color', () => {
      createComponent({ ...defaultProps, backgroundColor: white.shorthex });

      expect(wrapper.classes()).toContain('gl-label-text-dark');
    });

    it('supports rgba for background color to infer text color', () => {
      createComponent({ ...defaultProps, backgroundColor: white.rgba });

      expect(wrapper.classes()).toContain('gl-label-text-dark');
    });

    it('renders the label description', () => {
      const props = { ...defaultProps, description: 'lorem ipsum' };

      createComponent(props);

      expect(wrapper.text()).toContain(props.description);
    });

    describe('footer', () => {
      it('renders the tooltip with the footer when there is no description', () => {
        createComponent({ ...defaultProps, footer: 'Footer text' });

        expect(findTooltip().exists()).toBe(true);
        expect(findTooltipText()).toContain('Footer text');
      });

      it('renders both the description and the footer', () => {
        const props = { ...defaultProps, description: 'lorem ipsum', footer: 'Footer text' };

        createComponent(props);

        expect(findTooltipText()).toContain(props.description);
        expect(findTooltipText()).toContain('Footer text');
      });

      it('does not render a tooltip when there is no footer and no description', () => {
        createComponent({ ...defaultProps });

        expect(findTooltip().exists()).toBe(false);
      });
    });

    it('links to label target', () => {
      const props = { ...defaultProps, target: 'http://local.host' };

      createComponent(props);

      expect(wrapper.findComponent(GlLink).attributes('href')).toEqual(props.target);
    });

    describe('close button', () => {
      it('does not render by default', () => {
        createComponent({ ...defaultProps });

        expect(findCloseButton().exists()).toBe(false);
      });

      it('renders when showCloseButton is true', () => {
        const props = { ...defaultProps, showCloseButton: true };

        createComponent(props);

        expect(findCloseButton().exists()).toBe(true);
      });

      it('renders correct aria-label', () => {
        const props = { ...defaultProps, showCloseButton: true };

        createComponent(props);

        expect(findCloseButton().attributes('aria-label')).toBe('Remove label - title');
      });

      it('emits close when "x" is clicked', () => {
        const props = { ...defaultProps, showCloseButton: true };

        createComponent(props, { mountFn: mount });

        findCloseButton().trigger('click');
        expect(wrapper.emitted('close')).toHaveLength(1);
      });

      it('does not emit close when "x" is clicked when disabled', () => {
        const props = { ...defaultProps, showCloseButton: true, disabled: true };

        createComponent(props, { mountFn: mount });

        findCloseButton().trigger('click');
        expect(wrapper.emitted('close')).toBe(undefined);
      });
    });

    describe('label has no target', () => {
      const props = { ...defaultProps, target: '' };

      it('renders the label content as text', () => {
        createComponent(props, { mountFn: mount });

        expect(findContent().element.tagName.toLowerCase()).toBe('span');
      });

      it('does not render a link', () => {
        createComponent(props, { mountFn: shallowMount });

        expect(findLink().exists()).toBe(false);
      });
    });
  });

  describe('scoped label', () => {
    const scopedProps = {
      ...defaultProps,
      title: 'scoped::label',
      scoped: true,
    };

    it('renders the scoped title', () => {
      createComponent({ ...scopedProps });

      expect(findTitle().text()).toEqual('scoped');
      expect(findSubTitle().text()).toEqual('label');
    });

    it('renders a black label', () => {
      createComponent({ ...scopedProps });

      expect(wrapper.classes()).toContain('gl-label-text-dark');
    });

    it('renders a white label if background color is dark', () => {
      createComponent({ ...scopedProps, backgroundColor: navy.hex });

      expect(wrapper.classes()).toContain('gl-label-text-light');
    });

    it('renders the label description with "Scoped label"', () => {
      const props = { ...scopedProps, description: 'lorem ipsum' };

      createComponent(props);

      expect(findTooltipText()).toContain(props.description);
      expect(findTooltipText()).toContain('Scoped label');
    });

    it('renders "Scoped label", the description and the footer', () => {
      const props = { ...scopedProps, description: 'lorem ipsum', footer: 'Footer text' };

      createComponent(props);

      expect(findTooltipText()).toContain('Scoped label');
      expect(findTooltipText()).toContain(props.description);
      expect(findTooltipText()).toContain('Footer text');
    });

    it('links to label target', () => {
      const props = { ...scopedProps, target: 'http://local.host' };
      createComponent(props);
      expect(findLink().attributes('href')).toEqual(props.target);
    });

    it('supports title with multiple occurrences of ::', () => {
      const props = { ...scopedProps, title: 'one::two::three' };
      createComponent(props);
      expect(findTitle().text()).toEqual('one::two');
      expect(findSubTitle().text()).toEqual('three');
    });

    describe('close button', () => {
      it('does not render by default', () => {
        const props = { ...scopedProps };
        createComponent(props);

        expect(findCloseButton().exists()).toBe(false);
      });

      it('renders when showCloseButton is true', () => {
        const props = { ...scopedProps, showCloseButton: true };
        createComponent(props);

        expect(findCloseButton().exists()).toBe(true);
      });

      it('emits close when "x" is clicked', () => {
        const props = { ...scopedProps, showCloseButton: true };

        createComponent(props, { mountFn: mount });

        findCloseButton().trigger('click');
        expect(wrapper.emitted('close')).toHaveLength(1);
      });

      it('does not emit close when "x" is clicked when disabled', () => {
        const props = { ...scopedProps, showCloseButton: true, disabled: true };

        createComponent(props, { mountFn: mount });

        findCloseButton().trigger('click');
        expect(wrapper.emitted('close')).toBe(undefined);
      });
    });

    describe('label has no target', () => {
      const props = { ...defaultProps, target: '' };

      it('renders the label content as text', () => {
        createComponent(props, { mountFn: mount });

        expect(findContent().element.tagName.toLowerCase()).toBe('span');
      });

      it('does not render a link', () => {
        createComponent(props, { mountFn: shallowMount });

        expect(findLink().exists()).toBe(false);
      });
    });
  });
});
