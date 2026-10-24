import { markRaw, nextTick } from 'vue';
import { shallowMount } from '@vue/test-utils';
import { mockCreateChartInstance } from '~helpers/chart_stubs';
import GlPopover from '../../../base/popover/popover.vue';
import { popoverPlacements } from '../../../../utils/constants';
import { waitForAnimationFrame } from '../../../../utils/test_utils';
import TooltipDefaultFormat from './tooltip_default_format/tooltip_default_format.vue';

import ChartTooltip from './tooltip.vue';

let mockChartInstance;

jest.mock('echarts', () => ({
  getInstanceByDom: () => mockChartInstance,
}));

describe('ChartTooltip', () => {
  let wrapper;
  let mockContainPixel;

  const findPopover = () => wrapper.findComponent(GlPopover);
  const findTooltipDefaultFormat = () => wrapper.findComponent(TooltipDefaultFormat);
  const findPopoverTarget = () => wrapper.find(`#${findPopover().attributes('target')}`);
  const getPopoverTargetStyle = (name) => findPopoverTarget().element.style.getPropertyValue(name);

  const getMouseHandler = () => mockChartInstance.getZr().on.mock.calls[0][1];
  const triggerMouseHandler = async (event) => {
    getMouseHandler()({ event });
    await waitForAnimationFrame();
  };

  const findMockCall = (eventType, method = 'on') =>
    mockChartInstance.getZr()[method].mock.calls.find((call) => call[0] === eventType);
  const findMockCallHandler = (eventType, method = 'on') => findMockCall(eventType, method).at(1);

  const createWrapper = (props = {}, options) => {
    mockChartInstance = markRaw({
      ...mockCreateChartInstance(),
      containPixel: mockContainPixel,
    });

    wrapper = shallowMount(ChartTooltip, {
      propsData: {
        chart: mockChartInstance,
        ...props,
      },
      ...options,
    });
  };

  beforeEach(() => {
    mockContainPixel = jest.fn();
  });

  it('sets target as container instead of a trigger', () => {
    createWrapper();

    expect(findPopover().props('triggers')).toBe('');
    expect(findPopover().props('container')).toEqual(findPopover().props('target'));

    expect(findPopoverTarget().exists()).toBe(true);
  });

  it('is right-positioned by default', () => {
    createWrapper();

    expect(findPopover().props('placement')).toBe(popoverPlacements.right);
  });

  it('applies placement if any', () => {
    createWrapper({ placement: popoverPlacements.bottom });

    expect(findPopover().props('placement')).toBe(popoverPlacements.bottom);
  });

  it('applies initial position and updates it', async () => {
    createWrapper({ show: true, left: '0', top: '50%' });

    expect(findPopover().attributes('show')).toBe('true');
    expect(getPopoverTargetStyle('left')).toBe('0px');
    expect(getPopoverTargetStyle('top')).toBe('50%');

    wrapper.setProps({ left: '100px', top: '200px' });

    await waitForAnimationFrame();

    expect(findPopover().attributes('show')).toBe('true');
    expect(getPopoverTargetStyle('left')).toBe('100px');
    expect(getPopoverTargetStyle('top')).toBe('200px');
  });

  it('reacts to `mousemove` and `mouseout` in chart dom', () => {
    createWrapper();

    const zr = mockChartInstance.getZr();
    const handler = getMouseHandler();

    expect(zr.on).toHaveBeenCalledWith('mousemove', handler);
    expect(zr.on).toHaveBeenCalledWith('mouseout', handler);
  });

  it('tooltip target has default offset', () => {
    createWrapper();

    expect(getPopoverTargetStyle('margin-top')).toBe('-10px');
    expect(getPopoverTargetStyle('height')).toBe('20px');

    expect(getPopoverTargetStyle('margin-left')).toBe('-2px');
    expect(getPopoverTargetStyle('width')).toBe('4px');
  });

  it('tooltip target defines offsets', () => {
    const xOffset = 7;
    const yOffset = 12;

    createWrapper({
      xOffset,
      yOffset,
    });

    expect(getPopoverTargetStyle('margin-top')).toBe('-12px');
    expect(getPopoverTargetStyle('height')).toBe('24px');

    expect(getPopoverTargetStyle('margin-left')).toBe('-7px');
    expect(getPopoverTargetStyle('width')).toBe('14px');
  });

  describe('when setting a `show` value', () => {
    it('applies initial `show` value and updates it', async () => {
      createWrapper({ show: true });

      expect(findPopover().attributes('show')).toBe('true');

      wrapper.setProps({ show: false });
      await waitForAnimationFrame();

      expect(findPopover().attributes('show')).toBe(undefined);
    });
  });

  describe('when not setting a `show` value', () => {
    describe('with no position defined', () => {
      beforeEach(() => {
        createWrapper();
      });

      it('when mouse moves outside of chart', async () => {
        mockContainPixel.mockReturnValueOnce(false);

        await triggerMouseHandler({ zrX: 1, zrY: 2.3 });

        expect(mockContainPixel).toHaveBeenCalledWith('grid', [1, 2]);

        expect(findPopover().attributes('show')).toBe(undefined);
      });

      it('when mouse moves inside chart', async () => {
        mockContainPixel.mockReturnValueOnce(true);

        await triggerMouseHandler({ zrX: 3, zrY: 4.3 });

        expect(mockContainPixel).toHaveBeenCalledWith('grid', [3, 4]);

        expect(findPopover().attributes('show')).toBe('true');
        expect(getPopoverTargetStyle('left')).toBe('3px');
        expect(getPopoverTargetStyle('top')).toBe('4px');
      });
    });

    describe('with position defined', () => {
      beforeEach(() => {
        createWrapper({ right: '50px', bottom: '100px' });
      });

      it('when mouse moves outside of chart', async () => {
        mockContainPixel.mockReturnValueOnce(false);
        await triggerMouseHandler({ zrX: 1, zrY: 2.3 });

        expect(mockContainPixel).toHaveBeenCalledWith('grid', [1, 2]);
        expect(findPopover().attributes('show')).toBe(undefined);
      });

      it('when mouse moves inside chart', async () => {
        mockContainPixel.mockReturnValueOnce(true);
        await triggerMouseHandler({ zrX: 3, zrY: 4.3 });

        expect(mockContainPixel).toHaveBeenCalledWith('grid', [3, 4]);
        expect(findPopover().attributes('show')).toBe('true');

        expect(getPopoverTargetStyle('left')).toBe('');
        expect(getPopoverTargetStyle('top')).toBe('');
        expect(getPopoverTargetStyle('right')).toBe('50px');
        expect(getPopoverTargetStyle('bottom')).toBe('100px');
      });
    });
  });

  describe('is customized via slots', () => {
    const triggerFormatter = (params, dimensionAxis = 'xAxis') => {
      const { formatter } =
        mockChartInstance.setOption.mock.calls[0][0][dimensionAxis].axisPointer.label;
      formatter(params);
    };

    const GlPopoverStub = {
      template: `
        <div>
          <slot name="title"></slot>
          <slot></slot>
        </div>
      `,
    };

    describe('formats tooltip', () => {
      beforeEach(() => {
        createWrapper(
          {
            useDefaultTooltipFormatter: true,
          },
          {
            stubs: {
              GlPopover: GlPopoverStub,
            },
          },
        );
      });

      it('sets tooltip formatter function', () => {
        expect(mockChartInstance.setOption).toHaveBeenCalledWith({
          xAxis: {
            axisPointer: {
              label: {
                formatter: expect.any(Function),
              },
              show: true,
            },
          },
        });
      });

      it('formats tooltip', async () => {
        expect(findTooltipDefaultFormat().props('tooltipContent')).toEqual({});

        triggerFormatter({
          seriesData: [
            {
              seriesName: 'Series 1',
              value: ['Value', 1],
              color: '#aaa',
            },
            {
              seriesName: 'Series 2',
              value: ['Value', 2],
              color: '#bbb',
            },
          ],
        });
        await nextTick();

        expect(findPopover().text()).toBe('Value');
        expect(findTooltipDefaultFormat().props('tooltipContent')).toEqual({
          'Series 1': { color: '#aaa', value: 1 },
          'Series 2': { color: '#bbb', value: 2 },
        });
      });

      it('formats tooltip with axis names', async () => {
        mockChartInstance.getOption.mockReturnValueOnce({
          xAxis: [{ name: 'Time' }],
          yAxis: [{ name: 'Amount' }],
        });

        triggerFormatter({
          seriesData: [
            {
              seriesName: 'Series 1',
              value: ['Value', 1],
              color: '#aaa',
            },
          ],
        });
        await nextTick();

        expect(findPopover().text()).toBe('Value (Time)');
        expect(findTooltipDefaultFormat().props('tooltipContent')).toEqual({
          Amount: { color: '', value: 1 },
        });
      });

      describe('dimensionAxis = `yAxis`', () => {
        beforeEach(() => {
          createWrapper(
            {
              useDefaultTooltipFormatter: true,
              dimensionAxis: 'yAxis',
            },
            {
              stubs: {
                GlPopover: GlPopoverStub,
              },
            },
          );
        });

        it('sets tooltip formatter function', () => {
          expect(mockChartInstance.setOption).toHaveBeenCalledWith({
            yAxis: {
              axisPointer: {
                label: {
                  formatter: expect.any(Function),
                },
                show: true,
              },
            },
          });
        });

        it('formats tooltip', async () => {
          expect(findTooltipDefaultFormat().props('tooltipContent')).toEqual({});

          triggerFormatter(
            {
              seriesData: [
                {
                  seriesName: 'Series 1',
                  value: [1, 'Value'],
                  color: '#aaa',
                },
                {
                  seriesName: 'Series 2',
                  value: [2, 'Value'],
                  color: '#bbb',
                },
              ],
            },
            'yAxis',
          );
          await nextTick();

          expect(findPopover().text()).toBe('Value');
          expect(findTooltipDefaultFormat().props('tooltipContent')).toEqual({
            'Series 1': { color: '#aaa', value: 1 },
            'Series 2': { color: '#bbb', value: 2 },
          });
        });

        it('formats tooltip with axis names', async () => {
          mockChartInstance.getOption.mockReturnValueOnce({
            xAxis: [{ name: 'Time' }],
            yAxis: [{ name: 'Amount' }],
          });

          triggerFormatter(
            {
              seriesData: [
                {
                  seriesName: 'Series 1',
                  value: [1, 'Value'],
                  color: '#aaa',
                },
              ],
            },
            'yAxis',
          );
          await nextTick();

          expect(findPopover().text()).toBe('Value (Amount)');
          expect(findTooltipDefaultFormat().props('tooltipContent')).toEqual({
            Time: { color: '', value: 1 },
          });
        });
      });
    });
  });

  describe('click-to-pin', () => {
    const triggerClickHandler = async (event) => {
      findMockCallHandler('click')({ event });
      await nextTick();
    };

    describe('when clickToPin is "false"', () => {
      beforeEach(() => {
        createWrapper({ clickToPin: false });
      });

      it('does not register the click handler', () => {
        expect(findMockCall('click')).toBeUndefined();
      });

      it('does not clean up click handler on destroy', () => {
        wrapper.destroy();
        expect(findMockCall('click', 'off')).toBeUndefined();
      });
    });

    describe('when clickToPin is "true"', () => {
      const triggerClickToPin = async ({
        mouseCoordinates = { zrX: 100, zrY: 200 },
        outsideChart = false,
      } = {}) => {
        mockContainPixel.mockReturnValue(!outsideChart);
        // move the mouse to the chart area
        await triggerMouseHandler(mouseCoordinates);
        // click on the chart area
        await triggerClickHandler(mouseCoordinates);
      };
      const isPinned = () =>
        findPopoverTarget().attributes('style').includes('pointer-events: auto');
      const isUnpinned = () =>
        findPopoverTarget().attributes('style').includes('pointer-events: none');

      beforeEach(() => {
        createWrapper({ clickToPin: true });
      });

      it('registers the click handler', () => {
        expect(findMockCall('click')).toBeDefined();
      });

      it('cleans up the click handler on destroy', () => {
        wrapper.destroy();
        expect(findMockCall('click', 'off')).toBeDefined();
      });

      describe('click behavior', () => {
        it('pins the tooltip when clicking inside the chart area', async () => {
          const mouseCoordinates = { zrX: 100, zrY: 200 };
          await triggerClickToPin({ mouseCoordinates });

          expect(findPopover().attributes('show')).toBe('true');
          expect(getPopoverTargetStyle('left')).toBe(`${mouseCoordinates.zrX}px`);
          expect(getPopoverTargetStyle('top')).toBe(`${mouseCoordinates.zrY}px`);
          expect(isPinned()).toBe(true);

          // Assert setOption called with triggerOn: 'none'
          expect(mockChartInstance.setOption).toHaveBeenCalledWith(
            expect.objectContaining({
              tooltip: expect.objectContaining({ triggerOn: 'none' }),
            }),
          );
        });

        it('does not pin the tooltip when clicking outside the chart area', async () => {
          await triggerClickToPin({ outsideChart: true });

          expect(findPopover().attributes('show')).toBe(undefined);
          expect(isUnpinned()).toBe(true);
        });
      });

      describe('unpinning behavior', () => {
        beforeEach(async () => {
          await triggerClickToPin();
        });

        it('does not unpin the tooltip when clicking inside the tooltip', async () => {
          findPopoverTarget().trigger('click');

          expect(isPinned()).toBe(true);
        });

        it('unpins the tooltip when clicking outside the tooltip but inside the chart', async () => {
          const unpinCoords = { zrX: 200, zrY: 200 };
          await triggerClickToPin({ mouseCoordinates: unpinCoords });

          expect(isUnpinned()).toBe(true);

          // Assert setOption called to restore triggerOn
          expect(mockChartInstance.setOption).toHaveBeenCalledWith(
            expect.objectContaining({
              tooltip: expect.objectContaining({ triggerOn: 'mousemove', show: false }),
            }),
          );
          // Assert dispatchAction called to show tooltip at click position
          expect(mockChartInstance.dispatchAction).toHaveBeenCalledWith(
            expect.objectContaining({
              type: 'showTip',
              x: unpinCoords.zrX,
              y: unpinCoords.zrY,
            }),
          );
        });

        it('unpins the tooltip when Escape key is pressed', async () => {
          document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
          await nextTick();

          expect(isUnpinned()).toBe(true);
        });
      });
    });
  });
});
