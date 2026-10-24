import { shallowMount } from '@vue/test-utils';
import GlMultiStepFormTemplate from './multi_step_form_template.vue';

describe('GlMultiStepFormTemplate', () => {
  let wrapper;
  const defaultProps = {
    title: 'Form title',
    currentStep: 1,
  };

  const createComponent = (props = {}, slots) => {
    wrapper = shallowMount(GlMultiStepFormTemplate, {
      propsData: {
        ...defaultProps,
        ...props,
      },
      slots,
    });
  };

  it('renders title', () => {
    createComponent();

    expect(wrapper.find('h1').exists()).toBe(true);
    expect(wrapper.text()).toContain('Form title');
  });

  it("uses the tag name provided for the title's heading tag", () => {
    createComponent({ headingTag: 'h2' });

    expect(wrapper.find('h2').exists()).toBe(true);
  });

  describe('step display', () => {
    it('displays step X of N when stepsTotal is provided', () => {
      createComponent({ stepsTotal: 2 });

      expect(wrapper.text()).toContain('Step 1 of 2');
    });

    it('displays only step X when stepsTotal is not provided', () => {
      createComponent();

      expect(wrapper.text()).toContain('Step 1');
      expect(wrapper.text()).not.toContain('Step 1 of');
    });

    it('does not render stepMessage if no currentStep is passed', () => {
      createComponent({ currentStep: null });
      expect(wrapper.text()).not.toContain('Step');
    });
  });

  describe('slots', () => {
    it('renders default slot content', () => {
      createComponent({}, { default: '<div class="test-form">Form Content</div>' });

      expect(wrapper.find('.test-form').exists()).toBe(true);
    });

    it('renders action buttons correctly when back and next slots are provided', () => {
      createComponent(
        {
          currentStep: 3,
        },
        {
          back: '<button class="back">Back</button>',
          next: '<button class="next">Next</button>',
        },
      );

      expect(wrapper.find('button.back').exists()).toBe(true);
      expect(wrapper.find('button.next').exists()).toBe(true);
    });

    it('does not render action buttons when no back or next slot is provided', () => {
      createComponent();

      expect(wrapper.find('[data-testid="multi-step-form-action"]').exists()).toBe(false);
    });

    it('renders footer slot content when provided', () => {
      createComponent(
        {},
        {
          footer: '<div class="test-footer">Footer Content</div>',
        },
      );

      expect(wrapper.find('.test-footer').exists()).toBe(true);
    });

    it('does not render footer section when no footer slot is provided', () => {
      createComponent();

      expect(wrapper.find('[data-testid="multi-step-form-footer"]').exists()).toBe(false);
    });
  });
});
