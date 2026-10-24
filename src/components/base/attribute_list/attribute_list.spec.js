import { shallowMount } from '@vue/test-utils';
import GlIcon from '../icon/icon.vue';
import GlAttributeList from './attribute_list.vue';

describe('GlAttributeList', () => {
  let wrapper;

  const defaultItems = [
    { icon: 'user', label: 'Author', text: 'John Doe' },
    { icon: 'calendar', label: 'Created', text: 'Jan 15, 2026' },
    { label: 'Status', text: 'Active' },
  ];

  const createComponent = (props = {}) => {
    wrapper = shallowMount(GlAttributeList, {
      propsData: { items: defaultItems, ...props },
    });
  };

  const findContainer = () => wrapper.find('[data-testid="gl-attribute-list"]');
  const findItems = () => wrapper.findAll('[data-testid="gl-attribute-list-item"]');
  const findLabels = () => wrapper.findAll('[data-testid="gl-attribute-list-item-label"]');
  const findDescriptions = () =>
    wrapper.findAll('[data-testid="gl-attribute-list-item-description"]');
  const findIcons = () => wrapper.findAllComponents(GlIcon);

  describe('rendering', () => {
    beforeEach(() => {
      createComponent();
    });

    it('renders correct number of items with proper content', () => {
      expect(findItems()).toHaveLength(3);

      const labels = findLabels();
      const descriptions = findDescriptions();

      expect(labels.at(0).text()).toContain('Author');
      expect(labels.at(1).text()).toContain('Created');
      expect(labels.at(2).text()).toContain('Status');

      expect(descriptions.at(0).text()).toBe('John Doe');
      expect(descriptions.at(1).text()).toBe('Jan 15, 2026');
      expect(descriptions.at(2).text()).toBe('Active');
    });

    it('renders icons only for items that have them', () => {
      const icons = findIcons();

      expect(icons).toHaveLength(2);
      expect(icons.at(0).props('name')).toBe('user');
      expect(icons.at(1).props('name')).toBe('calendar');
    });

    it('uses semantic HTML structure', () => {
      expect(findContainer().element.tagName).toBe('DL');
      expect(findLabels().at(0).element.tagName).toBe('DT');
      expect(findDescriptions().at(0).element.tagName).toBe('DD');
    });
  });

  describe('slots', () => {
    it('renders custom label slot with scoped data', () => {
      wrapper = shallowMount(GlAttributeList, {
        propsData: { items: defaultItems },
        scopedSlots: {
          label: '<span class="custom-label">{{ props.item.label }} ({{ props.index }})</span>',
        },
      });

      expect(wrapper.html()).toContain('custom-label');
      expect(wrapper.html()).toContain('Author (0)');
    });

    it('renders custom text slot with scoped data', () => {
      wrapper = shallowMount(GlAttributeList, {
        propsData: { items: defaultItems },
        scopedSlots: {
          description: '<strong>{{ props.item.text }} [{{ props.index }}]</strong>',
        },
      });

      expect(wrapper.html()).toContain('<strong>');
      expect(wrapper.html()).toContain('John Doe [0]');
    });
  });
});
