<script>
import { uniqueId, isObject } from 'lodash-es';
import GlButton from '../../base/button/button.vue';
import GlDisclosureDropdown from '../../base/new_dropdowns/disclosure/disclosure_dropdown.vue';
import GlIcon from '../../base/icon/icon.vue';
import GlLoadingIcon from '../../base/loading_icon/loading_icon.vue';
import GlPopover from '../../base/popover/popover.vue';
import GlSprintf from '../../utilities/sprintf/sprintf.vue';
import GlLink from '../../base/link/link.vue';
import GlTruncate from '../../utilities/truncate/truncate.vue';
import GlSkeletonLoader from '../../base/skeleton_loader/skeleton_loader.vue';
import { sprintf, translate } from '../../../utils/i18n';

export default {
  name: 'GlDashboardPanel',
  components: {
    GlButton,
    GlDisclosureDropdown,
    GlLoadingIcon,
    GlIcon,
    GlPopover,
    GlSprintf,
    GlLink,
    GlTruncate,
    GlSkeletonLoader,
  },
  props: {
    /**
     * CSS classes to apply to the panel container.
     */
    containerClass: {
      type: String,
      required: false,
      default: '',
    },
    /**
     * Additional CSS classes to apply to the `#body` slot container.
     */
    bodyContentClass: {
      type: String,
      required: false,
      default: '',
    },
    /**
     * Used to set the color of the panel border.
     */
    borderColorClass: {
      type: String,
      required: false,
      default: '',
    },
    /**
     * The string to render as the panel title.
     */
    title: {
      type: String,
      required: false,
      default: '',
    },
    /**
     * HTML tag for the panel title. Set a heading level, such as `h3`, so screen reader users
     * can move between panels by heading.
     */
    titleTag: {
      type: String,
      required: false,
      default: 'div',
    },
    /**
     * The name of the icon to render next to the panel title.
     */
    titleIcon: {
      type: String,
      required: false,
      default: '',
    },
    /**
     * The CSS classes to apply to the title icon.
     */
    titleIconClass: {
      type: String,
      required: false,
      default: '',
    },
    /**
     * Configuration object for the title popover. Expected structure:
     * **Deprecated:** Use slots `#info-popover-content` and `#info-popover-title` instead.
     *
     * - `description`: The popover text content with interpolation placeholders.
     *   Uses `%{linkStart}` and `%{linkEnd}` as markers for where a link should be inserted.
     *
     * - `descriptionLink`: The optional URL that will be used for the link portion
     *   of the description text between the linkStart and linkEnd markers.
     *
     * @deprecated Use slots `#info-popover-content` and `#info-popover-title` instead.
     */
    titlePopover: {
      type: Object,
      required: false,
      default: () => ({}),
    },
    /**
     * CSS classes to apply to the title popover (gets passed to the `css-classes` prop of the `GlPopover` component).
     */
    titlePopoverClasses: {
      type: [Array, String, Object],
      required: false,
      default: '',
    },
    /**
     * The string to render as the panel subtitle.
     */
    subtitle: {
      type: String,
      required: false,
      default: '',
    },
    /**
     * Set to `true` to show the loading state.
     */
    loading: {
      type: Boolean,
      required: false,
      default: false,
    },
    /**
     * Set to `true` for long-running operations.
     */
    loadingDelayed: {
      type: Boolean,
      required: false,
      default: false,
    },
    /**
     * The string to render while loading is delayed.
     */
    loadingDelayedText: {
      type: String,
      required: false,
      default: '',
    },
    /**
     * Array of `GlDisclosureDropdown` items to display in the dropdown.
     */
    actions: {
      type: Array,
      required: false,
      default: () => [],
      validator: (actions) => actions.every((a) => isObject(a)),
    },
    /**
     * The toggle text for the `GlDisclosureDropdown` dropdown.
     */
    actionsToggleText: {
      type: String,
      required: false,
      default: '',
    },
  },
  data() {
    return {
      panelId: uniqueId('gl-dashboard-panel-id-'),
      titlePopoverId: uniqueId('gl-dashboard-panel-title-popover-id-'),
    };
  },
  computed: {
    borderClass() {
      if (this.borderColorClass?.length > 0) {
        return `gl-border-t-2 gl-border-t-solid ${this.borderColorClass}`;
      }

      return '';
    },
    containerClasses() {
      return `${this.containerClass} ${this.borderClass}`;
    },
    bodyClasses() {
      return this.loading
        ? 'gl-flex gl-flex-wrap gl-content-center gl-text-center gl-flex-grow'
        : `gl-grow gl-overflow-y-auto gl-overflow-x-hidden ${this.bodyContentClass}`;
    },
    hasTitleIcon() {
      return Boolean(this.titleIcon);
    },
    hasTitle() {
      return Boolean(this.title);
    },
    hasInfoPopoverContentSlot() {
      return Boolean(this.$scopedSlots['info-popover-content']);
    },
    hasInfoPopoverTitleSlot() {
      return Boolean(this.$scopedSlots['info-popover-title']);
    },
    hasTitlePopover() {
      return (
        Boolean(this.titlePopover?.description) ||
        this.hasInfoPopoverContentSlot ||
        this.hasInfoPopoverTitleSlot
      );
    },
    titlePopoverLabel() {
      return this.hasTitle
        ? sprintf(
            translate(
              'GlDashboardPanel.titlePopoverLabelWithTitle',
              'More information about %{title}',
            ),
            { title: this.title },
            false,
          )
        : translate('GlDashboardPanel.titlePopoverLabel', 'More information');
    },
    hasTitlePopoverLink() {
      return Boolean(this.titlePopover?.descriptionLink);
    },
    shouldShowActions() {
      return this.actions?.length > 0;
    },
    isLoadingDelayed() {
      return this.loadingDelayed && Boolean(this.loadingDelayedText);
    },
  },
};
</script>

<template>
  <div
    :id="panelId"
    class="gl-border gl-h-full gl-rounded-lg gl-bg-default gl-p-5"
    :class="containerClasses"
  >
    <div class="gl-flex gl-h-full gl-flex-col">
      <div class="gl-mb-3 gl-flex gl-items-start gl-justify-between" data-testid="panel-title">
        <gl-skeleton-loader v-if="loading" :lines="1" />
        <div v-else class="gl-flex gl-items-center gl-gap-2 gl-overflow-hidden">
          <gl-icon
            v-if="hasTitleIcon"
            :class="titleIconClass"
            :name="titleIcon"
            data-testid="panel-title-icon"
          />

          <div class="gl-min-w-0">
            <div class="gl-flex gl-items-center gl-gap-2">
              <component
                :is="titleTag"
                v-if="hasTitle"
                class="gl-m-0 gl-min-w-0 gl-text-size-reset gl-font-bold gl-leading-reset gl-text-default"
                data-testid="panel-title-text"
              >
                <gl-truncate :text="title" with-tooltip />
              </component>
              <template v-if="hasTitlePopover">
                <gl-button
                  :id="titlePopoverId"
                  variant="link"
                  :aria-label="titlePopoverLabel"
                  data-testid="panel-title-popover-icon"
                >
                  <gl-icon class="gl-min-w-5" name="information-o" variant="info" />
                </gl-button>
                <gl-popover
                  data-testid="panel-title-popover"
                  boundary="viewport"
                  :target="titlePopoverId"
                  :css-classes="titlePopoverClasses"
                >
                  <!-- @slot The title of the info popover. -->
                  <template v-if="hasInfoPopoverTitleSlot" #title>
                    <slot name="info-popover-title"></slot>
                  </template>

                  <!-- @slot The content of the info popover. -->
                  <template v-if="hasInfoPopoverContentSlot">
                    <slot name="info-popover-content"></slot>
                  </template>

                  <template v-if="!hasInfoPopoverContentSlot">
                    <gl-sprintf v-if="hasTitlePopoverLink" :message="titlePopover.description">
                      <template #link="{ content }">
                        <gl-link :href="titlePopover.descriptionLink" class="gl-text-sm">{{
                          content
                        }}</gl-link>
                      </template>
                    </gl-sprintf>
                    <template v-else> {{ titlePopover.description }} </template>
                  </template>
                </gl-popover>
              </template>
            </div>

            <p
              v-if="subtitle"
              class="gl-mb-0 gl-mt-1 gl-text-sm gl-text-subtle"
              data-testid="panel-subtitle"
            >
              {{ subtitle }}
            </p>
          </div>
        </div>

        <div
          v-if="shouldShowActions || $scopedSlots.filters"
          data-testid="panel-actions-filters-container"
          class="gl-flex gl-flex-col gl-items-end gl-gap-2"
        >
          <gl-disclosure-dropdown
            v-if="shouldShowActions"
            :items="actions"
            icon="ellipsis_v"
            :toggle-text="actionsToggleText"
            text-sr-only
            no-caret
            placement="bottom-end"
            fluid-width
            toggle-class="gl-ml-1"
            category="tertiary"
            positioning-strategy="fixed"
            size="small"
            @shown="$emit('dropdown-open')"
            @hidden="$emit('dropdown-closed')"
          >
            <template #list-item="{ item }">
              <span>{{ item.text }}</span>
            </template>
          </gl-disclosure-dropdown>

          <div
            v-if="$scopedSlots.filters"
            class="gl-flex gl-items-center gl-justify-end"
            data-testid="panel-filters-container"
          >
            <!-- @slot  The filter section to add additional UI elements for filtering, grouping, etc. -->
            <slot name="filters"></slot>
          </div>
        </div>
      </div>
      <div :class="bodyClasses">
        <template v-if="loading">
          <gl-loading-icon size="lg" class="gl-min-h-8 gl-w-full" />
          <div
            v-if="isLoadingDelayed"
            class="gl-w-full gl-text-subtle"
            data-testId="panel-loading-delayed-indicator"
          >
            {{ loadingDelayedText }}
          </div>
        </template>
        <!-- @slot The panel body to display when not loading. -->
        <slot v-else name="body"></slot>
      </div>
      <div
        v-if="$scopedSlots.footer && !loading"
        class="gl-mt-3 gl-shrink-0"
        data-testid="panel-footer"
      >
        <!-- @slot Content pinned below the panel body, such as a link. Hidden while loading. -->
        <slot name="footer"></slot>
      </div>
      <slot name="alert-message" :panel-id="panelId"></slot>
    </div>
  </div>
</template>
