<script>
import { isPlainObject } from 'lodash-es';
import { BTab } from '../../../../vendor/bootstrap-vue/src/components/tabs/tab';
import GlBadge from '../../badge/badge.vue';
import { logWarning } from '../../../../utils/utils';

import { DEFAULT_TAB_TITLE_LINK_CLASS } from '../constants';

export default {
  name: 'GlTab',
  components: {
    BTab,
    GlBadge,
  },
  inheritAttrs: false,
  props: {
    /**
     * Additional CSS classes to apply to the tab title link.
     */
    titleLinkClass: {
      type: [String, Array, Object],
      required: false,
      default: '',
    },
    /**
     * Query string parameter value to use when `gl-tabs` `sync-active-tab-with-query-params` prop is set to `true`.
     */
    queryParamValue: {
      type: String,
      required: false,
      default: null,
    },
    /**
     * Display a count badge next to the tab title.
     */
    tabCount: {
      type: Number,
      required: false,
      default: null,
    },
    /**
     * Screen reader text to provide context for the tab count value.
     * Should be the result of calling n__() with the count.
     * Example: :tab-count-sr-text="n__('%d changed file', '%d changed files', count)"
     */
    tabCountSrText: {
      type: String,
      required: false,
      default: null,
    },
  },
  computed: {
    linkClass() {
      const { titleLinkClass } = this;

      if (Array.isArray(titleLinkClass)) {
        return [...titleLinkClass, DEFAULT_TAB_TITLE_LINK_CLASS];
      }
      if (isPlainObject(titleLinkClass)) {
        return { ...titleLinkClass, [DEFAULT_TAB_TITLE_LINK_CLASS]: true };
      }
      return `${titleLinkClass} ${DEFAULT_TAB_TITLE_LINK_CLASS}`.trim();
    },
    hasTabCount() {
      return this.tabCount != null && this.tabCount >= 0;
    },
  },
  created() {
    if (this.hasTabCount && !this.tabCountSrText) {
      logWarning(
        'When using "tab-count", you should also provide "tab-count-sr-text" for screen reader accessibility. Example: :tab-count-sr-text="n__(\'%d item\', \'%d items\', count)"',
        { name: 'GlTab' },
      );
    }
  },
};
</script>

<template>
  <b-tab
    :title="hasTabCount ? null : $attrs.title"
    :title-link-class="linkClass"
    :query-param-value="queryParamValue"
    v-bind="$attrs"
    v-on="$listeners"
  >
    <template v-if="hasTabCount" #title>
      <slot name="title">{{ $attrs.title }}</slot>
      <gl-badge
        class="gl-ml-2"
        variant="neutral"
        aria-hidden="true"
        data-testid="tab-counter-badge"
      >
        {{ tabCount }}
      </gl-badge>
      <span v-if="tabCountSrText" class="gl-sr-only">{{ tabCountSrText }}</span>
    </template>

    <template v-for="slot in Object.keys($scopedSlots)" #[slot]>
      <slot :name="slot"></slot>
    </template>
  </b-tab>
</template>
