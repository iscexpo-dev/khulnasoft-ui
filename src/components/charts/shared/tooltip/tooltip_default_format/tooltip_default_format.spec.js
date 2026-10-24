import { shallowMount } from '@vue/test-utils';

import SeriesLabel from '../../../series_label/series_label.vue';
import TooltipDefaultFormat from './tooltip_default_format.vue';

const mockTooltipContent = {
  'Series A': {
    color: '#000000',
    value: 1000,
  },
  'Series B': {
    color: '#ffffff',
    value: 5555.5,
  },
};

describe('tooltip default format', () => {
  let wrapper;

  const createComponent = ({ props, ...options } = {}) => {
    wrapper = shallowMount(TooltipDefaultFormat, {
      propsData: {
        tooltipContent: mockTooltipContent,
        ...props,
      },
      ...options,
    });
  };

  const findSeriesLabelAt = (i) => wrapper.findAllComponents(SeriesLabel).at(i);

  it('renders default tooltip', () => {
    createComponent();

    const text = wrapper.text();

    expect(text).toContain('Series A');
    expect(text).toContain('1000');

    expect(text).toContain('Series B');
    expect(text).toContain('5555.5');
  });

  it('renders label colors', () => {
    createComponent();

    expect(findSeriesLabelAt(0).props('color')).toBe('#000000');
    expect(findSeriesLabelAt(1).props('color')).toBe('#ffffff');
  });

  it('renders formatted values', () => {
    createComponent({
      scopedSlots: {
        'tooltip-value': ({ value }) =>
          value.toLocaleString(undefined, {
            minimumFractionDigits: 2,
          }),
      },
    });

    const text = wrapper.text();

    expect(text).toContain('Series A');
    expect(text).toContain('1,000.00');

    expect(text).toContain('Series B');
    expect(text).toContain('5,555.50');
  });
});
