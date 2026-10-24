import { nextTick } from 'vue';
import { shallowMount } from '@vue/test-utils';
import { mockPathItems } from './data';
import GlPath from './path.vue';

const PATH_ACTIVE_ITEM_CLASS = 'gl-path-active-item';
const BACKGROUND_COLOR_DEFAULT = 'rgba(0,0,0,0)';
const BACKGROUND_COLOR_LIGHT_GRAY = '#f0f0f0';

describe('Path', () => {
  let wrapper;

  const createComponent = (props = {}, options = {}) => {
    return shallowMount(GlPath, {
      propsData: {
        items: mockPathItems(),
        ...props,
      },
      ...options,
    });
  };

  const pathNav = () => {
    return wrapper.find('[data-testid="gl-path-nav"]').element;
  };

  const listItems = () => {
    return wrapper.vm.$refs.pathListItems;
  };

  const pathItemAt = (index) => {
    return listItems()[index].children[0];
  };

  const pathItemTextAt = (index) => {
    return pathItemAt(index).textContent;
  };

  const clickItemAt = (index) => {
    pathItemAt(index).click();
  };

  beforeEach(() => {
    wrapper = createComponent();
  });

  it('matches the snapshot', () => {
    expect(wrapper.element).toMatchSnapshot();
  });

  describe('background color selection', () => {
    describe('with no background color specified', () => {
      it('displays the default background color', () => {
        expect(pathNav().style.getPropertyValue('--path-bg-color')).toBe(BACKGROUND_COLOR_DEFAULT);
      });
    });

    describe('with a background color specified', () => {
      beforeEach(() => {
        wrapper = createComponent({ backgroundColor: BACKGROUND_COLOR_LIGHT_GRAY });
      });

      it('sets the correct background color', () => {
        expect(pathNav().style.getPropertyValue('--path-bg-color')).toBe(
          BACKGROUND_COLOR_LIGHT_GRAY,
        );
      });
    });
  });

  describe('renders the list of items', () => {
    it('renders the correct number of items', () => {
      expect(listItems()).toHaveLength(mockPathItems().length);
    });

    it('renders the items in the correct order', () => {
      const items = mockPathItems();
      expect(pathItemTextAt(0)).toContain(items[0].title);
      expect(pathItemTextAt(4)).toContain(items[4].title);
      expect(pathItemTextAt(9)).toContain(items[9].title);
    });

    describe('with metrics', () => {
      const testMetric = '12d';

      beforeEach(() => {
        const data = mockPathItems();
        data[0].metric = testMetric;

        wrapper = createComponent({ items: data });
      });

      it('matches the snapshot', () => {
        expect(wrapper.element).toMatchSnapshot();
      });

      it('renders the inline metric', () => {
        expect(pathItemTextAt(0)).toContain(mockPathItems()[0].title);
        expect(pathItemTextAt(0)).toContain(testMetric);
      });
    });

    describe('with icons', () => {
      const iconName = 'home';

      beforeEach(() => {
        const data = mockPathItems();
        data[0].icon = iconName;

        wrapper = createComponent({ items: data });
      });

      it('matches the snapshot', () => {
        expect(wrapper.element).toMatchSnapshot();
      });

      it('renders the inline icon', () => {
        const icon = wrapper.find('[data-testid="gl-path-item-icon"]');

        expect(icon.exists()).toBe(true);
        expect(icon.props('name')).toBe(iconName);
      });
    });
  });

  describe('renders the correct selected item', () => {
    describe('with no selected item passed in', () => {
      it('selects the first item', () => {
        expect(pathItemAt(0).classList).toContain(PATH_ACTIVE_ITEM_CLASS);
      });

      it('updates the selected item when props change', async () => {
        const items = mockPathItems();
        items[3].selected = true;

        wrapper.setProps({ items });
        await nextTick();

        expect(pathItemAt(0).classList).not.toContain(PATH_ACTIVE_ITEM_CLASS);
        expect(pathItemAt(3).classList).toContain(PATH_ACTIVE_ITEM_CLASS);
      });
    });

    describe('with a specifically selected item passed in', () => {
      beforeEach(() => {
        const data = mockPathItems();
        data[3].selected = true;

        wrapper = createComponent({ items: data });
      });

      it('selects the correct item', () => {
        expect(pathItemAt(3).classList).toContain(PATH_ACTIVE_ITEM_CLASS);
      });
    });

    describe('with multiple selected items passed in', () => {
      beforeEach(() => {
        const data = mockPathItems();
        data[3].selected = true;
        data[5].selected = true;

        wrapper = createComponent({ items: data });
      });

      it('selects the first selected option', () => {
        expect(pathItemAt(3).classList).toContain(PATH_ACTIVE_ITEM_CLASS);
        expect(pathItemAt(5).classList).not.toContain(PATH_ACTIVE_ITEM_CLASS);
      });
    });
  });

  describe('event handling', () => {
    describe('when an item is clicked', () => {
      it('emits the selected event with the correct data', () => {
        const items = mockPathItems();
        clickItemAt(1);
        clickItemAt(4);
        clickItemAt(6);

        expect(wrapper.emitted('selected')).toEqual([[items[1]], [items[4]], [items[6]]]);
      });
    });

    describe('when a disabled item is clicked', () => {
      it('does not emit the selected event', () => {
        clickItemAt(7);

        expect(wrapper.emitted('selected')).toBeUndefined();
      });
    });
  });

  describe('slots', () => {
    beforeEach(() => {
      wrapper = createComponent(null, {
        scopedSlots: {
          default: `
            <div
              :data-pathid="props.pathId"
              data-testid="path-item-slot-content">
              {{ props.pathItem.title }}
            </div>
          `,
        },
      });
    });

    it('contains all elements passed into the default slot', () => {
      mockPathItems().forEach((item, index) => {
        const pathItem = wrapper.findAll('[data-testid="path-item-slot-content"]').at(index);

        expect(pathItem.text()).toBe(item.title);
        expect(pathItem.attributes('data-pathid')).toContain('path-');
      });
    });
  });
});
