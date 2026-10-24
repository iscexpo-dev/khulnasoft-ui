import GlLineChart from '../../charts/line/line.vue';
import GlIcon from '../../base/icon/icon.vue';
import GlPopover from '../../base/popover/popover.vue';
import GlLink from '../../base/link/link.vue';
import GlButton from '../../base/button/button.vue';
import GlButtonGroup from '../../base/button_group/button_group.vue';
import GlDashboardPanel from './dashboard_panel.vue';

export default {
  title: 'dashboards/dashboards-panel',
  component: GlDashboardPanel,
  parameters: {
    docs: {
      description: {
        component:
          'See [Pajamas Design System documentation](https://design.khulnasoft.com/components/dashboard-panel) for usage and implementation details.',
      },
    },
  },
};

const chartProps = {
  chartData: [
    {
      name: 'Created MRs',
      data: [
        ['Mon', 1184],
        ['Tue', 1346],
        ['Wed', 1035],
        ['Thu', 1226],
        ['Fri', 1421],
        ['Sat', 1347],
        ['Sun', 1035],
      ],
    },
    {
      name: 'Closed MRs',
      data: [
        ['Mon', 1509],
        ['Tue', 1275],
        ['Wed', 1187],
        ['Thu', 1287],
        ['Fri', 1098],
        ['Sat', 1457],
        ['Sun', 1452],
      ],
    },
    {
      name: 'Predicted closed MRs',
      data: [
        ['Mon', 1041],
        ['Tue', 1468],
        ['Wed', 1273],
        ['Thu', 1503],
        ['Fri', 1209],
        ['Sat', 1416],
        ['Sun', 1213],
      ],
    },
  ],
  chartOptions: {
    animation: false,
    xAxis: {
      name: 'Time',
      type: 'category',
    },
  },
};

const marginTop = 'margin-top: 100px;';

const alertMessageSlot = `
<template #alert-message="{ panelId }">
  <gl-popover
    triggers="hover focus"
    title="Alert message"
    :show-close-button="false"
    placement="top"
    :css-classes="['gl-max-w-1/2']"
    :target="panelId"
    :delay="{ hide: 500 }"
    boundary="viewport"
    >
      Alert message to show users. <gl-link href="#">Learn more</gl-link>.
  </gl-popover>
</template>
`;

const wrap = (template, style = '', panelStyle = '') => `
  <div style="${style}" class="gl-text-base">
    <gl-dashboard-panel v-bind="$props" style="min-height: 7rem; ${panelStyle}">
      ${template}
    </gl-dashboard-panel>
  </div>
`;

const Template = (args, { argTypes }) => ({
  components: { GlDashboardPanel, GlLineChart, GlIcon, GlPopover, GlLink },
  props: Object.keys(argTypes),
  ...chartProps,
  template: wrap(`
    <template #body>
      <p class="gl-text-subtle">Your visualization here</p>
    </template>
  `),
});

const PopoverTemplate = (args, { argTypes }) => ({
  components: { GlDashboardPanel, GlLineChart, GlIcon, GlPopover, GlLink },
  props: Object.keys(argTypes),
  ...chartProps,
  template: wrap(
    `
    <template #body>
      <p class="gl-text-subtle">Your visualization here</p>
    </template>
  `,
    // Margin top added to give space for the popover
    marginTop,
  ),
});

export const Default = Template.bind({});
Default.args = {
  containerClass: null,
  borderColorClass: null,
  title: 'Dashboard panel',
  titlePopover: null,
  loading: false,
  loadingDelayed: false,
  loadingDelayedText: 'Still loading...',
  actions: [],
  actionsToggleText: 'Actions',
};

export const WithSubtitle = Template.bind({});
WithSubtitle.args = {
  ...Default.args,
  subtitle: 'Custom panel subtitle',
};

export const WithTitlePopover = PopoverTemplate.bind({});
WithTitlePopover.args = {
  ...Default.args,
  titlePopover: {
    description: 'Find out %{linkStart}more%{linkEnd}',
    descriptionLink: 'http://test.com',
  },
};

export const WithInfoPopoverSlotsContent = (args, { argTypes }) => ({
  components: { GlDashboardPanel, GlLineChart, GlIcon, GlPopover, GlLink },
  props: Object.keys(argTypes),
  ...chartProps,
  template: wrap(
    `
    <template #info-popover-title>Panel Details</template>
    <template #info-popover-content>
        <p class="gl-mb-3">This panel demonstrates HTML content using both info-popover slots.</p>
        <ul class="gl-mb-3 gl-pl-4">
          <li><strong>HTML formatting</strong> is supported</li>
          <li><gl-link href="https://design.khulnasoft.com" target="_blank">External links</gl-link></li>
          <li>Complex content layouts</li>
        </ul>
        <div class="gl-p-3 gl-bg-gray-50 gl-rounded-base">
          <gl-icon name="information-o" class="gl-text-blue-500 gl-mr-2" />
          <span class="gl-text-sm">Both <code>info-popover-title</code> and <code>info-popover-content</code> slots take precedence over the <code>titlePopover</code> prop.</span>
        </div>
    </template>
    <template #body>
      <p class="gl-text-subtle">Your visualization here</p>
    </template>
  `,
    // Margin top added to give space for the popover
    marginTop,
  ),
});
WithInfoPopoverSlotsContent.args = {
  ...Default.args,
  title: 'Dashboard panel',
};
WithInfoPopoverSlotsContent.parameters = {
  docs: {
    description: {
      story:
        'This story demonstrates both the `info-popover-title` and `info-popover-content` slots which allow for HTML content in the title popover. These slots take precedence over the `titlePopover` prop when provided.',
    },
  },
};

export const WithLoading = (args, { argTypes }) => ({
  components: { GlDashboardPanel, GlLineChart, GlIcon, GlPopover, GlLink },
  props: Object.keys(argTypes),
  ...chartProps,
  template: wrap('', '', 'height: 400px;'),
});
WithLoading.args = {
  ...Default.args,
  loading: true,
};

export const WithLoadingDelayed = WithLoading.bind({});
WithLoadingDelayed.args = {
  ...Default.args,
  loading: true,
  loadingDelayed: true,
};

export const WithActions = Template.bind({});
WithActions.args = {
  ...Default.args,
  actions: [
    {
      text: 'Configure',
      action: () => {},
    },
    {
      text: 'Make copy',
      action: () => {},
    },
    {
      text: 'Delete',
      action: () => {},
      variant: 'danger',
    },
  ],
};

export const WithActionsLoading = WithActions.bind({});
WithActionsLoading.args = {
  ...WithActions.args,
  loading: true,
};

export const ChartWithFilters = (args, { argTypes }) => ({
  components: { GlDashboardPanel, GlLineChart, GlIcon, GlPopover, GlLink, GlButton, GlButtonGroup },
  props: Object.keys(argTypes),
  ...chartProps,
  dayChartData: [
    {
      name: 'Created MRs (Day)',
      data: [
        ['Mon', 1184],
        ['Tue', 1346],
        ['Wed', 1035],
        ['Thu', 1226],
        ['Fri', 1421],
        ['Sat', 1347],
        ['Sun', 1035],
      ],
    },
    {
      name: 'Closed MRs (Day)',
      data: [
        ['Mon', 1509],
        ['Tue', 1275],
        ['Wed', 1187],
        ['Thu', 1287],
        ['Fri', 1098],
        ['Sat', 1457],
        ['Sun', 1452],
      ],
    },
  ],
  weekChartData: [
    {
      name: 'Created MRs (Week)',
      data: [
        ['Week 1', 8500],
        ['Week 2', 9200],
        ['Week 3', 7800],
        ['Week 4', 8900],
      ],
    },
    {
      name: 'Closed MRs (Week)',
      data: [
        ['Week 1', 9200],
        ['Week 2', 8800],
        ['Week 3', 9500],
        ['Week 4', 8700],
      ],
    },
  ],
  monthsChartData: [
    {
      name: 'Created MRs (Month)',
      data: [
        ['Jan', 35000],
        ['Feb', 32000],
        ['Mar', 38000],
        ['Apr', 36000],
        ['May', 39000],
        ['Jun', 37000],
      ],
    },
    {
      name: 'Closed MRs (Month)',
      data: [
        ['Jan', 36000],
        ['Feb', 33000],
        ['Mar', 37000],
        ['Apr', 35000],
        ['May', 38000],
        ['Jun', 36000],
      ],
    },
  ],
  data() {
    return {
      selectedRange: 'day',
    };
  },
  computed: {
    currentChartData() {
      return {
        day: this.$options.dayChartData,
        week: this.$options.weekChartData,
        months: this.$options.monthsChartData,
      }[this.selectedRange];
    },
  },
  template: wrap(`
    <template #filters>
      <gl-button-group>
        <gl-button
          category="secondary"
          variant="default"
          size="small"
          :selected="selectedRange === 'day'"
          :disabled="loading || loadingDelayed"
          @click="selectedRange = 'day'"
        >
          Day
        </gl-button>
        <gl-button
          category="secondary"
          variant="default"
          size="small"
          :selected="selectedRange === 'week'"
          :disabled="loading || loadingDelayed"
          @click="selectedRange = 'week'"
        >
          Week
        </gl-button>
        <gl-button
          category="secondary"
          variant="default"
          size="small"
          :selected="selectedRange === 'months'"
          :disabled="loading || loadingDelayed"
          @click="selectedRange = 'months'"
        >
          Months
        </gl-button>
      </gl-button-group>
    </template>
    <template #body>
      <gl-line-chart :data="currentChartData" :option="$options.chartOptions" />
    </template>
  `),
});
ChartWithFilters.args = {
  ...Default.args,
  title: 'Dashboard panel with filters and example visualization',
};

export const ChartWithFiltersAndActions = ChartWithFilters.bind({});
ChartWithFiltersAndActions.args = {
  ...ChartWithFilters.args,
  actions: [
    {
      text: 'Delete',
      action: () => {},
    },
  ],
  title: 'Dashboard panel with filters, actions and example visualization',
};

export const WithFooter = (args, { argTypes }) => ({
  components: { GlDashboardPanel, GlLineChart, GlLink },
  props: Object.keys(argTypes),
  ...chartProps,
  template: wrap(
    `
    <template #body>
      <gl-line-chart :data="$options.chartData" :option="$options.chartOptions" height="auto" />
    </template>
    <template #footer>
      <gl-link href="#">View merge request analytics</gl-link>
    </template>
  `,
    '',
    'height: 400px;',
  ),
});
WithFooter.args = {
  ...Default.args,
  title: 'Dashboard panel with a footer',
};
WithFooter.parameters = {
  docs: {
    description: {
      story:
        "The `footer` slot renders below the panel body, for content such as a link to more details. The body stays the scroll container, so the footer remains visible when the visualization fills the panel. The footer isn't rendered while the panel is loading.",
    },
  },
};

export const WithBorderColor = Template.bind({});
WithBorderColor.args = {
  ...Default.args,
  borderColorClass: 'gl-border-t-blue-500',
};

export const WithTitleIcon = Template.bind({});
WithTitleIcon.args = {
  ...Default.args,
  titleIcon: 'error',
  titleIconClass: 'gl-text-red-500',
};

export const WithLongTitle = PopoverTemplate.bind({});
WithLongTitle.args = {
  ...Default.args,
  containerClass: 'gl-max-w-48',
  title:
    'Very long title that will be truncated and the tooltip will be displayed to reveal the full text.',
};

export const WithLongTitleAndTitlePopover = PopoverTemplate.bind({});
WithLongTitleAndTitlePopover.args = {
  ...Default.args,
  containerClass: 'gl-max-w-48',
  title:
    'Very long title that will be truncated and the tooltip will be displayed to reveal the full text.',
  titlePopover: {
    description: 'Find out %{linkStart}more%{linkEnd}',
    descriptionLink: 'http://test.com',
  },
};

export const WithAlertMessage = (args, { argTypes }) => ({
  components: { GlDashboardPanel, GlLineChart, GlIcon, GlPopover, GlLink },
  props: Object.keys(argTypes),
  ...chartProps,
  template: wrap(
    `
    <template #body>
      <span data-testid="alert-body" class="gl-text-subtle">
        Something went wrong.
      </span>
    </template>
    ${alertMessageSlot}`,
    // Margin top added to give space for the alert popover
    marginTop,
  ),
});
WithAlertMessage.args = {
  ...Default.args,
  borderColorClass: 'gl-border-t-red-500',
  titleIcon: 'error',
  titleIconClass: 'gl-text-red-500',
};
