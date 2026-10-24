import customIllustrationPath from '@gitlab/svgs/dist/illustrations/status/status-success-sm.svg';
import illustrationsSpriteInfo from '@gitlab/svgs/dist/illustrations.json';
import GlButton from '../button/button.vue';
import { bannerVariants } from '../../../utils/constants';
import GlBanner from './banner.vue';

const template = `
    <gl-banner
      :title="title"
      :button-text="buttonText"
      :button-link="buttonLink"
      :svg-path="svgPath"
      :illustration-name="illustrationName"
      :variant="variant"
    >
      <p>KhulnaSoft Service Desk is a simple way to allow people to create issues in your KhulnaSoft instance without needing their own user account. It provides a unique email address for end users to create issues in a project, and replies can be sent either though the KhulnaSoft interface or by email. End users will only see the thread though email.</p>
    </gl-banner>
`;

const generateProps = ({
  title = 'Upgrade your plan to activate Service Desk',
  buttonText = 'Upgrade your plan',
  buttonLink = 'https://khulnasoft.com',
  svgPath = customIllustrationPath,
  illustrationName = 'service-desk-sm',
  variant = GlBanner.props.variant.default,
} = {}) => ({
  title,
  buttonText,
  buttonLink,
  svgPath,
  illustrationName,
  variant,
});

const Template = (args, { argTypes }) => ({
  components: {
    GlBanner,
  },
  props: Object.keys(argTypes),
  template,
});
export const Default = Template.bind({});
Default.args = generateProps();

export const NoImage = Template.bind({});
NoImage.args = generateProps({
  svgPath: null,
  illustrationName: null,
});

export const CustomIllustration = Template.bind({});
CustomIllustration.args = generateProps({
  svgPath: customIllustrationPath,
  illustrationName: null,
});

export const Introduction = Template.bind({});
Introduction.args = generateProps({
  illustrationName: 'service-desk-sm',
  variant: bannerVariants[1],
});

export const WithActions = (args, { argTypes }) => ({
  components: {
    GlBanner,
    GlButton,
  },
  props: Object.keys(argTypes),
  template: `
    <gl-banner
      :title="title"
      :button-text="buttonText"
      :button-link="buttonLink"
      :svg-path="svgPath"
      :illustration-name="illustrationName"
      :variant="variant"
    >
      <p>There should be a primary button and a link button below this text.</p>
      <template #actions>
        <gl-button class="gl-ml-3" variant="link">Ask again later</gl-button>
      </template>
    </gl-banner>`,
});
WithActions.args = generateProps({
  title: 'Button with actions banner',
  buttonText: 'Primary Button',
  svgPath: null,
  illustrationName: null,
});

export default {
  title: 'base/banner',
  component: GlBanner,
  parameters: {
    controls: {
      exclude: ['buttonAttributes'],
    },
    docs: {
      description: {
        component:
          'See [Pajamas Design System documentation](https://design.khulnasoft.com/components/banner) for usage and implementation details.',
      },
    },
  },
  argTypes: {
    variant: {
      options: bannerVariants,
      control: 'select',
    },
    svgPath: {
      control: 'text',
    },
    illustrationName: {
      options: illustrationsSpriteInfo.icons.map((obj) => obj.name),
      control: 'select',
    },
  },
};
