import { propDefaultFactory } from '../../../utils/stories_utils';
import GlAccordionItem from './accordion_item.vue';

const template = `
    <gl-accordion-item :title="title" :titleVisible="titleVisible" :visible="visible" :header-level="headerLevel">
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Delectus, maiores.
    </gl-accordion-item>
    `;

const defaultValue = propDefaultFactory(GlAccordionItem);

const generateProps = ({
  visible = defaultValue('visible'),
  headerLevel = 3,
  title = 'Accordion Item Title',
  titleVisible = undefined,
} = {}) => ({
  visible,
  headerLevel,
  title,
  titleVisible,
});

const Template = (args) => ({
  components: {
    GlAccordionItem,
  },
  props: Object.keys(args),
  template,
  provide: {
    defaultHeaderLevel: defaultValue('headerLevel'),
    autoCollapse: false,
  },
});

export const Default = Template.bind({});
Default.args = generateProps({ visible: true, titleVisible: 'Accordion Item Title Expanded' });

export const LongTitle = Template.bind({});
LongTitle.args = generateProps({
  visible: true,
  title:
    'src/components/base/accordion/very_long_file_name_that_should_wrap_instead_of_overflowing.vue',
});

export default {
  title: 'base/accordion/accordion-item',
  component: GlAccordionItem,
  tags: ['skip-visual-test'],
  argTypes: {
    headerLevel: {
      options: [1, 2, 3, 4, 5, 6],
      control: 'select',
    },
  },
};
