import { tokensValidator } from './helpers';

describe('tokensValidator', () => {
  it('returns `true` when all items have an `id` key', () => {
    const items = [
      {
        id: 1,
        name: 'foo',
      },
      {
        id: 2,
        name: 'bar',
      },
      {
        id: 3,
        name: 'baz',
      },
    ];

    expect(tokensValidator(items)).toBe(true);
  });

  it('returns `false` when an item does not have an `id` key', () => {
    const items = [
      {
        name: 'foo',
      },
      {
        id: 2,
        name: 'bar',
      },
      {
        id: 3,
        name: 'baz',
      },
    ];

    expect(tokensValidator(items)).toBe(false);
  });
});
