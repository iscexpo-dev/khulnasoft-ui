import { disableControls } from './stories_utils';

describe('stories utils', () => {
  describe('disableControls', () => {
    const DISABLE_CONTROL_PARAMETER = { control: { disable: true } };

    it('returns an empty object if no argument is given', () => {
      expect(disableControls()).toEqual({});
    });

    it('returns parameters object when given an array of strings', () => {
      expect(disableControls(['foo', 'bar'])).toEqual({
        foo: DISABLE_CONTROL_PARAMETER,
        bar: DISABLE_CONTROL_PARAMETER,
      });
    });
  });
});
