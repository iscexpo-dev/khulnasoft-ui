export const InputGroupMixin = {
  props: {
    value: {
      type: [String, Number],
      default: '',
    },
  },
  data() {
    return {
      localValue: this.stringifyValue(this.value),
    };
  },
  watch: {
    value(newVal) {
      if (newVal !== this.localValue) {
        this.localValue = this.stringifyValue(newVal);
      }
    },
    localValue(newVal) {
      if (newVal !== this.value) {
        this.$emit('input', newVal);
      }
    },
  },
  mounted() {
    const value = this.stringifyValue(this.value);
    if (this.activeOption) {
      const activeOption = this.predefinedOptions.find((opt) => opt.name === this.activeOption);
      this.localValue = activeOption.value;
    } else if (value !== this.localValue) {
      this.localValue = value;
    }
  },
  methods: {
    stringifyValue(value) {
      return value === undefined || value === null ? '' : String(value);
    },
  },
};
