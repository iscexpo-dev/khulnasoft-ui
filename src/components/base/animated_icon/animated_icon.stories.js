import GlButton from '../button/button.vue';
import { animatedIconVariantOptions } from '../../../utils/constants';
import GlBaseAnimatedIcon from './base_animated_icon.vue';
import GlAnimatedChevronRightDownIcon from './animated_chevron_right_down_icon.vue';
import GlAnimatedChevronLgRightDownIcon from './animated_chevron_lg_right_down_icon.vue';
import GlAnimatedChevronDownUpIcon from './animated_chevron_down_up_icon.vue';
import GlAnimatedChevronLgDownUpIcon from './animated_chevron_lg_down_up_icon.vue';
import GlAnimatedDuoChatIcon from './animated_duo_chat_icon.vue';
import GlAnimatedLoaderIcon from './animated_loader_icon.vue';
import GlAnimatedNotificationIcon from './animated_notifications_icon.vue';
import GlAnimatedSidebarIcon from './animated_sidebar_icon.vue';
import GlAnimatedSmileIcon from './animated_smile_icon.vue';
import GlAnimatedSortIcon from './animated_sort_icon.vue';
import GlAnimatedStarIcon from './animated_star_icon.vue';
import GlAnimatedTodoIcon from './animated_todo_icon.vue';
import GlAnimatedUploadIcon from './animated_upload_icon.vue';

const MorphTemplate = (args, { argTypes }) => ({
  components: {
    GlButton,
    GlAnimatedChevronRightDownIcon,
    GlAnimatedChevronLgRightDownIcon,
    GlAnimatedChevronDownUpIcon,
    GlAnimatedChevronLgDownUpIcon,
    GlAnimatedNotificationIcon,
    GlAnimatedSidebarIcon,
    GlAnimatedSmileIcon,
    GlAnimatedSortIcon,
    GlAnimatedStarIcon,
    GlAnimatedTodoIcon,
  },
  props: Object.keys(argTypes),
  data() {
    return {
      animationsOn: false,
    };
  },
  template: `
  <div class="gl-flex gl-gap-5 gl-flex-wrap hover:gl-cursor-pointer gl-select-none" @click="animationsOn = !animationsOn">
    <div class="gl-p-4 gl-border gl-rounded-default gl-flex gl-flex-col gl-items-center gl-gap-2">
      <gl-animated-todo-icon :variant="variant" :aria-label="ariaLabel" name="todo" :isOn="animationsOn" />
      todo
    </div>
    <div class="gl-p-4 gl-border gl-rounded-default gl-flex gl-flex-col gl-items-center gl-gap-2">
      <gl-animated-star-icon :variant="variant" :aria-label="ariaLabel" name="star" :isOn="animationsOn" />
      star
    </div>
    <div class="gl-p-4 gl-border gl-rounded-default gl-flex gl-flex-col gl-items-center gl-gap-2">
      <gl-animated-sort-icon :variant="variant" :aria-label="ariaLabel" name="sort" :isOn="animationsOn" />
      sort
    </div>
    <div class="gl-p-4 gl-border gl-rounded-default gl-flex gl-flex-col gl-items-center gl-gap-2">
      <gl-animated-smile-icon :variant="variant" :aria-label="ariaLabel" name="smile" :isOn="animationsOn" />
      smile
    </div>
    <div class="gl-p-4 gl-border gl-rounded-default gl-flex gl-flex-col gl-items-center gl-gap-2">
      <gl-animated-sidebar-icon :variant="variant" :aria-label="ariaLabel" name="sidebar" :isOn="animationsOn" />
      sidebar
    </div>
    <div class="gl-py-4 gl-px-5 gl-border gl-rounded-default gl-flex gl-flex-col gl-items-center gl-gap-2">
      <gl-animated-notification-icon :variant="variant" :aria-label="ariaLabel" name="notifications" :isOn="animationsOn" />
      notifications
    </div>
    <div class="gl-p-4 gl-border gl-rounded-default gl-flex gl-flex-col gl-items-center gl-gap-2">
      <gl-animated-chevron-right-down-icon :variant="variant" :aria-label="ariaLabel" name="chevron_right_down" :isOn="animationsOn" />
      chevron-right-down
    </div>
    <div class="gl-p-4 gl-border gl-rounded-default gl-flex gl-flex-col gl-items-center gl-gap-2">
      <gl-animated-chevron-lg-right-down-icon :variant="variant" :aria-label="ariaLabel" name="chevron_lg_right_down" :isOn="animationsOn" />
      chevron-lg-right-down
    </div>
    <div class="gl-p-4 gl-border gl-rounded-default gl-flex gl-flex-col gl-items-center gl-gap-2">
      <gl-animated-chevron-down-up-icon :variant="variant" :aria-label="ariaLabel" name="chevron_down_up" :isOn="animationsOn" />
      chevron-down-up
    </div>
    <div class="gl-p-4 gl-border gl-rounded-default gl-flex gl-flex-col gl-items-center gl-gap-2">
      <gl-animated-chevron-lg-down-up-icon :variant="variant" :aria-label="ariaLabel" name="chevron_lg_down_up" :isOn="animationsOn" />
      chevron-lg-down-up
    </div>
  </div>`,
});

export const Morph = MorphTemplate.bind({});

const InfiniteTemplate = (args, { argTypes }) => ({
  components: {
    GlButton,
    GlAnimatedDuoChatIcon,
    GlAnimatedLoaderIcon,
    GlAnimatedUploadIcon,
  },
  props: Object.keys(argTypes),
  data() {
    return {
      animationsOn: false,
    };
  },
  template: `
  <div class="gl-flex gl-gap-5 gl-flex-wrap gl-select-none">
    <div class="gl-py-4 gl-px-5 gl-border gl-rounded-default gl-flex gl-flex-col gl-items-center gl-gap-2" @mouseenter="animationsOn = true" @mouseleave="animationsOn = false">
      <gl-animated-upload-icon :variant="variant" :aria-label="ariaLabel" name="upload" :isOn="animationsOn" />
      upload
    </div>
    <div class="gl-py-4 gl-px-5 gl-border gl-rounded-default gl-flex gl-flex-col gl-items-center gl-gap-2" @mouseenter="animationsOn = true" @mouseleave="animationsOn = false">
      <gl-animated-duo-chat-icon :variant="variant" :aria-label="ariaLabel" name="duo_chat" :isOn="animationsOn" />
      duo-chat
    </div>
    <div class="gl-py-4 gl-px-5 gl-border gl-rounded-default gl-flex gl-flex-col gl-items-center gl-gap-2" @mouseenter="animationsOn = true" @mouseleave="animationsOn = false">
      <gl-animated-loader-icon :variant="variant" :aria-label="ariaLabel" name="loader" :isOn="animationsOn" />
      loader
    </div>
  </div>`,
});

export const Infinite = InfiniteTemplate.bind({});

export default {
  title: 'base/animated-icon',
  tags: ['skip-visual-test'],
  component: GlBaseAnimatedIcon,
  parameters: {
    docs: {
      description: {
        component:
          'See [Pajamas Design System documentation](https://design.khulnasoft.com/product-foundations/iconography-animated) for usage and implementation details.',
      },
    },
  },
  argTypes: {
    isOn: {
      control: { disable: true },
    },
    ariaLabel: {
      control: { disable: true },
    },
    variant: {
      options: Object.keys(animatedIconVariantOptions),
      control: 'select',
    },
  },
};
