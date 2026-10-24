import { shallowMount } from '@vue/test-utils';
import DashboardLayout from './dashboard_layout.vue';
import GridLayout from './grid_layout/grid_layout.vue';

const dashboardConfig = {
  title: 'Dashboard title',
  description: 'This is my dashboard description',
  panels: [
    {
      id: '1',
      title: 'A dashboard panel',
      gridAttributes: {
        width: 6,
        height: 1,
        yPos: 0,
        xPos: 3,
      },
    },
  ],
};

describe('GlDashboardLayout', () => {
  let wrapper;

  const findHeaderContainer = () => wrapper.find('[data-testid="header-container"]');
  const findTitle = () => wrapper.find('[data-testid="title"]');
  const findDescription = () => wrapper.find('[data-testid="description"]');
  const findActionsContainer = () => wrapper.find('[data-testid="actions-container"]');
  const findFiltersContainer = () => wrapper.find('[data-testid="filters-container"]');
  const findGrid = () => wrapper.findComponent(GridLayout);

  const panelSlotSpy = jest.fn();
  const emptyStateSlotSpy = jest.fn();

  const createWrapper = (props = {}, scopedSlots = {}) => {
    wrapper = shallowMount(DashboardLayout, {
      propsData: {
        config: dashboardConfig,
        ...props,
      },
      scopedSlots: {
        panel: panelSlotSpy,
        'empty-state': emptyStateSlotSpy,
        ...scopedSlots,
      },
      stubs: {
        GridLayout,
      },
    });
  };

  afterEach(() => {
    panelSlotSpy.mockClear();
    emptyStateSlotSpy.mockClear();
  });

  describe('default behaviour', () => {
    beforeEach(() => {
      createWrapper();
    });

    it('renders the dashboard title', () => {
      expect(findTitle().text()).toContain('Dashboard title');
    });

    it('renders the dashboard description', () => {
      expect(findDescription().text()).toContain('This is my dashboard description');
    });

    it('renders the dashboard grid with the config', () => {
      expect(findGrid().props('value')).toMatchObject(dashboardConfig);
    });

    it('renders the panel slot for each panel', async () => {
      expect(panelSlotSpy).toHaveBeenCalledTimes(dashboardConfig.panels.length);
    });

    it('does not render the empty state', () => {
      expect(emptyStateSlotSpy).not.toHaveBeenCalled();
    });

    it('does not render the filter or actions containers', () => {
      expect(findFiltersContainer().exists()).toBe(false);
      expect(findActionsContainer().exists()).toBe(false);
    });

    it('has a static grid', () => {
      expect(findGrid().props('isStaticGrid')).toBe(true);
    });
  });

  describe('when a dashboard has no title and no description', () => {
    beforeEach(() => {
      createWrapper({
        config: {
          ...dashboardConfig,
          title: undefined,
          description: undefined,
        },
      });
    });

    it('does not render the dashboard header', () => {
      expect(findHeaderContainer().exists()).toBe(false);
    });
  });

  describe('when a dashboard has no panels', () => {
    beforeEach(() => {
      createWrapper({
        config: {
          ...dashboardConfig,
          panels: undefined,
        },
      });
    });

    it('does not render the dashboard grid', () => {
      expect(findGrid().exists()).toBe(false);
    });

    it('renders the empty state', () => {
      expect(emptyStateSlotSpy).toHaveBeenCalled();
    });
  });

  describe('when a dashboard has no description', () => {
    beforeEach(() => {
      createWrapper({
        config: {
          ...dashboardConfig,
          description: undefined,
        },
      });
    });

    it('does not render the dashboard description', () => {
      expect(findDescription().exists()).toBe(false);
    });
  });

  describe('when a dashboard has title and description slots', () => {
    const titleSlotSpy = jest.fn();
    const descriptionSlotSpy = jest.fn();

    beforeEach(() => {
      createWrapper(
        {},
        {
          title() {
            titleSlotSpy();
            return this.$createElement('div');
          },
          description() {
            descriptionSlotSpy();
            return this.$createElement('div');
          },
        },
      );
    });

    afterEach(() => {
      titleSlotSpy.mockClear();
      descriptionSlotSpy.mockClear();
    });

    it('renders the title slot and not the config title', () => {
      expect(titleSlotSpy).toHaveBeenCalled();
      expect(findTitle().exists()).toBe(false);
    });

    it('renders the description slot and not the config description', () => {
      expect(descriptionSlotSpy).toHaveBeenCalled();
      expect(findDescription().exists()).toBe(false);
    });
  });

  describe('when a dashboard has a header slot', () => {
    const headerSlotSpy = jest.fn();
    const titleSlotSpy = jest.fn();
    const descriptionSlotSpy = jest.fn();

    beforeEach(() => {
      createWrapper(
        {},
        {
          header() {
            headerSlotSpy();
            return this.$createElement('div');
          },
          title() {
            titleSlotSpy();
            return this.$createElement('div');
          },
          description() {
            descriptionSlotSpy();
            return this.$createElement('div');
          },
        },
      );
    });

    afterEach(() => {
      headerSlotSpy.mockClear();
      titleSlotSpy.mockClear();
      descriptionSlotSpy.mockClear();
    });

    it('renders the header slot', () => {
      expect(findHeaderContainer().exists()).toBe(true);
      expect(headerSlotSpy).toHaveBeenCalled();
    });

    it('does not render the config title', () => {
      expect(findTitle().exists()).toBe(false);
    });

    it('does not render the config description', () => {
      expect(findDescription().exists()).toBe(false);
    });

    it('renders the header slot and not the title slot', () => {
      expect(titleSlotSpy).not.toHaveBeenCalled();
    });

    it('renders the header slot and not the description slot', () => {
      expect(descriptionSlotSpy).not.toHaveBeenCalled();
    });
  });

  describe('when a dashboard has actions slot content but no title or description', () => {
    beforeEach(() => {
      createWrapper(
        {
          config: {
            title: undefined,
            description: undefined,
          },
        },
        { actions: '<div>actions</div>' },
      );
    });

    it('renders the action slots', () => {
      expect(findActionsContainer().exists()).toBe(true);
    });
  });

  describe('when a dashboard has actions slot content', () => {
    beforeEach(() => {
      createWrapper({}, { actions: '<div>actions</div>' });
    });

    it('renders the action slots', () => {
      expect(findActionsContainer().exists()).toBe(true);
    });
  });

  describe('when a dashboard has filters slot content', () => {
    beforeEach(() => {
      createWrapper({}, { filters: '<div>filters</div>' });
    });

    it('renders the filters container', () => {
      expect(findFiltersContainer().exists()).toBe(true);
    });
  });

  describe('when a dashboard has a custom filters class', () => {
    beforeEach(() => {
      createWrapper({ filtersClass: 'custom-filters-class' }, { filters: '<div>filters</div>' });
    });

    it('applies the class to the filters container', () => {
      expect(findFiltersContainer().classes()).toContain('custom-filters-class');
    });

    it('keeps the default filters container classes', () => {
      expect(findFiltersContainer().classes()).toContain('gl-flex');
    });
  });

  describe('when a dashboard has a dynamic grid', () => {
    beforeEach(() => {
      createWrapper({ isStaticGrid: false });
    });

    it('renders the grid with static disabled', () => {
      expect(findGrid().props('isStaticGrid')).toBe(false);
    });

    it('emits the changed event when the grid input event is fired', () => {
      const newConfig = {
        ...dashboardConfig,
        panels: [{ ...dashboardConfig.panels[0], title: 'new title' }],
      };

      findGrid().vm.$emit('input', newConfig);

      expect(wrapper.emitted('changed')).toEqual([[newConfig]]);
    });
  });

  describe('when a dashboard has a custom cell height', () => {
    const cellHeight = 50;

    beforeEach(() => {
      createWrapper({ cellHeight });
    });

    it('passes the cellHeight prop to the grid component', () => {
      expect(findGrid().props('cellHeight')).toBe(cellHeight);
    });
  });

  describe('when a dashboard has a custom minimum cell height', () => {
    const minCellHeight = 50;

    beforeEach(() => {
      createWrapper({ minCellHeight });
    });

    it('passes the minCellHeight prop to the grid component', () => {
      expect(findGrid().props('minCellHeight')).toBe(minCellHeight);
    });
  });
});
