import { shallowMount } from '@vue/test-utils';
import { iconSizeOptions } from '~/utils/constants';
import { logWarning } from '../../../utils/utils';
import Icon from './icon.vue';

const ICONS_PATH = '/path/to/icons.svg';
const TEST_SIZE = 8;
const TEST_NAME = 'check-circle';

jest.mock('@gitlab/svgs/dist/icons.svg', () => '/path/to/icons.svg', { virtual: true });
jest.mock('../../../utils/utils', () => ({
  logWarning: jest.fn(),
}));

describe('Icon component', () => {
  let wrapper;

  const createComponent = (props) => {
    wrapper = shallowMount(Icon, {
      propsData: {
        size: TEST_SIZE,
        name: TEST_NAME,
        ...props,
      },
    });
  };

  const validateSize = (size) => Icon.props.size.validator(size);
  const validateName = (name) => Icon.props.name.validator(name);
  const validateVariant = (variant) => Icon.props.variant.validator(variant);

  it('has role=img', () => {
    createComponent();

    expect(wrapper.attributes('role')).toBe('img');
  });

  describe('when created', () => {
    beforeEach(() => {
      createComponent();
    });

    it(`shows svg class "s${TEST_SIZE}" and path "${ICONS_PATH}#${TEST_NAME}"`, () => {
      expect(wrapper.classes()).toContain(`s${TEST_SIZE}`);
      expect(wrapper.find('use').attributes('href')).toEqual(`${ICONS_PATH}#${TEST_NAME}`);
    });
  });

  describe('size validator', () => {
    const maxSize = Math.max(...iconSizeOptions);

    it('fails with size outside options', () => {
      expect(validateSize(maxSize + 10)).toBe(false);
    });

    it('passes with size in options', () => {
      expect(validateSize(maxSize)).toBe(true);
    });
  });

  describe('name validator', () => {
    it('fails with name that does not exist', () => {
      const badName = `${TEST_NAME}-bogus-zebra`;

      expect(validateName(badName)).toBe(false);

      expect(logWarning).toHaveBeenCalledWith(
        `Icon '${badName}' is not a known icon of @gitlab/svgs`,
        { name: 'GlIcon' },
      );
    });

    it('passes with name that exists', () => {
      expect(validateName(TEST_NAME)).toBe(true);
    });
  });

  describe('aria-hidden', () => {
    it('is true when there is no aria-label', () => {
      createComponent();

      expect(wrapper.attributes('aria-hidden')).toBe('true');
    });

    it('does not exist there is an aria-label', () => {
      createComponent({ 'aria-label': 'Icon label' });

      expect(wrapper.attributes('aria-hidden')).toBeUndefined();
    });
  });

  describe('variant', () => {
    describe('validator', () => {
      it('fails with size outside options', () => {
        expect(validateVariant('bogus')).toBe(false);
      });

      it('passes with size in options', () => {
        expect(validateVariant('default')).toBe(true);
      });
    });

    describe('classes', () => {
      it('adds `gl-fill-current` class to svg element when variant is not provided', () => {
        createComponent();
        expect(wrapper.classes()).toContain('gl-fill-current');
      });

      it('adds fill class to svg element when variant is provided', () => {
        createComponent({ variant: 'warning' });
        expect(wrapper.classes()).toContain('gl-fill-icon-warning');
      });
    });
  });
});
