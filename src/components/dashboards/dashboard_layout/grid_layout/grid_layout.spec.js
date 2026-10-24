import { nextTick } from 'vue';
import { GridStack } from 'gridstack';
import { shallowMount } from '@vue/test-utils';
import { pickBy } from 'lodash-es';
import { breakpoints } from '../../../../utils/breakpoints';
import { waitForAnimationFrame } from '../../../../utils/test_utils';
import { dashboard, mockPanel } from '../../mock_data';
import GridLayout from './grid_layout.vue';

const mockGridSetStatic = jest.fn();
const mockGridDestroy = jest.fn();
const mockGridLoad = jest.fn();
const mockPanelSlots = jest.fn();
const mockScrollIntoView = jest.fn();
let mockGridLoadCalledWith;

jest.mock('gridstack');

describe('GlGridLayout', () => {
  let wrapper;

  const createWrapper = (props = {}) => {
    wrapper = shallowMount(GridLayout, {
      propsData: {
        value: dashboard,
        ...props,
      },
      scopedSlots: {
        panel: mockPanelSlots,
      },
      attachTo: document.body,
    });
  };

  const findGrid = () => wrapper.find('[data-testid="gridstack-grid"]');
  const findGridStackPanels = () => wrapper.findAll('[data-testid="gridstack-panel"]');
  const findGridItemContentById = (panelId) =>
    wrapper.find(`[gs-id="${panelId}"]`).find('.grid-stack-item-content');
  const findPanelById = (panelId) => wrapper.find(`#${panelId}`);

  beforeAll(() => {
    if (!HTMLElement.prototype.scrollIntoView) {
      HTMLElement.prototype.scrollIntoView = mockScrollIntoView;
    }
  });

  afterAll(() => {
    if (HTMLElement.prototype.scrollIntoView.mock) {
      delete HTMLElement.prototype.scrollIntoView;
    }
  });

  afterEach(() => {
    mockGridSetStatic.mockReset();
    mockGridDestroy.mockReset();
    mockPanelSlots.mockReset();
    mockScrollIntoView.mockReset();
    mockGridLoadCalledWith = undefined;
  });

  beforeEach(() => {
    GridStack.init = jest.fn().mockImplementation((config) => {
      const actualModule = jest.requireActual('gridstack');
      const instance = actualModule.GridStack.init(config);
      const originalLoad = instance.load.bind(instance);
      instance.load = mockGridLoad.mockImplementation((...args) => {
        // Capture a snapshot of the args before gridstack's load() mutates them
        mockGridLoadCalledWith = JSON.parse(JSON.stringify(args));
        return originalLoad(...args);
      });
      instance.setStatic = mockGridSetStatic;
      instance.destroy = mockGridDestroy;
      return instance;
    });
  });

  describe('default behaviour', () => {
    beforeEach(() => {
      createWrapper();
    });

    it('sets up GridStack', () => {
      expect(GridStack.init).toHaveBeenCalledWith(
        {
          alwaysShowResizeHandle: true,
          staticGrid: true,
          animate: true,
          margin: '8px',
          handle: '.grid-stack-item-handle',
          cellHeight: 137,
          minRow: 1,
          columnOpts: { breakpoints: [{ w: breakpoints.md, c: 1 }] },
          float: true,
        },
        findGrid().element,
      );
    });

    it('loads the parsed dashboard config', () => {
      const expectedConfig = dashboard.panels.map((panel) => {
        const { id, gridAttributes, ...panelWithoutGridAttributes } = panel;
        const { xPos, yPos, width, height, minWidth, minHeight, maxWidth, maxHeight } =
          gridAttributes;

        const filterUndefinedValues = (obj) => pickBy(obj, (value) => value !== undefined);

        return {
          minH: 1,
          ...filterUndefinedValues({
            x: xPos,
            y: yPos,
            w: width,
            h: height,
            minH: minHeight,
            minW: minWidth,
            maxH: maxHeight,
            maxW: maxWidth,
            id,
          }),
          props: {
            id,
            ...panelWithoutGridAttributes,
          },
        };
      });

      expect(mockGridLoad).toHaveBeenCalled();
      expect(mockGridLoadCalledWith[0]).toEqual(expectedConfig);
    });

    it('does not render the grab cursor on grid panels', () => {
      expect(findGridStackPanels().at(0).classes()).not.toContain('gl-cursor-grab');
    });

    it('does not scroll panels into view', () => {
      expect(mockScrollIntoView).not.toHaveBeenCalled();
    });

    it('renders a panel once it has been added', async () => {
      const newPanel = mockPanel;

      mockScrollIntoView.mockClear();

      expect(findPanelById(newPanel.id).exists()).toBe(false);

      wrapper.setProps({
        value: {
          ...dashboard,
          panels: [...dashboard.panels, newPanel],
        },
      });

      await nextTick();
      await waitForAnimationFrame();

      const gridItem = findGridItemContentById(newPanel.id);
      const panel = findPanelById(newPanel.id);

      expect(panel.element.parentElement).toBe(gridItem.element);
      expect(mockScrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' });
    });

    it('does not render a removed panel', async () => {
      const panelToRemove = dashboard.panels[0];

      expect(findGridStackPanels()).toHaveLength(dashboard.panels.length);
      expect(findPanelById(panelToRemove.id).exists()).toBe(true);

      wrapper.setProps({
        value: {
          ...dashboard,
          panels: dashboard.panels.filter((panel) => panel.id !== panelToRemove.id),
        },
      });

      await nextTick();
      await waitForAnimationFrame();

      expect(findGridStackPanels()).toHaveLength(dashboard.panels.length - 1);
      expect(findPanelById(panelToRemove.id).exists()).toBe(false);
    });

    describe.each(dashboard.panels.map((panel, index) => [panel, index]))(
      'for dashboard panel %#',
      (panel, index) => {
        it('renders a grid panel', () => {
          const element = findGridStackPanels().at(index);

          expect(element.attributes().id).toContain('panel-');
        });

        it('sets the panel props on the panel slot', () => {
          const { gridAttributes, ...panelProps } = panel;

          expect(mockPanelSlots.mock.calls[index][0]).toMatchObject({ panel: panelProps });
        });

        it("renders the panel inside the grid item's content", async () => {
          const gridItem = findGridItemContentById(panel.id);

          await nextTick();
          await waitForAnimationFrame();

          expect(findGridStackPanels().at(index).element.parentElement).toBe(gridItem.element);
        });
      },
    );
  });

  describe('when isStaticGrid = false', () => {
    beforeEach(() => {
      createWrapper({ isStaticGrid: false });
    });

    it('initializes GridStack with staticGrid = false', () => {
      expect(GridStack.init).toHaveBeenCalledWith(
        expect.objectContaining({
          staticGrid: false,
        }),
        findGrid().element,
      );
    });

    it('calls GridStack.setStatic when the isStaticGrid prop changes', async () => {
      wrapper.setProps({ isStaticGrid: true });

      await nextTick();
      await waitForAnimationFrame();

      expect(mockGridSetStatic).toHaveBeenCalledWith(true);
    });

    it('renders the grab cursor on grid panels', () => {
      expect(findGridStackPanels().at(0).classes()).toContain('gl-cursor-grab');
    });
  });

  describe('when cellHeight is set', () => {
    const cellHeight = 50;

    beforeEach(() => {
      createWrapper({ cellHeight });
    });

    it('initializes GridStack with the custom cellHeight', () => {
      expect(GridStack.init).toHaveBeenCalledWith(
        expect.objectContaining({ cellHeight }),
        findGrid().element,
      );
    });
  });

  describe('when minCellHeight is set', () => {
    const minCellHeight = 10;

    beforeEach(() => {
      createWrapper({ minCellHeight });
    });

    it('applies the custom minCellHeight to grid panels', () => {
      const expectedConfig = dashboard.panels.map((panel) => {
        const { id, gridAttributes, ...panelWithoutGridAttributes } = panel;
        const { xPos, yPos, width, height, minWidth, minHeight, maxWidth, maxHeight } =
          gridAttributes;

        const filterUndefinedValues = (obj) => pickBy(obj, (value) => value !== undefined);

        return {
          minH: minCellHeight,
          ...filterUndefinedValues({
            x: xPos,
            y: yPos,
            w: width,
            h: height,
            minH: minHeight,
            minW: minWidth,
            maxH: maxHeight,
            maxW: maxWidth,
            id,
          }),
          props: {
            id,
            ...panelWithoutGridAttributes,
          },
        };
      });

      expect(mockGridLoad).toHaveBeenCalled();
      expect(mockGridLoadCalledWith[0]).toEqual(expectedConfig);
    });
  });

  describe('when the grid changes', () => {
    beforeEach(async () => {
      createWrapper();

      await nextTick();
      await waitForAnimationFrame();

      const gridEl = wrapper.find('.grid-stack').element;
      const event = new CustomEvent('change', {
        detail: [
          {
            id: dashboard.panels[1].id,
            x: 10,
            y: 20,
            w: 30,
            h: 40,
          },
        ],
      });

      gridEl.dispatchEvent(event);
    });

    it('emits the changed dashboard object', () => {
      expect(wrapper.emitted('input')).toStrictEqual([
        [
          {
            ...dashboard,
            panels: [
              dashboard.panels[0],
              {
                ...dashboard.panels[1],
                gridAttributes: {
                  ...dashboard.panels[1].gridAttributes,
                  xPos: 10,
                  yPos: 20,
                  width: 30,
                  height: 40,
                },
              },
            ],
          },
        ],
      ]);
    });
  });

  describe('when panel properties change', () => {
    beforeEach(() => {
      createWrapper();
    });

    it('updates the UI when panel properties change', async () => {
      const updatedPanel = {
        ...dashboard.panels[0],
        loading: true,
      };
      const { gridAttributes, ...updatedPanelProps } = updatedPanel;

      mockPanelSlots.mockClear();

      // Verify initial state
      const initialPanelLoading = findGridStackPanels().at(0).attributes('loading');
      expect(initialPanelLoading).toBeUndefined();

      // Update the panel properties
      wrapper.setProps({
        value: {
          ...dashboard,
          panels: [updatedPanel, dashboard.panels[1]],
        },
      });

      await nextTick();

      // Check that the slot was called with updated data
      const updatedPanelCall = mockPanelSlots.mock.calls.find(
        (call) => call[0].panel.id === updatedPanel.id,
      );

      expect(updatedPanelCall).toBeDefined();

      expect(updatedPanelCall[0].panel).toMatchObject(updatedPanelProps);
      expect(updatedPanelCall[0].panel.loading).toBe(true);
    });
  });

  describe('beforeDestroy', () => {
    beforeEach(async () => {
      createWrapper();

      await nextTick();
      await waitForAnimationFrame();

      wrapper.destroy();
    });

    it('cleans up the gridstack instance', () => {
      expect(mockGridDestroy).toHaveBeenCalled();
    });
  });
});
