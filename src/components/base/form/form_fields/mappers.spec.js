import { mapToNumber } from './mappers';

describe('components/base/form/form_fields/mappers', () => {
  describe('mapToNumber', () => {
    it.each`
      input      | output
      ${''}      | ${0}
      ${false}   | ${0}
      ${{}}      | ${Number.NaN}
      ${'888'}   | ${888}
      ${'-5e10'} | ${-50000000000}
      ${'55.78'} | ${55.78}
    `('with $input, returns $output', ({ input, output }) => {
      expect(mapToNumber(input)).toBe(output);
    });
  });
});
