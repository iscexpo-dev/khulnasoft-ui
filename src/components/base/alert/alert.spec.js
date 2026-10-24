import { shallowMount } from '@vue/test-utils';
import { nextTick } from 'vue';
import { buttonCategoryOptions } from '../../../utils/constants';
import GlAlert from './alert.vue';

const DummyComponent = {
  template: '<p>dummy</p>',
};

const primaryButtonText = 'foo';
const primaryButtonLink = '#foo';
const secondaryButtonText = 'bar';
const secondaryButtonLink = '#bar';

describe('Alert component', () => {
  let wrapper;

  const createComponent = (options) => {
    wrapper = shallowMount(GlAlert, {
      ...options,
    });
  };

  const findIcon = () => wrapper.find('.gl-alert-icon');
  const findDismissButton = () => wrapper.findComponent({ ref: 'dismiss' });
  const findTitle = () => wrapper.find('.gl-alert-title');
  const findBodyContainer = () => wrapper.find('.gl-alert-body');
  const findActionsContainer = () => wrapper.find('.gl-alert-actions');
  const findActionButtons = () => wrapper.findAll('.gl-alert-action');

  describe('by default', () => {
    beforeEach(() => {
      createComponent({ slots: { default: DummyComponent } });
    });

    it('renders a variant icon', () => {
      expect(findIcon().exists()).toBe(true);
    });

    it('renders a dismiss button', () => {
      expect(findDismissButton().exists()).toBe(true);
    });

    it('clicking on dismiss button emits a dismiss event', () => {
      findDismissButton().vm.$emit('click');

      expect(wrapper.emitted('dismiss')).toHaveLength(1);
    });

    it('does not render a title', () => {
      expect(findTitle().exists()).toBe(false);
    });

    it('does not render any actions', () => {
      expect(findActionsContainer().exists()).toBe(false);
    });

    it('renders default slot content', () => {
      expect(findBodyContainer().findComponent(DummyComponent).exists()).toBe(true);
    });

    it('has tabindex="-1"', () => {
      expect(wrapper.attributes('tabindex')).toBe('-1');
    });
  });

  it('does not render a dismiss button when dismissible = false', () => {
    createComponent({ propsData: { dismissible: false } });

    expect(findDismissButton().exists()).toBe(false);
  });

  it('renders the provided title with heading level 2 by default', () => {
    const title = 'foo';
    createComponent({ propsData: { title } });

    const titleWrapper = findTitle();
    expect(titleWrapper.exists()).toBe(true);
    expect(titleWrapper.text()).toContain(title);
    expect(titleWrapper.element.tagName).toEqual('H2');
  });

  it('renders heading level from headerLevel prop', () => {
    const title = 'foo';
    createComponent({ propsData: { title, headerLevel: 3 } });

    const titleWrapper = findTitle();
    expect(titleWrapper.element.tagName).toEqual('H3');
  });

  describe('headerLevel validator', () => {
    const validateHeaderLevel = (value) => GlAlert.props.headerLevel.validator(value);

    it('passes with valid heading levels', () => {
      expect(validateHeaderLevel(1)).toBe(true);
      expect(validateHeaderLevel(6)).toBe(true);
    });

    it('fails with invalid heading levels', () => {
      expect(validateHeaderLevel(0)).toBe(false);
      expect(validateHeaderLevel(7)).toBe(false);
    });
  });

  describe('given primaryButtonText', () => {
    beforeEach(() => {
      createComponent({ propsData: { primaryButtonText } });
    });

    it('renders a small primary button', () => {
      expect(findActionsContainer().exists()).toBe(true);

      const buttons = findActionButtons();
      expect(buttons).toHaveLength(1);

      const button = buttons.at(0);
      expect(button.text()).toContain(primaryButtonText);

      const props = button.props();
      expect(props.href).toBeUndefined();
      expect(props.category).toEqual(buttonCategoryOptions.primary);
      expect(props.size).toBe('small');
    });

    it('emits a primary-action event when primary button is clicked', () => {
      findActionButtons().at(0).vm.$emit('click');

      expect(wrapper.emitted('primary-action')).toHaveLength(1);
    });
  });

  describe('given primaryButtonText and primaryButtonLink', () => {
    beforeEach(() => {
      createComponent({ propsData: { primaryButtonText, primaryButtonLink } });
    });

    it('renders a primary button with an href given primaryButtonLink', () => {
      const button = findActionButtons().at(0);
      expect(button.attributes('href')).toEqual(primaryButtonLink);
    });
  });

  describe('given secondaryButtonText', () => {
    beforeEach(() => {
      createComponent({ propsData: { secondaryButtonText } });
    });

    it('renders a small secondary button', () => {
      expect(findActionsContainer().exists()).toBe(true);

      const buttons = findActionButtons();
      expect(buttons).toHaveLength(1);

      const button = buttons.at(0);
      expect(button.text()).toContain(secondaryButtonText);

      const props = button.props();
      expect(props.href).toBeUndefined();
      expect(props.category).toEqual(buttonCategoryOptions.secondary);
      expect(props.size).toBe('small');
    });

    it('emits a secondary-action event when secondary button is clicked', () => {
      findActionButtons().at(0).vm.$emit('click');

      expect(wrapper.emitted('secondary-action')).toHaveLength(1);
    });
  });

  describe('given secondaryButtonText and secondaryButtonLink', () => {
    beforeEach(() => {
      createComponent({ propsData: { secondaryButtonText, secondaryButtonLink } });
    });

    it('renders a secondary button with an href given secondaryButtonLink', () => {
      const button = findActionButtons().at(0);
      expect(button.attributes('href')).toEqual(secondaryButtonLink);
    });
  });

  it('renders actions slot content', () => {
    createComponent({ slots: { actions: DummyComponent } });

    const actionsContainer = findActionsContainer();
    expect(actionsContainer.exists()).toBe(true);
    expect(actionsContainer.findComponent(DummyComponent).exists()).toBe(true);
  });

  describe('top-level classes', () => {
    describe.each`
      prop             | cssClass                      | presentIf
      ${'sticky'}      | ${'gl-alert-sticky'}          | ${true}
      ${'dismissible'} | ${'gl-alert-not-dismissible'} | ${false}
    `('$cssClass', ({ prop, cssClass, presentIf }) => {
      it(`adds class ${cssClass} when ${prop} is ${presentIf}`, () => {
        createComponent({
          propsData: {
            [prop]: presentIf,
          },
        });

        expect(wrapper.classes()).toContain(cssClass);
      });

      it(`does not add class ${cssClass} when ${prop} is ${!presentIf}`, () => {
        createComponent({
          propsData: {
            [prop]: !presentIf,
          },
        });

        expect(wrapper.classes()).not.toContain(cssClass);
      });
    });

    it('adds the `gl-alert-has-title` class if there is a title', () => {
      createComponent({
        propsData: {
          title: 'title',
        },
      });

      expect(wrapper.classes()).toContain('gl-alert-has-title');
    });

    it('does not add the `gl-alert-has-title` class if there is no title', () => {
      createComponent();

      expect(wrapper.classes()).not.toContain('gl-alert-has-title');
    });

    it('adds the `gl-alert-has-actions` class if there are action buttons', () => {
      createComponent({
        propsData: {
          primaryButtonText,
        },
      });

      expect(wrapper.classes()).toContain('gl-alert-has-actions');
    });

    it('adds the `gl-alert-has-actions` class if the actions slot is filled', () => {
      createComponent({ slots: { actions: DummyComponent } });

      expect(wrapper.classes()).toContain('gl-alert-has-actions');
    });

    it('does not add the `gl-alert-has-actions` class if there are no actions', () => {
      createComponent();

      expect(wrapper.classes()).not.toContain('gl-alert-has-actions');
    });
  });

  describe('aria-live', () => {
    it('uses default politeness', () => {
      createComponent();
      expect(wrapper.find('[role="status"][aria-live="polite"]').exists()).toBe(true);
    });

    it('uses custom politeness', () => {
      createComponent({ propsData: { politeness: 'assertive' } });
      expect(wrapper.find('[role="status"][aria-live="assertive"]').exists()).toBe(true);
    });

    it('ignores invalid custom politeness', () => {
      createComponent({ propsData: { politeness: 'foo' } });

      expect(wrapper).toHaveLoggedVueWarnings();
    });
  });

  describe('focus public method', () => {
    beforeEach(() => {
      createComponent({ attachTo: document.body });
    });

    it('focuses the component element', async () => {
      expect(document.activeElement).not.toBe(wrapper.element);
      wrapper.vm.focus();
      expect(document.activeElement).toBe(wrapper.element);
    });

    it('adds/removes gl-focus class', async () => {
      wrapper.vm.focus();
      await nextTick();

      expect(wrapper.classes()).toContain('gl-focus');

      await wrapper.trigger('blur');

      expect(wrapper.classes()).not.toContain('gl-focus');
    });
  });
});
