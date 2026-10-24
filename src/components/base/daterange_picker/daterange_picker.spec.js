import { shallowMount } from '@vue/test-utils';
import Datepicker from '../datepicker/datepicker.vue';
import Icon from '../icon/icon.vue';
import DaterangePicker from './daterange_picker.vue';

describe('Daterange Picker', () => {
  let wrapper;

  const startDate = new Date('2020-08-27');
  const endDate = new Date('2020-08-29');
  const defaultMaxDate = new Date('2021-01-01');

  const factory = (props = {}, scopedSlots = {}) => {
    wrapper = shallowMount(DaterangePicker, {
      propsData: {
        defaultStartDate: startDate,
        defaultEndDate: endDate,
        ...props,
      },
      scopedSlots,
    });
  };

  const findStartPicker = () => wrapper.findAllComponents(Datepicker).at(0);
  const findEndPicker = () => wrapper.findAllComponents(Datepicker).at(1);

  it('renders two datepickers', () => {
    factory();
    expect(findStartPicker().exists()).toBe(true);
    expect(findEndPicker().exists()).toBe(true);
  });

  describe('from date picker', () => {
    describe('emits the input event', () => {
      beforeEach(() => {
        factory();
        findStartPicker().vm.$emit('input', startDate);
      });

      it('updates startDate correctly', () => {
        expect(wrapper.vm.startDate).toBe(startDate);
      });

      it("sets the end date picker's minDate to one day after the startDate", () => {
        const toCalendarMinDate = new Date('2020-08-28');

        expect(findEndPicker().props('minDate')).toEqual(toCalendarMinDate);
      });

      it('emits `start-date-open` event on component when `open` event fires', () => {
        findStartPicker().vm.$emit('open');

        expect(wrapper.emitted('start-picker-open')).toHaveLength(1);
      });

      it('emits `start-date-close` event on component when `close` event fires', () => {
        findStartPicker().vm.$emit('close');

        expect(wrapper.emitted('start-picker-close')).toHaveLength(1);
      });

      describe('with a date range violation', () => {
        beforeEach(() => {
          factory({
            defaultEndDate: new Date('2020-08-26'),
          });
          findStartPicker().vm.$emit('input', startDate);
        });

        it('does not emit the "input" event when there is a date range violation', () => {
          expect(Object.keys(wrapper.emitted())).toHaveLength(0);
        });

        it('sets openToCalendar=true', () => {
          expect(wrapper.vm.openToCalendar).toBe(true);
        });

        it('sets endDate=null', () => {
          expect(wrapper.vm.endDate).toBe(null);
        });
      });

      describe('date range violation with maxDateRange and sameDaySelection', () => {
        describe.each`
          maxDateRange | sameDaySelection | violation
          ${2}         | ${false}         | ${false}
          ${1}         | ${false}         | ${true}
          ${2}         | ${true}          | ${true}
          ${3}         | ${true}          | ${false}
        `(
          'with maxDateRange = $maxDateRange, sameDaySelection = $sameDaySelection and violation = $violation',
          ({ maxDateRange, sameDaySelection, violation }) => {
            beforeEach(() => {
              factory({
                maxDateRange,
                sameDaySelection,
              });
              findStartPicker().vm.$emit('input', startDate);
            });

            it(`${violation ? 'has' : 'does not have'} a date range violation`, () => {
              const events = violation ? 0 : 1;
              expect(Object.keys(wrapper.emitted())).toHaveLength(events);
            });
          },
        );
      });

      describe('with no date range violation', () => {
        it('emits the "input" event', () => {
          expect(wrapper.emitted('input')).toEqual([[{ startDate, endDate: wrapper.vm.endDate }]]);
        });
      });
    });
  });

  describe('end date picker', () => {
    describe('emits the input event', () => {
      beforeEach(() => {
        factory();
        findEndPicker().vm.$emit('input', endDate);
      });

      it('updates endDate correctly', () => {
        expect(wrapper.vm.endDate).toBe(endDate);
      });

      it('sets openToCalendar=false', () => {
        expect(wrapper.vm.openToCalendar).toBe(false);
      });

      it('calls the event handler', () => {
        expect(wrapper.emitted('input')).toEqual([[{ startDate: wrapper.vm.startDate, endDate }]]);
      });

      it('emits `end-date-open` event on component when `open` event fires', () => {
        findEndPicker().vm.$emit('open');

        expect(wrapper.emitted('end-picker-open')).toHaveLength(1);
      });

      it('emits `end-date-close` event on component when `close` event fires', () => {
        findEndPicker().vm.$emit('close');

        expect(wrapper.emitted('end-picker-close')).toHaveLength(1);
      });
    });
  });

  describe('with maxDateRange = 10', () => {
    beforeEach(() => {
      factory({ maxDateRange: 10, defaultMaxDate });
    });

    it('sets the maxDate to the startDate + the maxDateRange', () => {
      const maxDate = new Date('2020-09-06');

      expect(findEndPicker().props('maxDate')).toEqual(maxDate);
    });
  });

  describe('with startPickerTarget/endPickerTarget defined', () => {
    beforeEach(() => {
      factory({ startPickerTarget: '.btn', endPickerTarget: '.btn' });
    });

    it('sets the `target` prop to startPickerTarget', () => {
      expect(findStartPicker().props('target')).toBe('.btn');
    });

    it('sets the `target` prop to endPickerTarget', () => {
      expect(findEndPicker().props('target')).toBe('.btn');
    });
  });

  describe('with startPickerContainer/endPickerContainer defined', () => {
    beforeEach(() => {
      factory({ startPickerContainer: 'body', endPickerContainer: 'body' });
    });

    it('sets the `container` prop to startPickerContainer', () => {
      expect(findStartPicker().props('container')).toBe('body');
    });

    it('sets the `container` prop to endPickerContainer', () => {
      expect(findEndPicker().props('container')).toBe('body');
    });
  });

  describe('sameDaySelection = true', () => {
    describe('from date picker', () => {
      beforeEach(() => {
        factory({ sameDaySelection: true });
      });

      it('updates startDate correctly', () => {
        expect(wrapper.vm.startDate).toBe(startDate);
      });

      it("sets the end date picker's minDate to the startDate", () => {
        expect(findEndPicker().props('minDate')).toEqual(startDate);
      });

      describe('with maxDateRange = 10', () => {
        beforeEach(() => {
          factory({ sameDaySelection: true, maxDateRange: 10, defaultMaxDate });
        });

        it('sets the maxDate to the startDate + the maxDateRange - 1', () => {
          const maxDate = new Date('2020-09-05');

          expect(findEndPicker().props('maxDate')).toEqual(maxDate);
        });
      });
    });
  });

  describe('labelClass', () => {
    const customClass = 'foobar';

    const findLabelsWithCustomClass = () =>
      wrapper.findAll('label').filter((label) => label.classes(customClass));

    it('does not have the class by default', () => {
      factory();

      expect(findLabelsWithCustomClass()).toHaveLength(0);
    });

    it('adds the label class when provided', () => {
      factory({ labelClass: customClass });

      expect(findLabelsWithCustomClass()).toHaveLength(2);
    });
  });

  describe('with date range indicator and tooltip', () => {
    const tooltip = 'Date range limited to 31 days';
    const dateRangeIndicatorClass = 'indicator-container-class';

    const findDateRangeIndicator = () => wrapper.find('[data-testid="daterange-picker-indicator"]');
    const findTooltipIcon = () => wrapper.findComponent(Icon);

    const slots = {
      default: `<div>{{ props.daysSelected }} days selected</div>`,
    };

    it('does not show default slot or tooltip icon by default', () => {
      factory();

      expect(findDateRangeIndicator().exists()).toBe(false);
      expect(findTooltipIcon().exists()).toBe(false);
    });

    it('shows the default slot when provided', () => {
      factory({}, slots);

      expect(findDateRangeIndicator().text()).toBe('2 days selected');
    });

    it('shows the effective days selected for the default slot when sameDaySelection is true', () => {
      factory({ sameDaySelection: true }, slots);

      expect(findDateRangeIndicator().text()).toBe('3 days selected');
    });

    it('shows the icon with the provided tooltip', () => {
      factory({ tooltip });

      expect(findTooltipIcon().attributes('title')).toBe(tooltip);
    });

    it('adds the indicator class when provided', () => {
      factory({ dateRangeIndicatorClass }, slots);

      expect(wrapper.find(`.${dateRangeIndicatorClass}`).exists()).toBe(true);
    });
  });

  it.each`
    prop                  | value                 | testid
    ${'startPickerClass'} | ${'gl-text-blue-500'} | ${'daterange-picker-start-container'}
    ${'endPickerClass'}   | ${'gl-text-red-500'}  | ${'daterange-picker-end-container'}
  `('adds the provided $value class to $testid', ({ prop, value, testid }) => {
    factory({ [prop]: value });

    expect(wrapper.find(`[data-testid="${testid}"]`).classes()).toContain(value);
  });

  describe('startOpened', () => {
    beforeEach(() => {
      factory({ startOpened: true });
    });
    it('sets start-opened on the from date picker', () => {
      expect(findStartPicker().props('startOpened')).toBe(true);
    });

    it('defaults to false', () => {
      factory();
      expect(findStartPicker().props('startOpened')).toBe(false);
    });

    it('does not set start-opened on the end date picker', () => {
      expect(findEndPicker().props('startOpened')).toBe(false);
    });
  });
});
