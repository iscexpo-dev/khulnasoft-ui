<script>
import { uniqueId } from 'lodash-es';
import { GlTooltipDirective } from '../../../directives/tooltip/tooltip';
import { getDayDifference, getDateInPast, getDateInFuture } from '../../../utils/datetime_utility';
import GlDatepicker from '../datepicker/datepicker.vue';
import GlIcon from '../icon/icon.vue';
import { datepickerWidthOptionsMap } from '../../../utils/constants';

const CONTAINER_CLASSES = [
  'gl-flex',
  'gl-items-baseline',
  'gl-flex-wrap',
  '@sm:gl-flex-nowrap',
  '@sm:gl-gap-3',
];

export default {
  name: 'GlDaterangePicker',
  components: {
    GlDatepicker,
    GlIcon,
  },
  directives: {
    GlTooltip: GlTooltipDirective,
  },
  props: {
    /**
     * Label text for the start date picker.
     */
    fromLabel: {
      type: String,
      required: false,
      default: 'From',
    },
    /**
     * Label text for the end date picker.
     */
    toLabel: {
      type: String,
      required: false,
      default: 'To',
    },
    /**
     * Accessible label for the start date input.
     */
    fromAriaLabel: {
      type: String,
      required: false,
      default: 'From date',
    },
    /**
     * Accessible label for the end date input.
     */
    toAriaLabel: {
      type: String,
      required: false,
      default: 'To date',
    },
    /**
     * The selected date range object containing `startDate` and `endDate` properties.
     */
    value: {
      type: Object,
      required: false,
      default: null,
    },
    /**
     * Internationalization object for Pikaday labels and month/day names.
     */
    i18n: {
      type: Object,
      required: false,
      default: null,
    },
    /**
     * The earliest selectable date for the start date picker.
     */
    defaultMinDate: {
      type: Date,
      required: false,
      default: null,
    },
    /**
     * The latest selectable date for the end date picker.
     */
    defaultMaxDate: {
      type: Date,
      required: false,
      default: null,
    },
    /**
     * Initial value for the start date.
     */
    defaultStartDate: {
      type: Date,
      required: false,
      default: null,
    },
    /**
     * Initial value for the end date.
     */
    defaultEndDate: {
      type: Date,
      required: false,
      default: null,
    },
    /**
     * Maximum number of days allowed between start and end date. Set to 0 for no limit.
     */
    maxDateRange: {
      type: Number,
      required: false,
      default: 0,
    },
    /**
     * Additional CSS class(es) for the start date picker container.
     */
    startPickerClass: {
      type: String,
      required: false,
      default: '',
    },
    /**
     * Selector of element that triggers the start date picker.
     */
    startPickerTarget: {
      type: String,
      required: false,
      default: '',
    },
    /**
     * DOM node selector to render the start date calendar into.
     */
    startPickerContainer: {
      type: String,
      required: false,
      default: '',
    },
    /**
     * Validation state for the start date picker input.
     */
    startPickerState: {
      type: Boolean,
      required: false,
      default: null,
    },
    /**
     * Additional CSS class(es) for the end date picker container.
     */
    endPickerClass: {
      type: String,
      required: false,
      default: '',
    },
    /**
     * Selector of element that triggers the end date picker.
     */
    endPickerTarget: {
      type: String,
      required: false,
      default: '',
    },
    /**
     * DOM node selector to render the end date calendar into.
     */
    endPickerContainer: {
      type: String,
      required: false,
      default: '',
    },
    /**
     * Validation state for the end date picker input.
     */
    endPickerState: {
      type: Boolean,
      required: false,
      default: null,
    },
    /**
     * Additional CSS class(es) for the label elements.
     */
    labelClass: {
      type: String,
      required: false,
      default: '',
    },
    /**
     * Additional CSS class for the Pikaday calendar theme.
     */
    theme: {
      type: String,
      required: false,
      default: '',
    },
    /**
     * Whether to allow selecting the same date for start and end.
     */
    sameDaySelection: {
      type: Boolean,
      required: false,
      default: false,
    },
    /**
     * If provided, renders an info icon with a tooltip.
     */
    tooltip: {
      type: String,
      required: false,
      default: '',
    },
    /**
     * Additional class(es) to apply to the date range indicator section.
     */
    dateRangeIndicatorClass: {
      type: [String, Object, Array],
      required: false,
      default: '',
    },
    /**
     * Whether the start date picker should be open on mount.
     */
    startOpened: {
      type: Boolean,
      required: false,
      default: false,
    },
    /**
     * Maximum width of the Datepicker.
     */
    width: {
      type: String,
      required: false,
      default: null,
      validator: (value) => Object.keys(datepickerWidthOptionsMap).includes(value),
    },
  },
  data() {
    return {
      fromCalendarMaxDate: this.defaultMaxDate ? getDateInPast(this.defaultMaxDate, 1) : null,
      startDate: this.defaultStartDate,
      endDate: this.defaultEndDate,
      openToCalendar: false,
    };
  },
  computed: {
    effectiveMaxDateRange() {
      return this.sameDaySelection ? this.maxDateRange - 1 : this.maxDateRange;
    },
    toCalendarMinDate() {
      if (!this.startDate) return null;

      return this.sameDaySelection ? this.startDate : getDateInFuture(this.startDate, 1);
    },
    toCalendarMaxDate() {
      if (!this.startDate || !this.maxDateRange) return this.defaultMaxDate;

      const computedMaxEndDate = getDateInFuture(this.startDate, this.effectiveMaxDateRange);
      return new Date(Math.min(computedMaxEndDate, this.defaultMaxDate));
    },
    dateRangeViolation() {
      return this.startDate >= this.endDate || this.exceedsDateRange;
    },
    exceedsDateRange() {
      if (this.numberOfDays < 0) {
        return false;
      }
      return this.maxDateRange && this.numberOfDays > this.maxDateRange;
    },
    toCalendarDefaultDate() {
      return this.endDate || this.toCalendarMinDate;
    },
    numericStartTime() {
      return this.startDate ? this.startDate.getTime() : null;
    },
    numberOfDays() {
      if (!this.startDate || !this.endDate) {
        return -1;
      }
      const numberOfDays = getDayDifference(this.startDate, this.endDate);
      return this.sameDaySelection ? numberOfDays + 1 : numberOfDays;
    },
    startContainerClasses() {
      return [this.startPickerClass, ...CONTAINER_CLASSES];
    },
    endContainerClasses() {
      return [this.endPickerClass, ...CONTAINER_CLASSES];
    },
    showIndicator() {
      return Boolean(this.$scopedSlots.default || this.tooltip);
    },
    fromId() {
      return uniqueId('date-from-field-');
    },
    toId() {
      return uniqueId('date-to-field-');
    },
  },
  watch: {
    value(val) {
      const { startDate, endDate } = val;
      this.startDate = startDate;
      this.endDate = endDate;
    },
  },
  methods: {
    onStartDateSelected(startDate) {
      this.startDate = startDate;

      if (this.dateRangeViolation) {
        this.openToCalendar = true;
        this.endDate = null;
      } else this.$emit('input', { startDate, endDate: this.endDate });
    },
    onEndDateSelected(endDate) {
      this.openToCalendar = false;
      this.endDate = endDate;
      /**
       * Emitted when start or end date selected with {startDate, endDate} value
       *
       * @event input
       * */
      this.$emit('input', { startDate: this.startDate, endDate });
    },
    onStartPickerOpen() {
      /**
       * Emitted when the primary action button is clicked.
       *
       * @event start-picker-open
       * */
      this.$emit('start-picker-open');
    },
    onStartPickerClose() {
      /**
       * Emitted when the start date datepicker is hidden.
       *
       * @event start-picker-close
       * */
      this.$emit('start-picker-close');
    },
    onEndPickerOpen() {
      /**
       * Emitted when the end date datepicker becomes visible.
       *
       * @event end-picker-open
       * */
      this.$emit('end-picker-open');
    },
    onEndPickerClose() {
      /**
       * Emitted when the end date datepicker is hidden.
       *
       * @event end-picker-close
       * */
      this.$emit('end-picker-close');
    },
  },
};
</script>

<template>
  <div class="gl-daterange-picker gl-flex gl-gap-5">
    <div :class="startContainerClasses" data-testid="daterange-picker-start-container">
      <label :class="labelClass" :for="fromId">{{ fromLabel }}</label>

      <gl-datepicker
        v-model="startDate"
        :input-id="fromId"
        :input-label="fromAriaLabel"
        :min-date="defaultMinDate"
        :max-date="fromCalendarMaxDate"
        :start-range="defaultMinDate"
        :end-range="fromCalendarMaxDate"
        :theme="theme"
        :i18n="i18n"
        :target="startPickerTarget"
        :container="startPickerContainer"
        :start-opened="startOpened"
        :state="startPickerState"
        :width="width"
        @input="onStartDateSelected"
        @open="onStartPickerOpen"
        @close="onStartPickerClose"
      >
        <template #after>
          <slot name="after-start"></slot>
        </template>
      </gl-datepicker>
    </div>
    <div :class="endContainerClasses" data-testid="daterange-picker-end-container">
      <label :class="labelClass" :for="toId">{{ toLabel }}</label>
      <gl-datepicker
        :key="numericStartTime"
        v-model="endDate"
        :input-id="toId"
        :input-label="toAriaLabel"
        :min-date="toCalendarMinDate"
        :max-date="toCalendarMaxDate"
        :start-range="toCalendarMinDate"
        :end-range="toCalendarMaxDate"
        :theme="theme"
        :i18n="i18n"
        :target="endPickerTarget"
        :container="endPickerContainer"
        :start-opened="openToCalendar"
        :default-date="toCalendarDefaultDate"
        :width="width"
        :state="endPickerState"
        @input="onEndDateSelected"
        @open="onEndPickerOpen"
        @close="onEndPickerClose"
      >
        <template #after>
          <slot name="after-end"></slot>
        </template>
      </gl-datepicker>
    </div>
    <div
      v-if="showIndicator"
      :class="dateRangeIndicatorClass"
      data-testid="daterange-picker-indicator"
      class="gl-daterange-picker-indicator"
    >
      <!-- @slot Content to display for days selected. The value is -1 when no date range is selected.-->
      <slot v-bind="{ daysSelected: numberOfDays }"></slot>
      <gl-icon
        v-if="tooltip"
        v-gl-tooltip
        name="information-o"
        :title="tooltip"
        :size="16"
        variant="info"
      />
    </div>
  </div>
</template>
