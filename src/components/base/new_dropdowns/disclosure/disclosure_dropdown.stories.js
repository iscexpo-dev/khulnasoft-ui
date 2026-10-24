import {
  buttonCategoryOptions,
  buttonSizeOptions,
  buttonVariantOptions,
  dropdownPlacements,
} from '../../../../utils/constants';
import GlBadge from '../../badge/badge.vue';
import GlToggle from '../../toggle/toggle.vue';
import GlAvatar from '../../avatar/avatar.vue';
import GlModal from '../../modal/modal.vue';
import GlIcon from '../../icon/icon.vue';
import GlTooltip from '../../tooltip/tooltip.vue';
import { makeContainer } from '../../../../utils/story_decorators/container';
import GlDisclosureDropdown from './disclosure_dropdown.vue';
import GlDisclosureDropdownItem from './disclosure_dropdown_item.vue';
import GlDisclosureDropdownGroup from './disclosure_dropdown_group.vue';
import { DISCLOSURE_DROPDOWN_GROUP_BORDER_POSITIONS } from './constants';
import {
  mockItems,
  mockButtons,
  mockItemsCustomItem,
  mockGroups,
  mockProfileGroups,
  mockGroupsCustomItem,
} from './mock_data';

const makeBindings = (overrides = {}) =>
  Object.entries({
    ':items': 'items',
    ':category': 'category',
    ':variant': 'variant',
    ':size': 'size',
    ':disabled': 'disabled',
    ':loading': 'loading',
    ':no-caret': 'noCaret',
    ':placement': 'placement',
    ':toggle-id': 'toggleId',
    ':toggle-text': 'toggleText',
    ':text-sr-only': 'textSrOnly',
    ':icon': 'icon',
    ':toggle-aria-label': 'toggleAriaLabel',
    ':toggle-aria-labelled-by': 'toggleAriaLabelledBy',
    ':list-aria-labelled-by': 'listAriaLabelledBy',
    ':block': 'block',
    ':fluid-width': 'fluidWidth',
    ':auto-close': 'autoClose',
    ':positioning-strategy': 'positioningStrategy',
    ':start-opened': 'startOpened',
    ...overrides,
  })
    .map(([key, value]) => `${key}="${value}"`)
    .join('\n');

const template = (content = '', { bindingOverrides = {}, after = '' } = {}) => `
  <gl-disclosure-dropdown
    ref="disclosure"
    ${makeBindings(bindingOverrides)}
  >
    ${content}
  </gl-disclosure-dropdown>
  ${after}
`;

const TOGGLE_ID = 'custom-toggle-id';
export const Default = (args, { argTypes }) => ({
  toggleId: TOGGLE_ID,
  props: Object.keys(argTypes),
  components: {
    GlDisclosureDropdown,
    GlTooltip,
  },
  template: `
    <div>
      ${template()}
      <gl-tooltip :target="$options.toggleId" placement="right">
        This is a default disclosure
      </gl-tooltip>
    </div>
  `,
});
Default.args = {
  items: mockItems,
  toggleText: 'Merge request actions',
  textSrOnly: false,
  toggleId: TOGGLE_ID,
};
Default.decorators = [makeContainer({ height: '200px' })];

export const FixedDropdown = (args, { argTypes }) => ({
  props: Object.keys(argTypes),
  components: {
    GlDisclosureDropdown,
    GlTooltip,
  },
  template: `
    <div class="gl-overflow-auto gl-@container">
      ${template()}
    </div>
  `,
});
FixedDropdown.args = {
  items: mockItems,
  toggleText: 'Merge request actions',
  textSrOnly: false,
  positioningStrategy: 'fixed',
};
FixedDropdown.decorators = [makeContainer({ height: '200px' })];

export const UnavailableOptionsDropdown = (args, { argTypes }) => ({
  props: Object.keys(argTypes),
  components: {
    GlDisclosureDropdown,
    GlTooltip,
  },
  template: `
    <div>
      ${template()}
      <gl-tooltip :target="'more-actions-toggle'" placement="top">
        More actions
      </gl-tooltip>
    </div>
  `,
});

UnavailableOptionsDropdown.args = {
  items: [
    { text: 'Available', action: () => {} },
    { text: 'Disabled', action: () => {}, disabled: true },
  ],
  toggleText: 'Select option',
  category: 'tertiary',
  toggleId: 'more-actions-toggle',
};
UnavailableOptionsDropdown.decorators = [makeContainer({ height: '200px' })];

export const MoreActionsDropdown = (args, { argTypes }) => ({
  props: Object.keys(argTypes),
  components: {
    GlDisclosureDropdown,
    GlTooltip,
  },
  template: `
    <div>
      ${template()}
      <gl-tooltip :target="'more-actions-toggle'" placement="top">
        More actions
      </gl-tooltip>
    </div>
  `,
});
MoreActionsDropdown.args = {
  items: [
    { text: 'Edit', action: () => {} },
    { text: 'Copy link', action: () => {} },
    { text: 'Move', action: () => {} },
    { text: 'Archive', action: () => {} },
    { text: 'Delete', action: () => {}, variant: 'danger' },
  ],
  icon: 'ellipsis_v',
  toggleText: 'More actions for merge request',
  textSrOnly: true,
  noCaret: true,
  category: 'tertiary',
  toggleId: 'more-actions-toggle',
};
MoreActionsDropdown.decorators = [makeContainer({ height: '200px' })];

export const WithIcons = (args, { argTypes }) => ({
  props: Object.keys(argTypes),
  components: {
    GlDisclosureDropdown,
    GlTooltip,
  },
  template: `
    <div>
      ${template()}
      <gl-tooltip :target="'more-actions-toggle'" placement="top">
        More actions
      </gl-tooltip>
    </div>
  `,
});
WithIcons.args = {
  items: [
    {
      items: [
        { text: 'Edit', icon: 'pencil' },
        { text: 'Close', icon: 'issue-close' },
        { text: 'Move' },
      ],
    },
    {
      items: [{ text: 'Copy link' }, { text: 'Lock discussion', icon: 'lock' }],
    },
    {
      name: 'Report',
      items: [{ text: 'Report abuse' }],
    },
    {
      items: [{ text: 'Archive' }, { text: 'Delete', icon: 'remove', variant: 'danger' }],
    },
  ],
  icon: 'ellipsis_v',
  toggleText: 'More actions for merge request',
  textSrOnly: true,
  noCaret: true,
  category: 'tertiary',
  toggleId: 'more-actions-toggle',
};
WithIcons.decorators = [makeContainer({ height: '200px' })];

export const CustomListItem = (args, { argTypes }) => ({
  props: Object.keys(argTypes),
  components: {
    GlDisclosureDropdown,
    GlBadge,
  },
  template: template(
    `
      <template #list-item="{ item }">
        <span class="gl-flex gl-items-center gl-justify-between">
          {{ item.text }}
          <gl-badge pill variant="neutral">{{ item.count }}</gl-badge>
        </span>
      </template>
    `,
    {
      bindingOverrides: {
        class: '!gl-block gl-text-center',
      },
    },
  ),
});

CustomListItem.args = {
  items: mockItemsCustomItem,
  toggleText: 'Merge requests',
  placement: 'center',
};
CustomListItem.decorators = [makeContainer({ height: '200px' })];

const makeGroupedExample = (changes) => {
  const story = (args, { argTypes }) => ({
    props: Object.keys(argTypes),
    components: {
      GlBadge,
      GlDisclosureDropdown,
      GlDisclosureDropdownGroup,
      GlDisclosureDropdownItem,
      GlToggle,
      GlAvatar,
      GlModal,
      GlIcon,
    },
    ...changes,
  });

  story.args = { items: mockGroups };
  story.decorators = [makeContainer({ height: '340px' })];

  return story;
};

export const Groups = makeGroupedExample({
  template: template(''),
});
Groups.args = {
  icon: 'plus-square',
  items: mockGroups,
  toggleText: 'Create new',
  textSrOnly: true,
};

export const CustomGroupsAndItems = (args, { argTypes }) => ({
  props: Object.keys(argTypes),
  components: {
    GlDisclosureDropdown,
    GlBadge,
  },
  methods: {
    getTotalMrs(items) {
      return items.reduce((acc, item) => acc + item.count, 0);
    },
  },
  template: template(
    `
      <template #group-label="{ group }">
        {{ group.name }} <gl-badge pill variant="neutral">{{ getTotalMrs(group.items) }}</gl-badge>
      </template>
      <template #list-item="{ item }">
        <span class="gl-flex gl-items-center gl-justify-between">
          {{ item.text }}
          <gl-badge pill variant="neutral">{{ item.count }}</gl-badge>
        </span>
      </template>
    `,
  ),
});

CustomGroupsAndItems.args = {
  items: mockGroupsCustomItem,
  toggleText: 'Merge requests',
  block: true,
};
CustomGroupsAndItems.decorators = [makeContainer({ height: '200px' })];

export const CustomGroupsItemsAndToggle = makeGroupedExample({
  template: template(
    `
    <template #toggle="{ accessibilityAttributes }">
      <button class="gl-rounded-default gl-border-none gl-p-2 gl-bg-strong" v-bind="accessibilityAttributes">
        <span class="gl-sr-only">
          Orange Fox user's menu
        </span>
        <gl-avatar :size="32" entity-name="Orange Fox" aria-hidden="true"/>
      </button>
      </template>
      <gl-disclosure-dropdown-group>
        <gl-disclosure-dropdown-item @action="closeDropdown">
          <template #list-item>
            <span class="gl-flex gl-flex-col">
              <span class="gl-font-bold gl-whitespace-nowrap">Orange Fox</span>
              <span class="gl-text-subtle">@thefox</span>
            </span>
          </template>
        </gl-disclosure-dropdown-item>
      </gl-disclosure-dropdown-group>
      <gl-disclosure-dropdown-group :bordered="bordered" :border-position="borderPosition" :group="$options.groups[0]" @action="closeDropdown">
        <template #list-item="{ item }">
          <span class="gl-flex gl-items-center gl-justify-between">
            {{item.text}}
            <gl-icon v-if="item.icon" :name="item.icon"/>
          </span>
        </template>
      </gl-disclosure-dropdown-group>
      <gl-disclosure-dropdown-group :bordered="bordered" :border-position="borderPosition">
        <template #group-label>
          <span class="gl-text-sm">Navigation redesign</span>
          <gl-badge variant="info">Beta</gl-badge>
        </template>
        <gl-disclosure-dropdown-item @action="toggleNewNavigation">
          <div  class="gl-new-dropdown-item-content">
            <div class="gl-new-dropdown-item-text-wrapper">
              <gl-toggle label="New navigation" label-position="left" :value="newNavigation"/>
            </div>
          </div>
        </gl-disclosure-dropdown-item>
        <gl-disclosure-dropdown-item @action="toggleModalVisibility(true)">
          <template #list-item>Provide feedback</template>
        </gl-disclosure-dropdown-item>
        <gl-disclosure-dropdown-item  @action="closeDropdown" variant="danger">
          <template #list-item>Danger item</template>
        </gl-disclosure-dropdown-item>
      </gl-disclosure-dropdown-group>
      <gl-disclosure-dropdown-group :bordered="bordered" :border-position="borderPosition" :group="$options.groups[1]" @action="closeDropdown"/>
    `,
    {
      after: `
      <gl-modal :visible="feedBackModalVisible" @change="toggleModalVisibility" modal-id="feedbackModal" size="sm">
        <textarea class="gl-w-full">Tell us what you think!</textarea>
      </gl-modal>
    `,
    },
  ),
  data() {
    return {
      newNavigation: true,
      feedBackModalVisible: false,
    };
  },
  methods: {
    closeDropdown() {
      this.$refs.disclosure.closeAndFocus();
    },
    toggleModalVisibility(value) {
      this.feedBackModalVisible = value;
      this.closeDropdown();
    },
    toggleNewNavigation() {
      this.newNavigation = !this.newNavigation;
      // eslint-disable-next-line no-restricted-globals
      setTimeout(() => {
        this.closeDropdown();
      }, 500);
    },
  },
  groups: mockProfileGroups,
});
CustomGroupsItemsAndToggle.args = {
  icon: 'plus-square',
  toggleText: 'User profile menu',
  textSrOnly: true,
  autoClose: false,
  bordered: true,
  borderPosition: DISCLOSURE_DROPDOWN_GROUP_BORDER_POSITIONS.top,
};
CustomGroupsItemsAndToggle.argTypes = {
  borderPosition: {
    options: DISCLOSURE_DROPDOWN_GROUP_BORDER_POSITIONS,
    control: {
      type: 'select',
    },
  },
};

export const WithDynamicWrapperText = (args, { argTypes }) => ({
  toggleId: TOGGLE_ID,
  props: Object.keys(argTypes),
  data() {
    return {
      currentToggleText: 'Group by',
    };
  },
  components: {
    GlDisclosureDropdown,
    GlTooltip,
  },
  methods: {
    handleAction(selectedItem) {
      this.currentToggleText = selectedItem.text;
    },
  },

  template: `
    <div>
      ${template('', { bindingOverrides: { ':toggle-text': 'currentToggleText', '@action': 'handleAction' } })}
      <gl-tooltip :target="$options.toggleId" placement="right">
        This is a default disclosure
      </gl-tooltip>
    </div>
  `,
});

WithDynamicWrapperText.args = {
  items: mockButtons,
  noCaret: true,
  toggleId: TOGGLE_ID,
};
WithDynamicWrapperText.decorators = [makeContainer({ height: '200px' })];
WithDynamicWrapperText.tags = ['skip-visual-test'];

export const MiscellaneousContent = (args, { argTypes }) => ({
  props: Object.keys(argTypes),
  components: {
    GlDisclosureDropdown,
  },
  template: template(
    `
      <div class="gl-p-3">A disclosure dropdown is a button that toggles a panel containing a list of items and/or links.</div>
    `,
  ),
});

MiscellaneousContent.args = {
  icon: 'doc-text',
  toggleText: 'Miscellaneous content',
  textSrOnly: true,
  fluidWidth: true,
};
MiscellaneousContent.decorators = [makeContainer({ height: '200px' })];

export const ViewportPositioning = (args, { argTypes }) => ({
  props: Object.keys(argTypes),
  components: {
    GlDisclosureDropdown,
  },
  template: `
    <div class="gl-h-[768px] gl-flex gl-flex-col gl-justify-between gl-pb-10">
      <div class="gl-p-3">
        ${template('', { bindingOverrides: { ':placement': "'bottom-start'", toggleText: 'My arrow should be on the top and the dropdown left aligned.', ':block': true } })}
      </div>
      <div class="gl-p-3 gl-text-right">
        ${template('', { bindingOverrides: { ':placement': "'bottom'", toggleText: 'My arrow should be on the top.' } })}
      </div>
      <div class="gl-p-3">
        ${template('', { bindingOverrides: { ':placement': "'right-start'", toggleText: 'My arrow should be on the left.' } })}
      </div>
      <div class="gl-p-3 gl-text-right">
        ${template('', { bindingOverrides: { ':placement': "'right-start'", toggleText: 'My arrow should be on the right.' } })}
      </div>
      <div class="gl-p-3">
        ${template('', { bindingOverrides: { toggleText: 'My arrow should be on the bottom.' } })}
      </div>
      <div class="gl-p-3">
        ${template('', { bindingOverrides: { ':placement': "'bottom-end'", toggleText: 'My arrow should be on the top and the dropdown right aligned.', ':block': true } })}
      </div>
    </div>
  `,
});

ViewportPositioning.args = {
  items: mockButtons,
  startOpened: true,
};

export default {
  title: 'base/dropdown/disclosure-dropdown',
  component: GlDisclosureDropdown,
  parameters: {
    docs: {
      description: {
        component:
          'See [Pajamas Design System documentation](https://design.khulnasoft.com/components/dropdown-disclosure) for usage and implementation details.',
      },
    },
  },
  argTypes: {
    category: {
      control: {
        type: 'select',
      },
      options: buttonCategoryOptions,
    },
    variant: {
      control: {
        type: 'select',
      },
      options: buttonVariantOptions,
    },
    size: {
      control: {
        type: 'select',
      },
      options: Object.keys(buttonSizeOptions),
    },
    placement: {
      control: {
        type: 'select',
      },
      options: Object.keys(dropdownPlacements),
    },
  },
  args: {
    startOpened: true,
  },
};
