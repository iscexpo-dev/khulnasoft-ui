import { propDefaultFactory } from '../../../utils/stories_utils';
import GlPopover from '../popover/popover.vue';
import GlPath from './path.vue';
import { mockPathItems } from './data';

const defaultValue = propDefaultFactory(GlPath);

const generateProps = ({
  items = mockPathItems(),
  backgroundColor = defaultValue('backgroundColor'),
} = {}) => ({
  items,
  backgroundColor,
});

const template = (slot = '') => `
  <gl-path :items="items" :background-color="backgroundColor">
    ${slot}
  </gl-path>`;

export const Default = (args, { argTypes }) => ({
  components: { GlPath },
  props: Object.keys(argTypes),
  template: template(),
});
Default.args = generateProps();

export const WithPopovers = (args, { argTypes }) => ({
  components: { GlPath, GlPopover },
  props: Object.keys(argTypes),
  template: template(`
    <template #default="{ pathItem, pathId }">
      <gl-popover placement="bottom" :target="pathId">
        <template #title>
          {{ pathItem.title }}
        </template>
        {{ pathItem.metric }}
      </gl-popover>
    </template>`),
});
WithPopovers.args = generateProps();

export const AllOptions = () => ({
  components: { GlPath },
  data: () => ({
    items: [
      {
        title: 'First',
        metric: '14d',
        icon: 'home',
      },
      {
        title: 'Second',
        metric: '2d',
      },
    ],
  }),
  template: `<gl-path :items="items" />`,
});
AllOptions.parameters = { controls: { disable: true } };

export default {
  title: 'base/path',
  component: GlPath,
  parameters: {
    docs: {
      description: {
        component:
          'See [Pajamas Design System documentation](https://design.khulnasoft.com/components/path) for usage and implementation details.',
      },
    },
  },
  argTypes: {
    backgroundColor: {
      control: 'color',
    },
  },
};
