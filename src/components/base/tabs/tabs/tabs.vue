<script>
import { BTabs } from '../../../../vendor/bootstrap-vue/src/components/tabs/tabs';
import { tabsButtonDefaults } from '../../../../utils/constants';
import GlButton from '../../button/button.vue';

const validatorHelper = (obj) =>
  Object.keys(obj).every((val) => val === 'text' || val === 'attributes');

export default {
  name: 'GlTabs',
  components: {
    BTabs,
    GlButton,
  },
  inheritAttrs: false,
  props: {
    /**
     * Configuration for the primary action button in the tabs.
     */
    actionPrimary: {
      type: Object,
      required: false,
      default: null,
      validator: (obj) => validatorHelper(obj),
    },
    /**
     * Configuration for the secondary action button in the tabs.
     */
    actionSecondary: {
      type: Object,
      required: false,
      default: null,
      validator: (obj) => validatorHelper(obj),
    },
    /**
     * Configuration for the tertiary action button in the tabs.
     */
    actionTertiary: {
      type: Object,
      required: false,
      default: null,
      validator: (obj) => validatorHelper(obj),
    },
    /**
     * Additional CSS classes to apply to the tab content area.
     */
    contentClass: {
      type: [String, Array, Object],
      required: false,
      default: null,
    },
    /**
     * Additional CSS classes to apply to the tab navigation.
     */
    navClass: {
      type: [String, Array, Object],
      required: false,
      default: null,
    },
    /**
     * When true, makes the tabs stretch to fill the available width.
     */
    justified: {
      type: Boolean,
      required: false,
      default: false,
    },
    /**
     * Sync active tab with query string parameters. Allows for deep linking into specific tabs.
     */
    syncActiveTabWithQueryParams: {
      type: Boolean,
      required: false,
      default: false,
    },
    /**
     * Name to use for query string parameter.
     */
    queryParamName: {
      type: String,
      required: false,
      default: 'tab',
    },
    /**
     * The currently active tab value.
     */
    value: {
      type: Number,
      required: false,
      default: 0,
    },
  },
  data() {
    return {
      activeTabIndex: 0,
    };
  },
  computed: {
    hasActions() {
      return [this.actionPrimary, this.actionSecondary, this.actionTertiary].some(Boolean);
    },
    listeners() {
      return {
        ...this.$listeners,
        input: this.handleInput,
      };
    },
  },
  watch: {
    value: {
      handler(newValue) {
        if (this.activeTabIndex !== newValue) {
          this.activeTabIndex = newValue;
        }
      },
      immediate: true,
    },
  },
  mounted() {
    if (this.syncActiveTabWithQueryParams) {
      this.syncActiveTabFromQueryParams();
      window.addEventListener('popstate', this.syncActiveTabFromQueryParams);
    }

    // Because we are manually binding `value` attribute to `b-tabs` the `input`
    // event is no longer automatically fired when the component is mounted.
    // To maintain parity with original `b-tabs` functionality
    // we manually fire the `input` event when the component is mounted.
    this.$emit('input', this.activeTabIndex);
  },
  destroyed() {
    window.removeEventListener('popstate', this.syncActiveTabFromQueryParams);
  },
  methods: {
    buttonBinding(prop, name) {
      if (!prop.attributes) {
        return tabsButtonDefaults[name];
      }
      return prop.attributes;
    },
    primary() {
      this.$emit('primary');
    },
    secondary() {
      this.$emit('secondary');
    },
    tertiary() {
      this.$emit('tertiary');
    },
    /**
     * When the query parameter is updated, update the active tab to match.
     */
    async syncActiveTabFromQueryParams() {
      await this.$nextTick();
      const queryParamValue = this.getQueryParamValue();
      const tabIndexToActivate = this.getTabs().findIndex(
        (tab, tabIndex) => this.getTabQueryParamValue(tabIndex) === queryParamValue,
      );
      this.activeTabIndex = tabIndexToActivate !== -1 ? tabIndexToActivate : 0;
    },

    /**
     * Returns a list of all <b-tab> instances associated with this tab control.
     */
    getTabs() {
      return this.$refs.bTabs.getTabs();
    },

    /**
     * Get the value of the query param as defined by the `queryParamName` prop.
     */
    getQueryParamValue() {
      const searchParams = new URLSearchParams(window.location.search);

      return searchParams.get(this.queryParamName);
    },

    /**
     * Set the value of the query param as defined by the `queryParamName` prop.
     * This method does nothing if the query param is already up to date.
     */
    setQueryParamValueIfNecessary(tabIndex) {
      const currentQueryParamValue = this.getQueryParamValue();
      const newQueryParamValue = this.getTabQueryParamValue(tabIndex);

      // If the current query parameter is already up-to-date,
      // avoid creating a duplicate history entry.
      if (
        (tabIndex === 0 && !currentQueryParamValue) ||
        (tabIndex !== 0 && currentQueryParamValue === newQueryParamValue)
      ) {
        return;
      }

      const searchParams = new URLSearchParams(window.location.search);
      searchParams.set(this.queryParamName, newQueryParamValue);

      window.history.pushState({}, '', `${window.location.pathname}?${searchParams.toString()}`);
    },

    /**
     * Returns the query param value for a tab.
     * Defaults to the tab index unless the `query-param-value` attribute is set.
     */
    getTabQueryParamValue(tabIndex) {
      const tab = this.getTabs()[tabIndex];

      return tab?.$attrs['query-param-value'] || tabIndex.toString();
    },

    /**
     * Event handler for `input` event.
     */
    handleInput(tabIndex) {
      this.$emit('input', tabIndex);
      this.activeTabIndex = tabIndex;

      if (this.syncActiveTabWithQueryParams) {
        this.setQueryParamValueIfNecessary(tabIndex);
      }
    },
  },
};
</script>

<template>
  <b-tabs
    ref="bTabs"
    :no-nav-style="true"
    :no-fade="true"
    active-nav-item-class="gl-tab-nav-item-active"
    :content-class="[contentClass, 'gl-tab-content']"
    nav-wrapper-class="gl-tabs-wrapper"
    :nav-class="[navClass, 'gl-tabs-nav']"
    :justified="justified"
    :value="activeTabIndex"
    class="gl-tabs"
    v-bind="$attrs"
    v-on="listeners"
  >
    <template v-for="slot in Object.keys($slots)" #[slot]>
      <slot :name="slot"></slot>
    </template>

    <template v-if="hasActions" #toolbar-start>
      <div role="toolbar" data-testid="actions-tabs-start" class="gl-actions-tabs-start">
        <gl-button
          v-if="actionPrimary"
          data-testid="action-primary"
          v-bind="buttonBinding(actionPrimary, 'actionPrimary')"
          @click="primary"
        >
          {{ actionPrimary.text }}
        </gl-button>
        <gl-button
          v-if="actionSecondary"
          data-testid="action-secondary"
          v-bind="buttonBinding(actionSecondary, 'actionSecondary')"
          @click="secondary"
        >
          {{ actionSecondary.text }}
        </gl-button>
        <gl-button
          v-if="actionTertiary"
          data-testid="action-tertiary"
          v-bind="buttonBinding(actionTertiary, 'actionTertiary')"
          @click="tertiary"
        >
          {{ actionTertiary.text }}
        </gl-button>
      </div>
    </template>
    <template v-if="hasActions" #toolbar-end>
      <div role="toolbar" data-testid="actions-tabs-end" class="gl-actions-tabs-end">
        <gl-button
          v-if="actionPrimary"
          data-testid="action-primary"
          v-bind="buttonBinding(actionPrimary, 'actionPrimary')"
          @click="primary"
        >
          {{ actionPrimary.text }}
        </gl-button>
        <gl-button
          v-if="actionSecondary"
          data-testid="action-secondary"
          v-bind="buttonBinding(actionSecondary, 'actionSecondary')"
          @click="secondary"
        >
          {{ actionSecondary.text }}
        </gl-button>
        <gl-button
          v-if="actionTertiary"
          data-testid="action-tertiary"
          v-bind="buttonBinding(actionTertiary, 'actionTertiary')"
          @click="tertiary"
        >
          {{ actionTertiary.text }}
        </gl-button>
      </div>
    </template>
  </b-tabs>
</template>
