import { shallowMount } from '@vue/test-utils';
import GlListboxGroup from './listbox_group.vue';

describe('GlListboxGroup', () => {
  let wrapper;
  const name = 'Group name';

  const buildWrapper = ({ propsData, slots } = {}) => {
    wrapper = shallowMount(GlListboxGroup, {
      propsData: {
        name,
        ...propsData,
      },
      slots,
    });
  };

  const findByTestId = (testid, root = wrapper) => root.find(`[data-testid="${testid}"]`);
  const findLabelElement = () => {
    const labelElementId = wrapper.attributes('aria-labelledby');
    return wrapper.find(`#${labelElementId}`);
  };

  it('renders a group', () => {
    buildWrapper();

    expect(wrapper.find('ul[role="group"]').element).toBe(wrapper.element);
  });

  it('renders default slot content', () => {
    buildWrapper({ slots: { default: '<li data-testid="default-slot-content"></li>' } });

    expect(findByTestId('default-slot-content').exists()).toBe(true);
  });

  it('labels the group', () => {
    buildWrapper();

    expect(findLabelElement().text()).toBe(name);
  });

  it('allows arbitrary content for group label', () => {
    buildWrapper({ slots: { 'group-label': '<i data-testid="custom-name"></i>' } });

    expect(findByTestId('custom-name', findLabelElement()).exists()).toBe(true);
  });

  describe('`textSrOnly` is true', () => {
    beforeEach(() => {
      buildWrapper({
        propsData: {
          textSrOnly: true,
        },
      });
    });

    it('adds `gl-sr-only` class', () => {
      expect(findLabelElement().classes('gl-sr-only')).toBe(true);
    });
  });
});
