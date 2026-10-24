import { navItemIndicatorPositionOptions } from '../../../utils/constants';
import GlAvatar from '../avatar/avatar.vue';
import GlNavItem from './nav_item.vue';

const generateProps = ({
  ariaLabel = null,
  label = 'Nav item',
  href = '#',
  to = null,
  selected = false,
  icon = null,
  isIconOnly = false,
  isParent = false,
  expanded = null,
  indicatorPosition = 'left',
} = {}) => ({
  ariaLabel,
  label,
  href,
  to,
  selected,
  icon,
  isIconOnly,
  isParent,
  expanded,
  indicatorPosition,
});

const Template = (args, { argTypes }) => ({
  components: { GlNavItem },
  props: Object.keys(argTypes),
  template: `
    <gl-nav-item v-bind="$props" :aria-label="ariaLabel">
      {{ label }}
    </gl-nav-item>
  `,
});

export const Default = Template.bind({});
Default.args = generateProps();

export const Selected = (args, { argTypes }) => ({
  components: { GlNavItem },
  props: Object.keys(argTypes),
  // The padding keeps the indicator, which sits outside the item, inside the visual snapshot.
  template: `
    <div class="gl-p-4">
      <gl-nav-item v-bind="$props" selected>
        {{ label }}
      </gl-nav-item>
    </div>
  `,
});
Selected.args = generateProps({ label: 'Selected nav item' });

export const WithIcon = Template.bind({});
WithIcon.args = generateProps({
  ariaLabel: 'Home',
  icon: 'home',
});

export const WithSlots = (args, { argTypes }) => ({
  components: { GlNavItem, GlAvatar },
  props: Object.keys(argTypes),
  template: `
    <gl-nav-item v-bind="$props">
      <template #icon>
        <gl-avatar :size="24" entity-name="KhulnaSoft" shape="rect" />
      </template>
      {{ label }}
      <template #end>
        <span class="gl-text-sm gl-m-auto">2</span>
      </template>
    </gl-nav-item>
  `,
});
WithSlots.args = generateProps({
  label: 'Nav item with slots',
});

export const IsParent = (args, { argTypes }) => ({
  components: { GlNavItem },
  props: Object.keys(argTypes),
  data() {
    return {
      isExpanded: this.expanded,
    };
  },
  watch: {
    expanded(newVal) {
      this.isExpanded = newVal;
    },
  },
  template: `
    <nav class="gl-flex gl-flex-col gl-gap-2">
      <gl-nav-item icon="thumbtack" is-parent :expanded="isExpanded" @click="isExpanded = !isExpanded">Pinned</gl-nav-item>
      <gl-nav-item v-if="isExpanded" :href="href" :to="to" class="gl-pl-8">
        Child Item 1
      </gl-nav-item>
      <gl-nav-item v-if="isExpanded" :href="href" :to="to" class="gl-pl-8">
        Child Item 2
      </gl-nav-item>
    </nav>
  `,
});

export default {
  title: 'base/nav_item',
  component: GlNavItem,
  argTypes: {
    indicatorPosition: {
      options: Object.keys(navItemIndicatorPositionOptions),
      control: 'radio',
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          'See [Pajamas Design System documentation](https://design.khulnasoft.com/components/nav-item) for usage and implementation details.',
      },
    },
  },
};
