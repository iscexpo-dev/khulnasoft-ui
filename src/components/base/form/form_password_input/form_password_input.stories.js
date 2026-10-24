import GlFormGroup from '../form_group/form_group.vue';
import GlFormPasswordInput from './form_password_input.vue';

const template = `
  <gl-form-group :label="labelText" :label-for="inputId">
    <gl-form-password-input
      :id="inputId"
      :value="value"
      :disabled="disabled"
      :readonly="readonly"
      :initial-visibility="initialVisibility"
      :reveal-label="revealLabel"
      :hide-label="hideLabel"
      :input-class="inputClass"
      @input="onInput"
    />
  </gl-form-group>
`;

const generateProps = ({
  inputId = 'password-input',
  labelText = 'Password',
  value = 'super-secret-token',
  disabled = false,
  readonly = false,
  initialVisibility = false,
  revealLabel = 'Reveal password',
  hideLabel = 'Hide password',
  inputClass = '',
} = {}) => ({
  inputId,
  labelText,
  value,
  disabled,
  readonly,
  initialVisibility,
  revealLabel,
  hideLabel,
  inputClass,
});

const Template = (args, { updateArgs }) => ({
  components: { GlFormPasswordInput, GlFormGroup },
  props: Object.keys(args),
  methods: {
    onInput(value) {
      updateArgs({ ...this.$props, value });
    },
  },
  template,
});

export const Default = Template.bind({});
Default.args = generateProps();

export const Revealed = Template.bind({});
Revealed.args = generateProps({ initialVisibility: true });

export const Readonly = Template.bind({});
Readonly.args = generateProps({ readonly: true });
Readonly.parameters = {
  docs: {
    description: {
      story:
        'The value cannot be edited, but it can still be revealed and copied, and it is submitted with the form. Use this for a generated secret the user needs to read.',
    },
  },
};

export const Disabled = Template.bind({});
Disabled.args = generateProps({ disabled: true });
Disabled.parameters = {
  docs: {
    description: {
      story:
        'The input and the toggle are both inert: neither is in the tab order, the value cannot be revealed, and it is not submitted with the form.',
    },
  },
};

export default {
  title: 'base/form/form-password-input',
  component: GlFormPasswordInput,
  parameters: {
    docs: {
      description: {
        component: `An input that masks its value, with a button to toggle its visibility.

Attributes that are not props are forwarded to the underlying input, so \`id\`, \`name\`,
\`autocomplete\`, \`required\` and friends behave as they would on a plain \`GlFormInput\`.

Use \`readonly\` to prevent edits while keeping the value readable, copyable and submitted.
Use \`disabled\` to make the whole control inert.

Use \`input-class\` to add class(es) to the inner input itself (a \`class\` on the component
lands on the wrapper under Vue 2), for hooks or styles that must target the input.`,
      },
    },
  },
  argTypes: {},
};
