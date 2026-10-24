import { userEvent, within, waitFor, expect } from '@storybook/test';
import GlDropdown from '../dropdown/dropdown.vue';
import GlDropdownItem from '../dropdown/dropdown_item.vue';
import {
  buttonCategoryOptions,
  buttonVariantOptions,
  badgeForButtonOptions,
  buttonSizeOptions,
  targetOptions,
} from '../../../utils/constants';
import { propDefaultFactory, getA11yParameters } from '../../../utils/stories_utils';
import GlBadge from '../badge/badge.vue';
import GlButtonGroup from '../button_group/button_group.vue';
import GlButton from './button.vue';

const components = { GlButton };

const defaultValue = propDefaultFactory(GlButton);

const generateProps = ({
  category = defaultValue('category'),
  variant = defaultValue('variant'),
  size = defaultValue('size'),
  withLink = false,
  href = '#',
  target = null,
  block = false,
  disabled = defaultValue('disabled'),
  loading = defaultValue('loading'),
  selected = defaultValue('selected'),
} = {}) => ({
  category,
  variant,
  size,
  block,
  disabled,
  loading,
  selected,
  ...(withLink && {
    href,
    target,
  }),
});

const wrapDropdownButton = (template) => `<div class="gl-h-11">${template}</div>`;

export const Default = (args, { argTypes = {} }) => ({
  components,
  props: Object.keys(argTypes),
  template: `
      <gl-button
        :category="category"
        :variant="variant"
        :size="size"
        :block="block"
        :disabled="disabled"
        :loading="loading"
        :selected="selected"
        :count="count"
        :count-sr-text="countSrText"
      >
        This is a button
      </gl-button>
    `,
});
Default.args = generateProps();

export const BlockButton = (args, { argTypes }) => ({
  props: Object.keys(argTypes),
  components,
  template: `
      <gl-button
        :category="category"
        :variant="variant"
        :size="size"
        :block="block"
        :disabled="disabled"
        :loading="loading"
        :selected="selected"
      >
        This is a block button
      </gl-button>
    `,
});
BlockButton.args = generateProps({ block: true });

export const IconButton = (args, { argTypes }) => ({
  props: Object.keys(argTypes),
  components,
  template: `
      <div>
        <gl-button
          :category="category"
          :variant="variant"
          :size="size"
          :block="block"
          :disabled="disabled"
          :loading="loading"
          :selected="selected"
          icon="star-o"
          aria-label="Star icon button"
        />
        <div class="gl-mt-3">
          <gl-button icon="star-o" aria-label="Star icon button" />
          <gl-button size="small" icon="star-o" aria-label="Star icon small button" />
        </div>
        <div class="gl-mt-3">
          <gl-button icon="star-o">Icon text</gl-button>
          <gl-button size="small" icon="star-o">Icon text</gl-button>
        </div>
      </div>
    `,
});
IconButton.args = generateProps({
  category: buttonCategoryOptions.primary,
  variant: buttonVariantOptions.danger,
});

export const DropdownButton = (args, { argTypes }) => ({
  props: Object.keys(argTypes),
  components: { GlDropdown, GlDropdownItem },
  template: wrapDropdownButton(`
      <gl-dropdown
        text="Some dropdown"
        :category="category"
        :variant="variant"
        :size="size"
        :block="block"
        :disabled="disabled"
      >
        <gl-dropdown-item>Dropdown item</gl-dropdown-item>
      </gl-dropdown>
    `),
});
DropdownButton.args = generateProps();

export const DropdownIconButton = (args, { argTypes }) => ({
  props: Object.keys(argTypes),
  components: { GlDropdown, GlDropdownItem },
  template: wrapDropdownButton(`
      <gl-dropdown
        icon="download"
        text="Download"
        :text-sr-only="true"
        :category="category"
        :variant="variant"
        :size="size"
        :block="block"
        :disabled="disabled"
      >
        <gl-dropdown-item>Dropdown item</gl-dropdown-item>
      </gl-dropdown>
    `),
});
DropdownIconButton.args = generateProps();

export const DropdownIconTextButton = (args, { argTypes }) => ({
  props: Object.keys(argTypes),
  components: { GlDropdown, GlDropdownItem },
  template: wrapDropdownButton(`
      <gl-dropdown
        icon="notifications"
        text="Notifications"
        :category="category"
        :variant="variant"
        :size="size"
        :block="block"
        :disabled="disabled"
      >
        <gl-dropdown-item>Dropdown item</gl-dropdown-item>
      </gl-dropdown>
    `),
});
DropdownIconTextButton.args = generateProps();

export const DropdownIconOnlyButton = (args, { argTypes }) => ({
  props: Object.keys(argTypes),
  components: { GlDropdown, GlDropdownItem },
  template: wrapDropdownButton(`
      <gl-dropdown
        icon="ellipsis_v"
        text="More actions"
        :text-sr-only="true"
        :category="category"
        :variant="variant"
        :size="size"
        :block="block"
        :disabled="disabled"
        no-caret
      >
        <gl-dropdown-item>Dropdown item</gl-dropdown-item>
      </gl-dropdown>
    `),
});
DropdownIconOnlyButton.args = generateProps({
  category: buttonCategoryOptions.tertiary,
});

export const DropdownSplitButton = (args, { argTypes }) => ({
  props: Object.keys(argTypes),
  components: { GlDropdown, GlDropdownItem },
  template: wrapDropdownButton(`
      <gl-dropdown
        split
        text="Some dropdown"
        :category="category"
        :variant="variant"
        :size="size"
        :block="block"
        :disabled="disabled"
      >
        <gl-dropdown-item>Dropdown item</gl-dropdown-item>
      </gl-dropdown>
    `),
});
DropdownSplitButton.args = generateProps({ category: 'primary', variant: 'confirm' });

export const DropdownIconSplitButton = (args, { argTypes }) => ({
  props: Object.keys(argTypes),
  components: { GlDropdown, GlDropdownItem },
  template: wrapDropdownButton(`
      <gl-dropdown
        split
        icon="download"
        text="Some dropdown"
        :category="category"
        :variant="variant"
        :size="size"
        :block="block"
        :disabled="disabled"
      >
        <gl-dropdown-item>Dropdown item</gl-dropdown-item>
      </gl-dropdown>
    `),
});
DropdownIconSplitButton.args = generateProps({ category: 'secondary', variant: 'danger' });
DropdownIconSplitButton.parameters = {
  // Skip known axe-core failures, skipped rules should be removed when underlying violation is resolved
  a11y: getA11yParameters({ temporarySkipRules: ['button-name'] }),
};

export const DropdownLoadingButton = (args, { argTypes }) => ({
  props: Object.keys(argTypes),
  components: { GlDropdown, GlDropdownItem },
  template: `
      <gl-dropdown text="Some dropdown" :category="category" :loading="true">
        <gl-dropdown-item>Dropdown item</gl-dropdown-item>
      </gl-dropdown>
    `,
});
DropdownLoadingButton.args = generateProps({ category: 'secondary' });

export const LoadingButton = (args, { argTypes }) => ({
  props: Object.keys(argTypes),
  components,
  template: `
      <gl-button
        :category="category"
        :variant="variant"
        :size="size"
        :block="block"
        :disabled="disabled"
        :loading="loading"
        :selected="selected"
      >
        Loading button
      </gl-button>
    `,
});
LoadingButton.args = generateProps({ loading: true });

export const LinkButton = (args, { argTypes }) => ({
  props: Object.keys(argTypes),
  components,
  template: `
      <gl-button
        :category="category"
        :variant="variant"
        :size="size"
        :block="block"
        :disabled="disabled"
        :loading="loading"
        :selected="selected"
        :href="href"
        :target="target"
      >
        This is a link button
      </gl-button>
    `,
});
LinkButton.args = generateProps({ withLink: true });

export const IconButtonWithOverflowedText = (args, { argTypes }) => ({
  props: Object.keys(argTypes),
  components,
  template: `
        <gl-button
          :category="category"
          :variant="variant"
          :size="size"
          :block="block"
          :disabled="disabled"
          :loading="loading"
          :selected="selected"
          icon="star-o"
          style="width: 130px;"
        >
            Apply suggestion
        </gl-button>
    `,
});
IconButtonWithOverflowedText.args = generateProps();

export const BorderlessTertiary = (args, { argTypes }) => ({
  props: Object.keys(argTypes),
  components,
  template: `
      <div class="gl-inline-flex">
        <gl-button
          :category="category"
          :size="size"
          :block="block"
          :disabled="disabled"
          :loading="loading"
          :selected="selected"
        >
            Default borderless
        </gl-button>
        <gl-button
          variant="confirm"
          :category="category"
          :size="size"
          :block="block"
          :disabled="disabled"
          :loading="loading"
          :selected="selected"
        >
            Primary borderless
        </gl-button>
      </div>
    `,
});
BorderlessTertiary.args = generateProps({ category: 'tertiary' });

const AccessibleDisabledFocusTemplate = (args, { argTypes }) => ({
  props: Object.keys(argTypes),
  components,
  template: `
      <gl-button
        :category="category"
        :variant="variant"
        :size="size"
        :disabled="disabled"
        accessible-disabled
      >
        Accessible disabled button
      </gl-button>
    `,
});

// `accessibleDisabled` buttons stay focusable, so they must keep the focus ring when disabled
const focusAccessibleDisabledButton = async ({ canvasElement }) => {
  const button = within(canvasElement).getByRole('button');
  await userEvent.tab();
  await waitFor(() => expect(button).toHaveFocus());
};

export const AccessibleDisabledTertiaryFocus = AccessibleDisabledFocusTemplate.bind({});
AccessibleDisabledTertiaryFocus.args = generateProps({
  category: buttonCategoryOptions.tertiary,
  disabled: true,
});
AccessibleDisabledTertiaryFocus.play = focusAccessibleDisabledButton;

export const AccessibleDisabledLinkFocus = AccessibleDisabledFocusTemplate.bind({});
AccessibleDisabledLinkFocus.args = generateProps({
  variant: buttonVariantOptions.link,
  disabled: true,
});
AccessibleDisabledLinkFocus.play = focusAccessibleDisabledButton;

export const LabelButton = (args, { argTypes = {} }) => ({
  props: Object.keys(argTypes),
  components: { GlButton, GlButtonGroup },
  template: `
      <div>
        <gl-button label>Label</gl-button>
        <gl-button size="small" label>Label</gl-button>
        <gl-button-group>
          <gl-button id="commit-sha-label" class="gl-font-monospace" label>
            b29cc44d
          </gl-button>
          <gl-button
            aria-describedby="commit-sha-label"
            icon="duplicate"
            aria-label="Copy commit SHA" />
          <gl-button icon="folder-open" aria-label="Open file" />
        </gl-button-group>
      </div>
    `,
});
LabelButton.parameters = { controls: { disable: true } };

export const AllVariantsAndCategories = (args, { argTypes = {} }) => ({
  props: Object.keys(argTypes),
  components,
  variants: Object.keys(buttonVariantOptions).filter(
    (variant) => !buttonVariantOptions[variant].includes('deprecated'),
  ),
  categories: buttonCategoryOptions,
  style: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 150px)',
    rowGap: '8px',
    textAlign: 'center',
  },
  template: `
      <div :style="$options.style">
        <template v-for="variant in $options.variants">
          <div v-for="category in $options.categories" :key="variant + category">
            <gl-button :key="category" :category="category" :variant="variant">
              {{ category }} {{ variant }}
            </gl-button>
          </div>
        </template>
      </div>
    `,
});
AllVariantsAndCategories.parameters = { controls: { disable: true } };

export const Emojis = (args, { argTypes = {} }) => ({
  props: Object.keys(argTypes),
  components,
  template: `
      <div>
        <gl-button selected>
          <template #emoji>
            <gl-emoji title="thumbs up sign" data-name="thumbsup" data-unicode-version="6.0"
              >👍</gl-emoji
            >
          </template>
          1
        </gl-button>
        <gl-button>
          <template #emoji>
            <gl-emoji title="thumbs down sign" data-name="thumbsdown" data-unicode-version="6.0"
              >👎</gl-emoji
            >
          </template>
          0
        </gl-button>
      </div>
    `,
});
Emojis.parameters = { controls: { disable: true } };

export const Ellipsis = (args, { argTypes = {} }) => ({
  props: Object.keys(argTypes),
  components,
  template: `
    <gl-button icon="ellipsis_h" aria-label="Ellipsis button" />
  `,
});
Ellipsis.parameters = { controls: { disable: true } };

export const Sizes = (args, { argTypes = {} }) => ({
  props: Object.keys(argTypes),
  components,
  template: `
    <div>
      <gl-button size="small">Small button</gl-button>
      <gl-button>Default button</gl-button>
      <div class="gl-mt-3">
        <gl-button size="small" block>Full width small button</gl-button>
      </div>
      <div class="gl-mt-3">
        <gl-button block>Full width button</gl-button>
      </div>
    </div>
  `,
});
Sizes.parameters = { controls: { disable: true } };

export const ButtonWithCount = (args, { argTypes = {} }) => ({
  props: Object.keys(argTypes),
  components: { GlButton },
  template: `
    <div>
      <gl-button :count="5">Button with count</gl-button>
      <gl-button variant="confirm" :count="12" class="gl-ml-3">Confirm with count</gl-button>
      <gl-button variant="danger" category="secondary" :count="0" class="gl-ml-3">Zero count</gl-button>
      <gl-button size="small" :count="99" class="gl-ml-3">Small with count</gl-button>
      <div class="gl-mt-3">
        <gl-button icon="star-o" :count="3">Icon with count</gl-button>
        <gl-button icon="notifications" :count="7" class="gl-ml-3">Notifications</gl-button>
      </div>
    </div>
  `,
});
ButtonWithCount.parameters = { controls: { disable: true } };

export const ButtonWithBadge = (args, { argTypes = {} }) => ({
  props: Object.keys(argTypes),
  components: { GlButton, GlBadge },
  variants: Object.keys(badgeForButtonOptions),
  categories: buttonCategoryOptions,
  style: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 200px)',
    rowGap: '8px',
    textAlign: 'center',
  },
  methods: {
    getBadgeVariant(variant) {
      return badgeForButtonOptions[variant];
    },
  },
  template: `
      <div :style="$options.style">
          <template v-for="variant in $options.variants">
              <div v-for="category in $options.categories" :key="variant + category">
                  <gl-button :key="category" :category="category" :variant="variant" buttonTextClasses="gl-flex gl-items-center">
                      {{ category }} {{ variant }}
                      <gl-badge :variant="getBadgeVariant(variant)" class="gl-ml-2">Badge</gl-badge>
                  </gl-button>
              </div>
          </template>
      </div>
  `,
});
ButtonWithBadge.parameters = { controls: { disable: true } };

export const BadgeWithSROnlyText = (args, { argTypes = {} }) => ({
  props: Object.keys(argTypes),
  components: { GlButton, GlBadge },
  template: `
      <gl-button variant="default" buttonTextClasses="gl-flex gl-items-center">
          Button
          <gl-badge variant="neutral" class="gl-ml-2">Ready</gl-badge>
          <span class="gl-sr-only">begin process</span>
      </gl-button>
  `,
});
BadgeWithSROnlyText.parameters = { controls: { disable: true } };

export default {
  title: 'base/button',
  component: GlButton,
  parameters: {
    docs: {
      description: {
        component:
          'See [Pajamas Design System documentation](https://design.khulnasoft.com/components/button) for usage and implementation details.',
      },
    },
  },
  argTypes: {
    category: {
      options: Object.keys(buttonCategoryOptions),
      control: 'select',
    },
    variant: {
      options: Object.keys(buttonVariantOptions),
      control: 'select',
    },
    size: {
      options: Object.keys(buttonSizeOptions),
      control: 'select',
    },
    target: {
      options: targetOptions,
      control: 'select',
    },
    count: {
      control: 'number',
      description: 'Display a count badge next to the button label',
    },
    countSrText: {
      control: 'text',
      description: 'Screen reader text to provide context for the count value',
    },
  },
};
