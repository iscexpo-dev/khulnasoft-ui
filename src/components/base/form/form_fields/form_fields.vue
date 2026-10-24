<script>
import { isFunction, mapValues, uniqueId } from 'lodash-es';
import GlFormGroup from '../form_group/form_group.vue';
import GlFormInput from '../form_input/form_input.vue';
import { setObjectProperty } from '../../../../utils/set_utils';
import GlFormFieldValidator from './form_field_validator.vue';
import GlFormFieldsLoop from './form_fields_loop.vue';

export default {
  name: 'GlFormFields',
  components: {
    GlFormGroup,
    GlFormInput,
    GlFormFieldValidator,
    GlFormFieldsLoop,
  },
  model: {
    prop: 'values',
    event: 'input',
  },
  props: {
    /**
     * Object of keys to FieldDefinitions.
     * The shape of the keys will be the same for `values` and what's emitted by the `input` event.
     *
     * @typedef {object} FieldDefinition
     * @template TValue=string
     * @property {string | null | undefined} label - Label text to show for this field. When explicitly set to null, the label is suppressed. When undefined or not provided, the field name is used as the label.
     * @property {undefined | Object} groupAttrs - Properties that are passed to the group wrapping this field.
     * @property {undefined | Object} inputAttrs - Properties that are passed to the actual input for this field.
     * @property {undefined | function(string): TValue} mapValue - Function that maps the inputted string value to the field's actual value (e.g. a Number).
     * @property {undefined | Array<function(TValue): string | undefined>=} validators - Collection of validator functions.
     * @property {undefined | boolean} fieldset - When true, renders the form group as a fieldset with legend instead of div with label.
     *
     * @type {{ [key: string]: FieldDefinition }}
     */
    fields: {
      type: Object,
      required: true,
    },
    /**
     * The current value for each field, by key.
     * Keys should match between `values` and `fields`.
     */
    values: {
      type: Object,
      required: true,
    },
    /**
     * The id of the form element to handle "submit" listening.
     */
    formId: {
      type: String,
      required: true,
    },
    /**
     * Validation errors from the server. Generally passed to the component after making an API call.
     */
    serverValidations: {
      type: Object,
      required: false,
      default() {
        return {};
      },
    },
    /**
     * Whether to validate fields on blur. When set to false, validation will only occur on form submission.
     */
    validateOnBlur: {
      type: Boolean,
      required: false,
      default: true,
    },
  },
  data() {
    return {
      fieldDirtyStatuses: {},
      fieldValidations: {},
      fieldIds: {},
    };
  },
  computed: {
    formElement() {
      return document.getElementById(this.formId);
    },
    fieldValidationProps() {
      return mapValues(this.fields, (_, fieldName) => {
        const invalidFeedback =
          this.serverValidations[fieldName] || this.fieldValidations[fieldName] || '';

        return {
          invalidFeedback,
          state: invalidFeedback ? false : null,
        };
      });
    },
    fieldValues() {
      return mapValues(this.fields, (_, fieldName) => {
        if (fieldName in this.values) {
          return this.values[fieldName];
        }

        return this.getMappedValue(fieldName, undefined);
      });
    },
    fieldNames() {
      return Object.keys(this.fields);
    },
    fieldsToRender() {
      return mapValues(this.fields, (field, fieldName) => {
        const id = this.memoizeAndReturnFieldId(field, fieldName);

        const inputSlotName = `input(${fieldName})`;
        const groupPassthroughSlotName = `group(${fieldName})-`;
        const afterSlotName = `after(${fieldName})`;

        const inputSlot = {
          slotName: inputSlotName,
          attrs: {
            value: this.fieldValues[fieldName],
            input: (val) => this.onFieldInput(fieldName, val),
            blur: () => this.onFieldBlur(fieldName),
            validation: this.fieldValidationProps[fieldName],
            id,
          },
        };

        const groupPassthroughSlots = Object.keys(this.$scopedSlots)
          .filter((slotName) => slotName.startsWith(groupPassthroughSlotName))
          .map((slotName) => {
            const childSlotName = slotName.replace(groupPassthroughSlotName, '');

            return {
              slotName,
              childSlotName,
            };
          });

        return {
          ...field,
          id,
          label: this.getFieldLabel(field, fieldName),
          inputSlot,
          groupPassthroughSlots,
          afterSlotName,
        };
      });
    },
  },
  mounted() {
    // why: We emit initial values as a convenience so that `v-model="values"` can be easily initialized.
    this.$emit('input', this.fieldValues);

    this.formElement?.addEventListener('submit', this.onFormSubmission);
  },
  created() {
    this.batchedInputEvent = {};
    this.isBatchedInputEventScheduled = false;
  },
  destroyed() {
    this.formElement?.removeEventListener('submit', this.onFormSubmission);
  },
  methods: {
    setFieldDirty(fieldName) {
      this.fieldDirtyStatuses = setObjectProperty(this.fieldDirtyStatuses, fieldName, true);
    },
    setAllFieldsDirty() {
      this.fieldNames.forEach((fieldName) => this.setFieldDirty(fieldName));
    },
    hasAllFieldsValid() {
      // note: Only check "fieldNames" since "fields" could have changed since the life of "fieldValidations"
      return this.fieldNames.every((fieldName) => !this.fieldValidations[fieldName]);
    },
    async checkBeforeSubmission() {
      this.setAllFieldsDirty();

      await this.$nextTick();

      return this.hasAllFieldsValid();
    },
    getFieldLabel(field, fieldName) {
      if (field.label === null) return undefined;
      return field.label || fieldName;
    },
    getMappedValue(fieldName, val) {
      const field = this.fields[fieldName];

      if (isFunction(field?.mapValue)) {
        return field.mapValue(val);
      }

      return val;
    },
    memoizeAndReturnFieldId(field, fieldName) {
      const memoizedId = this.fieldIds[fieldName];

      if (memoizedId) {
        return memoizedId;
      }

      const id = field.id || uniqueId('gl-form-field-');
      this.fieldIds[fieldName] = id;

      return id;
    },
    onFieldValidationUpdate(fieldName, invalidFeedback) {
      this.fieldValidations = setObjectProperty(this.fieldValidations, fieldName, invalidFeedback);

      this.$emit('field-validation', {
        fieldName,
        ...this.fieldValidationProps[fieldName],
      });
    },
    onFieldBlur(fieldName) {
      if (this.validateOnBlur) {
        this.setFieldDirty(fieldName);
      }
    },
    async onFieldInput(fieldName, inputValue) {
      const val = this.getMappedValue(fieldName, inputValue);

      /**
       * Emitted when a form input emits the `input` event.
       */
      this.$emit('input-field', {
        name: fieldName,
        value: val,
      });

      this.batchedInputEvent = {
        ...this.batchedInputEvent,
        [fieldName]: val,
      };

      // Return if a batched input event has already been scheduled
      if (this.isBatchedInputEventScheduled) {
        return;
      }

      this.isBatchedInputEventScheduled = true;
      await this.$nextTick();

      /**
       * Emitted when any of the form values change. Used by `v-model`.
       */
      this.$emit('input', {
        ...this.values,
        ...this.batchedInputEvent,
      });

      this.batchedInputEvent = {};
      this.isBatchedInputEventScheduled = false;
    },
    async onFormSubmission(e) {
      e.preventDefault();

      const isValid = await this.checkBeforeSubmission();

      if (isValid) {
        /**
         * Emitted when the form is submitted and all of the form fields are valid.
         */
        this.$emit('submit', e);
      }
    },
  },
};
</script>

<template>
  <gl-form-fields-loop :fields="fieldsToRender">
    <template #default="{ field, fieldName }">
      <gl-form-group
        v-bind="field.groupAttrs"
        :key="field.id"
        :label="field.label"
        :label-for="field.fieldset ? undefined : field.id"
        :invalid-feedback="fieldValidationProps[fieldName].invalidFeedback"
        :state="fieldValidationProps[fieldName].state"
      >
        <gl-form-field-validator
          :value="fieldValues[fieldName]"
          :validators="field.validators"
          :should-validate="fieldDirtyStatuses[fieldName]"
          @update="onFieldValidationUpdate(fieldName, $event)"
        />

        <template
          v-for="{ slotName, childSlotName } in field.groupPassthroughSlots"
          #[childSlotName]
        >
          <!-- @slot Can be used to pass slots to `GlFormGroup`. -->
          <slot :name="slotName"></slot>
        </template>
        <!-- @slot Scoped slot that can be used for components other than `GlFormInput`. The name of the slot is `input(<fieldName>)`. -->
        <slot :name="field.inputSlot.slotName" v-bind="field.inputSlot.attrs">
          <gl-form-input
            :id="field.id"
            :value="fieldValues[fieldName]"
            :state="fieldValidationProps[fieldName].state"
            v-bind="field.inputAttrs"
            @input="onFieldInput(fieldName, $event)"
            @blur="onFieldBlur(fieldName)"
          />
        </slot>
      </gl-form-group>
      <!-- @slot Can be used to add content the form group of a field. The name of the slot is `after(<fieldName>)`.-->
      <slot :name="field.afterSlotName"></slot>
    </template>
  </gl-form-fields-loop>
</template>
