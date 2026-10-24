import GlTabs from '../../base/tabs/tabs/tabs.vue';
import GlTab from '../../base/tabs/tab/tab.vue';
import GlChart from './chart.vue';

const generateProps = ({ options } = {}) => ({
  options: {
    xAxis: {
      type: 'category',
      data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    },
    yAxis: {
      type: 'value',
    },
    series: [
      {
        data: [820, 932, 901, 934, 1290, 1330, 1320],
        type: 'bar',
      },
    ],
    ...options,
  },
});

const Template = (args, { argTypes = {} }) => ({
  components: { GlChart },
  props: Object.keys(argTypes),
  template: '<gl-chart :options="options" />',
  ...args,
});

export const Default = Template.bind({});
Default.args = generateProps();

export const Tab = (args, { argTypes }) => ({
  components: {
    GlChart,
    GlTabs,
    GlTab,
  },
  props: Object.keys(argTypes),
  template: `
  <gl-tabs>
    <gl-tab title="Chart">
      <gl-chart :options="options" />
    </gl-tab>
  </gl-tabs>
  `,
});
Tab.args = generateProps();

export const WithToolbox = Template.bind({});
WithToolbox.args = generateProps({ options: { toolbox: { show: true } } });

export const Connected = Template.bind(
  {},
  {
    methods: {
      optionsFromData(data) {
        return {
          xAxis: {
            type: 'category',
            data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
          },
          yAxis: {
            type: 'value',
          },
          axisPointer: {
            show: true,
          },
          series: [
            {
              data,
              type: 'bar',
            },
          ],
        };
      },
    },
    template: `
      <div>
        <gl-chart
          group-id="connected-chart-unique-id"
          :options="optionsFromData([820, 932, 901, 934, 1290, 1330, 1320])"
        />
        <gl-chart
          group-id="connected-chart-unique-id"
          :options="optionsFromData([540, 759, 140, 757, 675, 1500, 457])"
        />
      </div>
      `,
  },
);
Connected.tags = ['skip-visual-test'];

export default {
  title: 'charts/chart',
  component: GlChart,
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        component:
          'See [Pajamas Design System documentation](https://design.khulnasoft.com/data-visualization/charts) for usage and implementation details.',
      },
    },
  },
};
