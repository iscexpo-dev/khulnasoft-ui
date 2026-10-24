import { translate, translatePlural, sprintf } from './i18n';

const TRANSLATION_KEY = 'TRANSLATION_KEY';
const CONFIGURED_VALUE = 'CONFIGURED_VALUE';
const PLURAL_TRANSLATION_KEY = 'PLURAL_TRANSLATION_KEY';
const TEMPLATED_TRANSLATION_KEY = 'TEMPLATED_TRANSLATION_KEY';
const TEMPLATED_TRANSLATION_VALUE = 'Step %{currentStep} of %{stepsTotal}';
const CONFIGURED_SINGULAR_VALUE = '1 result';
const CONFIGURED_PLURAL_VALUE = 'Multiple results';
const CONFIGURED_PLURAL_HANDLER = (n) =>
  n === 1 ? CONFIGURED_SINGULAR_VALUE : CONFIGURED_PLURAL_VALUE;

jest.mock('../config', () => ({
  i18n: {
    [TRANSLATION_KEY]: CONFIGURED_VALUE,
    [PLURAL_TRANSLATION_KEY]: CONFIGURED_PLURAL_HANDLER,
    [TEMPLATED_TRANSLATION_KEY]: TEMPLATED_TRANSLATION_VALUE,
  },
}));

describe('i18n', () => {
  describe('translate', () => {
    it('returns the fallback label if the key is not present in the config', () => {
      const FALLBACK_VALUE = 'FALLBACK_VALUE';

      expect(translate('ThisKeyIsNotProvided', FALLBACK_VALUE)).toBe(FALLBACK_VALUE);
    });

    it('returns the label from the config if it is provided', () => {
      expect(translate(TRANSLATION_KEY, 'Fallback translation')).toBe(CONFIGURED_VALUE);
    });

    it('can accept named template replacements', () => {
      expect(
        translate(TEMPLATED_TRANSLATION_KEY, 'Step %{currentStep} of %{stepsTotal}', {
          currentStep: 1,
          stepsTotal: 2,
        }),
      ).toBe('Step 1 of 2');
    });
  });

  describe('translatePlural', () => {
    const FALLBACK_SINGULAR_VALUE = 'FALLBACK_SINGULAR_VALUE';
    const FALLBACK_PLURAL_VALUE = 'FALLBACK_PLURAL_VALUE';

    describe('when the translation is not configured', () => {
      it('returns the fallback singular label', () => {
        expect(
          translatePlural(
            'ThisKeyIsNotProvided',
            FALLBACK_SINGULAR_VALUE,
            FALLBACK_PLURAL_VALUE,
          )(1),
        ).toBe(FALLBACK_SINGULAR_VALUE);
      });

      it('returns the fallback plural label', () => {
        expect(
          translatePlural(
            'ThisKeyIsNotProvided',
            FALLBACK_SINGULAR_VALUE,
            FALLBACK_PLURAL_VALUE,
          )(0),
        ).toBe(FALLBACK_PLURAL_VALUE);
      });
    });

    describe('when the translation is configured', () => {
      it('returns the fallback singular label', () => {
        expect(
          translatePlural(
            [PLURAL_TRANSLATION_KEY],
            FALLBACK_SINGULAR_VALUE,
            FALLBACK_PLURAL_VALUE,
          )(1),
        ).toBe(CONFIGURED_SINGULAR_VALUE);
      });

      it('returns the fallback plural label', () => {
        expect(
          translatePlural(
            [PLURAL_TRANSLATION_KEY],
            FALLBACK_SINGULAR_VALUE,
            FALLBACK_PLURAL_VALUE,
          )(0),
        ).toBe(CONFIGURED_PLURAL_VALUE);
      });
    });
  });

  describe('sprintf', () => {
    it('does not modify string without parameters', () => {
      const input = 'No parameters';

      const output = sprintf(input);

      expect(output).toBe(input);
    });

    it('ignores extraneous parameters', () => {
      const input = 'No parameters';

      const output = sprintf(input, { ignore: 'this' });

      expect(output).toBe(input);
    });

    it('ignores extraneous placeholders', () => {
      const input = 'No %{parameters}';

      const output = sprintf(input);

      expect(output).toBe(input);
    });

    it('replaces parameters', () => {
      const input = '%{name} has %{count} parameters';
      const parameters = {
        name: 'this',
        count: 2,
      };

      const output = sprintf(input, parameters);

      expect(output).toBe('this has 2 parameters');
    });

    it('replaces multiple occurrences', () => {
      const input = 'to %{verb} or not to %{verb}';
      const parameters = {
        verb: 'be',
      };

      const output = sprintf(input, parameters);

      expect(output).toBe('to be or not to be');
    });

    it('escapes parameters', () => {
      const input = 'contains %{userContent}';
      const parameters = {
        userContent: '<script>alert("malicious!")</script>',
      };

      const output = sprintf(input, parameters);

      expect(output).toBe('contains &lt;script&gt;alert(&quot;malicious!&quot;)&lt;/script&gt;');
    });

    it('does not escape parameters for escapeParameters = false', () => {
      const input = 'contains %{safeContent}';
      const parameters = {
        safeContent: '15',
      };

      const output = sprintf(input, parameters, false);

      expect(output).toBe('contains 15');
    });

    describe('replaces duplicated % in input', () => {
      it('removes duplicated percentage signs', () => {
        const input = 'contains duplicated %{safeContent}%%';

        const parameters = {
          safeContent: '15',
        };

        const output = sprintf(input, parameters, false);

        expect(output).toBe('contains duplicated 15%');
      });
    });

    describe('ignores special replacements in the input', () => {
      it.each(['$$', '$&', '$`', `$'`])('replacement "%s" is ignored', (replacement) => {
        const input = 'My odd %{replacement} is preserved';

        const parameters = { replacement };

        const output = sprintf(input, parameters, false);
        expect(output).toBe(`My odd ${replacement} is preserved`);
      });
    });
  });
});
