import GlButton from '../button/button.vue';
import { setStoryTimeout } from '../../../utils/test_utils';
import GlFormCheckboxGroup from './form_checkbox/form_checkbox_group.vue';
import GlForm from './form.vue';
import GlFormGroup from './form_group/form_group.vue';
import GlFormInput from './form_input/form_input.vue';
import GlFormSelect from './form_select/form_select.vue';
import GlFormCheckbox from './form_checkbox/form_checkbox.vue';

export const Default = (args) => ({
  components: {
    GlForm,
    GlFormGroup,
    GlFormInput,
    GlFormSelect,
    GlFormCheckbox,
    GlFormCheckboxGroup,
    GlButton,
  },
  props: Object.keys(args),
  data() {
    return {
      form: {
        email: '',
        name: '',
        mergeState: null,
        date: '01/02/24',
        groupID: '12312312',
        checked: [],
      },
      states: [{ text: 'Select one', value: null }, 'Open', 'Resolved', 'Closed', 'Blocked'],
      show: true,
    };
  },
  methods: {
    onReset() {
      this.form.name = '';
    },
    onSubmit(evt) {
      evt.preventDefault();
      setStoryTimeout(() => {
        // eslint-disable-next-line no-alert
        alert(JSON.stringify(this.form));
      }, 1000);
    },
  },
  template: `
    <gl-form @submit="onSubmit" @reset="onReset">
      <gl-form-group
        id="input-group-1"
        label="Email address"
        label-for="input-1"
        label-description="We'll never share your email with anyone else."
      >
        <gl-form-input
          id="input-1"
          v-model="form.email"
          type="email"
          required
          placeholder="name@domain.com"
        />
      </gl-form-group>

      <gl-form-group id="input-group-2" label="Your name" label-for="input-2">
        <gl-form-input id="input-2" v-model="form.name" required />
      </gl-form-group>

      <gl-form-group id="input-group-3" label="Merge state" label-for="input-3">
        <gl-form-select id="input-3" v-model="form.mergeState" :options="states" required />
      </gl-form-group>

      <gl-form-group id="input-group-4" label="Date" label-for="input-4">
        <gl-form-input id="input-4" v-model="form.date" disabled />
      </gl-form-group>

      <gl-form-group id="input-group-5" label="Group ID" label-for="input-5">
        <gl-form-input id="input-5" v-model="form.groupID" readonly />
      </gl-form-group>

      <gl-form-group id="input-group-6">
        <gl-form-checkbox-group id="checkboxes-6" v-model="form.checked">
          <gl-form-checkbox value="squash">Squash commits</gl-form-checkbox>
          <gl-form-checkbox value="new">Create new issue</gl-form-checkbox>
        </gl-form-checkbox-group>
      </gl-form-group>

      <div class="gl-flex gl-gap-3">
        <gl-button type="submit" variant="confirm">Submit</gl-button>
        <gl-button type="reset">Cancel</gl-button>
      </div>
    </gl-form>
  `,
});

export default {
  title: 'base/form/form',
  component: GlForm,
  parameters: {
    docs: {
      description: {
        component:
          'See [Pajamas Design System documentation](https://design.khulnasoft.com/patterns/forms) for usage and implementation details.',
      },
    },
  },
};
