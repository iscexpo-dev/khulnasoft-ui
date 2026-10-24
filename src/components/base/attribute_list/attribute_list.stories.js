import GlAvatarLabeled from '../avatar_labeled/avatar_labeled.vue';
import GlBadge from '../badge/badge.vue';
import GlIcon from '../icon/icon.vue';
import GlLink from '../link/link.vue';
import { makeContainer } from '../../../utils/story_decorators/container';
import GlAttributeList from './attribute_list.vue';

const defaultItems = [
  { icon: 'code', label: 'File', text: 'devfile.yaml' },
  { icon: 'user', label: 'Author', text: 'User Alpha' },
  { icon: 'merge', label: 'Merged by', text: 'User Beta' },
  { icon: 'clock', label: 'Approved by', text: 'User Gamma' },
  {
    icon: 'text-description',
    label: 'Description',
    text: 'This change refactors the codebase to add linting and spec tests to resolve documented behavior in linked issue discussion.',
  },
  {
    icon: 'commit',
    label: 'Commit SHA',
    text: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
  },
  { icon: 'work-item-issue', label: 'Issue', text: '#12345' },
  { icon: 'merge-request', label: 'Merge request', text: '!12345' },
  {
    icon: 'merge-request',
    label: 'Changes',
    text: 'package.json, src/index.js, src/utils.js',
  },
  { icon: 'calendar', label: 'Created', text: '1 month ago' },
  { icon: 'calendar', label: 'Updated', text: '15 min ago' },
  { icon: 'status-health', label: 'Health', text: 'OK' },
  { label: 'Status', text: 'Active' },
];

const generateProps = ({
  items = defaultItems,
  layout = GlAttributeList.props.layout.default,
  labelClass = GlAttributeList.props.labelClass.default,
  descriptionClass = GlAttributeList.props.descriptionClass.default,
} = {}) => ({
  items,
  layout,
  labelClass,
  descriptionClass,
});

const Template = (args, { argTypes }) => ({
  components: { GlAttributeList },
  props: Object.keys(argTypes),
  template: `
    <gl-attribute-list
      :items="items"
      :layout="layout"
      :labelClass="labelClass"
      :descriptionClass="descriptionClass"
    />
  `,
});

export const Default = Template.bind({});
Default.args = generateProps();

export const VerticalLayout = Template.bind({});
VerticalLayout.args = generateProps({
  layout: 'vertical',
});

export const CustomClasses = Template.bind({});
CustomClasses.args = generateProps({
  labelClass: 'gl-min-w-15',
  descriptionClass: 'gl-text-subtle gl-truncate',
});

export const WithSlots = (args, { argTypes }) => ({
  components: { GlAttributeList, GlAvatarLabeled, GlBadge, GlIcon, GlLink },
  props: Object.keys(argTypes),
  template: `
    <gl-attribute-list
      :items="items"
      :layout="layout"
    >
      <template #label="{ item }">
        <gl-icon v-if="item.icon" class="gl-attribute-list-item-label-icon" :name="item.icon" variant="subtle" />
        <span>{{ item.label }}</span>
      </template>

      <template #description="{ item }">
        <code v-if="item.label === 'File'" class="gl-bg-strong gl-text-strong gl-py-1 gl-px-2 gl-rounded-default">
          {{ item.text }}
        </code>
        <gl-link v-else-if="item.label === 'Issue'" href="#">
          {{ item.text }}
        </gl-link>
        <gl-badge v-else-if="item.label === 'Merge request'" href="#" icon="merge-request" variant="success">
          {{ item.text }}
        </gl-badge>
        <gl-badge v-else-if="item.label === 'Health'">
          {{ item.text }}
        </gl-badge>
        <span v-else-if="['Author', 'Merged by', 'Approved by'].includes(item.label)">
          <gl-avatar-labeled :size="16" :label="item.text" />
        </span>
        <div v-else-if="item.label === 'Commit SHA'" class="gl-truncate">
          {{ item.text }}
        </div>
        <span v-else class="gl-text-subtle">{{ item.text }}</span>
      </template>
    </gl-attribute-list>
  `,
});

WithSlots.args = generateProps();

export default {
  title: 'base/attribute_list',
  component: GlAttributeList,
  parameters: {
    docs: {
      description: {
        component:
          'See [Pajamas Design System documentation](https://design.khulnasoft.com/components/attribute-list) for usage and implementation details.',
      },
    },
  },
  argTypes: {
    items: {
      description: 'Array of items with icon (optional), label, and text properties',
      control: { disable: true },
    },
    layout: {
      options: ['horizontal', 'vertical'],
      control: 'select',
    },
  },
  decorators: [makeContainer({ 'container-type': 'inline-size' })],
};
