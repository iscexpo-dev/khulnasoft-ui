import { getA11yParameters } from '../../../../utils/stories_utils';
import GlFormTextarea from './form_textarea.vue';

const template = `
  <gl-form-textarea v-bind="$props" v-model="value">
    <template #remaining-character-count-text="{ count }">{{ remainingCharacterCountText(count) }}</template>
    <template #character-count-over-limit-text="{ count }">{{ characterCountOverLimitText(count) }}</template>
  </gl-form-textarea>
`;

const generateProps = ({
  value = 'We take inspiration from other companies, and we always go for the boring solutions. Just like the rest of our work, we continually adjust our values and strive always to make them better. We used to have more values, but it was difficult to remember them all, so we condensed them and gave sub-values and created an acronym. Everyone is welcome to suggest improvements.',
  placeholder = 'hello',
  noResize = GlFormTextarea.props.noResize.default,
  characterCountLimit = null,
  textareaClasses = null,
  rows = 4,
} = {}) => ({
  value,
  placeholder,
  noResize,
  characterCountLimit,
  textareaClasses,
  rows,
});

const Template = (args, { argTypes }) => ({
  components: { GlFormTextarea },
  props: Object.keys(argTypes),
  methods: {
    remainingCharacterCountText(count) {
      return count === 1 ? `${count} character remaining.` : `${count} characters remaining.`;
    },
    characterCountOverLimitText(count) {
      return count === 1 ? `${count} character over limit.` : `${count} characters over limit.`;
    },
  },
  template,
});

export const Default = Template.bind({});
Default.args = generateProps();

export const WithCharacterCount = Template.bind({});
WithCharacterCount.args = generateProps({
  value: '',
  placeholder: 'hello',
  characterCountLimit: 100,
});
WithCharacterCount.parameters = {
  // Skip known axe-core failures, skipped rules should be removed when underlying violation is resolved
  a11y: getA11yParameters({ temporarySkipRules: ['label-title-only'] }),
};

export const WithCharacterCountAndClasses = Template.bind({});
WithCharacterCountAndClasses.args = generateProps({
  value: '',
  placeholder: 'type longer text to see over limit text',
  characterCountLimit: 100,
  textareaClasses: '!gl-rounded-lg gl-border-2',
});
WithCharacterCountAndClasses.parameters = {
  // Skip known axe-core failures, skipped rules should be removed when underlying violation is resolved
  a11y: getA11yParameters({ temporarySkipRules: ['label-title-only'] }),
};

export default {
  title: 'base/form/form-textarea',
  component: GlFormTextarea,
  parameters: {
    docs: {
      description: {
        component:
          'See [Pajamas Design System documentation](https://design.khulnasoft.com/components/textarea) for usage and implementation details.',
      },
    },
  },
};
