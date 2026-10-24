import { setObjectProperty } from './set_utils';

describe('set utils', () => {
  it.each`
    source              | key        | value       | output
    ${undefined}        | ${''}      | ${''}       | ${{}}
    ${null}             | ${''}      | ${''}       | ${{}}
    ${''}               | ${''}      | ${''}       | ${{}}
    ${{}}               | ${''}      | ${''}       | ${{}}
    ${{}}               | ${''}      | ${'value'}  | ${{}}
    ${{}}               | ${'key'}   | ${'value'}  | ${{ key: 'value' }}
    ${{ key: 'value' }} | ${['key']} | ${'value'}  | ${{ key: 'value' }}
    ${{ key: 'value' }} | ${null}    | ${'value'}  | ${{}}
    ${{ key: 'value' }} | ${'key1'}  | ${'value1'} | ${{ key: 'value', key1: 'value1' }}
    ${{ key: 'value' }} | ${'key'}   | ${'value1'} | ${{ key: 'value1' }}
    ${[]}               | ${'key'}   | ${'value1'} | ${{ key: 'value1' }}
  `('set new property on object or update existing', ({ source, key, value, output }) => {
    expect(setObjectProperty(source, key, value)).toEqual(output);
  });
});
