import { propDefaultFactory } from '../../../utils/stories_utils';
import GlDashboardSkeleton from './dashboard_skeleton.vue';

const defaultValue = propDefaultFactory(GlDashboardSkeleton);

const generateProps = ({ cards = defaultValue('cards') } = {}) => ({
  cards,
});

const Template = (args, { argTypes }) => ({
  components: { GlDashboardSkeleton },
  props: Object.keys(argTypes),
  template: '<gl-dashboard-skeleton :cards="cards" />',
});

export const Default = Template.bind({});
Default.args = generateProps();

export default {
  title: 'regions/dashboard-skeleton',
  component: GlDashboardSkeleton,
  parameters: {
    docs: {
      description: {
        component:
          'See [Pajamas Design System documentation](https://design.khulnasoft.com/patterns/dashboards) for usage and implementation details.',
      },
    },
  },
};
