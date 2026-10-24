import { isVue3, safeVueInstance } from './vue_utils';

describe('isVue3', () => {
  it('returns true for a Vue 3 instance (has $ property)', () => {
    expect(isVue3({ $: {} })).toBe(true);
  });

  it('returns false for a Vue 2 instance (no $ property)', () => {
    expect(isVue3({})).toBe(false);
  });

  it('returns false for an instance with a falsy $ property', () => {
    expect(isVue3({ $: null })).toBe(false);
    expect(isVue3({ $: 0 })).toBe(false);
    expect(isVue3({ $: '' })).toBe(false);
  });
});

describe('safeVueInstance', () => {
  describe('when the target is not a Vue 3 instance', () => {
    it('returns the original target as-is', () => {
      const target = { foo: 'bar' };

      expect(safeVueInstance(target)).toBe(target);
    });
  });

  describe('when the target is a Vue 3 instance', () => {
    const createVue3LikeTarget = (props = {}) => ({ $: {}, ...props });

    it('returns existing properties', () => {
      const target = createVue3LikeTarget({ foo: 'bar', count: 0, empty: '' });
      const proxy = safeVueInstance(target);

      expect(proxy.foo).toBe('bar');
      expect(proxy.count).toBe(0);
      expect(proxy.empty).toBe('');
    });

    it('returns undefined for non-existent properties', () => {
      const target = createVue3LikeTarget({ foo: 'bar' });
      const proxy = safeVueInstance(target);

      expect(proxy.$router).toBeUndefined();
      expect(proxy.nonExistent).toBeUndefined();
    });

    it('returns a wrapper, not the original target', () => {
      const target = createVue3LikeTarget({ foo: 'bar' });

      expect(safeVueInstance(target)).not.toBe(target);
    });
  });
});
