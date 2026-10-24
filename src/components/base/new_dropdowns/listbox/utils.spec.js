import { isOption, flattenedOptions, itemsValidator } from './utils';
import { mockOptions, mockGroups } from './mock_data';

describe('isOption', () => {
  it.each([null, undefined, {}, { text: 'group', options: [] }])(
    'isOption(%p) === false',
    (notAnOption) => {
      expect(isOption(notAnOption)).toBe(false);
    },
  );

  it.each([
    { value: null },
    { value: '' },
    { value: 5.3 },
    { value: 'foo', text: 'bar' },
    { value: 'qux', foo: true },
  ])('isOption(%p) === true', (option) => {
    expect(isOption(option)).toBe(true);
  });
});

describe('flattenedOptions', () => {
  it('returns flattened items as-is', () => {
    expect(flattenedOptions(mockOptions)).toEqual(mockOptions);
  });

  it('returns flattened items given groups items', () => {
    expect(flattenedOptions(mockGroups)).toEqual([
      ...mockGroups[0].options,
      ...mockGroups[1].options,
    ]);
  });

  it('returns flattened items given mixed items/groups', () => {
    expect(flattenedOptions([...mockOptions, ...mockGroups])).toEqual([
      ...mockOptions,
      ...mockGroups[0].options,
      ...mockGroups[1].options,
    ]);
  });
});

describe('itemsValidator', () => {
  it.each`
    description                         | value                                                                                   | expected
    ${'valid flat items'}               | ${mockOptions}                                                                          | ${true}
    ${'valid grouped items'}            | ${mockGroups}                                                                           | ${true}
    ${'empty list'}                     | ${[]}                                                                                   | ${true}
    ${'invalid items'}                  | ${[{ foo: true }]}                                                                      | ${false}
    ${'group with invalid items'}       | ${[{ text: 'foo', options: [{ foo: true }] }]}                                          | ${false}
    ${'non-unique items'}               | ${[{ value: 'a' }, { value: 'a' }]}                                                     | ${false}
    ${'non-unique items across groups'} | ${[{ text: 'a', options: [{ value: 'b' }] }, { text: 'z', options: [{ value: 'b' }] }]} | ${false}
    ${'non-unique groups'}              | ${[{ text: 'a', options: [] }, { text: 'a', options: [] }]}                             | ${false}
    ${'sibling groups and options'}     | ${[...mockOptions, ...mockGroups]}                                                      | ${false}
  `('returns $expected given $description', ({ value, expected }) => {
    expect(itemsValidator(value)).toBe(expected);
  });
});
