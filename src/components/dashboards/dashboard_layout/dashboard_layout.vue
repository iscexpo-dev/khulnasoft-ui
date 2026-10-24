<script>
import GridLayout from "./grid_layout/grid_layout.vue";
import { dashboardConfigValidator } from "./validators";

/**
 * The `DashboardLayout` component provides an easy way to render dashboards using a configuration, aligning with our [Pajamas guidelines](https://design.khulnasoft.com/patterns/dashboards).
 */
export default {
  name: "GlDashboardLayout",
  components: {
    GridLayout,
  },
  props: {
    /**
     * The dashboard configuration object.
     *
     * @typedef {Object} Dashboard
     * @property {string} title - The dashboard title to render. Expected if no #title or #header slot is provided.
     * @property {string} description - Optional: The dashboard description to render.
     * @property {DashboardGrid} panels - Optional: The grid configuration.
     * @see GridLayout.vue
     *
     * @type {Dashboard}
     */
    config: {
      type: Object,
      required: true,
      validator: dashboardConfigValidator,
    },
    /**
     * Set to `false` to enable user-driven modification of the grid layout.
     */
    isStaticGrid: {
      type: Boolean,
      required: false,
      default: true,
    },
    /**
     * Adjusts the cell height of the grid. Setting this too high can leave unwanted whitespace
     * between grid panels. Reduce the number to allow for a more compact grid.
     * For more information, see:
     * https://github.com/khulnasoft/khulnasoft-ui/issues/3051
     */
    cellHeight: {
      type: Number,
      required: false,

      /* Magic number:
       * After allowing for padding, and the panel title row, this leaves us with minimum 48px height for the cell content.
       * This means text/content with our spacing scale can fit up to 49px without scrolling.
       */
      default: 137,
      validator: (value) => value > 0,
    },
    /**
     * Sets a default minimum height for grid panels. This can still be overriden on a per-panel
     * basis by setting `value.panels[].gridAttributes.minHeight`
     */
    minCellHeight: {
      type: Number,
      required: false,
      default: 1,
      validator: (value) => value > 0,
    },
    /**
     * Additional CSS classes to apply to the `#filters` slot container.
     */
    filtersClass: {
      type: String,
      required: false,
      default: "",
    },
  },
  computed: {
    dashboardHasPanels() {
      return this.config.panels?.length > 0;
    },
    dashboardHasTitle() {
      return this.$scopedSlots.title || Boolean(this.config.title);
    },
    dashboardHasDescription() {
      return this.$scopedSlots.description || Boolean(this.config.description);
    },
    dashboardHasHeader() {
      return (
        this.$scopedSlots.header ||
        this.$scopedSlots.actions ||
        this.dashboardHasTitle ||
        this.dashboardHasDescription
      );
    },
  },
  methods: {
    emitChanges(newConfig) {
      this.$emit("changed", newConfig);
    },
  },
};
</script>
<template>
  <div>
    <section
      v-if="dashboardHasHeader"
      data-testid="header-container"
      class="gl-my-4 gl-flex gl-items-center"
    >
      <!-- @slot Used to render custom dashboard header state. Replaces the default rendering. -->
      <slot name="header">
        <div class="gl-flex gl-w-full gl-flex-col">
          <!-- Dashboard title -->
          <div v-if="dashboardHasTitle" class="gl-flex gl-items-center">
            <!-- @slot Used to render custom dashboard titles. Replaces the default rendering. -->
            <slot name="title">
              <h2 data-testid="title" class="gl-my-0">{{ config.title }}</h2>
            </slot>
          </div>
          <!-- Dashboard description -->
          <div v-if="dashboardHasDescription" class="gl-mt-3 gl-flex">
            <!-- @slot Used to render custom dashboard descriptions. Replaces the default rendering. -->
            <slot name="description">
              <p data-testid="description" class="gl-mb-0">
                {{ config.description }}
              </p>
            </slot>
          </div>
        </div>
      </slot>
      <div v-if="$scopedSlots.actions" data-testid="actions-container">
        <!-- @slot Place dashboard actions inside this slot. -->
        <slot name="actions"></slot>
      </div>
    </section>
    <div class="gl-flex">
      <div class="gl-flex gl-min-w-0 gl-grow gl-flex-col">
        <!-- @slot For dashboard-level alerts. -->
        <slot name="alert"></slot>

        <!-- Dashboard filters -->
        <section
          v-if="$scopedSlots.filters"
          class="gl-flex gl-flex-row gl-flex-wrap gl-gap-5 gl-pb-3 gl-pt-4"
          :class="filtersClass"
          data-testid="filters-container"
        >
          <!-- @slot Place dashboard filters inside this slot. -->
          <slot name="filters"></slot>
        </section>

        <!-- Dashboard grid -->
        <!--
          Gridstack guttering wraps around each panel in the grid.
          We want the grid to be flush against the edge, so we remove the excess margin using -gl-mx-3.
        -->
        <grid-layout
          v-if="dashboardHasPanels"
          :value="config"
          :is-static-grid="isStaticGrid"
          :cell-height="cellHeight"
          :min-cell-height="minCellHeight"
          class="-gl-mx-3"
          @input="emitChanges"
        >
          <template #panel="{ panel }">
            <!-- @slot The contents to render inside each dashboard panel. -->
            <slot name="panel" v-bind="{ panel }"></slot>
          </template>
        </grid-layout>

        <!-- @slot Shown when a dashboard has no panels. -->
        <slot v-else name="empty-state"></slot>
      </div>
    </div>
    <!-- @slot Optional: The dashboard footer content. -->
    <slot name="footer"></slot>
  </div>
</template>
