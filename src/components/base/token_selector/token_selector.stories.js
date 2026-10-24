import { userEvent, within, waitFor, expect } from '@storybook/test';
import { makeContainer } from '../../../utils/story_decorators/container';
import GlFormGroup from '../form/form_group/form_group.vue';
import GlTokenSelector from './token_selector.vue';

const template = `
  <div>
    <gl-form-group label="Select technologies" label-for="token-selector-input">
      <gl-token-selector
        v-model="selectedTokens"
        v-bind="$props"
        :dropdown-items="filteredDropdownItems"
        :text-input-attrs="{ id: 'token-selector-input' }"
        @text-input="handleTextInput"
        @focus="handleFocus" />
    </gl-form-group>
    {{ selectedTokens }}
  </div>
`;

const ariaLabelTemplate = `
  <div>
    <gl-token-selector
      v-model="selectedTokens"
      v-bind="$props"
      aria-label="Select technologies"
      :dropdown-items="filteredDropdownItems"
      @text-input="handleTextInput"
      @focus="handleFocus" />
    {{ selectedTokens }}
  </div>
`;

const ariaLabelledByTemplate = `
  <div>
    <div id="token-selector-text-label" style="margin-bottom: 0.5rem;"><b>Select technologies text label</b> <i>(not clickable)</i></div>
    <gl-token-selector
      v-model="selectedTokens"
      v-bind="$props"
      aria-labelledby="token-selector-text-label"
      :dropdown-items="filteredDropdownItems"
      @text-input="handleTextInput"
      @focus="handleFocus" />
    {{ selectedTokens }}
  </div>
`;

const dropdownItems = [
  {
    id: 1,
    name: 'Vue.js',
  },
  {
    id: 2,
    name: 'Ruby On Rails',
    class: '!gl-text-white !gl-bg-data-viz-magenta-950',
  },
  {
    id: 3,
    name: 'GraphQL',
  },
  {
    id: 4,
    name: 'Redis',
    class: '!gl-text-white !gl-bg-data-viz-green-700',
  },
  {
    id: 5,
    name: 'CSS',
    class: '!gl-text-red-700 !gl-bg-red-50',
  },
];

const generateProps = (props) => ({
  dropdownItems,
  ...props,
});

const Template = (args, { argTypes }) => ({
  components: { GlTokenSelector, GlFormGroup },
  props: Object.keys(argTypes).filter((key) => key !== 'selectedTokens'),
  template: args.template || template,
  data() {
    return {
      filteredDropdownItems: [],
      inputText: '',
      selectedTokens: args.selectedTokens || [
        {
          id: 1,
          name: 'Vue.js',
        },
      ],
    };
  },
  methods: {
    handleTextInput(value) {
      this.inputText = value;

      if (this.inputText === '') {
        this.filteredDropdownItems = this.dropdownItems;

        return;
      }

      this.filterDropdownItems();
    },
    handleFocus() {
      if (this.inputText !== '') {
        this.filterDropdownItems();
      } else {
        this.filteredDropdownItems = this.dropdownItems;
      }
    },
    filterDropdownItems() {
      this.filteredDropdownItems = this.dropdownItems.filter((dropdownItem) => {
        return dropdownItem.name.toLowerCase().includes(this.inputText.toLowerCase());
      });
    },
  },
});

export const Default = Template.bind({});
Default.args = generateProps();
Default.play = async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  const button = canvas.getByRole('combobox');
  await userEvent.click(button);
  await waitFor(() => expect(canvas.getByRole('listbox')).toBeVisible());
};

export default {
  title: 'base/token_selector',
  component: GlTokenSelector,
  parameters: {
    docs: {
      description: {
        component:
          'See [Pajamas Design System documentation](https://design.khulnasoft.com/components/token) for usage and implementation details.',
      },
    },
  },
  argTypes: {
    state: {
      options: [true, false, null],
      control: 'radio',
    },
  },
};

export const UserDefinedTokens = Template.bind({});
UserDefinedTokens.tags = ['skip-visual-test'];
UserDefinedTokens.parameters = {
  docs: {
    description: {
      story: 'Allows users to add custom tokens when no results are found.',
    },
  },
};
UserDefinedTokens.args = generateProps({ allowUserDefinedTokens: true });

export const UserDefinedTokensShowAddNewAlways = Template.bind({});
UserDefinedTokensShowAddNewAlways.tags = ['skip-visual-test'];
UserDefinedTokensShowAddNewAlways.parameters = {
  docs: {
    description: {
      story: 'Allows users to add custom tokens regardless if results are found.',
    },
  },
};
UserDefinedTokensShowAddNewAlways.args = generateProps({
  allowUserDefinedTokens: true,
  showAddNewAlways: true,
});

export const Clearable = Template.bind({});
Clearable.parameters = {
  docs: {
    description: {
      story: 'Allows user to bulk delete tokens.',
    },
  },
};
Clearable.decorators = [makeContainer({ width: '300px' })];
Clearable.args = {
  ...generateProps({ allowClearAll: true }),
  selectedTokens: dropdownItems,
};

export const WithAriaLabelledBy = Template.bind({});
WithAriaLabelledBy.tags = ['skip-visual-test'];
WithAriaLabelledBy.args = {
  ...generateProps(),
  template: ariaLabelledByTemplate,
};

export const WithAriaLabel = Template.bind({});
WithAriaLabel.tags = ['skip-visual-test'];
WithAriaLabel.args = {
  ...generateProps(),
  template: ariaLabelTemplate,
};

export const WithPlaceholder = Template.bind({});
WithPlaceholder.args = {
  ...generateProps({ placeholder: 'Select items' }),
  selectedTokens: [],
};
