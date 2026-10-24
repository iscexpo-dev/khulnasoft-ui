import issuesSvg from '@gitlab/svgs/dist/illustrations/rocket-launch-md.svg';
import illustrationsSpriteInfo from '@gitlab/svgs/dist/illustrations.json';
import GlButton from '../../base/button/button.vue';
import GlEmptyState from './empty_state.vue';

const template = `
  <gl-empty-state
    :title="title"
    :svg-path="svgPath"
    :svg-height="svgHeight"
    :illustration-name="illustrationName"
    :description="description"
    :primary-button-text="primaryButtonText"
    :secondary-button-text="secondaryButtonText"
    :compact="compact"
    :primary-button-link="primaryButtonLink"
    :secondary-button-link="secondaryButtonLink"
    :content-class="contentClass"
  />`;

const Template = (args) => ({
  components: {
    GlEmptyState,
  },
  props: Object.keys(args),
  template,
});

const generateProps = ({
  title = 'This state is empty',
  svgPath = issuesSvg,
  svgHeight = 144,
  illustrationName = 'status-nothing-md',
  description = 'The title and message should be clear, concise, and explain why the user is seeing this screen.',
  primaryButtonText = 'Something actionable',
  secondaryButtonText = 'Something else',
  primaryButtonLink = '#',
  secondaryButtonLink = '#',
  compact = false,
  contentClass = [],
} = {}) => ({
  title,
  svgPath,
  svgHeight,
  illustrationName,
  description,
  primaryButtonText,
  secondaryButtonText,
  primaryButtonLink,
  secondaryButtonLink,
  compact,
  contentClass,
});

export const Default = Template.bind({});
Default.args = generateProps({
  svgPath: null,
});

export const SingleButton = Template.bind({});
SingleButton.args = generateProps({
  secondaryButtonText: null,
  svgPath: null,
});

export const NoButtons = Template.bind({});
NoButtons.args = generateProps({
  primaryButtonText: null,
  secondaryButtonText: null,
  svgPath: null,
});

export const NoIllustration = Template.bind({});
NoIllustration.args = generateProps({
  illustrationName: null,
  svgPath: null,
});

export const CustomIllustration = Template.bind({});
CustomIllustration.args = generateProps({
  title: 'This is a custom SVG asset',
  description: 'This illustration does not adapt to color mode changes.',
  illustrationName: null,
});

export const CustomActions = (args) => ({
  components: {
    GlEmptyState,
    GlButton,
  },
  props: Object.keys(args),
  template: `
    <gl-empty-state
      :title="title"
      :illustration-name="illustrationName"
      :description="description"
      :primary-button-text="primaryButtonText"
      :secondary-button-text="secondaryButtonText"
      :compact="compact"
      :primary-button-link="primaryButtonLink"
      :secondary-button-link="secondaryButtonLink"
      :content-class="contentClass"
    >
      <template #actions>
        <gl-button
          variant="confirm"
          class="gl-mb-3"
        >Custom button</gl-button>
        <gl-button
          variant="link"
          class="gl-mb-3 gl-ml-3"
          href="#"
          @click.prevent
        >Custom link</gl-button>
      </template>
    </gl-empty-state>
  `,
});
CustomActions.args = generateProps({
  svgPath: null,
});

export const NotFullscreen = Template.bind({});
NotFullscreen.args = generateProps({
  compact: true,
  title: 'This is a compact empty state',
  description: 'It could be included in a settings page, or a list view',
  svgPath: null,
});

export const SlottedDescription = (args) => ({
  components: {
    GlEmptyState,
    GlButton,
  },
  props: Object.keys(args),
  template: `
    <gl-empty-state
      :title="title"
      :illustration-name="illustrationName"
      :description="description"
      :primary-button-text="primaryButtonText"
      :secondary-button-text="secondaryButtonText"
      :compact="compact"
      :primary-button-link="primaryButtonLink"
      :secondary-button-link="secondaryButtonLink"
      :content-class="contentClass"
    >
      <template #description>
        <p>A slotted description allows you to use more custom HTML such as <a href="#">links</a>.</p>
        <pre>You could also include code snippets</pre>
        <p><strong>Note:</strong> A slotted description will override one provided by a property.</p>
      </template>
    </gl-empty-state>
  `,
});
SlottedDescription.args = generateProps({
  title: 'Slotted description example',
  illustrationName: 'rocket-launch-md',
  svgPath: null,
  primaryButtonText: 'Learn more',
  secondaryButtonText: null,
});

export default {
  title: 'regions/empty-state',
  component: GlEmptyState,
  argTypes: {
    illustrationName: {
      options: illustrationsSpriteInfo.icons.map((obj) => obj.name),
      control: 'select',
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          'See [Pajamas Design System documentation](https://design.khulnasoft.com/patterns/empty-states) for usage and implementation details.',
      },
    },
  },
};
