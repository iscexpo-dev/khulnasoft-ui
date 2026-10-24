import avatarPath1 from '../../../../static/img/avatar.png';
import avatarPath2 from '../../../../static/img/avatar_pajamas.png';
import { breadCrumbSizeOptions } from '../../../utils/constants';
import GlButton from '../button/button.vue';
import GlBreadcrumb from './breadcrumb.vue';

const template = `
    <gl-breadcrumb
        :items="items"
        :aria-label="ariaLabel"
        :auto-resize="autoResize"
        :size="size"
    />
  `;

const templateWithClipboardButton = `
    <gl-breadcrumb
        :items="items"
        :aria-label="ariaLabel"
        :auto-resize="autoResize"
        :size="size"
        :show-clipboard-button="true"
        clipboardTooltipText="Copy path"
    >
    </gl-breadcrumb>
  `;

const collapsedTemplate = `
  <div style="max-width: 300px">
    <gl-breadcrumb
        :items="items"
        :aria-label="ariaLabel"
        :auto-resize="autoResize"
        :size="size"
    />

    <gl-breadcrumb
        class="gl-mt-4"
        aria-label="Breadcrumbs with copy path button"
        :items="items"
        :auto-resize="autoResize"
        :size="size"
        :show-clipboard-button="true"
        clipboardTooltipText="Copy path"
    />
  </div>
`;

const defaultItems = [
  {
    text: 'First item',
    href: '#',
    avatarPath: avatarPath1,
  },
  {
    text: 'Second item',
    href: '#',
  },
  {
    text: 'Third item',
    href: '#',
    avatarPath: avatarPath2,
  },
  {
    text: 'Fourth item',
    to: { name: 'fourth-item' },
  },
];

const generateProps = ({ items = defaultItems, ariaLabel, size } = {}) => ({
  items,
  ariaLabel,
  size,
});

const Template = (args, { argTypes }) => ({
  components: {
    GlBreadcrumb,
  },
  props: Object.keys(argTypes),
  template,
});

const TemplateWithClipboardButton = (args, { argTypes }) => ({
  components: {
    GlBreadcrumb,
    GlButton,
  },
  props: Object.keys(argTypes),
  template: templateWithClipboardButton,
});
export const Default = Template.bind({});
Default.args = generateProps();

const CollapsedTemplate = (args, { argTypes }) => ({
  components: {
    GlBreadcrumb,
  },
  props: Object.keys(argTypes),
  template: collapsedTemplate,
});

export default {
  title: 'base/breadcrumb',
  component: GlBreadcrumb,
  parameters: {
    docs: {
      description: {
        component:
          'See [Pajamas Design System documentation](https://design.khulnasoft.com/components/breadcrumb) for usage and implementation details.',
      },
    },
  },
  argTypes: {
    size: {
      options: Object.keys(breadCrumbSizeOptions),
      control: 'select',
    },
  },
};

const extraItems = [
  {
    text: 'Fifth item',
    href: '#',
  },
  {
    text: 'Sixth item',
    href: '#',
  },
  {
    text: 'Seventh item',
    href: '#',
  },
  {
    text: 'Eighth item with a really long text to make it even longer',
    href: '#',
  },
];

export const CollapsedItems = CollapsedTemplate.bind({});
CollapsedItems.args = generateProps({ items: [...defaultItems, ...extraItems] });

export const WithClipboardButton = TemplateWithClipboardButton.bind({});
WithClipboardButton.args = generateProps({ items: defaultItems, size: 'sm' });

export const MediumSize = Template.bind({});
MediumSize.args = generateProps({ items: defaultItems, size: 'md' });

export const CollapsedMediumSize = CollapsedTemplate.bind({});
CollapsedMediumSize.args = generateProps({ items: [...defaultItems, ...extraItems], size: 'md' });

export const WithClipboardButtonMediumSize = TemplateWithClipboardButton.bind({});
WithClipboardButtonMediumSize.args = generateProps({ items: defaultItems, size: 'md' });
