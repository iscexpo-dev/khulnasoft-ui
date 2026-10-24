import GlFormInput from '../form_input/form_input.vue';
import GlFormGroup from '../form_group/form_group.vue';
import GlFormCharacterCount from './form_character_count.vue';

const template = `
  <gl-form-group label="Form input with character count" :label-for="$options.inputId">
    <gl-form-input :id="$options.inputId" :aria-describedby="countTextId" :value="value" @input="onInput" />
    <gl-form-character-count
      :value="value"
      :limit="limit"
      :count-text-id="countTextId"
    >
      <template #remaining-count-text="{ count }">{{ remainingCountText(count) }}</template>
      <template #over-limit-text="{ count }">{{ overLimitText(count) }}</template>
    </gl-form-character-count>
  </gl-form-group>
`;

const generateProps = ({ value = '', limit = 100, countTextId = 'character-count-text' } = {}) => ({
  value,
  limit,
  countTextId,
});

const Template = (args, { updateArgs }) => ({
  inputId: 'form-input-with-character-count',
  components: { GlFormCharacterCount, GlFormInput, GlFormGroup },
  props: Object.keys(args),
  methods: {
    onInput(value) {
      updateArgs({ ...this.$props, value });
    },
    remainingCountText(count) {
      return count === 1 ? `${count} character remaining.` : `${count} characters remaining.`;
    },
    overLimitText(count) {
      return count === 1 ? `${count} character over limit.` : `${count} characters over limit.`;
    },
  },
  template,
});

export const Default = Template.bind({});
Default.args = generateProps();

export default {
  title: 'base/form/form-character-count',
  component: GlFormCharacterCount,
  parameters: {
    docs: {
      description: {
        component:
          'See [Pajamas Design System documentation](https://design.khulnasoft.com/components/character-count) for usage and implementation details.',
      },
    },
  },
  argTypes: {},
};
