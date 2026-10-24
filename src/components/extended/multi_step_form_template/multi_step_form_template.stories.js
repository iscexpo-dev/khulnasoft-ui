import { GlButton } from '../../base/button/button.vue';
import GlMultiStepFormTemplate from './multi_step_form_template.vue';

export default {
  component: GlMultiStepFormTemplate,
  title: 'extended/multi-step-form-template',
};

const Template = (args, { argTypes }) => ({
  components: { GlMultiStepFormTemplate, GlButton },
  props: Object.keys(argTypes),
  template: `<gl-multi-step-form-template v-bind="$props">
    <div class="gl-border gl-flex gl-min-h-13 gl-items-center gl-justify-center gl-rounded-lg gl-border-dashed gl-p-5">
      <div class="gl-text-center">
        <code>#default</code>&nbsp;slot (for the main content of the step)
      </div>
    </div>
    <template #back>
      <div class="gl-border gl-flex gl-items-center gl-justify-center gl-rounded-lg gl-border-dashed gl-p-5">
        <div class="gl-text-center">
          <code>#back</code>&nbsp;slot for a back button
        </div>
      </div>
    </template>
    <template #next>
      <div class="gl-border gl-flex gl-items-center gl-justify-center gl-rounded-lg gl-border-dashed gl-p-5">
        <div class="gl-text-center">
          <code>#next</code>&nbsp;slot for a next button
        </div>
      </div>
    </template>
    <template #footer>
      <div class="gl-border gl-flex gl-min-h-13 gl-items-center gl-justify-center gl-rounded-lg gl-border-dashed gl-p-5">
        <div class="gl-text-center">
          <code>#footer</code>&nbsp;slot (for form inputs/controls not specific to the current step)
        </div>
      </div>
    </template>
  </gl-multi-step-form-template>`,
});

export const Default = Template.bind({});
Default.args = {
  title: 'Create new project',
  currentStep: 1,
  stepsTotal: 2,
};
export const NumberOfStepsIsNotDefined = Template.bind({});
NumberOfStepsIsNotDefined.args = {
  title: 'Create new project',
  currentStep: 1,
};
