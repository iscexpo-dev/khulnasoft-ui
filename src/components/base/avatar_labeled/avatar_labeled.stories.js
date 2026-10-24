import Vue from 'vue';
import GlBadge from '../badge/badge.vue';
import GlButton from '../button/button.vue';
import GlIcon from '../icon/icon.vue';
import { GlTooltipDirective } from '../../../directives/tooltip/tooltip';
import { avatarSizeOptions, avatarShapeOptions, tooltipPlacements } from '../../../utils/constants';
import avatarPath from '../../../../static/img/avatar_1.png';
import GlAvatarLabeled from './avatar_labeled.vue';

Vue.directive('gl-tooltip', GlTooltipDirective);

const components = { GlAvatarLabeled };

const generateProps = ({
  label = 'KhulnaSoft User',
  subLabel = '@khulnasoft-user',
  size = 32,
  shape = 'circle',
  src = avatarPath,
  inlineLabels = false,
  labelLink,
} = {}) => ({
  label,
  subLabel,
  size,
  shape,
  src,
  inlineLabels,
  labelLink,
});

const generateTooltipProps = ({ tooltipText = 'Avatar tooltip', placement = 'top' } = {}) => ({
  tooltipText,
  placement,
});

export const Default = (args, { argTypes }) => ({
  components,
  props: Object.keys(argTypes),
  template: `
      <gl-avatar-labeled
        :shape="shape"
        :size="size"
        :src="src"
        :label="label"
        :sub-label="subLabel"
      />
    `,
});
Default.args = generateProps();

export const WithInlineLabels = (args, { argTypes }) => ({
  components,
  props: Object.keys(argTypes),
  template: `
      <gl-avatar-labeled
        :shape="shape"
        :size="size"
        :src="src"
        :label="label"
        :sub-label="subLabel"
        :inline-labels="inlineLabels"
      />
    `,
});
WithInlineLabels.args = generateProps({ inlineLabels: true });

export const WithTooltip = (args, { argTypes }) => ({
  components,
  props: Object.keys(argTypes),
  template: `
      <gl-avatar-labeled
        :shape="shape"
        :size="size"
        :src="src"
        :label="label"
        :sub-label="subLabel"
        :title="tooltipText"
        v-gl-tooltip="{ placement }"
      />
    `,
});
WithTooltip.args = { ...generateProps(), ...generateTooltipProps() };
WithTooltip.argTypes = {
  placement: {
    options: tooltipPlacements,
    control: 'select',
  },
};

export const WithBadges = (args, { argTypes }) => ({
  components: { GlAvatarLabeled, GlBadge },
  props: Object.keys(argTypes),
  template: `
      <gl-avatar-labeled
        :shape="shape"
        :size="size"
        :src="src"
        :label="label"
        :sub-label="subLabel"
      >
        <template #meta>
          <div class="gl-p-1">
            <gl-badge class="!gl-flex" variant="info">2FA</gl-badge>
          </div>
          <div class="gl-p-1">
            <gl-badge class="!gl-flex" variant="danger">Blocked</gl-badge>
          </div>
        </template>
      </gl-avatar-labeled>
    `,
});
WithBadges.args = generateProps();

export const WithDefaultSlot = (args, { argTypes }) => ({
  components: { GlAvatarLabeled, GlButton },
  props: Object.keys(argTypes),
  template: `
      <gl-avatar-labeled
        :shape="shape"
        :size="size"
        :src="src"
        :label="label"
        :sub-label="subLabel"
      >
        <template>
          <gl-button class="gl-mt-3 gl-self-start" size="small">Follow</gl-button>
        </template>
      </gl-avatar-labeled>
    `,
});
WithDefaultSlot.args = generateProps({ size: 64 });

export const WithLinks = (args, { argTypes }) => ({
  components: { GlAvatarLabeled, GlBadge, GlIcon },
  props: Object.keys(argTypes),
  template: `
      <gl-avatar-labeled
        :shape="shape"
        :size="size"
        :label-link="labelLink"
        :src="src"
        :label="label"
      >
        <template #meta>
          <gl-icon
            v-gl-tooltip="'Public - The project can be accessed without any authentication.'"
            name="earth"
            variant="subtle"
            class="gl-ml-2"
          />
        </template>
        <div class="gl-max-w-75">
          <p class="gl-mb-0 gl-mt-2 gl-text-sm">KhulnaSoft is an open source end-to-end software development platform with built-in version control, issue tracking, code review, CI/CD, and more. Self-host KhulnaSoft on your own servers, in a container, or on a cloud provider.</p>
        </div>
      </gl-avatar-labeled>
    `,
});
WithLinks.args = generateProps({
  src: './img/avatar.png',
  size: 48,
  shape: 'rect',
  label: 'KhulnaSoft.org / KhulnaSoft',
  subLabel: '',
  labelLink: 'https://khulnasoft.com/khulnasoft-org/khulnasoft',
});

export default {
  title: 'base/avatar/labeled',
  component: GlAvatarLabeled,
  parameters: {
    docs: {
      description: {
        component:
          'See [Pajamas Design System documentation](https://design.khulnasoft.com/components/avatar) for usage and implementation details.',
      },
    },
  },
  argTypes: {
    size: {
      options: avatarSizeOptions,
      control: 'select',
    },
    shape: {
      options: avatarShapeOptions,
      control: 'select',
    },
  },
};
