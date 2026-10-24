import { propDefaultFactory } from '../../../utils/stories_utils';
import GlButton from '../button/button.vue';
import { popoverPlacements } from '../../../utils/constants';
import BVueReadme from '../../../vendor/bootstrap-vue/src/components/popover/README.md';
import GlPopover from './popover.vue';

const defaultValue = propDefaultFactory(GlPopover);

const components = { GlPopover, GlButton };

const contentString = `
  A popover is used to provide supplemental, useful, unique information about an element.
`;

const getTemplate = (id, slots = '') => `
  <div style="height:400px;" class="gl-flex gl-justify-center gl-items-center">
    <gl-button id="${id}">{{placement}}</gl-button>
    <gl-popover
      target="${id}"
      :triggers="triggers"
      :title="title"
      :placement="placement"
      :show-close-button="showCloseButton"
      content="${contentString}"
      data-testid="${id}"
      :show="$options.viewMode !== 'docs'">${slots}</gl-popover>
  </div>`;

const generateProps = ({
  placement = defaultValue('placement'),
  title = 'Popover',
  triggers = defaultValue('triggers'),
  cssClasses = defaultValue('cssClasses'),
  showCloseButton = defaultValue('showCloseButton'),
} = {}) => ({
  placement,
  title,
  triggers,
  cssClasses,
  showCloseButton,
});

export const Default = (_args, { viewMode, argTypes }) => ({
  viewMode,
  components,
  props: Object.keys(argTypes),
  template: getTemplate('popover-with-props'),
});
Default.args = generateProps();

export const WithCloseButton = (_args, { viewMode, argTypes }) => ({
  viewMode,
  components,
  props: Object.keys(argTypes),
  template: getTemplate('popover-with-close-button'),
});
WithCloseButton.args = generateProps({
  showCloseButton: true,
  title: 'Compliance framework used with Ruby project',
});

export const TextLinks = (_args, { viewMode, argTypes }) => ({
  viewMode,
  components,
  props: Object.keys(argTypes),
  template: getTemplate(
    'popover-with-text-links',
    `
    <template>
      A popover is used to provide supplemental, useful, unique information about an element. This one has a link to <a class="gl-link" href="https://design.khulnasoft.com/components/popover">learn more about popovers.</a>
    </template>
  `,
  ),
});
TextLinks.args = generateProps({
  showCloseButton: true,
  title: '',
});

export const OnClick = (_args, { viewMode, argTypes }) => ({
  viewMode,
  components,
  props: Object.keys(argTypes),
  template: getTemplate(
    'popover-button-click',
    `
    <template #title>
      <span data-testid="popover-title">Popover title</span>
    </template>
  `,
  ),
});
OnClick.args = generateProps({
  triggers: 'click',
});
OnClick.tags = ['skip-visual-test'];

export default {
  title: 'base/popover',
  component: GlPopover,
  parameters: {
    bootstrapDocs: BVueReadme,
    bootstrapComponent: 'b-popover',
    docs: {
      description: {
        component:
          'See [Pajamas Design System documentation](https://design.khulnasoft.com/components/popover) for usage and implementation details.',
      },
    },
  },
  argTypes: {
    placement: {
      options: Object.values(popoverPlacements),
      control: 'select',
    },
    title: {
      control: 'text',
    },
  },
};
