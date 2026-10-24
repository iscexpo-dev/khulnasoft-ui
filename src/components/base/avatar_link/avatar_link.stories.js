import GlAvatar from '../avatar/avatar.vue';
import GlAvatarLabeled from '../avatar_labeled/avatar_labeled.vue';
import { avatarSizeOptions, avatarShapeOptions } from '../../../utils/constants';
import avatarPath from '../../../../static/img/avatar_1.png';
import GlAvatarLink from './avatar_link.vue';

const components = { GlAvatarLink, GlAvatar, GlAvatarLabeled };

const generateDefaultProps = ({
  href = 'https://khulnasoft.com/khulnasoft-org/khulnasoft',
  shape = 'circle',
  size = 32,
} = {}) => ({
  href,
  shape,
  size,
});

const generateLabelsProps = ({ label = 'KhulnaSoft User', subLabel = '@khulnasoft-user' } = {}) => ({
  label,
  subLabel,
});

const generateImageProps = ({ src = avatarPath } = {}) => ({
  src,
});

export const Default = (args, { argTypes }) => ({
  components,
  props: Object.keys(argTypes),
  template: `
    <gl-avatar-link target="_blank" :href="href">
      <gl-avatar :src="src" :size="size" :shape="shape" />
    </gl-avatar-link>
    `,
});
Default.args = { ...generateDefaultProps(), ...generateImageProps() };

export const WithLabeledAvatar = (args, { argTypes }) => ({
  components,
  props: Object.keys(argTypes),
  template: `
  <gl-avatar-link target="_blank" :href="href">
    <gl-avatar-labeled :src="src" :size="size" :shape="shape" :label="label" :sub-label="subLabel" />
  </gl-avatar-link>
  `,
});
WithLabeledAvatar.args = {
  ...generateDefaultProps({}),
  ...generateLabelsProps({}),
  ...generateImageProps({}),
};

export const WithNoImageAvatar = (args, { argTypes }) => ({
  components,
  props: Object.keys(argTypes),
  template: `
    <gl-avatar-link target="_blank" :href="href">
      <gl-avatar-labeled :entity-name="label" :label="label" :sub-label="subLabel" :size="size" :shape="shape" />
    </gl-avatar-link>
    `,
});
WithNoImageAvatar.args = { ...generateDefaultProps({}), ...generateLabelsProps({}) };

export default {
  title: 'base/avatar/avatar-link',
  component: GlAvatarLink,
  parameters: {
    docs: {
      description: {
        component:
          'See [Pajamas Design System documentation](https://design.khulnasoft.com/components/avatar) for usage and implementation details.',
      },
    },
  },
  argTypes: {
    shape: {
      options: avatarShapeOptions,
      control: 'select',
    },
    size: {
      options: avatarSizeOptions,
      control: 'select',
    },
  },
};
