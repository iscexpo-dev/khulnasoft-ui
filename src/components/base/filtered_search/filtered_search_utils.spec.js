import { reactive } from 'vue';
import {
  splitOnQuotes,
  wrapTokenInQuotes,
  stepIndexAndWrap,
  tokenToOption,
} from './filtered_search_utils';

describe('FilteredSearchUtils', () => {
  describe('splitOnQuotes', () => {
    it('returns token as an array', () => {
      const token = 'token';

      expect(splitOnQuotes(token)).toEqual([token]);
    });

    it('splits the token by spaces', () => {
      const token = 'some token with spaces';

      expect(splitOnQuotes(token)).toEqual(['some', 'token', 'with', 'spaces']);
    });

    it("doesn't split if token is inside quotes", () => {
      const token = '"token inside"';

      expect(splitOnQuotes(token)).toEqual([token]);
    });

    it("doesn't split if the token has multiple quotes", () => {
      const token = `'My "old" milestone'`;

      expect(splitOnQuotes(token)).toEqual([token]);
    });
  });

  describe('wrapTokenInQuotes', () => {
    it('returns token if no space is present', () => {
      const token = 'foo';

      expect(wrapTokenInQuotes(token)).toEqual(token);
    });

    it('returns token if already wrapped in quotes', () => {
      const token1 = '"foo"';
      const token2 = "'foo'";

      expect(wrapTokenInQuotes(token1)).toEqual(token1);
      expect(wrapTokenInQuotes(token2)).toEqual(token2);
    });

    it('returns wrapped token', () => {
      const token = 'foo bar';

      expect(wrapTokenInQuotes(token)).toEqual(`"${token}"`);
    });
  });

  describe('stepIndexAndWrap', () => {
    it.each`
      index  | step   | length | result
      ${0}   | ${0}   | ${5}   | ${0}
      ${0}   | ${1}   | ${5}   | ${1}
      ${0}   | ${-1}  | ${5}   | ${4}
      ${0}   | ${6}   | ${5}   | ${1}
      ${0}   | ${-6}  | ${5}   | ${4}
      ${1}   | ${0}   | ${5}   | ${1}
      ${1}   | ${1}   | ${5}   | ${2}
      ${1}   | ${-2}  | ${5}   | ${4}
      ${1}   | ${-5}  | ${5}   | ${1}
      ${-1}  | ${0}   | ${5}   | ${-1}
      ${6}   | ${0}   | ${5}   | ${6}
      ${6}   | ${1}   | ${5}   | ${0}
      ${6}   | ${-1}  | ${5}   | ${4}
      ${-1}  | ${1}   | ${5}   | ${0}
      ${-1}  | ${-1}  | ${5}   | ${4}
      ${-1}  | ${-5}  | ${5}   | ${0}
      ${-1}  | ${5}   | ${5}   | ${4}
      ${4}   | ${1}   | ${5}   | ${0}
      ${4}   | ${2}   | ${5}   | ${1}
      ${NaN} | ${1}   | ${1}   | ${0}
      ${0}   | ${NaN} | ${1}   | ${NaN}
      ${0}   | ${1}   | ${NaN} | ${NaN}
      ${0}   | ${1}   | ${0}   | ${NaN}
    `('stepIndex($index, $step, $length) === $result', ({ index, step, length, result }) => {
      expect(stepIndexAndWrap(index, step, length, result)).toBe(result);
    });
  });

  describe('tokenToOption', () => {
    it('unwraps a reactive option component', () => {
      const optionComponent = { render: () => null };
      const {
        tokens: [token],
      } = reactive({ tokens: [{ type: 'a', optionComponent }] });

      expect(tokenToOption(token).component).toBe(optionComponent);
    });
  });
});
