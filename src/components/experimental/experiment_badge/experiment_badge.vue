<script>
import { uniqueId } from 'lodash-es';
import GlBadge from '../../base/badge/badge.vue';
import GlLink from '../../base/link/link.vue';
import GlPopover from '../../base/popover/popover.vue';
import GlSprintf from '../../utilities/sprintf/sprintf.vue';
import { badgeTypeValidator } from './constants';

export const i18n = {
  experiment: {
    BADGE: 'Experiment',
    HELP_PAGE_URL: 'https://docs.khulnasoft.com/policy/development_stages_support/#experiment',
    POPOVER_TITLE: "What's an experiment?",
    POPOVER_CONTENT:
      'An %{linkStart}experiment%{linkEnd} is not yet production-ready, but is released for initial testing and feedback during development.%{line-breakStart}Experiments:%{line-breakEnd} %{bullets}',
    POPOVER_BULLETS: [
      'Might be unstable or cause data loss.',
      'Are not supported and might not be documented.',
      'Could be changed or removed at any time.',
    ],
  },
  beta: {
    BADGE: 'Beta',
    HELP_PAGE_URL: 'https://docs.khulnasoft.com/policy/development_stages_support/#beta',
    POPOVER_TITLE: "What's a beta?",
    POPOVER_CONTENT:
      "A %{linkStart}beta%{linkEnd} feature is not yet production-ready, but is ready for testing and unlikely to change significantly before it's released.%{line-breakStart}Beta features:%{line-breakEnd} %{bullets}",
    POPOVER_BULLETS: [
      'Have a low risk of data loss, but might still be unstable.',
      'Are supported on a commercially-reasonable effort basis.',
      'Have a near complete user experience.',
    ],
  },
};

export default {
  name: 'GlExperimentBadge',
  components: {
    GlBadge,
    GlPopover,
    GlSprintf,
    GlLink,
  },
  props: {
    /**
     * The placement of the popover in relation to the button.
     */
    popoverPlacement: {
      type: String,
      required: false,
      default: 'bottom',
    },
    /**
     * The type of the badge. Can be 'experiment' or 'beta'.
     */
    type: {
      type: String,
      required: false,
      default: 'experiment',
      validator: badgeTypeValidator,
    },
  },
  computed: {
    activeType() {
      return i18n[this.type];
    },
  },
  created() {
    this.triggerId = uniqueId('experiment-badge-');
  },
};
</script>

<template>
  <gl-badge
    :id="triggerId"
    ref="badge"
    href="#"
    class="gl-mx-4 hover:gl-cursor-pointer"
    variant="neutral"
  >
    <span>{{ activeType.BADGE }}</span>
    <gl-popover
      triggers="hover focus click"
      show-close-button
      :placement="popoverPlacement"
      :target="triggerId"
      css-classes="!gl-z-9999"
      :title="activeType.POPOVER_TITLE"
    >
      <gl-sprintf :message="activeType.POPOVER_CONTENT">
        <template #link="{ content }">
          <gl-link :href="activeType.HELP_PAGE_URL" target="_blank" class="!gl-text-sm">
            {{ content }}</gl-link
          >
        </template>
        <template #bullets>
          <ul class="gl-mb-0 gl-pl-5">
            <li v-for="(item, i) in activeType.POPOVER_BULLETS" :key="`li-${i}`">
              {{ item }}
            </li>
          </ul>
        </template>
        <template #line-break="{ content }">
          <span class="gl-mb-0 gl-mt-5 gl-block">{{ content }}</span>
        </template>
      </gl-sprintf>
    </gl-popover>
  </gl-badge>
</template>
