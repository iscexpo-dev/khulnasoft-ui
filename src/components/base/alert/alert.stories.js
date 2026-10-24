import GlToggle from '../toggle/toggle.vue';
import { alertVariantOptions } from '../../../utils/constants';
import { propDefaultFactory } from '../../../utils/stories_utils';
import GlAlert from './alert.vue';

const template = `
  <gl-alert
    :title="title"
    :dismissible="dismissible"
    :dismiss-label="dismissLabel"
    :variant="variant"
    :primary-button-text="primaryButtonText"
    :secondary-button-text="secondaryButtonText"
    :primary-button-link="primaryButtonLink"
    :secondary-button-link="secondaryButtonLink"
    :sticky="sticky"
    :header-level="headerLevel"
  >{{ message }}</gl-alert>`;

const defaultValue = propDefaultFactory(GlAlert);

const generateProps = ({
  title = defaultValue('title'),
  variant = defaultValue('variant'),
  dismissible = defaultValue('dismissible'),
  dismissLabel = defaultValue('dismissLabel'),
  primaryButtonText = defaultValue('primaryButtonText'),
  primaryButtonLink = defaultValue('primaryButtonLink'),
  secondaryButtonText = defaultValue('secondaryButtonText'),
  secondaryButtonLink = defaultValue('secondaryButtonLink'),
  sticky = defaultValue('sticky'),
  headerLevel = defaultValue('headerLevel'),
} = {}) => ({
  title,
  message: 'Lorem ipsum dolor sit amet',
  variant,
  dismissible,
  dismissLabel,
  primaryButtonText,
  primaryButtonLink,
  secondaryButtonText,
  secondaryButtonLink,
  sticky,
  headerLevel,
});

const Template = (args, { argTypes }) => ({
  components: { GlAlert },
  props: Object.keys(argTypes),
  template,
});

export const Default = Template.bind({});
Default.args = generateProps();

export const TitledWarning = Template.bind({});
TitledWarning.args = generateProps({
  title: 'A warning',
  variant: alertVariantOptions.warning,
});

export const UndismissibleDangerWithActions = Template.bind({});
UndismissibleDangerWithActions.args = generateProps({
  variant: alertVariantOptions.danger,
  dismissible: false,
  primaryButtonText: 'Primary action',
  secondaryButtonText: 'Secondary action',
  secondaryButtonLink: '#',
});

export const CustomActions = () => ({
  components: { GlAlert, GlToggle },
  data: () => ({
    toggle: false,
  }),
  template: `
    <gl-alert>
      Lorem ipsum dolor sit amet
      <template #actions>
        <gl-toggle v-model="toggle" label="label-name" label-position="hidden" />
      </template>
    </gl-alert>`,
});
CustomActions.tags = ['skip-visual-test'];

export const TextLinks = () => ({
  components: { GlAlert },
  template: `
    <gl-alert>
      Lorem ipsum dolor sit <a class="gl-link" href="#">text link</a> amet
    </gl-alert>`,
});
TextLinks.tags = ['skip-visual-test'];

export const Variants = () => ({
  components: { GlAlert },
  variants: alertVariantOptions,
  template: `
  <div>
    <gl-alert
      v-for="variant in $options.variants"
      :key="variant"
      :variant="variant"
      title="Alert title"
      primary-button-text="Primary"
      secondary-button-text="Secondary"
      class="gl-mb-5"
    >
      <span class="gl-capitalize">{{ variant }}</span> lorem ipsum dolor sit
      <gl-link href="#">text link</gl-link> amet
    </gl-alert>
  </div>`,
});
Variants.tags = ['skip-visual-test'];

export const Sticky = () => ({
  components: { GlAlert },
  variants: alertVariantOptions,
  data: () => generateProps({ sticky: true }),
  template: `
  <div style="max-height: 200px; overflow-y: auto;">
    ${template}
    <div style="height: 200px;" class="gl-bg-red-100 gl-my-3"><p>Scrolling content…</p></div>
    <div style="height: 200px;" class="gl-bg-green-100 gl-my-3"><p>Scrolling content…</p></div>
    <div style="height: 200px;" class="gl-bg-blue-100 gl-my-3"><p>Scrolling content…</p></div>
  </div>`,
});

export const IncreasedSpacing = (args, { argTypes }) => ({
  components: { GlAlert },
  props: Object.keys(argTypes),
  template: `
    <div style="--gl-alert-padding-x: 0.5rem;">
      <gl-alert>
        Lorem ipsum dolor sit <a class="gl-link" href="#">text link</a> amet
      </gl-alert>
    </div>`,
});
IncreasedSpacing.args = generateProps();

export const Focused = () => ({
  components: { GlAlert },
  mounted() {
    this.$nextTick(() => {
      this.$refs.alert.focus();
    });
  },
  template: `
    <gl-alert ref="alert" variant="danger">
      Lorem ipsum dolor sit amet
    </gl-alert>
  `,
});
Focused.parameters = {
  controls: {
    // Hide all controls, as this story is used as a visual test only.
    exclude: /.*/,
  },
};

export default {
  title: 'base/alert',
  component: GlAlert,
  parameters: {
    docs: {
      description: {
        component:
          'See [Pajamas Design System documentation](https://design.khulnasoft.com/components/alert) for usage and implementation details.',
      },
    },
  },
  argTypes: {
    variant: {
      options: alertVariantOptions,
      control: 'select',
    },
  },
};
