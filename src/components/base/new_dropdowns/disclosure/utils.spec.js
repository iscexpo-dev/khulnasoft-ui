import { itemsValidator, isItem, isGroup } from './utils';
import { mockItems, mockGroups } from './mock_data';

describe('isItem', () => {
  it.each([null, undefined, {}, { text: null }, { text: 'group', items: [] }])(
    'isItem(%p) === false',
    (notAnItem) => {
      expect(isItem(notAnItem)).toBe(false);
    },
  );

  it.each([
    { text: 'Action' },
    { text: 'Action', href: 'khulnasoft.com' },
    {
      text: 'Action',
      action: () => {},
    },
    {
      text: 'Action',
      href: 'khulnasoft.com',
      action: () => {},
    },
  ])('isItem(%p) === true', (item) => {
    expect(isItem(item)).toBe(true);
  });
});

describe('isGroup', () => {
  it.each([null, undefined, {}, { name: null }, { name: 'group', items: [] }])(
    'isGroup(%p) === false',
    (notAGroup) => {
      expect(isGroup(notAGroup)).toBe(false);
    },
  );

  it.each([
    {
      name: 'group',
      items: [
        { text: 'Action', href: 'khulnasoft.com' },
        {
          text: 'Action',
          action: () => {},
        },
      ],
    },
    {
      items: [
        { text: 'Action', href: 'khulnasoft.com' },
        {
          text: 'Action',
          action: () => {},
        },
      ],
    },
  ])('isGroup(%p) === true', (group) => {
    expect(isGroup(group)).toBe(true);
  });
});

describe('itemsValidator', () => {
  it.each`
    description                   | value                                        | expected
    ${'valid flat items'}         | ${mockItems}                                 | ${true}
    ${'valid grouped items'}      | ${mockGroups}                                | ${true}
    ${'empty list'}               | ${[]}                                        | ${true}
    ${'invalid items'}            | ${[{ foo: true }]}                           | ${false}
    ${'group with invalid items'} | ${[{ name: 'foo', items: [{ foo: true }] }]} | ${false}
    ${'sibling groups and items'} | ${[...mockItems, ...mockGroups]}             | ${false}
  `('returns $expected given $description', ({ value, expected }) => {
    expect(itemsValidator(value)).toBe(expected);
  });
});
