import { propDefaultFactory } from '../../../utils/stories_utils';
import GlButton from '../button/button.vue';
import GlDisclosureDropdown from '../new_dropdowns/disclosure/disclosure_dropdown.vue';
import GlCollapsibleListbox from '../new_dropdowns/listbox/listbox.vue';
import GlDropdown from '../dropdown/dropdown.vue';
import {
  buttonCategoryOptions,
  buttonSizeOptions,
  buttonVariantOptions,
} from '../../../utils/constants';
import GlButtonGroup from './button_group.vue';

const defaultValue = propDefaultFactory(GlButton);

const generateProps = ({
  vertical = false,
  category = buttonCategoryOptions.primary,
  size = defaultValue('size'),
  variant = 'default',
  disabled = false,
} = {}) => ({
  vertical,
  category,
  size,
  variant,
  disabled,
});

const template = `
  <gl-button-group :vertical="vertical">
    <gl-button :category="category" :size="size" :variant="variant" :disabled="disabled">Button 1</gl-button>
    <gl-button :category="category" :size="size" :variant="variant" :disabled="disabled">Button 2</gl-button>
    <gl-button :category="category" :size="size" :variant="variant" :disabled="disabled">Button 3</gl-button>
  </gl-button-group>`;

const Template = (args, { argTypes }) => ({
  components: { GlButton, GlButtonGroup },
  props: Object.keys(argTypes),
  template,
});

export const Default = Template.bind({});
Default.args = generateProps();

// Original static Selected example
export const Selected = (args, { argTypes }) => ({
  components: { GlButton, GlButtonGroup },
  props: Object.keys(argTypes),
  template: `
    <div class="gl-flex gl-flex-col gl-gap-5 gl-items-start">
      <gl-button-group :vertical="vertical">
        <gl-button selected :size="size" :disabled="disabled">Option 1</gl-button>
        <gl-button :size="size" :disabled="disabled">Option 2</gl-button>
        <gl-button :size="size" :disabled="disabled">Option 3</gl-button>
      </gl-button-group>

      <gl-button-group :vertical="vertical">
        <gl-button :size="size" :disabled="disabled">Option 1</gl-button>
        <gl-button selected :size="size" :disabled="disabled">Option 2</gl-button>
        <gl-button :size="size" :disabled="disabled">Option 3</gl-button>
      </gl-button-group>

      <gl-button-group :vertical="vertical">
        <gl-button :size="size" :disabled="disabled">Option 1</gl-button>
        <gl-button :size="size" :disabled="disabled">Option 2</gl-button>
        <gl-button selected :size="size" :disabled="disabled">Option 3</gl-button>
      </gl-button-group>

      <gl-button-group :vertical="vertical">
        <gl-button selected icon="arrow-left" :size="size" :disabled="disabled" aria-label="Left" />
        <gl-button icon="arrow-up" :size="size" :disabled="disabled" aria-label="Up" />
        <gl-button icon="arrow-right" :size="size" :disabled="disabled" aria-label="Right" />
      </gl-button-group>

      <gl-button-group :vertical="vertical">
        <gl-button icon="arrow-left" :size="size" :disabled="disabled" aria-label="Left" />
        <gl-button selected icon="arrow-up" :size="size" :disabled="disabled" aria-label="Up" />
        <gl-button icon="arrow-right" :size="size" :disabled="disabled" aria-label="Right" />
      </gl-button-group>

      <gl-button-group :vertical="vertical">
        <gl-button icon="arrow-left" :size="size" :disabled="disabled" aria-label="Left" />
        <gl-button icon="arrow-up" :size="size" :disabled="disabled" aria-label="Up" />
        <gl-button selected icon="arrow-right" :size="size" :disabled="disabled" aria-label="Right" />
      </gl-button-group>
    </div>
  `,
});
Object.assign(Selected, {
  args: generateProps(),
  parameters: {
    controls: {
      include: ['vertical', 'disabled', 'size'],
    },
  },
});

// New interactive example
export const InteractiveSelected = (args, { argTypes }) => ({
  components: { GlButton, GlButtonGroup },
  props: Object.keys(argTypes),
  data() {
    return {
      selectedOption: 1,
    };
  },
  template: `
    <gl-button-group :vertical="vertical">
      <gl-button
        :selected="selectedOption === 1"
        :size="size"
        :disabled="disabled"
        @click="selectedOption = 1"
      >
        Option 1
      </gl-button>
      <gl-button
        :selected="selectedOption === 2"
        :size="size"
        :disabled="disabled"
        @click="selectedOption = 2"
      >
        Option 2
      </gl-button>
      <gl-button
        :selected="selectedOption === 3"
        :size="size"
        :disabled="disabled"
        @click="selectedOption = 3"
      >
        Option 3
      </gl-button>
    </gl-button-group>
  `,
});
Object.assign(InteractiveSelected, {
  args: generateProps(),
  parameters: {
    controls: {
      include: ['vertical', 'disabled', 'size'],
    },
  },
});

export const Vertical = Template.bind({});
Vertical.args = generateProps({ vertical: true });

export const AllDefaultVariants = (args, { argTypes }) => ({
  components: { GlButton, GlButtonGroup },
  props: Object.keys(argTypes),
  template: `
    <div class="gl-flex gl-flex-col gl-gap-3 gl-items-start">
      <gl-button-group :vertical="vertical">
        <gl-button category="primary" :size="size" variant="default" :disabled="disabled">Default primary</gl-button>
        <gl-button category="primary" :size="size" variant="default" :disabled="disabled">Button 2</gl-button>
        <gl-button category="primary" :size="size" variant="default" :disabled="disabled">Button 3</gl-button>
      </gl-button-group>
      <gl-button-group :vertical="vertical">
        <gl-button category="secondary" :size="size" variant="default" :disabled="disabled">Default secondary</gl-button>
        <gl-button category="secondary" :size="size" variant="default" :disabled="disabled">Button 2</gl-button>
        <gl-button category="secondary" :size="size" variant="default" :disabled="disabled">Button 3</gl-button>
      </gl-button-group>

      <gl-button-group :vertical="vertical">
        <gl-button category="primary" :size="size" variant="confirm" :disabled="disabled">Confirm primary</gl-button>
        <gl-button category="primary" :size="size" variant="confirm" :disabled="disabled">Button 2</gl-button>
        <gl-button category="primary" :size="size" variant="confirm" :disabled="disabled">Button 3</gl-button>
      </gl-button-group>
      <gl-button-group :vertical="vertical">
        <gl-button category="secondary" :size="size" variant="confirm" :disabled="disabled">Confirm secondary</gl-button>
        <gl-button category="secondary" :size="size" variant="confirm" :disabled="disabled">Button 2</gl-button>
        <gl-button category="secondary" :size="size" variant="confirm" :disabled="disabled">Button 3</gl-button>
      </gl-button-group>

      <gl-button-group :vertical="vertical">
        <gl-button category="primary" :size="size" variant="danger" :disabled="disabled">Danger primary</gl-button>
        <gl-button category="primary" :size="size" variant="danger" :disabled="disabled">Button 2</gl-button>
        <gl-button category="primary" :size="size" variant="danger" :disabled="disabled">Button 3</gl-button>
      </gl-button-group>
      <gl-button-group :vertical="vertical">
        <gl-button category="secondary" :size="size" variant="danger" :disabled="disabled">Danger secondary</gl-button>
        <gl-button category="secondary" :size="size" variant="danger" :disabled="disabled">Button 2</gl-button>
        <gl-button category="secondary" :size="size" variant="danger" :disabled="disabled">Button 3</gl-button>
      </gl-button-group>

      <gl-button-group :vertical="vertical">
        <gl-button category="primary" :size="size" variant="reset" :disabled="disabled">Reset primary</gl-button>
        <gl-button category="primary" :size="size" variant="reset" :disabled="disabled">Button 2</gl-button>
        <gl-button category="primary" :size="size" variant="reset" :disabled="disabled">Button 3</gl-button>
      </gl-button-group>
      <gl-button-group :vertical="vertical">
        <gl-button category="secondary" :size="size" variant="reset" :disabled="disabled">Reset secondary</gl-button>
        <gl-button category="secondary" :size="size" variant="reset" :disabled="disabled">Button 2</gl-button>
        <gl-button category="secondary" :size="size" variant="reset" :disabled="disabled">Button 3</gl-button>
      </gl-button-group>
    </div>
  `,
});
Object.assign(AllDefaultVariants, {
  args: generateProps(),
  parameters: {
    controls: {
      include: ['vertical', 'disabled', 'size'],
    },
  },
});

export const CombinedVariants = (args, { argTypes }) => ({
  components: { GlButton, GlButtonGroup },
  props: Object.keys(argTypes),
  template: `
    <div class="gl-flex gl-flex-col gl-gap-3 gl-items-start">
      <gl-button-group :vertical="vertical">
        <gl-button category="primary" :size="size" variant="default" :disabled="disabled">Default primary</gl-button>
        <gl-button category="primary" :size="size" variant="confirm" :disabled="disabled">Confirm primary</gl-button>
        <gl-button category="primary" :size="size" variant="danger" :disabled="disabled">Danger primary</gl-button>
      </gl-button-group>
      <gl-button-group :vertical="vertical">
        <gl-button category="secondary" :size="size" variant="default" :disabled="disabled">Default secondary</gl-button>
        <gl-button category="secondary" :size="size" variant="confirm" :disabled="disabled">Confirm secondary</gl-button>
        <gl-button category="secondary" :size="size" variant="danger" :disabled="disabled">Danger secondary</gl-button>
      </gl-button-group>
    </div>
  `,
});
Object.assign(CombinedVariants, {
  args: generateProps(),
  parameters: {
    controls: {
      include: ['vertical', 'disabled', 'size'],
    },
  },
});

export const SplitDropdowns = (args, { argTypes }) => ({
  components: { GlButton, GlButtonGroup, GlCollapsibleListbox, GlDisclosureDropdown },
  props: Object.keys(argTypes),
  data() {
    return {
      firstListboxValue: 1,
      secondListboxValue: 1,
      items: [
        { text: 'One', value: 1 },
        { text: 'Two', value: 2 },
      ],
    };
  },
  template: `
    <div class="gl-flex gl-flex-col gl-gap-6 gl-items-start">
      <gl-button-group>
        <gl-button
          :disabled="disabled"
          :category="category"
          :size="size"
          :variant="variant"
        >Split disclosure</gl-button>

        <gl-disclosure-dropdown
          :disabled="disabled"
          :items="items"
          toggle-text="Other actions"
          text-sr-only
          :category="category"
          :size="size"
          :variant="variant"
        />
      </gl-button-group>

      <gl-button-group>
        <gl-button
          :disabled="disabled"
          :category="category"
          :size="size"
          :variant="variant"
        >Split listbox</gl-button>

        <gl-collapsible-listbox
          v-model="secondListboxValue"
          :disabled="disabled"
          :items="items"
          toggle-text="Choose button action"
          text-sr-only
          :category="category"
          :size="size"
          :variant="variant"
        />
      </gl-button-group>
    </div>
  `,
});
Object.assign(SplitDropdowns, {
  args: generateProps(),
  parameters: {
    controls: {
      include: ['category', 'disabled', 'size', 'variant'],
    },
  },
});

export const AllSplitDropdownsVariants = (args, { argTypes }) => ({
  components: { GlButton, GlButtonGroup, GlDisclosureDropdown },
  props: Object.keys(argTypes),
  data() {
    return {
      firstListboxValue: 1,
      secondListboxValue: 1,
      items: [
        { text: 'One', value: 1 },
        { text: 'Two', value: 2 },
      ],
    };
  },
  template: `
    <div class="gl-flex gl-flex-col gl-gap-3 gl-items-start">
      <gl-button-group>
        <gl-button
          :disabled="disabled"
          category="primary"
          :size="size"
          variant="default"
        >Default primary</gl-button>

        <gl-disclosure-dropdown
          :disabled="disabled"
          :items="items"
          toggle-text="Other actions"
          text-sr-only
          category="primary"
          :size="size"
          variant="default"
        />
      </gl-button-group>
      <gl-button-group>
        <gl-button
          :disabled="disabled"
          category="secondary"
          :size="size"
          variant="default"
        >Default secondary</gl-button>

        <gl-disclosure-dropdown
          :disabled="disabled"
          :items="items"
          toggle-text="Other actions"
          text-sr-only
          category="secondary"
          :size="size"
          variant="default"
        />
      </gl-button-group>

      <gl-button-group>
        <gl-button
          :disabled="disabled"
          category="primary"
          :size="size"
          variant="confirm"
        >Confirm primary</gl-button>

        <gl-disclosure-dropdown
          :disabled="disabled"
          :items="items"
          toggle-text="Other actions"
          text-sr-only
          category="primary"
          :size="size"
          variant="confirm"
        />
      </gl-button-group>
      <gl-button-group>
        <gl-button
          :disabled="disabled"
          category="secondary"
          :size="size"
          variant="confirm"
        >Confirm secondary</gl-button>

        <gl-disclosure-dropdown
          :disabled="disabled"
          :items="items"
          toggle-text="Other actions"
          text-sr-only
          category="secondary"
          :size="size"
          variant="confirm"
        />
      </gl-button-group>

      <gl-button-group>
        <gl-button
          :disabled="disabled"
          category="primary"
          :size="size"
          variant="danger"
        >Danger primary</gl-button>

        <gl-disclosure-dropdown
          :disabled="disabled"
          :items="items"
          toggle-text="Other actions"
          text-sr-only
          category="primary"
          :size="size"
          variant="danger"
        />
      </gl-button-group>
      <gl-button-group>
        <gl-button
          :disabled="disabled"
          category="secondary"
          :size="size"
          variant="danger"
        >Danger secondary</gl-button>

        <gl-disclosure-dropdown
          :disabled="disabled"
          :items="items"
          toggle-text="Other actions"
          text-sr-only
          category="secondary"
          :size="size"
          variant="danger"
        />
      </gl-button-group>

      <gl-button-group>
        <gl-button
          :disabled="disabled"
          category="secondary"
          :size="size"
          variant="reset"
        >Reset primary</gl-button>

        <gl-disclosure-dropdown
          :disabled="disabled"
          :items="items"
          toggle-text="Other actions"
          text-sr-only
          category="secondary"
          :size="size"
          variant="reset"
        />
      </gl-button-group>
      <gl-button-group>
        <gl-button
          :disabled="disabled"
          category="secondary"
          :size="size"
          variant="reset"
        >Reset secondary</gl-button>

        <gl-disclosure-dropdown
          :disabled="disabled"
          :items="items"
          toggle-text="Other actions"
          text-sr-only
          category="secondary"
          :size="size"
          variant="reset"
        />
      </gl-button-group>

    </div>
  `,
});
Object.assign(AllSplitDropdownsVariants, {
  args: generateProps(),
  parameters: {
    controls: {
      include: ['disabled', 'size'],
    },
  },
});

export const AllLegacyDropdownsVariants = (args, { argTypes }) => ({
  components: { GlButton, GlDropdown },
  props: Object.keys(argTypes),
  template: `
    <div class="gl-flex gl-flex-col gl-gap-3 gl-items-start">
      <gl-dropdown
        split
        text="Default primary"
        category="primary"
        variant="default"
        :size="size"
        :disabled="disabled"
      >
        <gl-dropdown-item>Dropdown item</gl-dropdown-item>
      </gl-dropdown>
      <gl-dropdown
        split
        text="Default secondary"
        category="secondary"
        variant="default"
        :size="size"
        :disabled="disabled"
      >
        <gl-dropdown-item>Dropdown item</gl-dropdown-item>
      </gl-dropdown>

      <gl-dropdown
        split
        text="Confirm primary"
        category="primary"
        variant="confirm"
        :size="size"
        :disabled="disabled"
      >
        <gl-dropdown-item>Dropdown item</gl-dropdown-item>
      </gl-dropdown>
      <gl-dropdown
        split
        text="Confirm secondary"
        category="secondary"
        variant="confirm"
        :size="size"
        :disabled="disabled"
      >
        <gl-dropdown-item>Dropdown item</gl-dropdown-item>
      </gl-dropdown>

      <gl-dropdown
        split
        text="Danger primary"
        category="primary"
        variant="danger"
        :size="size"
        :disabled="disabled"
      >
        <gl-dropdown-item>Dropdown item</gl-dropdown-item>
      </gl-dropdown>
      <gl-dropdown
        split
        text="Danger secondary"
        category="secondary"
        variant="danger"
        :size="size"
        :disabled="disabled"
      >
        <gl-dropdown-item>Dropdown item</gl-dropdown-item>
      </gl-dropdown>
      <gl-dropdown
        split
        text="Reset primary"
        category="primary"
        variant="reset"
        :size="size"
        :disabled="disabled"
      >
        <gl-dropdown-item>Dropdown item</gl-dropdown-item>
      </gl-dropdown>
      <gl-dropdown
        split
        text="Reset secondary"
        category="secondary"
        variant="reset"
        :size="size"
        :disabled="disabled"
      >
        <gl-dropdown-item>Dropdown item</gl-dropdown-item>
      </gl-dropdown>
    </div>
  `,
});
Object.assign(AllLegacyDropdownsVariants, {
  args: generateProps(),
  parameters: {
    controls: {
      include: ['disabled', 'size'],
    },
  },
});

export default {
  title: 'base/button group',
  component: GlButtonGroup,
  parameters: {
    docs: {
      description: {
        component:
          'See [Pajamas Design System documentation](https://design.khulnasoft.com/components/button-group) for usage and implementation details.',
      },
    },
  },
  argTypes: {
    category: {
      options: Object.keys(buttonCategoryOptions),
      control: 'select',
    },
    size: {
      options: Object.keys(buttonSizeOptions),
      control: 'select',
    },
    variant: {
      options: Object.keys(buttonVariantOptions),
      control: 'select',
    },
  },
};
