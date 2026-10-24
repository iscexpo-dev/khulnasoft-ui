import GlButton from '../button/button.vue';
import GlCard from '../card/card.vue';
import GlCollapse from './collapse.vue';

const generateProps = ({ visible = false } = {}) => ({ visible });

const template = `
  <div>
    <h1>Here's a headline</h1>
    <gl-button class="gl-float-right" category="primary" @click="toggle" :aria-expanded="visible ? 'true' : 'false'"
      aria-controls="collapse-4">
      Toggle Collapse
    </gl-button>
    <gl-collapse :visible="visible" class="gl-mt-2" id="collapse-4">
      <span>
        This content can be hidden by default, which is good if there are some extensive details
        that should only be visible if the user wants to interact with them
      </span>
    </gl-collapse>
  </div>`;

const Template = (args, { argTypes, updateArgs }) => ({
  components: { GlButton, GlCard, GlCollapse },
  props: Object.keys(argTypes),
  methods: {
    toggle() {
      updateArgs({ ...args, visible: !this.visible });
    },
  },
  template,
});

export const Default = Template.bind({});
Default.args = generateProps();

export default {
  title: 'base/collapse',
  component: GlCollapse,
  parameters: {
    docs: {
      description: {
        component:
          'See [Pajamas Design System documentation](https://design.khulnasoft.com/components/collapse) for usage and implementation details.',
      },
    },
  },
};
