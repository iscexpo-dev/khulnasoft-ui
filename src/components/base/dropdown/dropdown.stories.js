import iconSpriteInfo from '@gitlab/svgs/dist/icons.json';
import GlAvatar from '../avatar/avatar.vue';
import GlIcon from '../icon/icon.vue';
import GlButton from '../button/button.vue';
import GlSearchBoxByType from '../search_box_by_type/search_box_by_type.vue';
import {
  buttonCategoryOptions,
  buttonSizeOptions,
  dropdownVariantOptions,
} from '../../../utils/constants';
import { propDefaultFactory, getA11yParameters } from '../../../utils/stories_utils';
import BVueReadme from '../../../vendor/bootstrap-vue/src/components/dropdown/README.md';
import GlDropdownDivider from './dropdown_divider.vue';
import GlDropdownSectionHeader from './dropdown_section_header.vue';
import GlDropdownItem from './dropdown_item.vue';
import GlDropdownText from './dropdown_text.vue';
import GlDropdownForm from './dropdown_form.vue';
import GlDropdown from './dropdown.vue';

const components = {
  GlAvatar,
  GlIcon,
  GlDropdown,
  GlDropdownDivider,
  GlDropdownSectionHeader,
  GlDropdownItem,
  GlDropdownText,
  GlDropdownForm,
};

function addClass(component) {
  component.$el.querySelectorAll('.btn').forEach((el) => el.classList.add('gl-button'));
}

const defaultValue = propDefaultFactory(GlDropdown);

const generateProps = ({
  headerText = defaultValue('headerText'),
  hideHeaderBorder = defaultValue('hideHeaderBorder'),
  showClearAll = defaultValue('showClearAll'),
  clearAllText = defaultValue('clearAllText'),
  clearAllTextClass = defaultValue('clearAllTextClass'),
  text = defaultValue('text'),
  showHighlightedItemsTitle = defaultValue('showHighlightedItemsTitle'),
  highlightedItemsTitle = defaultValue('highlightedItemsTitle'),
  highlightedItemsTitleClass = defaultValue('highlightedItemsTitleClass'),
  textSrOnly = defaultValue('textSrOnly'),
  split = defaultValue('split'),
  category = defaultValue('category'),
  variant = defaultValue('variant'),
  size = defaultValue('size'),
  icon = defaultValue('icon'),
  block = defaultValue('block'),
  disabled = defaultValue('disabled'),
  loading = defaultValue('loading'),
  toggleClass = defaultValue('toggleClass'),
  right = defaultValue('right'),
} = {}) => ({
  headerText,
  hideHeaderBorder,
  showClearAll,
  clearAllText,
  clearAllTextClass,
  text,
  showHighlightedItemsTitle,
  highlightedItemsTitle,
  highlightedItemsTitleClass,
  textSrOnly,
  split,
  category,
  variant,
  size,
  icon,
  block,
  disabled,
  loading,
  toggleClass,
  right,
});

const withContainer = (template, containerHeight = 150) => `
  <div style="height: ${containerHeight}px;">
    ${template}
  </div>`;

function wrap(template, containerHeight, cssClass) {
  return withContainer(
    `
    <gl-dropdown
      ref="dropdown"
      :category="category"
      :variant="variant"
      :size="size"
      :block="block"
      :disabled="disabled"
      :text="text"
      :text-sr-only="textSrOnly"
      :icon="icon"
      :split="split"
      :toggle-class="toggleClass"
      :header-text="headerText"
      :hide-header-border="hideHeaderBorder"
      :show-clear-all="showClearAll"
      :clear-all-text="clearAllText"
      :clear-all-text-class="clearAllTextClass"
      :show-highlighted-items-title="showHighlightedItemsTitle"
      :highlighted-items-title="highlightedItemsTitle"
      :highlighted-items-title-class="highlightedItemsTitleClass"
      :loading="loading"
      :right="right"
      class="${cssClass}"
    >
      ${template}
    </gl-dropdown>`,
    containerHeight,
  );
}

function clickDropdown(component) {
  component.$nextTick(() => component.$el.querySelector('.dropdown-toggle').click());
}

export const Default = (_args, { argTypes }) => ({
  props: Object.keys(argTypes),
  components,
  template: wrap(
    `
    <gl-dropdown-item>First item</gl-dropdown-item>
    <gl-dropdown-item>Second item</gl-dropdown-item>
    <gl-dropdown-item>Third item</gl-dropdown-item>
    <gl-dropdown-item>Fourth item</gl-dropdown-item>
    <gl-dropdown-item>Fifth item</gl-dropdown-item>
    <gl-dropdown-item>Sixth item</gl-dropdown-item>
    <gl-dropdown-item>Seventh item</gl-dropdown-item>
    <gl-dropdown-item>Eighth item</gl-dropdown-item>
    <gl-dropdown-item>Ninth item</gl-dropdown-item>
    <gl-dropdown-item>Tenth item</gl-dropdown-item>
    <gl-dropdown-item>Eleventh item</gl-dropdown-item>`,
    340,
  ),
  mounted() {
    clickDropdown(this);
  },
  updated() {
    addClass(this);
  },
});
Default.args = generateProps({ text: 'Some dropdown' });

export const Secondary = (_args, { argTypes }) => ({
  props: Object.keys(argTypes),
  components,
  template: wrap(`
    <gl-dropdown-item>First item</gl-dropdown-item>
    <gl-dropdown-item>Second item</gl-dropdown-item>
    <gl-dropdown-item>Third item</gl-dropdown-item>`),
  mounted() {
    clickDropdown(this);
  },
  updated() {
    addClass(this);
  },
});
Secondary.args = generateProps({
  text: 'Some dropdown',
  category: buttonCategoryOptions.secondary,
  variant: dropdownVariantOptions.confirm,
});

export const WithForm = (_args, { argTypes }) => ({
  props: Object.keys(argTypes),
  components: { ...components, GlButton },
  template: wrap(`
    <gl-dropdown-form class="gl-px-4">
      <gl-button>One</gl-button>
      <gl-button>Two</gl-button>
      <gl-button>Three</gl-button>
    </gl-dropdown-form>`),
  mounted() {
    clickDropdown(this);
  },
});
WithForm.args = generateProps({ text: 'Some dropdown' });
WithForm.parameters = {
  // Skip known axe-core failures, skipped rules should be removed when underlying violation is resolved
  a11y: getA11yParameters({ temporarySkipRules: ['aria-required-children'] }),
};

export const WithDivider = (args, { argTypes }) => ({
  props: Object.keys(argTypes),
  components,
  template: wrap(
    `
    <gl-dropdown-item>First item</gl-dropdown-item>
    <gl-dropdown-item>Second item</gl-dropdown-item>
    <gl-dropdown-divider />
    <gl-dropdown-item>Third item</gl-dropdown-item>
    <gl-dropdown-item>Fourth item</gl-dropdown-item>`,
    200,
  ),
  mounted() {
    clickDropdown(this);
  },
  updated() {
    addClass(this);
  },
});
WithDivider.args = generateProps({ text: 'Some dropdown' });

export const WithHeaderAndFooter = (args, { argTypes }) => ({
  props: Object.keys(argTypes),
  components: { ...components, GlSearchBoxByType },
  template: wrap(
    `
    <template #header>
      <gl-search-box-by-type />
    </template>
    <gl-dropdown-item>First item</gl-dropdown-item>
    <gl-dropdown-item>Second item</gl-dropdown-item>
    <gl-dropdown-item>Third item</gl-dropdown-item>
    <gl-dropdown-item>Fourth item</gl-dropdown-item>
    <gl-dropdown-item>Fifth item</gl-dropdown-item>
    <gl-dropdown-item>Sixth item</gl-dropdown-item>
    <gl-dropdown-item>Seventh item</gl-dropdown-item>
    <gl-dropdown-item>Eighth item</gl-dropdown-item>
    <template #footer>
      <gl-dropdown-item>First footer item</gl-dropdown-item>
      <gl-dropdown-item>Second footer item</gl-dropdown-item>
    </template>`,
    340,
  ),
  mounted() {
    clickDropdown(this);
  },
  updated() {
    addClass(this);
  },
});
WithHeaderAndFooter.args = generateProps({
  text: 'Some dropdown',
  headerText: 'Header',
  hideHeaderBorder: true,
});
WithHeaderAndFooter.parameters = {
  // Skip known axe-core failures, skipped rules should be removed when underlying violation is resolved
  a11y: getA11yParameters({ temporarySkipRules: ['aria-required-children'] }),
};

export const WithSectionHeader = (args, { argTypes }) => ({
  props: Object.keys(argTypes),
  components,
  template: wrap(
    `
    <gl-dropdown-section-header>Header title</gl-dropdown-section-header>
    <gl-dropdown-item>First item</gl-dropdown-item>
    <gl-dropdown-item>Second item</gl-dropdown-item>
    <gl-dropdown-section-header>I am a really long header title which should wrap</gl-dropdown-section-header>
    <gl-dropdown-item>Third item</gl-dropdown-item>
    <gl-dropdown-item>Fourth item</gl-dropdown-item>`,
    300,
  ),
  mounted() {
    clickDropdown(this);
  },
  updated() {
    addClass(this);
  },
});
WithSectionHeader.args = generateProps({ text: 'Some dropdown' });
WithSectionHeader.parameters = {
  // Skip known axe-core failures, skipped rules should be removed when underlying violation is resolved
  a11y: getA11yParameters({
    temporarySkipRules: [
      'aria-required-children',
      'landmark-no-duplicate-banner',
      'landmark-unique',
    ],
  }),
};

export const WithCheckedItems = (args, { argTypes }) => ({
  props: Object.keys(argTypes),
  components,
  template: wrap(`
    <gl-dropdown-item :is-check-item="true" :is-checked="true">Checked item</gl-dropdown-item>
    <gl-dropdown-item :is-check-item="true">Unchecked item</gl-dropdown-item>`),
  mounted() {
    clickDropdown(this);
  },
  updated() {
    addClass(this);
  },
});
WithCheckedItems.args = generateProps({ text: 'Some dropdown' });

export const WithAvatarAndSecondaryText = (args, { argTypes }) => ({
  props: Object.keys(argTypes),
  components,
  template: wrap(`
    <gl-dropdown-item
      avatar-url="./img/avatar.png"
      secondary-text="@sytses"
    >
      Sid Sijbrandij
    </gl-dropdown-item>`),
  mounted() {
    clickDropdown(this);
  },
  updated() {
    addClass(this);
  },
});
WithAvatarAndSecondaryText.args = generateProps({ text: 'Some dropdown' });

export const WithIcons = (args, { argTypes }) => ({
  props: Object.keys(argTypes),
  components,
  template: wrap(
    `
    <gl-dropdown-item
      icon-color="info"
      icon-name="status_running"
      icon-right-name="retry"
      icon-right-aria-label="Retry"
    >
      Status running
    </gl-dropdown-item>
    <gl-dropdown-item
      icon-color="success"
      icon-name="status_success"
      icon-right-name="cancel"
      icon-right-aria-label="Cancel"
    >
      Status success
    </gl-dropdown-item>
    <gl-dropdown-item
      icon-color="warning"
      icon-name="status_warning"
      icon-right-name="cancel"
      icon-right-aria-label="Cancel"
    >
      Status warning
    </gl-dropdown-item>
    <gl-dropdown-item
      icon-color="danger"
      icon-name="status_failed"
      icon-right-name="cancel"
      icon-right-aria-label="Cancel"
    >
      Status failed
    </gl-dropdown-item>
    <gl-dropdown-item
      icon-name="status_manual"
      icon-right-name="cancel"
      icon-right-aria-label="Cancel"
    >
      Status manual
    </gl-dropdown-item>`,
    200,
  ),
  mounted() {
    clickDropdown(this);
  },
  updated() {
    addClass(this);
  },
});
WithIcons.args = generateProps({ text: 'Some dropdown' });

export const FullWidth = (args, { argTypes }) => ({
  props: Object.keys(argTypes),
  components,
  template: wrap(`
    <gl-dropdown-item>First item</gl-dropdown-item>
    <gl-dropdown-item>Second item</gl-dropdown-item>
    <gl-dropdown-item>Last item</gl-dropdown-item>`),
  mounted() {
    clickDropdown(this);
  },
  updated() {
    addClass(this);
  },
});
FullWidth.args = generateProps({ text: 'Some dropdown', block: true });

export const WithShortTextAndWideWidth = (args, { argTypes }) => ({
  props: Object.keys(argTypes),
  components,
  template: withContainer(`
    <gl-dropdown
      text="Some dropdown"
      :category="category"
      :variant="variant"
      :size="size"
      :block="block"
      :disabled="disabled"
      style="width: 300px;"
    >
      <gl-dropdown-item>First item</gl-dropdown-item>
      <gl-dropdown-item>Last item</gl-dropdown-item>
    </gl-dropdown>`),
  mounted() {
    clickDropdown(this);
  },
  updated() {
    addClass(this);
  },
});
WithShortTextAndWideWidth.args = generateProps();

export const WithLongTextAndNarrowWidth = (args, { argTypes }) => ({
  props: Object.keys(argTypes),
  components,
  template: withContainer(`
    <gl-dropdown
      text="Truncated text dropdown"
      :category="category"
      :variant="variant"
      :size="size"
      :block="block"
      :disabled="disabled"
      style="width: 160px;"
    >
      <gl-dropdown-item>First item</gl-dropdown-item>
      <gl-dropdown-item>Last item</gl-dropdown-item>
    </gl-dropdown>`),
  mounted() {
    clickDropdown(this);
  },
  updated() {
    addClass(this);
  },
});
WithLongTextAndNarrowWidth.args = generateProps({ block: true });

export const WithItemTextThatDoesNotWrap = (args, { argTypes }) => ({
  props: Object.keys(argTypes),
  components,
  template: wrap(`
    <gl-dropdown-item icon-right-name="star" icon-right-aria-label="Some action">
      Normal item
    </gl-dropdown-item>
    <gl-dropdown-item icon-right-name="star" icon-right-aria-label="Some action">
      <div class="gl-truncate">ellipsis/should/truncate/this/item</div>
    </gl-dropdown-item>`),
  mounted() {
    clickDropdown(this);
  },
  updated() {
    addClass(this);
  },
});
WithItemTextThatDoesNotWrap.args = generateProps({ text: 'Some dropdown' });

export const IconOnly = (args, { argTypes }) => ({
  props: Object.keys(argTypes),
  components,
  template: wrap(`
    <gl-dropdown-item>First item</gl-dropdown-item>
    <gl-dropdown-item>Second item</gl-dropdown-item>
    <gl-dropdown-item>Last item</gl-dropdown-item>`),
  mounted() {
    clickDropdown(this);
  },
  updated() {
    addClass(this);
  },
});
IconOnly.args = generateProps({ icon: 'ellipsis_v', text: 'More actions', textSrOnly: true });

export const WithLoadingState = (args, { argTypes }) => ({
  props: Object.keys(argTypes),
  components,
  template: wrap(`
    <gl-dropdown-item>First item</gl-dropdown-item>
    <gl-dropdown-item>Last item</gl-dropdown-item>`),
  mounted() {
    clickDropdown(this);
  },
  updated() {
    addClass(this);
  },
});
WithLoadingState.args = generateProps({ text: 'Some dropdown', loading: true });

export const WithClearAll = (args, { argTypes }) => ({
  props: Object.keys(argTypes),
  components,
  template: wrap(`
    <gl-dropdown-item :is-check-item="true" :is-checked="true">First item</gl-dropdown-item>
    <gl-dropdown-item :is-check-item="true" :is-checked="true">Second item</gl-dropdown-item>
    <gl-dropdown-item :is-check-item="true" :is-checked="true">Third item</gl-dropdown-item>`),
  mounted() {
    clickDropdown(this);
  },
  updated() {
    addClass(this);
  },
});
WithClearAll.args = generateProps({
  text: 'Some dropdown',
  showClearAll: true,
  clearAllText: 'Clear all',
  clearAllTextClass: 'gl-px-5',
});
WithClearAll.parameters = {
  // Skip known axe-core failures, skipped rules should be removed when underlying violation is resolved
  a11y: getA11yParameters({ temporarySkipRules: ['aria-required-children'] }),
};

export const WithHighlightedItems = (args, { argTypes }) => ({
  props: Object.keys(argTypes),
  components,
  template: wrap(
    `
    <template #highlighted-items>
      <gl-dropdown-item :is-check-item="true" :is-checked="true">First item</gl-dropdown-item>
      <gl-dropdown-item :is-check-item="true" :is-checked="true">Second item</gl-dropdown-item>
    </template>
    <gl-dropdown-item>Third item</gl-dropdown-item>
    <gl-dropdown-item>Fourth item</gl-dropdown-item>
    `,
    200,
  ),
  mounted() {
    clickDropdown(this);
  },
  updated() {
    addClass(this);
  },
});
WithHighlightedItems.args = generateProps({
  text: 'Some dropdown',
  showHighlightedItemsTitle: true,
  highlightedItemsTitle: 'Highlights',
  highlightedItemsTitleClass: 'gl-px-5',
});

export const OnRightEdge = (args, { argTypes }) => ({
  props: Object.keys(argTypes),
  components,
  template: wrap(
    `
    <gl-dropdown-item>First item</gl-dropdown-item>
    <gl-dropdown-item>Second item</gl-dropdown-item>
    <gl-dropdown-item>Third item</gl-dropdown-item>
    <gl-dropdown-item>Fourth item</gl-dropdown-item>
    `,
    200,
    '!gl-block gl-text-right',
  ),
  mounted() {
    clickDropdown(this);
  },
  updated() {
    addClass(this);
  },
});
OnRightEdge.args = generateProps({ text: 'Some dropdown' });

export default {
  title: 'base/dropdown/deprecated',
  component: GlDropdown,
  subcomponents: {
    GlDropdownDivider,
    GlDropdownForm,
    GlDropdownItem,
    GlDropdownSectionHeader,
    GlDropdownText,
  },
  parameters: {
    bootstrapComponent: 'b-dropdown',
    bootstrapDocs: BVueReadme,
  },
  argTypes: {
    category: {
      options: Object.keys(buttonCategoryOptions),
      control: 'select',
    },
    variant: {
      options: Object.keys(dropdownVariantOptions),
      control: 'select',
    },
    size: {
      options: Object.keys(buttonSizeOptions),
      control: 'select',
    },
    icon: {
      options: iconSpriteInfo.icons,
      control: 'select',
    },
  },
};
