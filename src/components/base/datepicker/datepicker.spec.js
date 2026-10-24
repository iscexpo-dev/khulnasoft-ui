import { mount, shallowMount } from '@vue/test-utils';
import { nextTick } from 'vue';
import Pikaday from 'pikaday';
import { defaultDateFormat } from '../../../utils/constants';
import { defaultConfig } from '../../../config';
import GlDatepicker from './datepicker.vue';

jest.mock('pikaday');

describe('datepicker component', () => {
  const mountWithOptions = ({ shallow = true, ...mountOptions } = {}) => {
    const func = shallow ? shallowMount : mount;
    return func(GlDatepicker, mountOptions);
  };
  const pikadayConfig = () => Pikaday.mock.calls[0][0];
  const currentDate = new Date(2018, 0, 1);

  const findInput = (wrapper) => wrapper.find('[data-testid="gl-datepicker-input"]');
  const findClearButton = (wrapper) => wrapper.find('[data-testid="clear-button"]');
  const findTriggerButton = (wrapper) => wrapper.findComponent({ ref: 'calendarTriggerBtn' });
  const findCalendarIcon = (wrapper) => wrapper.find('[data-testid="datepicker-calendar-icon"]');

  const assertDefaultDates = () => {
    const { setDefaultDate, defaultDate } = pikadayConfig();

    expect(defaultDate).toEqual(currentDate);
    expect(setDefaultDate).toBe(true);
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  beforeEach(() => {
    jest.useFakeTimers('modern');
    jest.setSystemTime(currentDate.getTime());
  });

  it("does not set default date when 'value' and 'defaultDate' props aren't set", () => {
    mountWithOptions();

    expect(Pikaday).toHaveBeenCalled();
    expect(pikadayConfig()).toMatchObject({
      setDefaultDate: false,
    });
  });

  it("uses 'defaultDate' over 'value' as the calendar default date", () => {
    mountWithOptions({
      propsData: {
        value: new Date(2000, 1, 1),
        defaultDate: currentDate,
      },
    });

    expect(Pikaday).toHaveBeenCalled();
    assertDefaultDates();
  });

  it("uses 'value' as the calendar default date", () => {
    mountWithOptions({
      propsData: {
        value: currentDate,
      },
    });

    expect(Pikaday).toHaveBeenCalled();
    assertDefaultDates();
  });

  it('opens calendar after mounting when start-opened property equals true', () => {
    mountWithOptions({ propsData: { startOpened: true } });

    expect(Pikaday.prototype.show).toHaveBeenCalled();
  });

  it('opens calendar when show method is called', () => {
    const wrapper = mountWithOptions();

    wrapper.vm.show();

    expect(Pikaday.prototype.show).toHaveBeenCalled();
  });

  describe('"firstDay" configuration', () => {
    it('configures pikaday with the default day', () => {
      mountWithOptions();

      expect(pikadayConfig().firstDay).toBe(0);
    });

    it('configures pikaday with configured first day', () => {
      defaultConfig.firstDayOfWeek = 1;

      mountWithOptions();

      expect(pikadayConfig().firstDay).toBe(1);
    });

    it('configures pikaday with given first day', () => {
      const firstDay = 1;

      mountWithOptions({
        propsData: {
          firstDay,
        },
      });

      expect(pikadayConfig().firstDay).toBe(1);
    });
  });

  describe('when `ariaLabel` prop is passed', () => {
    it('configures pikaday with the given label', () => {
      const ariaLabel = 'Meaningful description';

      mountWithOptions({
        propsData: {
          ariaLabel,
        },
      });

      expect(pikadayConfig().ariaLabel).toBe(ariaLabel);
    });
  });

  describe('when `target` prop is not passed', () => {
    it('sets calendar icon as `trigger` option', () => {
      const wrapper = mountWithOptions();

      expect(wrapper.vm.$refs.calendarTriggerBtn.$el.isSameNode(pikadayConfig().trigger)).toBe(
        true,
      );
    });

    describe('when datepicker is disabled', () => {
      it('does not pass the `trigger` option to Pikaday', () => {
        mountWithOptions({ propsData: { disabled: true } });

        expect(pikadayConfig()).not.toHaveProperty('trigger');
      });
    });
  });

  describe('when `target` prop is `null`', () => {
    it('does not pass the `trigger` option to Pikaday', () => {
      // This will cause the calendar to open when the `field` is focused
      // https://github.com/Pikaday/Pikaday#configuration

      mountWithOptions({ propsData: { target: null } });

      expect(pikadayConfig()).not.toHaveProperty('trigger');
    });

    it('renders a svg icon instead of a button', () => {
      const wrapper = mountWithOptions({ shallow: false, propsData: { target: null } });

      const calendarIcon = findCalendarIcon(wrapper);

      expect(findTriggerButton(wrapper).exists()).toBe(false);
      expect(calendarIcon.exists()).toBe(true);
      expect(calendarIcon.props('variant')).toBe('default');
    });
  });

  describe('when `container` prop is not passed', () => {
    it('sets component element as `container` option', () => {
      const wrapper = mountWithOptions();

      expect(pikadayConfig()).toHaveProperty('container', wrapper.vm.$el);
    });
  });

  describe('when `container` prop is `null`', () => {
    it('does not pass the `container` option to Pikaday', () => {
      mountWithOptions({
        propsData: { container: null },
      });

      expect(pikadayConfig()).not.toHaveProperty('container');
    });
  });

  describe('when `showClearButton` prop is `true`', () => {
    describe('when text input has a value', () => {
      let wrapper;
      let clearButton;
      let input;

      const setup = async (propsData = {}) => {
        wrapper = mountWithOptions({
          shallow: false,
          propsData: { showClearButton: true, ...propsData },
        });

        input = findInput(wrapper);
        await input.setValue('2020-01-15');

        clearButton = findClearButton(wrapper);
      };

      it('renders clear button', async () => {
        await setup();

        expect(clearButton.exists()).toBe(true);
      });

      describe('when clear button is clicked', () => {
        beforeEach(async () => {
          await setup();

          clearButton.trigger('click');
        });

        it('clears the input', () => {
          expect(input.element.value).toBe('');
        });

        it('emits the `clear` event', () => {
          expect(wrapper.emitted('clear')).toHaveLength(1);
        });
      });

      describe('when datepicker is disabled', () => {
        it('does not render clear button', async () => {
          await setup({ disabled: true });

          expect(clearButton.exists()).toBe(false);
        });
      });
    });

    describe('when text input does not have a value', () => {
      it('does not render clear button', () => {
        const wrapper = mountWithOptions({
          shallow: false,
          propsData: { showClearButton: true },
        });

        expect(findClearButton(wrapper).exists()).toBe(false);
      });
    });
  });

  describe('when text input is passed in the default slot', () => {
    it('sets it as Pikaday `field` option', () => {
      const input = document.createElement('input');
      input.setAttribute('type', 'text');
      input.setAttribute('name', 'foo-bar');

      mountWithOptions({
        slots: { default: input.outerHTML },
      });

      expect(pikadayConfig().field).toEqual(input);
    });
  });

  describe('when the user presses the `enter` key on the input field', () => {
    describe('and the input field is not empty', () => {
      it('emits no input event', async () => {
        const wrapper = mountWithOptions({
          shallow: false,
          propsData: {
            value: currentDate,
          },
        });
        findInput(wrapper).trigger('keydown', 'Enter');
        expect(wrapper.emitted('input')).toBe(undefined);
      });
    });

    describe('and the input field is empty', () => {
      it.each`
        minDate        | isSet
        ${null}        | ${'is empty'}
        ${currentDate} | ${'is set'}
      `('emits input with the value `$minDate` when the `minDate` prop $isSet', ({ minDate }) => {
        const wrapper = mountWithOptions({
          shallow: false,
          propsData: {
            minDate,
          },
        });

        findInput(wrapper).trigger('keydown', { key: 'Enter' });
        expect(wrapper.emitted('input')).toHaveLength(1);
        expect(wrapper.emitted('input')[0]).toEqual([minDate]);
      });
    });
  });

  describe('when a key is pressed on the input field', () => {
    it('emits keydown event with the keyboard event', async () => {
      const wrapper = mountWithOptions({ shallow: false });
      const input = findInput(wrapper);

      await input.trigger('keydown', { key: 'Escape' });

      expect(wrapper.emitted('keydown')).toHaveLength(1);
      expect(wrapper.emitted('keydown')[0][0]).toBeInstanceOf(Event);
    });
  });

  it.each`
    calendarEvent | componentEvent | params
    ${'onSelect'} | ${'input'}     | ${[currentDate]}
    ${'onClose'}  | ${'close'}     | ${[]}
    ${'onOpen'}   | ${'open'}      | ${[]}
  `(
    'emits $componentEvent event when calendar emits $calendarEvent event',
    ({ componentEvent, calendarEvent, params }) => {
      const wrapper = mountWithOptions();

      const config = pikadayConfig();

      config[calendarEvent](...params);

      expect(wrapper.emitted(componentEvent)[0]).toEqual(params);
    },
  );

  it.each`
    calendarSetter  | calendarProperty | componentProperty | extraParams
    ${'setDate'}    | ${'date'}        | ${'value'}        | ${[true]}
    ${'setMinDate'} | ${'minDate'}     | ${'minDate'}      | ${[]}
    ${'setMaxDate'} | ${'maxDate'}     | ${'maxDate'}      | ${[]}
  `(
    'sets $calendarProperty calendar property when $componentProperty component property changes',
    async ({ calendarSetter, componentProperty, extraParams }) => {
      const wrapper = mountWithOptions();

      wrapper.setProps({ [componentProperty]: currentDate });

      await nextTick();
      expect(Pikaday.prototype[calendarSetter]).toHaveBeenCalledWith(currentDate, ...extraParams);
    },
  );

  describe('when open event is emitted', () => {
    let wrapper;
    let mockElement;

    beforeEach(async () => {
      wrapper = mountWithOptions();
      const config = pikadayConfig();
      mockElement = document.createElement('div');
      mockElement.innerHTML = `
        <div class="pika-title" role="heading"></div>
        <select class="pika-select-month"></select>
        <select class="pika-select-year"></select>
      `;
      wrapper.vm.$el.appendChild(mockElement);
      config.onOpen();
    });

    it('adds level', () => {
      expect(mockElement.querySelector('.pika-title').getAttribute('aria-level')).toBe('3');
    });

    it('adds month label', () => {
      expect(mockElement.querySelector('.pika-select-month').getAttribute('aria-label')).toBe(
        'Month',
      );
    });

    it('adds year label', () => {
      expect(mockElement.querySelector('.pika-select-year').getAttribute('aria-label')).toBe(
        'Year',
      );
    });
  });

  describe('when draw event is emitted', () => {
    let pikaday;
    let pastDateButton;
    let futureDateButton;
    let wrapper;

    beforeEach(() => {
      pastDateButton = {
        dataset: {
          pikaYear: 2016,
          pikaMonth: 1,
          pikaDay: 1,
        },
        classList: {
          add: jest.fn(),
        },
      };
      futureDateButton = {
        dataset: {
          pikaYear: currentDate.getFullYear(),
          pikaMonth: currentDate.getMonth(),
          pikaDay: currentDate.getDate() + 1,
        },
        classList: {
          add: jest.fn(),
        },
      };
      pikaday = {
        el: {
          querySelectorAll() {
            return [pastDateButton, futureDateButton];
          },
        },
      };

      wrapper = mountWithOptions();

      const config = pikadayConfig();

      config.onDraw(pikaday);
    });

    it('marks past days with "is-past-date" class selector', () => {
      expect(pastDateButton.classList.add).toHaveBeenCalledWith('is-past-date');
    });

    it('does not mark future days with "is-past-date" class selector', () => {
      expect(futureDateButton.classList.add).not.toHaveBeenCalled();
    });

    it('emits month-change event', () => {
      expect(wrapper.emitted('month-change')).toHaveLength(1);
    });
  });

  describe('when destroyed', () => {
    it('destroys the Pikaday instance', () => {
      const wrapper = mountWithOptions();
      const [pikaday] = Pikaday.mock.instances;

      wrapper.destroy();

      expect(pikaday.destroy).toHaveBeenCalledTimes(1);
    });

    it('does not throw when destroyed before the Pikaday instance was created', () => {
      const wrapper = mountWithOptions();
      // Vue 3 can unmount a component before `mounted` ran, which leaves `calendar` unset.
      wrapper.vm.calendar = undefined;

      expect(() => wrapper.destroy()).not.toThrow();
    });
  });

  describe('when props change before the Pikaday instance was created', () => {
    it.each`
      propName        | value
      ${'value'}      | ${new Date(2020, 0, 1)}
      ${'minDate'}    | ${new Date(2020, 0, 1)}
      ${'maxDate'}    | ${new Date(2020, 0, 1)}
      ${'startRange'} | ${new Date(2020, 0, 1)}
      ${'endRange'}   | ${new Date(2020, 0, 1)}
    `('does not throw when `$propName` changes', async ({ propName, value }) => {
      const wrapper = mountWithOptions();
      wrapper.vm.calendar = undefined;

      await expect(wrapper.setProps({ [propName]: value })).resolves.not.toThrow();
    });
  });

  describe('when datepicker is disabled', () => {
    it('renders a svg icon instead of a button', () => {
      const wrapper = mountWithOptions({ propsData: { disabled: true } });

      const calendarIcon = findCalendarIcon(wrapper);

      expect(findTriggerButton(wrapper).exists()).toBe(false);
      expect(calendarIcon.exists()).toBe(true);
      expect(calendarIcon.props('variant')).toBe('disabled');
    });
  });

  it.each`
    propName         | attribute         | expectedValue
    ${'inputId'}     | ${'id'}           | ${undefined}
    ${'inputName'}   | ${'name'}         | ${undefined}
    ${'target'}      | ${'autocomplete'} | ${undefined}
    ${'placeholder'} | ${'placeholder'}  | ${defaultDateFormat}
  `(
    'when `$propName` prop is not passed sets input `$attribute` attribute to `$expectedValue`',
    ({ attribute, expectedValue }) => {
      const wrapper = mountWithOptions();

      expect(findInput(wrapper).attributes(attribute)).toBe(expectedValue);
    },
  );

  it.each`
    propName          | value             | attribute         | expectedValue
    ${'inputId'}      | ${'idForInput'}   | ${'id'}           | ${'idForInput'}
    ${'inputName'}    | ${'nameForInput'} | ${'name'}         | ${'nameForInput'}
    ${'target'}       | ${null}           | ${'autocomplete'} | ${'off'}
    ${'autocomplete'} | ${'on'}           | ${'autocomplete'} | ${'on'}
    ${'placeholder'}  | ${'foo bar'}      | ${'placeholder'}  | ${'foo bar'}
  `(
    'when `$propName` prop is passed sets input `$attribute` to `$expectedValue`',
    ({ propName, value, attribute, expectedValue }) => {
      const wrapper = mountWithOptions({
        propsData: {
          [propName]: value,
        },
      });

      expect(findInput(wrapper).attributes(attribute)).toBe(expectedValue);
    },
  );

  it.each`
    dateString      | parsedDate
    ${'2021-09-27'} | ${new Date(2021, 8, 27)}
    ${'2021/09/27'} | ${new Date(2021, 8, 27)}
    ${'foobarbaz'}  | ${currentDate}
  `('parses $dateString correctly', ({ dateString, parsedDate }) => {
    mountWithOptions();

    const config = pikadayConfig();

    expect(config.parse).not.toBeUndefined();
    expect(config.parse(dateString)).toEqual(parsedDate);
  });

  it.each`
    width        | expectedClass
    ${undefined} | ${'gl-form-input-md'}
    ${'sm'}      | ${'gl-form-input-sm'}
    ${'md'}      | ${'gl-form-input-md'}
    ${'lg'}      | ${'gl-form-input-lg'}
    ${'xl'}      | ${'gl-form-input-xl'}
  `('applies $expectedClass class when width is $width', ({ width, expectedClass }) => {
    const wrapper = mountWithOptions({
      propsData: {
        width,
      },
    });

    expect(wrapper.classes()).toContain(expectedClass);
  });
});
