<script>
import GlButtonGroup from '../button_group/button_group.vue';
import GlButton from '../button/button.vue';

const validateOptionsProp = (options) => {
  const requiredOptionPropType = {
    value: ['string', 'number', 'boolean'],
    disabled: ['boolean', 'undefined'],
  };
  const optionProps = Object.keys(requiredOptionPropType);

  return options.every((option) => {
    if (!option) {
      return false;
    }
    return optionProps.every((name) => requiredOptionPropType[name].includes(typeof option[name]));
  });
};

export default {
  name: 'GlSegmentedControl',
  components: {
    GlButtonGroup,
    GlButton,
  },
  props: {
    /**
     * Array of option objects for the segmented control.
     */
    options: {
      type: Array,
      required: true,
      validator: validateOptionsProp,
    },
    /**
     * The currently selected value.
     */
    value: {
      type: [String, Number, Boolean],
      required: true,
    },
  },
};
</script>

<template>
  <gl-button-group>
    <gl-button
      v-for="option in options"
      :key="option.value"
      :disabled="!!option.disabled"
      :selected="value === option.value"
      v-bind="option.props"
      @click="$emit('input', option.value)"
    >
      <slot name="button-content" v-bind="option">
        {{ option.text }}
      </slot>
    </gl-button>
  </gl-button-group>
</template>
