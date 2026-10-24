<script>
import { isString, isPlainObject, uniqueId } from 'lodash-es';
import { BFormGroup } from '../../../../vendor/bootstrap-vue/src/components/form-group/form-group';

export default {
  name: 'GlFormGroup',
  components: {
    BFormGroup,
  },
  provide() {
    return {
      // Only for internal use by @khulnasoft/ui components
      getFormGroupInstance: () => this,
    };
  },
  inheritAttrs: false,
  props: {
    /**
     * Additional CSS class(es) to apply to the label element.
     */
    labelClass: {
      type: [String, Array, Object],
      required: false,
      default: null,
    },
    /**
     * Descriptive text to display below the label.
     */
    labelDescription: {
      type: String,
      required: false,
      default: '',
    },
    /**
     * When true, displays optional text next to the label.
     */
    optional: {
      type: Boolean,
      required: false,
      default: false,
    },
    /**
     * Text to display when the field is optional.
     */
    optionalText: {
      type: String,
      required: false,
      default: '(optional)',
    },
  },
  data() {
    return {
      labelId: uniqueId('gl-form-group-label-'),
    };
  },
  computed: {
    actualLabelClass() {
      const { labelClass } = this;
      const defaultClass = 'col-form-label';

      if (isString(labelClass)) {
        return `${labelClass} ${defaultClass}`;
      }
      if (Array.isArray(labelClass)) {
        return [...labelClass, defaultClass];
      }
      if (isPlainObject(labelClass)) {
        return { ...labelClass, [defaultClass]: true };
      }
      return defaultClass;
    },
    hasLabelDescription() {
      return Boolean(this.labelDescription || this.$slots['label-description']);
    },
  },
};
</script>
<template>
  <b-form-group
    v-bind="$attrs"
    class="gl-form-group"
    :label-class="actualLabelClass"
    :label-id="labelId"
  >
    <template v-if="$attrs.label || $scopedSlots.label" #label>
      <slot name="label">
        {{ $attrs.label }}
        <span v-if="optional" class="optional-label" data-testid="optional-label">{{
          optionalText
        }}</span>
      </slot>
      <div v-if="hasLabelDescription" data-testid="label-description" class="label-description">
        <slot name="label-description">{{ labelDescription }}</slot>
      </div>
    </template>

    <template v-for="slot in Object.keys($slots)" #[slot]>
      <slot :name="slot"></slot>
    </template>
  </b-form-group>
</template>
