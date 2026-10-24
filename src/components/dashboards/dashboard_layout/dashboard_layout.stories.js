import GlDashboardPanel from '../dashboard_panel/dashboard_panel.vue';
import GlFormGroup from '../../base/form/form_group/form_group.vue';
import GlFormInput from '../../base/form/form_input/form_input.vue';
import GlButton from '../../base/button/button.vue';
import GlDashboardLayout from './dashboard_layout.vue';

export default {
  title: 'dashboards/dashboards-layout',
  component: GlDashboardLayout,
  parameters: {
    docs: {
      description: {
        component:
          'See [Pajamas Design System documentation](https://design.khulnasoft.com/patterns/dashboards) for usage and implementation details.',
      },
    },
  },
};

const dashboardConfig = {
  title: 'Dashboard title',
  description: 'Dashboards made easy with a snap grid system',
  panels: [
    {
      id: '1',
      title: 'Dashboard panel',
      gridAttributes: {
        width: 6,
        height: 1,
        yPos: 0,
        xPos: 3,
      },
    },
    {
      id: '2',
      title: 'Another dashboard panel',
      gridAttributes: {
        width: 3,
        height: 2,
        yPos: 1,
        xPos: 1,
      },
    },
    {
      id: '3',
      title: 'I can be placed anywhere on the grid',
      gridAttributes: {
        width: 4,
        height: 1,
        yPos: 2,
        xPos: 7,
      },
    },
  ],
};

const Template = (args, { argTypes }) => ({
  components: { GlDashboardLayout, GlDashboardPanel },
  props: Object.keys(argTypes),
  template: `
    <gl-dashboard-layout v-bind="$props">
      <template #panel="{ panel }">
        <gl-dashboard-panel :title="panel.title" :loading="panel.loading" class="gl-h-full">
          <template #body>
            <p class="gl-text-tertiary">Your visualization here</p>
          </template>
        </gl-dashboard-panel>
      </template>
      <template #empty-state>
        <p>No dashboard panels here 🕵</p>
      </template>
    </gl-dashboard-layout>
  `,
});

const SlotsTemplate = (args, { argTypes }) => ({
  components: { GlDashboardLayout },
  props: Object.keys(argTypes),
  template: `
    <gl-dashboard-layout v-bind="$props">
      <template #title>
        <h2>
          Custom dashboard <code>#title</code> 🚀
        </h2>
      </template>
      <template #description>
        <div class="gl-text-subtle">
          This is the <code>#description</code> slot.
        </div>
      </template>
      <template #filters>
        <div class>
          Add your dashboard-level filters in the <code>#filters</code> slot.
        </div>
      </template>
      <template #actions>
        <a href="#" class="gl-display-flex"><code>#actions</code></a>
      </template>
      <template #alert>
        <div class="gl-text-danger">
          Dashboard alerts go in the <code>#alert</code> slot.
        </div>
      </template>
      <template #panel="{ panel }">
        <div class="gl-bg-feedback-warning gl-h-full">
          <p>The <code>#panel</code> slot.</p>
        </div>
      </template>
      <template #empty-state>
        <p>This dashboard has no panels</p>
      </template>
      <template #footer>
        <div class="gl-text-subtle">
          This is a custom <code>#footer</code>!
        </div>
      </template>
    </gl-dashboard-layout>
  `,
});

const CustomHeaderTemplate = (args, { argTypes }) => ({
  components: {
    GlDashboardLayout,
    GlDashboardPanel,
    GlFormGroup,
    GlFormInput,
    GlButton,
  },
  props: Object.keys(argTypes),
  template: `
    <gl-dashboard-layout v-bind="$props">
      <template #header>
        <div class="gl-flex gl-w-full gl-flex-col">
          <h2>Custom dashboard <code>#header</code></h2>
          <gl-form-group>
            <gl-form-input type="text" value="Dashboard title" class="gl-mb-2 gl-max-w-sm" />
            <gl-form-input type="text" value="Dashboard description" class="gl-mb-2 gl-max-w-sm" />
            <gl-button type="submit">Save dashboard</gl-button>
          </gl-form-group>
        </div>
      </template>
      <template #panel="{ panel }">
        <gl-dashboard-panel :title="panel.title" :loading="panel.loading" class="gl-h-full">
          <template #body>
            <p class="gl-text-tertiary">Your visualization here</p>
          </template>
        </gl-dashboard-panel>
      </template>
    </gl-dashboard-layout>
  `,
});

export const Default = Template.bind({});
Default.args = {
  config: { ...dashboardConfig },
};

export const DynamicGrid = Template.bind({});
DynamicGrid.parameters = {
  docs: {
    description: {
      story:
        'Disable the `isStaticGrid` prop to enable grid layout editing and reordering with drag-and-drop or resizing of panels.',
    },
  },
};
DynamicGrid.args = {
  config: { ...dashboardConfig },
  isStaticGrid: false,
  cellHeight: 10,
  minCellHeight: 10,
};

export const EmptyState = Template.bind({});
EmptyState.args = {
  config: {
    ...dashboardConfig,
    panels: [],
  },
};

export const Slots = SlotsTemplate.bind({});
Slots.args = {
  config: { ...dashboardConfig },
};

export const CustomHeader = CustomHeaderTemplate.bind({});
CustomHeader.args = {
  config: { ...dashboardConfig },
};
