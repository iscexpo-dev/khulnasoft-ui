import { shallowMount } from '@vue/test-utils';
import ClearIconButton from './clear_icon_button.vue';

describe('Clear Icon Button', () => {
  let wrapper;

  const defaultPropsData = {
    title: 'Tooltip Text',
    tooltipContainer: '#divId',
  };

  const createComponent = (propsData = defaultPropsData) => {
    wrapper = shallowMount(ClearIconButton, { propsData });
  };

  beforeEach(() => {
    createComponent();
  });

  it('renders successfully', () => {
    expect(wrapper.element).toMatchSnapshot();
  });
});
