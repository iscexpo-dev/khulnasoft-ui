import { range } from 'lodash-es';
import GlBadge from '../../badge/badge.vue';
import { badgeVariantOptions } from '../../../../utils/constants';
import { getA11yParameters } from '../../../../utils/stories_utils';
import GlTab from '../tab/tab.vue';
import BVueReadme from '../../../../vendor/bootstrap-vue/src/components/tabs/README.md';
import BVueReadmeSizeProps from '../../../../vendor/bootstrap-vue/docs/markdown/reference/size-props/README.md';
import GlScrollableTabs from './scrollable_tabs.vue';
import GlTabs from './tabs.vue';

const components = {
  GlTabs,
  GlTab,
};

const generateProps = ({ justified } = {}) => ({
  justified,
});

const wrap = (template) => `
  <gl-tabs
    :justified="justified"
  >
    ${template}
  </gl-tabs>
`;

const ScrollableTabsGenerator = {
  components: {
    GlTabs,
    GlScrollableTabs,
    GlTab,
  },
  props: {
    count: {
      type: Number,
      required: true,
    },
  },
  computed: {
    tabs() {
      return range(this.count).map((i) => ({
        title: `Tab ${i + 1}`,
        content: `Tab panel ${i + 1} content...`,
      }));
    },
  },
  template: `
    <gl-scrollable-tabs v-bind="$attrs">
      <gl-tab v-for="tab in tabs" :key="tab.title" :title="tab.title">
        {{ tab.content }}
      </gl-tab>
    </gl-scrollable-tabs>
  `,
};

export const Default = (_args, { argTypes }) => ({
  props: Object.keys(argTypes),
  components,
  template: wrap(`
    <gl-tab title="Tab 1">
      Tab panel 1
    </gl-tab>
    <gl-tab title="Tab 2">
      Tab panel 2
    </gl-tab>
    <gl-tab title="Tab 3">
      Tab panel 3
    </gl-tab>
    <gl-tab title="Tab 4">
      Tab panel 4
    </gl-tab>
    <gl-tab title="Tab 5">
      Tab panel 5
    </gl-tab>
    <gl-tab title="Tab 6">
      Tab panel 6
    </gl-tab>
    <gl-tab title="Tab 7">
      Tab panel 7
    </gl-tab>
    <gl-tab title="Tab 8">
      Tab panel 8
    </gl-tab>
    <gl-tab title="Tab 9">
      Tab panel 9
    </gl-tab>
    <gl-tab title="Tab 10">
      Tab panel 10
    </gl-tab>
    <gl-tab title="Tab 11">
      Tab panel 11
    </gl-tab>
    <gl-tab title="Tab 12">
      Tab panel 12
    </gl-tab>
    <gl-tab title="Tab 13" query-param-value="thirteenth">
      Tab panel 13
    </gl-tab>
    <gl-tab title="Tab 14">
      Tab panel 14
    </gl-tab>`),
});
Default.args = generateProps();

export const ContentlessTab = (_args, { argTypes }) => ({
  props: Object.keys(argTypes),
  components,
  template: wrap(`
    <gl-tab title="Regular tab">
      <p>Regular tab content.</p>
      <p>The contentless tab is not selectable, as it has no content. This is useful for displaying things that aren't really tabs after the list of tabs.</p>
    </gl-tab>
    <gl-tab title="Another tab">
      <p>Another tab's content.</p>
    </gl-tab>
    <template #tabs-end>
      <li role="tab" class="gl-tab-nav-item">
        Contentless tab
      </li>
    </template>`),
});
ContentlessTab.parameters = {
  // Skip known axe-core failures, skipped rules should be removed when underlying violation is resolved
  a11y: getA11yParameters({ temporarySkipRules: ['aria-required-children', 'listitem'] }),
};

export const EmptyState = (_args, { argTypes }) => ({
  props: Object.keys(argTypes),
  components,
  template: wrap(`
    <template #empty>
      This content is only displayed when there are no tabs. Useful for dynamically added/removed tabs.
    </template>`),
});

export const JustifiedTabs = (_args, { argTypes }) => ({
  props: Object.keys(argTypes),
  components,
  template: wrap(`
    <gl-tab title="Tab 1">
      <p>Tab panel 1</p>
    </gl-tab>
    <gl-tab title="Tab 2">
      <p>Tab panel 2</p>
    </gl-tab>`),
});
JustifiedTabs.args = generateProps({ justified: true });

export const WithCounterBadges = (_args, { argTypes }) => ({
  props: Object.keys(argTypes),
  components,
  data() {
    return {
      allCount: 42,
      openCount: 15,
      closedCount: 1,
    };
  },
  computed: {
    allSrText() {
      return `${this.allCount} ${this.allCount === 1 ? 'issue' : 'issues'}`;
    },
    openSrText() {
      return `${this.openCount} open ${this.openCount === 1 ? 'issue' : 'issues'}`;
    },
    closedSrText() {
      return `${this.closedCount} closed ${this.closedCount === 1 ? 'issue' : 'issues'}`;
    },
  },
  template: wrap(`
    <gl-tab title="All" :tab-count="allCount" :tab-count-sr-text="allSrText">
      <p>All issues content</p>
    </gl-tab>
    <gl-tab title="Open" :tab-count="openCount" :tab-count-sr-text="openSrText">
      <p>Open issues content</p>
    </gl-tab>
    <gl-tab title="Closed" :tab-count="closedCount" :tab-count-sr-text="closedSrText">
      <p>Closed issues content</p>
    </gl-tab>`),
});

export const WithCounterBadgesLegacy = (_args, { argTypes }) => ({
  props: Object.keys(argTypes),
  components: { ...components, GlBadge },
  template: wrap(`
    <gl-tab
      v-for="variant in $options.badgeVariantOptions"
      :key="variant"
    >
      <template #title>
        <span>Tab</span>
        <gl-badge class="gl-tab-counter-badge" :variant="variant">500</gl-badge>
        <span class="gl-sr-only">items</span>
      </template>
      Tab panel {{ variant }}
    </gl-tab>`),
  badgeVariantOptions,
});

export const WithScroll = (_args, { argTypes }) => ({
  props: Object.keys(argTypes),
  components: {
    ScrollableTabsGenerator,
  },
  template: '<scrollable-tabs-generator :count="50" />',
});
WithScroll.parameters = {
  // Skip known axe-core failures, skipped rules should be removed when underlying violation is resolved
  a11y: getA11yParameters({ temporarySkipRules: ['aria-required-children', 'listitem'] }),
};

export const WithScrollAndGrowing = (_args, { argTypes }) => ({
  props: Object.keys(argTypes),
  components: {
    ScrollableTabsGenerator,
  },
  data() {
    return {
      count: 2,
      intervalId: 0,
    };
  },
  mounted() {
    this.intervalId = setInterval(() => {
      this.count += 1;
    }, 2000);
  },
  template: '<scrollable-tabs-generator :count="count" />',
});
WithScrollAndGrowing.tags = ['skip-visual-test'];

export const withActions = (_args, { argTypes }) => ({
  props: Object.keys(argTypes),
  components,
  template: `<gl-tabs
    :action-secondary="{ text: 'Secondary' }"
    :action-primary="{ text: 'Primary' }"
    :action-tertiary="{ text: 'Tertiary' }">
      <gl-tab title="Tab 1">
        Tab panel 1
      </gl-tab>
      <gl-tab title="Tab 2">
        Tab panel 2
      </gl-tab>
      <gl-tab title="Tab 3">
        Tab panel 3
      </gl-tab>
    </gl-tabs>`,
});
withActions.args = generateProps({ justified: true });

export default {
  title: 'base/tabs',
  component: GlTabs,
  subcomponents: { GlTab, GlScrollableTabs },
  parameters: {
    bootstrapDocs: BVueReadme + BVueReadmeSizeProps,
    bootstrapComponent: 'b-tabs',
    docs: {
      description: {
        component:
          'See [Pajamas Design System documentation](https://design.khulnasoft.com/components/tabs) for usage and implementation details.',
      },
    },
  },
  argTypes: {
    contentClass: { control: { disable: true } },
    navClass: { control: { disable: true } },
    syncActiveTabWithQueryParams: { control: { disable: true } },
    queryParamName: { control: { disable: true } },
    value: { control: { disable: true } },
  },
  excludeStories: ['withActions'],
};
