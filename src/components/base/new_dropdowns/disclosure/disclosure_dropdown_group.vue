<script>
import { uniqueId } from 'lodash-es';
import GlDisclosureDropdownItem from './disclosure_dropdown_item.vue';
import { isGroup, doSomeItemsHaveIcon } from './utils';
import {
  DISCLOSURE_DROPDOWN_GROUP_NAME,
  DISCLOSURE_DROPDOWN_GROUP_BORDER_POSITIONS as borderPositions,
} from './constants';

export const BORDER_CLASSES = {
  [borderPositions.top]: 'gl-border-t gl-border-t-dropdown-divider gl-pt-2 gl-mt-2',
  [borderPositions.bottom]: 'gl-border-b gl-border-b-dropdown-divider gl-pb-2 gl-mb-2',
};

export default {
  name: DISCLOSURE_DROPDOWN_GROUP_NAME,
  components: {
    GlDisclosureDropdownItem,
  },
  props: {
    /**
     * Group of items
     */
    group: {
      type: Object,
      required: false,
      default: null,
      validator: isGroup,
    },
    /**
     * If 'true', will set top border for the group
     * to separate from other groups. You can control
     * the border position using the `borderPosition`
     * property.
     */
    bordered: {
      type: Boolean,
      required: false,
      default: false,
    },

    /**
     * Controls the position of the group's border. Valid
     * values are 'top' and 'bottom'.
     */
    borderPosition: {
      type: String,
      required: false,
      default: borderPositions.top,
      validator: (value) => Object.keys(borderPositions).includes(value),
    },
  },
  computed: {
    borderClass() {
      return this.bordered ? BORDER_CLASSES[this.borderPosition] : null;
    },
    showHeader() {
      return this.$scopedSlots['group-label'] || this.group?.name;
    },
    groupLabeledBy() {
      return this.showHeader ? this.nameId : null;
    },
    siblingsHaveIcons() {
      return doSomeItemsHaveIcon(this.group.items);
    },
  },
  created() {
    this.nameId = uniqueId('gl-disclosure-dropdown-group-');
  },
  methods: {
    handleAction(action) {
      this.$emit('action', action);
    },
    uniqueItemId() {
      return uniqueId(`disclosure-item-`);
    },
  },
};
</script>

<template>
  <li :class="borderClass">
    <div
      v-if="showHeader"
      :id="nameId"
      class="gl-py-2 gl-pl-4 gl-text-sm gl-font-bold gl-text-strong"
    >
      <slot name="group-label">{{ group.name }}</slot>
    </div>
    <ul
      :aria-labelledby="groupLabeledBy"
      class="gl-new-dropdown-item-group gl-mb-0 gl-list-none gl-pl-0"
    >
      <slot>
        <!-- eslint-disable vue/valid-v-for -->
        <gl-disclosure-dropdown-item
          v-for="item in group.items"
          :key="uniqueItemId()"
          :siblings-have-icons="siblingsHaveIcons"
          :item="item"
          @action="handleAction"
        >
          <template #list-item>
            <slot name="list-item" :item="item"></slot>
          </template>
        </gl-disclosure-dropdown-item>
      </slot>
    </ul>
  </li>
</template>
