import GlAvatar from '../avatar/avatar.vue';
import GlAvatarLink from '../avatar_link/avatar_link.vue';
import { GlTooltipDirective } from '../../../directives/tooltip/tooltip';
import { avatarsInlineSizeOptions } from '../../../utils/constants';
import GlAvatarsInline from './avatars_inline.vue';

const defaultAvatars = [
  { src: './img/avatar_1.png', alt: 'Administrator’s user avatar' },
  { src: './img/avatar_2.png', alt: 'Ops Manager’s user avatar' },
  { src: './img/avatar_3.png', alt: 'Developer’s user avatar' },
  { src: './img/avatar_4.png', alt: 'Business Admin’s user avatar' },
  { src: './img/avatar_5.png', alt: 'Product designer’s user avatar' },
];

const generateProps = (
  avatars = defaultAvatars,
  {
    maxVisible = 2,
    collapsed = true,
    avatarSize = 24,
    badgeTooltipProp = '',
    badgeSrOnlyText = `${avatars.length - maxVisible} additional users`,
  } = {},
) => ({
  maxVisible,
  collapsed,
  avatarSize,
  avatars,
  badgeTooltipProp,
  badgeSrOnlyText,
});

export const Default = (args, { argTypes }) => ({
  components: { GlAvatarsInline },
  props: Object.keys(argTypes),
  template: `
    <gl-avatars-inline :avatars="avatars" :collapsed="collapsed" :avatar-size="avatarSize" :max-visible="maxVisible" :badgeTooltipProp="badgeTooltipProp" :badgeSrOnlyText="badgeSrOnlyText">
    </gl-avatars-inline>
    `,
});
Default.args = generateProps();

export const WithLinksAndTooltips = (args, { argTypes }) => ({
  components: { GlAvatarsInline, GlAvatar, GlAvatarLink },
  directives: { GlTooltip: GlTooltipDirective },
  props: Object.keys(argTypes),
  template: `
    <gl-avatars-inline :avatars="avatars" :collapsed="collapsed" :avatar-size="avatarSize" :max-visible="maxVisible" :badgeTooltipProp="badgeTooltipProp" :badgeSrOnlyText="badgeSrOnlyText">
      <template #avatar="{ avatar }">
        <gl-avatar-link target="_blank" :href="avatar.href" v-gl-tooltip :title="avatar.tooltip">
          <gl-avatar :src="avatar.src" :size="avatarSize" />
        </gl-avatar-link>
      </template>
    </gl-avatars-inline>
    `,
});
WithLinksAndTooltips.args = generateProps(
  defaultAvatars.map((avatar, index) => ({
    ...avatar,
    href: '//khulnasoft.com',
    tooltip: `Avatar ${index}`,
  })),
  { badgeTooltipProp: 'tooltip', badgeSrOnlyText: 'screen reader only text' },
);

export default {
  title: 'base/avatar/avatars-inline',
  component: GlAvatarsInline,
  parameters: {
    docs: {
      description: {
        component:
          'See [Pajamas Design System documentation](https://design.khulnasoft.com/components/avatar) for usage and implementation details.',
      },
    },
  },
  argTypes: {
    avatarSize: {
      options: avatarsInlineSizeOptions,
      control: 'select',
    },
  },
};
