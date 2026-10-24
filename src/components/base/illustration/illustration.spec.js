import { shallowMount } from '@vue/test-utils';
import { logWarning } from '../../../utils/utils';
import Illustration from './illustration.vue';

const ILLUSTRATIONS_PATH = '/path/to/illustrations.svg';
const TEST_NAME = 'add-user-sm';

jest.mock('@gitlab/svgs/dist/illustrations.svg', () => '/path/to/illustrations.svg', { virtual: true });
jest.mock('../../../utils/utils', () => ({
  logWarning: jest.fn(),
}));

describe('Illustration component', () => {
  let wrapper;

  const createComponent = (props) => {
    wrapper = shallowMount(Illustration, {
      propsData: {
        name: TEST_NAME,
        ...props,
      },
    });
  };

  const validateName = (name) => Illustration.props.name.validator(name);

  it('has role=presentation', () => {
    createComponent();

    expect(wrapper.attributes('role')).toBe('presentation');
  });

  describe('when created', () => {
    beforeEach(() => {
      createComponent();
    });

    it(`shows svg path "${ILLUSTRATIONS_PATH}#${TEST_NAME}"`, () => {
      expect(wrapper.find('use').attributes('href')).toEqual(`${ILLUSTRATIONS_PATH}#${TEST_NAME}`);
    });
  });

  describe('name validator', () => {
    it('fails with name that does not exist', () => {
      const badName = `${TEST_NAME}-bogus-zebra`;

      expect(validateName(badName)).toBe(false);

      expect(logWarning).toHaveBeenCalledWith(
        `Illustration '${badName}' is not a known illustration of @gitlab/svgs`,
        { name: 'GlIllustration' },
      );
    });

    it('passes with name that exists', () => {
      expect(validateName(TEST_NAME)).toBe(true);
    });
  });
});
