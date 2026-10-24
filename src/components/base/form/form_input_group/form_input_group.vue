<script>
import GlDropdown from '../../dropdown/dropdown.vue';
import GlDropdownItem from '../../dropdown/dropdown_item.vue';
import GlFormInput from '../form_input/form_input.vue';
import { InputGroupMixin } from './form_input_group_mixin';

export default {
  name: 'GlFormInputGroup',
  components: {
    GlFormInput,
    GlDropdown,
    GlDropdownItem,
  },
  mixins: [InputGroupMixin],
  inheritAttrs: false,
  props: {
    /**
     * Automatically selects the content of the input field on click.
     */
    selectOnClick: {
      type: Boolean,
      required: false,
      default: false,
    },
    /**
     * Array of options. Each option should have `name` and `value` information: {name: "Foo", value: "Bar"})
     */
    predefinedOptions: {
      type: Array,
      required: false,
      default: () => [{ value: '', name: '' }],
      validator: (options) => options.every((opt) => Object.keys(opt).includes('name', 'value')),
    },
    /**
     * Accessible label for the input field. Used for the aria-label attribute.
     */
    label: {
      type: String,
      required: false,
      default: undefined,
    },
    /**
     * Additional CSS class(es) to apply to the input element.
     */
    inputClass: {
      type: [String, Array, Object],
      required: false,
      default: '',
    },
    /**
     * HTML attributes to apply to the wrapper element.
     */
    wrapperAttributes: {
      type: Object,
      required: false,
      default: () => ({}),
    },
  },
  data() {
    return {
      activeOption: this.predefinedOptions && this.predefinedOptions[0].name,
    };
  },
  methods: {
    handleClick() {
      if (this.selectOnClick) {
        this.$refs.input.$el.select();
      }
    },
    updateValue(option) {
      const { name, value } = option;
      this.activeOption = name;
      this.localValue = value;
    },
  },
};
</script>
<template>
  <div role="group" class="input-group" v-bind="wrapperAttributes">
    <div v-if="activeOption || $scopedSlots.prepend" class="input-group-prepend">
      <!-- @slot Is rendered in front of the input field. -->
      <slot name="prepend"></slot>
      <gl-dropdown v-if="activeOption" :text="activeOption">
        <gl-dropdown-item
          v-for="option in predefinedOptions"
          :key="option.value"
          is-check-item
          :is-checked="activeOption === option.name"
          @click="updateValue(option)"
        >
          {{ option.name }}
        </gl-dropdown-item>
      </gl-dropdown>
    </div>
    <!-- @slot Allows replacement of default input field. -->
    <slot>
      <gl-form-input
        ref="input"
        v-model="localValue"
        :class="inputClass"
        :aria-label="label"
        v-bind="$attrs"
        v-on="$listeners"
        @click="handleClick"
      />
    </slot>
    <div v-if="$scopedSlots.append" class="input-group-append">
      <!-- @slot Is rendered after the input field. -->
      <slot name="append"></slot>
    </div>
  </div>
</template>
