<script>
import { translate } from '../../../utils/i18n';

export default {
  name: 'GlMultiStepFormTemplate',
  props: {
    /**
     * The tile of the form. Should not be specific to the current step.
     */
    title: {
      type: String,
      required: true,
    },
    /**
     * The number of the current step. If a non-zero number is passed, then the current step number will be shown at the top of the form.
     */
    currentStep: {
      type: Number,
      required: false,
      default: null,
    },
    /**
     * The total number of steps. If a non-zero number is passed to this prop and a non-zero number is passed to the `currentStep` prop, then they will be formatted together at the top of the form. In English, this will appear as `Step n of x` where n is the current step and x is the step total.
     */
    stepsTotal: {
      type: Number,
      required: false,
      default: null,
    },
    /**
     * Optional override to the semantic element used for the form title's heading tag. Defaults to `h1` but should be adjusted in usage to prevent unexpected heading level changes in the DOM.
     */
    headingTag: {
      type: String,
      required: false,
      default: 'h1',
    },
  },
  computed: {
    stepMessage() {
      return this.stepsTotal
        ? translate('GlMultiStepFormTemplate.stepXofY', 'Step %{currentStep} of %{stepsTotal}', {
            currentStep: this.currentStep,
            stepsTotal: this.stepsTotal,
          })
        : translate('GlMultiStepFormTemplate.stepX', 'Step %{currentStep}', {
            currentStep: this.currentStep,
          });
    },
  },
};
</script>
<template>
  <div class="gl-mx-auto gl-max-w-80 gl-pt-8">
    <component
      :is="headingTag"
      class="gl-heading-1 gl-mb-3 gl-mt-0 gl-text-center"
      data-testid="multi-step-form-title"
    >
      {{ title }}
    </component>
    <p v-if="currentStep" class="gl-m-0 gl-text-center" data-testid="multi-step-form-steps">
      {{ stepMessage }}
    </p>
    <div class="gl-mt-7" data-testid="multi-step-form-content">
      <!-- @slot The main content of the step -->
      <slot></slot>
    </div>
    <div
      v-if="$scopedSlots.back || $scopedSlots.next"
      class="gl-mt-6 gl-flex gl-justify-center gl-gap-3"
      data-testid="multi-step-form-action"
    >
      <!-- @slot A container for a back button -->
      <slot name="back"></slot>
      <!-- @slot A container for a next button -->
      <slot name="next"></slot>
    </div>
    <div v-if="$scopedSlots.footer" class="gl-mt-7" data-testid="multi-step-form-footer">
      <!-- @slot A container for additional form-related inputs and controls that are not specific to the current step -->
      <slot name="footer"></slot>
    </div>
  </div>
</template>
