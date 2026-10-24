import { mount } from '@vue/test-utils';
import { progressBarVariantOptions } from '../../../utils/constants';
import ProgressBar from './progress_bar.vue';

describe('GlProgressBar', () => {
  let wrapper;

  const createWrapper = (propsData) => {
    wrapper = mount(ProgressBar, {
      propsData,
    });
  };

  const findProgress = () => wrapper.find('[role="progressbar"]');

  beforeEach(() => {
    createWrapper();
  });

  describe('default', () => {
    it('renders wrapper with expected classes and style', () => {
      expect(wrapper.classes()).toMatchObject(['gl-progress-bar', 'progress']);
      expect(wrapper.attributes('style')).toBeUndefined();
    });

    it('renders child with expected classes and attributes', () => {
      const progress = findProgress();

      expect(progress.classes()).toMatchObject(['gl-progress', 'gl-progress-bar-primary']);
      expect(progress.attributes('style')).toBe('transform: scaleX(0);');
      expect(progress.attributes('aria-label')).toBe('Progress bar');
      expect(progress.attributes('aria-valuemin')).toBe('0');
      expect(progress.attributes('aria-valuemax')).toBe('100');
      expect(progress.attributes('aria-valuenow')).toBe('0');
    });
  });

  describe('value', () => {
    it('sets style and attributes correctly when setting `value`', () => {
      const value = 65.6;
      createWrapper({ value });

      const progress = findProgress();
      const computedValue = parseFloat(value) / parseFloat(100);

      expect(progress.attributes('style')).toBe(`transform: scaleX(${computedValue});`);
      expect(progress.attributes('aria-valuenow')).toBe(`${parseFloat(value)}`);
    });
  });

  describe('ariaLabel', () => {
    it('sets value from prop', () => {
      const label = 'Progress';
      createWrapper({ ariaLabel: label });

      const progress = findProgress();

      expect(progress.attributes('aria-label')).toBe('Progress');
    });
  });

  describe('max', () => {
    it('sets style and attributes correctly when using custom `max`', () => {
      const value = 45.1;
      const max = 75.5;
      createWrapper({ value, max });

      const progress = findProgress();
      const computedValue = parseFloat(value) / parseFloat(max);

      expect(progress.attributes('style')).toBe(`transform: scaleX(${computedValue});`);
      expect(progress.attributes('aria-valuemax')).toBe(`${parseFloat(max)}`);
      expect(progress.attributes('aria-valuenow')).toBe(`${parseFloat(value)}`);
    });
  });

  describe('variant', () => {
    it.each(Object.values(progressBarVariantOptions))(
      'sets correct css class for variant %s',
      (variant) => {
        createWrapper({ variant });

        expect(findProgress().classes()).toMatchObject([
          'gl-progress',
          `gl-progress-bar-${variant}`,
        ]);
      },
    );
  });

  describe('height', () => {
    it('sets height correctly', () => {
      createWrapper({ height: '5px' });

      expect(wrapper.attributes('style')).toBe('height: 5px;');
    });
  });
});
