import GlCard from './card.vue';

const generateProps = ({
  headerClass,
  bodyClass,
  footerClass,
  headerContent = 'This is a custom header',
  bodyContent = 'Hello World',
  footerContent = 'This is a custom footer',
} = {}) => ({
  headerClass,
  bodyClass,
  footerClass,
  headerContent,
  bodyContent,
  footerContent,
});

const Template = (args, { argTypes }) => ({
  components: { GlCard },
  props: Object.keys(argTypes),
  template: `
      <gl-card :header-class="headerClass" :body-class="bodyClass" :footer-class="footerClass">
        <template v-if="headerContent" #header>
          <h3 class="gl-heading-scale-300 gl-mb-0">{{ headerContent }}</h3>
        </template>
        <template #default>
          {{ bodyContent }}
        </template>
        <template v-if="footerContent" #footer>
          {{ footerContent }}
        </template>
      </gl-card>
    `,
});

export const Default = Template.bind({});
Default.args = generateProps();

export default {
  title: 'base/card',
  component: GlCard,
  parameters: {
    docs: {
      description: {
        component:
          'See [Pajamas Design System documentation](https://design.khulnasoft.com/components/card) for usage and implementation details.',
      },
    },
  },
  argTypes: {
    headerClass: { control: 'text' },
    bodyClass: { control: 'text' },
    footerClass: { control: 'text' },
    headerContent: {
      description:
        'Text content for the card header (wrapped in h3 with gl-my-0 gl-font-heading gl-heading-scale-500 classes)',
    },
    bodyContent: {
      description: 'Plain text content for the card body',
    },
    footerContent: {
      description: 'Plain text content for the card footer',
    },
    header: { control: { disable: true } },
    default: { control: { disable: true } },
    footer: { control: { disable: true } },
  },
};
