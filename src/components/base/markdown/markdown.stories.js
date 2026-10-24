import { getA11yParameters } from '../../../utils/stories_utils';
import GlMarkdown from './markdown.vue';
import markdownTypescaleDemoContent from './markdown_typescale_demo.html';

const template = `
  <gl-markdown :compact="compact">${markdownTypescaleDemoContent}</gl-markdown>
  `;

const generateProps = ({ compact = false } = {}) => ({ compact });

const Template = (args, { argTypes }) => ({
  components: { GlMarkdown },
  props: Object.keys(argTypes),
  template,
});

export const Documentation = Template.bind({});
Documentation.args = generateProps();

export const Compact = Template.bind({});
Compact.args = generateProps({ compact: true });

export default {
  title: 'base/markdown',
  component: GlMarkdown,
  parameters: {
    // Skip known axe-core failures, skipped rules should be removed when underlying violation is resolved
    a11y: getA11yParameters({
      temporarySkipRules: ['scrollable-region-focusable'],
    }),
  },
};
