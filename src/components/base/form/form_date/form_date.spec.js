import { mount, shallowMount } from '@vue/test-utils';
import { nextTick } from 'vue';
import GlFormDate from './form_date.vue';

describe('GlFormDate', () => {
  let wrapper;

  const createComponent = (propsData = {}, mountFn = shallowMount, options = {}) => {
    wrapper = mountFn(GlFormDate, { propsData, ...options });
  };

  const findInput = () => wrapper.findComponent({ ref: 'input' });
  const findInvalidFeedback = () => wrapper.findComponent({ ref: 'invalidFeedback' });
  const findOutput = () => wrapper.findComponent({ ref: 'output' });

  describe('props', () => {
    it.each`
      propName   | value           | attribute  | expectedValue
      ${'id'}    | ${'idForInput'} | ${'id'}    | ${'idForInput'}
      ${'min'}   | ${'2020-01-01'} | ${'min'}   | ${'2020-01-01'}
      ${'max'}   | ${'2020-01-31'} | ${'max'}   | ${'2020-01-31'}
      ${'value'} | ${'2020-01-19'} | ${'value'} | ${'2020-01-19'}
    `(
      'when `$propName` prop is passed sets input `$attribute` to `$expectedValue`',
      ({ propName, value, attribute, expectedValue }) => {
        createComponent({ [propName]: value });

        expect(findInput().attributes(attribute)).toBe(expectedValue);
      },
    );

    it('when `id` prop is not passed sets a unique input `id` attribute', async () => {
      createComponent({ value: '2019-01-01' }, mount);
      await nextTick();
      await nextTick();
      expect(findInput().attributes('id')).not.toBe('');
      expect(findOutput().attributes('for')).not.toBe('');
      expect(findInput().attributes('id')).toMatch(findOutput().attributes('for'));
    });

    it.each`
      propName   | attribute  | expectedValue
      ${'min'}   | ${'min'}   | ${undefined}
      ${'max'}   | ${'max'}   | ${undefined}
      ${'value'} | ${'value'} | ${undefined}
    `(
      'when `$propName` prop is not passed sets input `$attribute` attribute to `$expectedValue`',
      ({ attribute, expectedValue }) => {
        createComponent();

        expect(findInput().attributes(attribute)).toBe(expectedValue);
      },
    );
  });

  describe('events', () => {
    it('emits `keydown` event with the native event when a key is pressed', async () => {
      createComponent({}, mount);

      await findInput().trigger('keydown', { key: 'Enter' });

      expect(wrapper.emitted('keydown')).toHaveLength(1);
    });

    it('emits `focus` event with the native event when the input receives focus', async () => {
      createComponent({}, mount, { attachTo: document.body });

      await findInput().trigger('focus');

      expect(wrapper.emitted('focus')).toHaveLength(1);
      const payload = wrapper.emitted('focus')[0][0];
      expect(payload).toEqual(expect.any(UIEvent));
      expect(payload.type).toBe('focus');
      expect(payload.target).toBe(findInput().element);
    });

    it('emits `blur` event with the native event when the input loses focus', async () => {
      createComponent({}, mount);

      await findInput().trigger('blur');

      expect(wrapper.emitted('blur')).toHaveLength(1);
    });
  });

  describe('validation', () => {
    it('when `value` is less than `min` adds `aria-invalid="true"` attribute and invalid-feedback`', () => {
      createComponent(
        {
          min: '2020-01-01',
          value: '2019-01-01',
        },
        mount,
      );

      expect(findInput().attributes('aria-describedby')).toMatch('form-date-invalid-feedback-');
      expect(findInput().attributes('aria-invalid')).toBe('true');
      expect(findInvalidFeedback().text()).toBe('Must be after minimum date.');
    });

    it('when `value` is greater than `max` adds `aria-invalid="true"` attribute and invalid-feedback`', () => {
      createComponent(
        {
          max: '2020-01-01',
          value: '2021-01-01',
        },
        mount,
      );

      expect(findInput().attributes('aria-describedby')).toMatch('form-date-invalid-feedback-');
      expect(findInput().attributes('aria-invalid')).toBe('true');
      expect(findInvalidFeedback().text()).toBe('Must be before maximum date.');
    });
  });
});
