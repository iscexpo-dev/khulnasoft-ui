import { propDefaultFactory, getA11yParameters } from '../../../utils/stories_utils';
import GlAccordion from './accordion.vue';
import GlAccordionItem from './accordion_item.vue';

const template = `
    <gl-accordion :auto-collapse="autoCollapse" :header-level="headerLevel">
      <gl-accordion-item title="Item 1" :header-level="headerLevel">
        Each accordion can be expanded or collapsed independently of others.
      </gl-accordion-item>

      <gl-accordion-item title="Item 2" :header-level="headerLevel" :visible="true">
        If you want to have an accordion item to be initially visible, please see
        <code>Initially Expanded</code> example for the <code>GLAccordionItem</code>.
      </gl-accordion-item>

      <gl-accordion-item title="Item 3" :header-level="headerLevel" :visible="autoCollapse">
        If you want the other accordion items to collapse when one is open, please see
        <code>Auto Collapse</code> example.
      </gl-accordion-item>
    </gl-accordion>
    `;

const defaultValue = propDefaultFactory(GlAccordion);

const generateProps = ({ autoCollapse = defaultValue('autoCollapse'), headerLevel = 3 } = {}) => ({
  autoCollapse,
  headerLevel,
});

const Template = (args) => ({
  components: {
    GlAccordion,
    GlAccordionItem,
  },
  props: Object.keys(args),
  template,
});

export const Default = Template.bind({});
Default.args = generateProps();

export default {
  title: 'base/accordion',
  component: GlAccordion,
  parameters: {
    // Skip known axe-core failures, skipped rules should be removed when underlying violation is resolved
    a11y: getA11yParameters({ temporarySkipRules: ['color-contrast'] }),
    docs: {
      description: {
        component:
          'See [Pajamas Design System documentation](https://design.khulnasoft.com/components/accordion) for usage and implementation details.',
      },
    },
  },
  argTypes: {
    headerLevel: {
      options: [1, 2, 3, 4, 5, 6],
      control: 'select',
    },
  },
};
