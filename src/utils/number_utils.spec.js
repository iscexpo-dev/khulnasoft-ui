import * as numberUtils from './number_utils';

describe('number utils', () => {
  describe('addition', () => {
    it('adds two numbers together', () => {
      expect(numberUtils.addition(3, 6)).toBe(9);
    });
  });

  describe('sum', () => {
    it('returns the sum of all arguments', () => {
      expect(numberUtils.sum(3, 6, 7, 8, 9, 10)).toBe(43);
    });

    it('returns the sum with some string arguments', () => {
      expect(numberUtils.sum('1.00', '2.00', 3)).toBe(6);
    });
  });

  describe('average', () => {
    it('returns the average of all arguments', () => {
      expect(numberUtils.average(4, 6, 9, 12)).toBe(7.75);
    });

    it('returns the average with some string arguments', () => {
      expect(numberUtils.average('1.00', '2.00', 3)).toBe(2);
    });
  });

  describe('engineeringNotation', () => {
    it.each`
      input                | output
      ${[1000]}            | ${'1k'}
      ${[-1000]}           | ${'-1k'}
      ${[100]}             | ${'100'}
      ${[0.001]}           | ${'1m'}
      ${[200000]}          | ${'200k'}
      ${[9999999]}         | ${'10M'}
      ${[101111]}          | ${'101k'}
      ${[0.00099]}         | ${'990μ'}
      ${[0.009101]}        | ${'9.1m'}
      ${[0.0000007]}       | ${'700n'}
      ${[0.0000007549]}    | ${'755n'}
      ${[0.0000007549, 0]} | ${'800n'}
      ${[0.0000007549, 4]} | ${'754.9n'}
      ${['1,000.00']}      | ${'NaN'}
      ${['a string']}      | ${'NaN'}
      ${[NaN]}             | ${'NaN'}
      ${[Infinity]}        | ${'Infinity'}
      ${[-Infinity]}       | ${'-Infinity'}
    `('with args $input, returns $output', ({ input, output }) => {
      expect(numberUtils.engineeringNotation(...input)).toBe(output);
    });
  });

  describe('modulo', () => {
    it.each`
      n           | divisor | result
      ${-7}       | ${3}    | ${2}
      ${-6}       | ${3}    | ${0}
      ${-5}       | ${3}    | ${1}
      ${-4}       | ${3}    | ${2}
      ${-3}       | ${3}    | ${0}
      ${-2}       | ${3}    | ${1}
      ${-1}       | ${3}    | ${2}
      ${0}        | ${3}    | ${0}
      ${1}        | ${3}    | ${1}
      ${2}        | ${3}    | ${2}
      ${3}        | ${3}    | ${0}
      ${4}        | ${3}    | ${1}
      ${5}        | ${3}    | ${2}
      ${6}        | ${3}    | ${0}
      ${7}        | ${3}    | ${1}
      ${-7}       | ${-3}   | ${-1}
      ${-6}       | ${-3}   | ${0}
      ${-5}       | ${-3}   | ${-2}
      ${-4}       | ${-3}   | ${-1}
      ${-3}       | ${-3}   | ${0}
      ${-2}       | ${-3}   | ${-2}
      ${-1}       | ${-3}   | ${-1}
      ${0}        | ${-3}   | ${0}
      ${1}        | ${-3}   | ${-2}
      ${2}        | ${-3}   | ${-1}
      ${3}        | ${-3}   | ${0}
      ${4}        | ${-3}   | ${-2}
      ${5}        | ${-3}   | ${-1}
      ${6}        | ${-3}   | ${0}
      ${7}        | ${-3}   | ${-2}
      ${NaN}      | ${1}    | ${NaN}
      ${1}        | ${NaN}  | ${NaN}
      ${1}        | ${0}    | ${NaN}
      ${Infinity} | ${1}    | ${NaN}
    `('modulo($n, $divisor) === $result', ({ n, divisor, result }) => {
      expect(numberUtils.modulo(n, divisor)).toBe(result);
    });
  });

  describe('formatNumberToLocale', () => {
    it('should format the provided string of either an integer or float', () => {
      expect(numberUtils.formatNumberToLocale('1234')).toEqual('1,234');
      expect(numberUtils.formatNumberToLocale('222222.233')).toEqual('222,222.233');
    });

    it('should not format the provided string if it contains no numbers', () => {
      expect(numberUtils.formatNumberToLocale('aaaa')).toEqual('aaaa');
    });

    it('should use the options if they are provided', () => {
      expect(numberUtils.formatNumberToLocale('222222.233', { minimumFractionDigits: 4 })).toEqual(
        '222,222.2330',
      );
    });

    it('should override the locale if one is provided', () => {
      expect(numberUtils.formatNumberToLocale('222222.233', {}, 'de-de')).toEqual('222.222,233');
    });
  });

  describe('toFloat', () => {
    it.each`
      value              | defaultValue | output
      ${1}               | ${undefined} | ${1}
      ${'1'}             | ${undefined} | ${1}
      ${1.23}            | ${undefined} | ${1.23}
      ${'1.23'}          | ${undefined} | ${1.23}
      ${1e5}             | ${undefined} | ${100000}
      ${'1e5'}           | ${undefined} | ${100000}
      ${'256 foobar'}    | ${undefined} | ${256}
      ${'256.78 foobar'} | ${undefined} | ${256.78}
      ${'foo 256bar'}    | ${undefined} | ${NaN}
      ${{}}              | ${undefined} | ${NaN}
      ${[]}              | ${undefined} | ${NaN}
      ${new Date()}      | ${undefined} | ${NaN}
      ${null}            | ${undefined} | ${NaN}
      ${undefined}       | ${undefined} | ${NaN}
      ${null}            | ${0}         | ${0}
      ${undefined}       | ${-1}        | ${-1}
    `('toFloat($input, $defaultValue) === $output', ({ value, defaultValue, output }) => {
      expect(numberUtils.toFloat(value, defaultValue)).toBe(output);
    });
  });
});
