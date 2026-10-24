import MockDate from 'mockdate';

/**
 * When applied to a story, this mixin mocks the current date to make
 * visual tests that rely on the date deterministic
 *
 * Usage:
 *
 * import { useFakeDate } from '../../../../tests/utils/use_fake_date';
 * documentedStoriesOf('some|story')
 * .add('default', () => ({
 *   mixins: [useFakeDate()],
 * })
 */
export const useFakeDate = () => {
  if (process.env.IS_VISUAL_TEST) {
    return {
      created() {
        MockDate.set('2026-01-10', 0);
      },
      destroyed() {
        MockDate.reset();
      },
    };
  }
  return {};
};
