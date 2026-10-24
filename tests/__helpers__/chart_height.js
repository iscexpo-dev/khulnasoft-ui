import { HEIGHT_AUTO_CLASSES } from '~/utils/charts/constants';

/**
 * Shared tests for height auto styles on chart components that use GlChart.
 *
 * @param {Function} createComponent - The factory used to create the wrapper.
 * @param {Function} findContainer - The finder for the chart container, usually the wrapper.
 * @param {Function} findChart - The finder for the chart component.
 * @param {String} classes - The expected height classes to find on the chart component.
 */
export const expectHeightAutoClasses = ({
  createComponent,
  findContainer,
  findChart,
  classes = HEIGHT_AUTO_CLASSES,
}) => {
  it('does not set the height classes by default', () => {
    createComponent();

    expect(findContainer().classes()).not.toEqual(expect.arrayContaining(classes.split(' ')));
    expect(findChart().classes()).not.toContain('gl-grow');
  });

  it('sets the height classes when height is "auto"', () => {
    createComponent({ height: 'auto' });

    expect(findContainer().classes()).toEqual(expect.arrayContaining(classes.split(' ')));
    expect(findChart().classes()).toContain('gl-grow');
  });
};
