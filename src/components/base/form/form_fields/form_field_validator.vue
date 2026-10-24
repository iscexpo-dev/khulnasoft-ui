<script>
/**
 * FormFieldValidator
 *
 * This is an internal component which is used to watch on specific field/value
 * pairs and emits changes to `invalidFeedback`.
 *
 * **why:** Without this separate component, *any* change to *any* value
 * was causing *all* validators to run. A separate renderless component
 * helps us isolate this logic *and* react only to what we need to.
 */
export default {
  name: 'GlFormFieldValidator',
  props: {
    /**
     * The value to validate.
     */
    value: {
      required: true,
      // ESLint requires "validator" or "type". Any kind of value is valid.
      validator: () => true,
    },
    /**
     * Array of validation functions or rules.
     */
    validators: {
      type: Array,
      required: false,
      default: () => [],
    },
    /**
     * When true, triggers validation.
     */
    shouldValidate: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  computed: {
    invalidFeedback() {
      if (!this.shouldValidate) {
        return '';
      }

      const result = this.validators.reduce((acc, validateFn) => {
        // If we already have an invalid message, let's just use that one.
        if (acc) {
          return acc;
        }

        return validateFn(this.value);
      }, '');

      // Force falsey string for type consistency.
      return result || '';
    },
  },
  watch: {
    invalidFeedback(newVal) {
      this.$emit('update', newVal);
    },
  },
  render() {
    return null;
  },
};
</script>
