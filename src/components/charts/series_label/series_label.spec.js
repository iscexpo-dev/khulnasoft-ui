import { shallowMount } from '@vue/test-utils';
import GlChartSeriesLabel from './series_label.vue';

describe('GlChartSeriesLabel', () => {
  let wrapper;

  const createComponent = (props = {}) => {
    wrapper = shallowMount(GlChartSeriesLabel, {
      propsData: {
        color: 'red',
        ...props,
      },
      slots: {
        default: 'Series name',
      },
    });
  };

  const findSwatch = () => wrapper.find('svg');

  it('renders the slot content as the label text', () => {
    createComponent();

    expect(wrapper.find('.gl-series-label-text').text()).toBe('Series name');
  });

  it('renders a decorative color swatch hidden from assistive technology', () => {
    createComponent();

    expect(findSwatch().exists()).toBe(true);
    expect(findSwatch().attributes('aria-hidden')).toBe('true');
  });

  it('does not render the color swatch when color is empty', () => {
    createComponent({ color: '' });

    expect(findSwatch().exists()).toBe(false);
  });
});
