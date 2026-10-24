import { uniqueId, omit } from 'lodash-es';
import GlModal from '../../modal/modal.vue';
import GlButton from '../../button/button.vue';
import GlAlert from '../../alert/alert.vue';
import GlListbox from '../../new_dropdowns/listbox/listbox.vue';
import GlIcon from '../../icon/icon.vue';
import GlFormCheckbox from '../form_checkbox/form_checkbox.vue';
import GlFormCheckboxGroup from '../form_checkbox/form_checkbox_group.vue';
import { setStoryTimeout } from '../../../../utils/test_utils';
import { getA11yParameters } from '../../../../utils/stories_utils';
import GlFormFields from './form_fields.vue';
import { required } from './validators';
import { mapToNumber } from './mappers';

// eslint-disable-next-line no-unused-vars
export const Default = (args, { argTypes = {} }) => ({
  ITEMS: ['Pizza', 'Keyboards', 'Guitars', 'Rocket ships'].map((text) => ({ text, value: text })),
  props: ['validateOnBlur'],
  components: {
    GlFormFields,
    GlButton,
    GlModal,
    GlListbox,
    GlAlert,
    GlIcon,
    GlFormCheckbox,
    GlFormCheckboxGroup,
  },
  data() {
    return {
      // why: We declare fields here so that we can test what binding the
      //      "confirmPassword" validator to "this.formValues" would act
      //      like. In most cases, these can be constant and injected through
      //      `$options`.
      fields: {
        USERNAME: {
          label: 'NAME (ALL CAPS)',
          mapValue: (x) => x?.toUpperCase(),
          validators: [required('NAME IS REQUIRED!!!')],
        },
        password: {
          label: 'Password with group styling',
          inputAttrs: { type: 'password' },
          groupAttrs: { class: 'gl-bg-purple-50 gl-w-20' },
          validators: [required('Password is required')],
        },
        confirmPassword: {
          label: 'Confirm Password',
          inputAttrs: { type: 'password' },
          validators: [
            required('Confirmed password is required'),
            (confirmValue) =>
              confirmValue !== this.formValues.password ? 'Must match password' : '',
          ],
        },
        custom: {
          label: 'Custom input',
          mapValue: mapToNumber,
          validators: [(val) => (val < 1 ? 'Please click this at least once :)' : '')],
        },
        favoriteItem: {
          label: 'Favorite Item',
          groupAttrs: {
            optional: true,
            'optional-text': '(optional)', // In KhulnaSoft.com translate this text with _('(optional)')
          },
        },
        favoriteFood: {
          label: 'Favorite Food',
          fieldset: true,
          groupAttrs: {
            optional: true,
            'optional-text': '(select all that apply)',
          },
          validators: [
            (val) => (!val || val.length === 0 ? 'Please select at least one option' : ''),
          ],
        },
        acknowledge: {
          label: null,
          validators: [(val) => (val === true ? '' : 'Acknowledge before submitting!')],
        },
      },
      formValues: {},
      testFormId: uniqueId('form_fields_story_'),
      serverValidations: {},
      loading: false,
      foodOptions: [
        { text: 'Burgers', value: 'Burgers' },
        { text: 'Pizza', value: 'Pizza' },
        { text: 'Sushi', value: 'Sushi' },
      ],
    };
  },
  computed: {
    values() {
      return omit(this.formValues, ['confirmPassword']);
    },
    valuesJSON() {
      // JSON doesn't allow undefined values
      return JSON.stringify(this.values, (key, value) => (value === undefined ? null : value), 2);
    },
    favoriteItemToggleText() {
      if (!this.formValues.favoriteItem) {
        return 'Select an item';
      }

      return null;
    },
  },
  methods: {
    onInputField({ name }) {
      this.$delete(this.serverValidations, name);
    },
    async onSubmit() {
      this.loading = true;

      // Simulate waiting for API request to resolve
      await new Promise((resolve) => {
        setStoryTimeout(resolve, 1000);
      });

      this.loading = false;

      // Manually checking field and validating for this example.
      // In practice this error message would come from the API response.
      if (this.formValues.USERNAME === 'FOO') {
        this.$set(this.serverValidations, 'USERNAME', 'Username has already been taken.');

        return;
      }

      this.$refs.modal.show();
    },
  },
  template: `
    <div>
      <h3>Fields</h3>
      <form :id="testFormId" @submit.prevent>
        <gl-form-fields :fields="fields" v-model="formValues" :form-id="testFormId" :server-validations="serverValidations" :validate-on-blur="validateOnBlur" @input-field="onInputField" @submit="onSubmit">
          <template #group(confirmPassword)-label>
            <div class="gl-flex gl-items-center gl-gap-x-3">
              <span>Confirm Password</span>
              <gl-icon name="information-o" />
            </div>
          </template>
          <template #group(confirmPassword)-description>
            Description using <code>group(confirmPassword)-description</code> slot.
          </template>
          <template #after(confirmPassword)>
            <gl-alert class="gl-mb-5" :dismissible="false">Custom content using <code>after(confirmPassword)</code> slot.</gl-alert>
          </template>
          <template #input(custom)="{ id, value, input, blur }">
            <button :id="id" @click="input(value + 1)" @blur="blur" type="button">{{value}}</button>
          </template>
          <template #input(favoriteItem)="{ id, value, input, blur }">
            <gl-listbox :toggle-id="id" :items="$options.ITEMS" :selected="value" :toggle-text="favoriteItemToggleText" @select="input" @hidden="blur" />
          </template>
          <template #group(favoriteItem)-label-description>
            Label description using <code>group(favoriteItem)-label-description</code> slot.
          </template>
          <template #input(favoriteFood)="{ id, value, input, validation }">
            <gl-form-checkbox-group
              :id="id"
              :options="foodOptions"
              :checked="value || []"
              :state="validation.state"
              @input="input"
            />
          </template>
          <template #input(acknowledge)="{ id, input, validation, value }">
            <gl-form-checkbox
              :state="validation.state"
              :id="id"
              :checked="value"
              @input="input"
            >
              I accept the terms and conditions
            </gl-form-checkbox>
          </template>
        </gl-form-fields>
        <gl-button type="submit" category="primary" :loading="loading">Submit</gl-button>
      </form>
      <gl-modal ref="modal" modal-id="submission-modal" title="Form submission"><pre>{{ valuesJSON }}</pre></gl-modal>
    </div>
  `,
});

Default.args = { validateOnBlur: true };

export default {
  title: 'base/form/form-fields',
  component: GlFormFields,
  parameters: {
    // Skip known axe-core failures, skipped rules should be removed when underlying violation is resolved
    a11y: getA11yParameters({ temporarySkipRules: ['color-contrast'] }),
  },
  argTypes: {
    fields: {
      control: false,
    },
    formId: {
      control: false,
    },
    serverValidations: {
      control: false,
    },
    'v-model': {
      table: {
        disable: true,
      },
    },
    input: {
      control: false,
    },
    'field-validation': {
      control: false,
    },
    'input-field': {
      control: false,
    },
    submit: {
      control: false,
    },
    slotName: {
      control: false,
    },
    'field.inputSlot.slotName': {
      control: false,
    },
    'field.afterSlotName': {
      control: false,
    },
  },
};
