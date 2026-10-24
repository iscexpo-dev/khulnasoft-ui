import { noEmojis, required } from './validators';

const TEST_FAIL_MESSAGE = 'Yo test failed!';

describe('components/base/form/form_fields/validators', () => {
  // note: We used the `factory` to build required, so we implicitly test `factory` heere
  describe('required', () => {
    let validator;

    beforeEach(() => {
      validator = required(TEST_FAIL_MESSAGE);
    });

    it.each`
      input        | output
      ${''}        | ${TEST_FAIL_MESSAGE}
      ${null}      | ${TEST_FAIL_MESSAGE}
      ${undefined} | ${TEST_FAIL_MESSAGE}
      ${'123'}     | ${''}
      ${{}}        | ${''}
      ${0}         | ${''}
      ${1}         | ${''}
      ${true}      | ${''}
      ${false}     | ${''}
    `('with $input, returns $output', ({ input, output }) => {
      expect(validator(input)).toBe(output);
    });
  });

  describe('noEmojis', () => {
    let validator;

    beforeEach(() => {
      validator = noEmojis(TEST_FAIL_MESSAGE);
    });

    it.each`
      input        | output
      ${'123🐱'}   | ${TEST_FAIL_MESSAGE}
      ${'0 🍩'}    | ${TEST_FAIL_MESSAGE}
      ${'🐟'}      | ${TEST_FAIL_MESSAGE}
      ${''}        | ${''}
      ${null}      | ${''}
      ${undefined} | ${''}
      ${'123'}     | ${''}
      ${'0'}       | ${''}
      ${{}}        | ${''}
      ${0}         | ${''}
      ${1}         | ${''}
      ${true}      | ${''}
      ${false}     | ${''}
    `('with $input, returns $output', ({ input, output }) => {
      expect(validator(input)).toBe(output);
    });
  });
});
