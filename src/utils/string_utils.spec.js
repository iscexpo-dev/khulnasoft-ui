import { splitAfterSymbols, getAvatarChar } from './string_utils';

describe('string utils', () => {
  describe('splitAfterSymbols', () => {
    it.each`
      string          | symbols                                 | result
      ${''}           | ${[]}                                   | ${['']}
      ${''}           | ${['']}                                 | ${['']}
      ${''}           | ${['/']}                                | ${['']}
      ${'/'}          | ${['/']}                                | ${['/']}
      ${'//'}         | ${['/']}                                | ${['/', '/']}
      ${'foo'}        | ${[]}                                   | ${['foo']}
      ${'foo'}        | ${['/']}                                | ${['foo']}
      ${'foo'}        | ${['']}                                 | ${['foo']}
      ${'a/b'}        | ${['/']}                                | ${['a/', 'b']}
      ${'a/b/c'}      | ${['/']}                                | ${['a/', 'b/', 'c']}
      ${'a/b-c'}      | ${['/', '-']}                           | ${['a/', 'b-', 'c']}
      ${'a/b-c'}      | ${['-', '/']}                           | ${['a/', 'b-', 'c']}
      ${'/-/-/'}      | ${['/', '-']}                           | ${['/', '-', '/', '-', '/']}
      ${`"'<>&/\\`}   | ${[`"`, `'`, `<`, `>`, `&`, `/`, `\\`]} | ${`"'<>&/\\`.split('')}
      ${'some words'} | ${['om', 'ord']}                        | ${['som', 'e word', 's']}
      ${'some words'} | ${['o', 'om']}                          | ${['so', 'me wo', 'rds']}
      ${'some words'} | ${['om', 'o']}                          | ${['som', 'e wo', 'rds']}
    `('given "$string" and $symbols returns $result', ({ string, symbols, result }) => {
      const actual = splitAfterSymbols(symbols, string);
      expect(actual).toEqual(result);
      expect(actual.join('')).toEqual(string);
    });
  });

  describe('Avatar name parsing', () => {
    it('Returns first character of name', () => {
      expect(getAvatarChar('Some Project')).toBe('S');
    });

    it('Returns empty if name is empty', () => {
      expect(getAvatarChar('')).toBe('');
    });

    it('Returns emoji if it is first character in name', () => {
      expect(getAvatarChar('🦊Tanuki')).toBe('🦊');
    });

    it('Returns first character if emoji is not first in name', () => {
      expect(getAvatarChar('tanuki🦊')).toBe('T');
    });

    it('Returns zero-width joined emoji if the name starts with it', () => {
      expect(getAvatarChar('🏴‍☠️Zero-width join')).toBe('🏴‍☠️');
    });

    it('Returns only first emoji if the name starts with multiple', () => {
      expect(getAvatarChar('🏴‍☠️🙂Multiple Emoji')).toBe('🏴‍☠️');
    });
  });
});
