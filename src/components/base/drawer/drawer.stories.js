import { propDefaultFactory } from '../../../utils/stories_utils';
import GlButton from '../button/button.vue';
import GlMarkdown from '../markdown/markdown.vue';
import { drawerVariants } from '../../../utils/constants';
import GlDrawer from './drawer.vue';

const components = { GlDrawer, GlButton, GlMarkdown };

const generateStaticContent = (number = 1) =>
  Array.from(
    Array(number),
    (_, index) => `
      <div tabindex="0" class="gl-mb-8">
        <h3 class="gl-heading-3">View jobs in a pipeline ${index}</h3>
        <p>
          Pipeline configuration begins with jobs. Jobs are the most fundamental element of a .khulnasoft-ci.yml file.
        </p>
        <p>Jobs are:</p>
        <ul>
          <li>Defined with constraints stating under what conditions they should be executed. </li>
          <li>Top-level elements with an arbitrary name and must contain at least the script clause.</li>
          <li>Not limited in how many can be defined.</li>
        </ul>
        <p>For example:</p>
        <gl-markdown compact>
          <code>job1: script: "execute-script-for-job1"</code>
          <br />
          <code>job2: script: "execute-script-for-job2"</code>
        </gl-markdown>
      </div>
    `,
  ).join('');

const generateDrawerContent = (items) =>
  items
    .map(
      (str) => `
    <div tabindex="0">
      <!-- tabindex avoid false positive 'scrollable-region-focusable' violation -->
      <strong class="gl-inline-block gl-mb-2">${str}</strong>
      <div>Content…</div>
    </div>
    `,
    )
    .join('');

const drawerContent = generateDrawerContent([
  'Group one',
  'Group two',
  'Group three',
  'Group four',
  'Group five',
  'Group six',
  'Group seven',
  'Group eight',
  'Group nine',
  'Group ten',
  'Group eleven',
  'Group twelve',
  'Group thirteen',
  'Group fourteen',
]);

const drawerContentShortList = generateDrawerContent(['One', 'Two', 'Three']);

const createSidebarTemplate = (content, { extraBindings = {} } = {}) => `
  <gl-drawer
    :open="open"
    :header-height="headerHeight"
    :header-sticky="headerSticky"
    :z-index="zIndex"
    :variant="variant"
    ${Object.entries(extraBindings)
      .map(([key, value]) => `${key}="${value}"`)
      .join('\n')}
    @close="close">${content}</gl-drawer>
  `;

const defaultValue = propDefaultFactory(GlDrawer);

const generateProps = ({
  headerHeight = defaultValue('headerHeight'),
  headerSticky = defaultValue('headerSticky'),
  zIndex = defaultValue('zIndex'),
  variant = defaultValue('variant'),
} = {}) => ({
  headerHeight,
  headerSticky,
  zIndex,
  variant,
});

const storyOptions = (viewMode) => ({
  props: Object.keys(generateProps()),
  components,
  methods: {
    toggle() {
      this.open = !this.open;
    },
    close() {
      this.open = false;
    },
  },
  data() {
    return {
      open: viewMode !== 'docs',
    };
  },
});

export const Default = (_args, { viewMode }) => ({
  mixins: [
    {
      data() {
        return {
          timesOpened: 0,
        };
      },
      methods: {
        opened() {
          this.timesOpened += 1;
        },
      },
    },
  ],
  ...storyOptions(viewMode),
  template: `
    <div :data-opened-count="timesOpened">
      <gl-button @click="toggle">Toggle Drawer</gl-button>
      ${createSidebarTemplate(
        `
        <template #title><h2 class="!gl-mb-0 gl-heading-scale-500">Example title</h2></template>
        ${drawerContent}
      `,
        { extraBindings: { '@opened': 'opened' } },
      )}
    </div>`,
});
Default.args = generateProps();

export const WithActions = (_args, { viewMode }) => ({
  ...storyOptions(viewMode),
  template: `
    <div>
      <gl-button @click="toggle">Toggle Drawer</gl-button>
      ${createSidebarTemplate(`
          <template #title>
          <h2 class="!gl-mb-0 gl-heading-scale-500">custom-network-policy multiple lines headline</h2>
        </template>
        <template #header>
            <div class="gl-mt-5">
              <gl-button variant="confirm">Save</gl-button>
              <gl-button class="gl-ml-3" @click="toggle">Cancel</gl-button>
            </div>
        </template>
          ${drawerContent}
      `)}
    </div>`,
});
WithActions.args = generateProps();

export const WithStickyFooterShortContent = (_args, { viewMode }) => ({
  ...storyOptions(viewMode),
  template: `
    <div>
      <gl-button @click="toggle">Toggle Drawer</gl-button>
      ${createSidebarTemplate(`
        <template #title><h2 class="!gl-mb-0 gl-heading-scale-500">List Settings</h2></template>
        ${drawerContentShortList}
        <template #footer>
          Drawer footer
        </template>
      `)}
    </div>`,
});

WithStickyFooterShortContent.args = generateProps();

export const WithStickyFooter = (_args, { viewMode }) => ({
  ...storyOptions(viewMode),
  template: `
    <div>
      <gl-button @click="toggle">Toggle Drawer</gl-button>
      ${createSidebarTemplate(`
        <template #title><h2 class="!gl-mb-0 gl-heading-scale-500">List Settings</h2></template>
        ${drawerContent}
        <template #footer>
          Drawer footer
        </template>
      `)}
    </div>`,
});

WithStickyFooter.args = generateProps();

export const WithScrimAndStaticContent = (_args, { viewMode }) => ({
  ...storyOptions(viewMode),
  template: `
    <div>
      <gl-button @click="toggle">Toggle Drawer</gl-button>
      ${createSidebarTemplate(`
        <template #title><h2 class="!gl-mb-0 gl-heading-scale-500">List Settings</h2></template>
        <div>
          ${generateStaticContent(3)}
        </div>
      `)}
    </div>`,
});

WithScrimAndStaticContent.args = generateProps({
  headerSticky: true,
});

export const SidebarVariant = (_args, { viewMode }) => ({
  ...storyOptions(viewMode),
  template: `
    <div>
      <gl-button @click="toggle">Toggle Drawer</gl-button>
      ${createSidebarTemplate(`
        <template #title>
          <h2 class="!gl-mb-0 gl-heading-scale-500">Sidebar</h2>
        </template>
        <template #header>
          <div class="gl-mt-5">
            <gl-button>Action</gl-button>
          </div>
        </template>
        ${drawerContent}
      `)}
    </div>`,
});
SidebarVariant.args = generateProps({
  variant: drawerVariants.sidebar,
});

export const StickyHeaderFooter = (_args, { viewMode }) => ({
  ...storyOptions(viewMode),
  template: `
  <div>
    <gl-button @click="toggle">Toggle Drawer</gl-button>
    ${createSidebarTemplate(`
      <template #title><h2 class="!gl-mb-0 gl-heading-scale-500">List Settings</h2></template>
      ${drawerContent}
      <template #footer>
         Drawer footer
      </template>
    `)}
  </div>`,
});
StickyHeaderFooter.args = generateProps({
  headerSticky: true,
});

export default {
  title: 'base/drawer',
  component: GlDrawer,
  parameters: {
    docs: {
      description: {
        component:
          'See [Pajamas Design System documentation](https://design.khulnasoft.com/components/drawer) for usage and implementation details.',
      },
    },
  },
  argTypes: {
    open: {
      control: false,
    },
    variant: {
      options: Object.keys(drawerVariants),
      control: 'select',
    },
  },
};
