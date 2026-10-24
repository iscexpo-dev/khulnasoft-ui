import Vue from 'vue';
import { GlTooltipDirective } from '../../../directives/tooltip/tooltip';
import { avatarSizeOptions, avatarShapeOptions, tooltipPlacements } from '../../../utils/constants';
import GlAvatar from './avatar.vue';

Vue.directive('gl-tooltip', GlTooltipDirective);

const components = { GlAvatar };

const generateImageProps = ({ size = 64, shape = 'circle' } = {}) => ({
  size,
  shape,
});

const generateProjectFallbackProps = ({
  size = 64,
  entityId = 123,
  entityName = 'Some Project',
} = {}) => ({
  entityId,
  entityName,
  size,
});

const generateEmojiProjectProps = ({
  size = 64,
  entityId = 123,
  entityName = '🦊Tanuki',
} = {}) => ({
  entityId,
  entityName,
  size,
});

const generateTooltipProps = ({ tooltipText = 'Avatar tooltip', placement = 'top' } = {}) => ({
  tooltipText,
  placement,
});

const template = `
<gl-avatar
  :entity-name="entityName"
  :entity-id="entityId"
  :size="size"
  shape="rect" />
`;

export const Image = (args, { argTypes }) => ({
  components,
  props: Object.keys(argTypes),
  template: `
      <gl-avatar
        :size="size"
        :shape="shape"
        src="./img/avatar_1.png"
      />
    `,
});
Image.args = generateImageProps();

export const NonSquareImage = (args, { argTypes }) => ({
  components,
  props: Object.keys(argTypes),
  template: `
      <gl-avatar
        :size="size"
        shape="rect"
        src="./img/avatar_non_square.jpg"
      />
    `,
});
NonSquareImage.args = generateImageProps();

export const ResponsiveImage = (args, { argTypes }) => ({
  components,
  props: Object.keys(argTypes),
  template: `
      <gl-avatar
        :size="size"
        :shape="shape"
        src="./img/avatar_1.png"
      />
    `,
});
ResponsiveImage.args = generateImageProps({ size: { default: 24, sm: 32, md: 48, lg: 96 } });
ResponsiveImage.argTypes = {
  size: { control: 'object' },
};

export const ProjectFallback = (args, { argTypes }) => ({
  components,
  props: Object.keys(argTypes),
  template,
});
ProjectFallback.args = generateProjectFallbackProps();

export const EmojiProjectName = (args, { argTypes }) => ({
  components,
  props: Object.keys(argTypes),
  template,
});
EmojiProjectName.args = generateEmojiProjectProps();

export const WithTooltip = (args, { argTypes }) => ({
  components,
  props: Object.keys(argTypes),
  template: `
      <gl-avatar
        :size="size"
        :shape="shape"
        :title="tooltipText"
        src="./img/avatar_1.png"
        v-gl-tooltip="{ placement }"
      />
    `,
});
WithTooltip.args = { ...generateImageProps(), ...generateTooltipProps() };

export const FallbackOnAvatarLoadFailure = (args, { argTypes }) => ({
  components,
  props: Object.keys(argTypes),
  template: `
      <gl-avatar
        :entity-name="entityName"
        :entity-id="entityId"
        :size="size"
        :fallback-on-error="true"
        src="someproject.jpg"
        alt="Some Project"
      />
    `,
});
FallbackOnAvatarLoadFailure.args = { ...generateProjectFallbackProps(), ...generateImageProps() };

export const AllSizes = () => ({
  components,
  data() {
    return {
      avatarSizeOptions,
    };
  },
  template: `
    <div class="gl-flex gl-flex-col gl-gap-3">
      <div class="gl-flex gl-gap-3 gl-items-center">
        <gl-avatar
          v-for="size in avatarSizeOptions"
          :key="size"
          :size="size"
          shape="rect"
          src="./img/avatar_pajamas.png"
        />
      </div>
      <div class="gl-flex gl-gap-3 gl-items-center">
        <gl-avatar
          v-for="size in avatarSizeOptions"
          :key="size"
          :size="size"
          shape="circle"
          src="./img/avatar_1.png"
        />
      </div>
      <div class="gl-flex gl-gap-3 gl-items-center">
        <gl-avatar
          v-for="size in avatarSizeOptions"
          :key="size"
          :size="size"
          shape="rect"
          :entity-id="0"
          entity-name="A"
        />
      </div>
      <div class="gl-flex gl-gap-3 gl-items-center">
        <gl-avatar
          v-for="size in avatarSizeOptions"
          :key="size"
          :size="size"
          shape="circle"
          :entity-id="0"
          entity-name="A"
        />
      </div>
    </div>
  `,
});

export const AllIdenticons = () => ({
  components,
  template: `
    <div class="gl-flex gl-gap-2">
      <gl-avatar
        v-for="i in [0,1,2,3,4,5,6]"
        :entity-id="i"
        :entity-name="i.toString()"
        shape="rect"
      />
    </div>
  `,
});

export default {
  title: 'base/avatar',
  component: GlAvatar,
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
    placement: {
      options: tooltipPlacements,
      control: 'select',
    },
  },
};
