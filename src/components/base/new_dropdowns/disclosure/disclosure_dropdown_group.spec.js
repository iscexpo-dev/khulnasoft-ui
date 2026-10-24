import { shallowMount } from '@vue/test-utils';
import GlDisclosureDropdownGroup, { BORDER_CLASSES } from './disclosure_dropdown_group.vue';
import GlDisclosureDropdownItem from './disclosure_dropdown_item.vue';
import { mockGroups, mockProfileGroups } from './mock_data';
import { DISCLOSURE_DROPDOWN_GROUP_BORDER_POSITIONS as borderPositions } from './constants';

describe('GlDisclosureDropdownGroup', () => {
  let wrapper;

  const buildWrapper = ({ propsData, slots } = {}) => {
    wrapper = shallowMount(GlDisclosureDropdownGroup, {
      propsData: {
        group: mockGroups[0],
        ...propsData,
      },
      stubs: {
        GlDisclosureDropdownItem,
      },
      slots,
    });
  };

  const findGroup = () => wrapper.find('ul');
  const findItems = () => wrapper.findAllComponents(GlDisclosureDropdownItem);
  const findByTestId = (testid, root = wrapper) => root.find(`[data-testid="${testid}"]`);
  const findLabelElement = () => {
    const labelElementId = findGroup().attributes('aria-labelledby');
    return wrapper.find(`#${labelElementId}`);
  };

  it('renders default slot content', () => {
    buildWrapper({ slots: { default: '<li data-testid="default-slot-content"></li>' } });

    expect(findByTestId('default-slot-content').exists()).toBe(true);
  });

  it('renders list of items if default content was not provided', () => {
    buildWrapper();

    expect(findItems()).toHaveLength(mockGroups[0].items.length);
  });

  it('renders `list-item` content in a `list-item` slot of `GlDisclosureDropdownItem`', () => {
    buildWrapper({
      slots: { 'list-item': '<span data-testid="list-item-content"></span>' },
    });

    expect(findItems()).toHaveLength(mockGroups[0].items.length);

    expect(findItems().at(0).find('[data-testid="list-item-content"]').exists()).toBe(true);
  });

  describe('label', () => {
    it('labels the group when label provided', () => {
      buildWrapper();
      expect(findLabelElement().text()).toBe(mockGroups[0].name);
    });

    it('does not label the group when label is not provided', () => {
      buildWrapper({ propsData: { group: mockProfileGroups[0] } });
      expect(findLabelElement().exists()).toBe(false);
    });

    it('allows arbitrary content for group label', () => {
      buildWrapper({ slots: { 'group-label': '<i data-testid="custom-name"></i>' } });

      expect(findByTestId('custom-name', findLabelElement()).exists()).toBe(true);
    });
  });

  it.each`
    bordered | borderPosition            | classes
    ${true}  | ${borderPositions.top}    | ${BORDER_CLASSES[borderPositions.top].split(' ')}
    ${true}  | ${borderPositions.bottom} | ${BORDER_CLASSES[borderPositions.bottom].split(' ')}
    ${false} | ${borderPositions.top}    | ${[]}
    ${false} | ${borderPositions.bottom} | ${[]}
  `(
    'adds border classes `$classes` when bordered=$bordered and borderPosition=$borderPosition',
    ({ bordered, borderPosition, classes }) => {
      buildWrapper({ propsData: { bordered, borderPosition } });
      expect(wrapper.classes()).toEqual(classes);
    },
  );
});
