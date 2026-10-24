import { mount } from '@vue/test-utils';
import { tooltipActionEvents } from '../../../utils/constants';
import { setGlTooltipDefaultContainer } from '../../../directives/tooltip/container';
import GlTooltip from './tooltip.vue';

describe('GlTooltip', () => {
  let wrapper;
  let target;

  afterEach(() => {
    target?.remove();
    target = null;
  });

  const createWrapper = ({ propsData, ...options } = {}) => {
    wrapper = mount(GlTooltip, {
      propsData: {
        target: document.body,
        ...propsData,
      },
      ...options,
    });
  };

  const createShownWrapper = ({ propsData, ...options } = {}) => {
    target = document.createElement('button');
    document.body.appendChild(target);
    // BTooltip shows only when the target is visible, and JSDOM has no layout
    jest.spyOn(target, 'getBoundingClientRect').mockReturnValue({ width: 24, height: 24 });

    return new Promise((resolve) => {
      createWrapper({
        propsData: { target, title: 'Title prop', show: true, ...propsData },
        listeners: { shown: resolve },
        attachTo: document.body,
        ...options,
      });
    });
  };

  const findBVTooltip = () => wrapper.findComponent({ ref: 'bvTooltip' });

  it.each(tooltipActionEvents)('passes through the %s event to call bvTooltip method', (event) => {
    const methodMock = jest.fn();
    createWrapper({
      stubs: {
        BTooltip: {
          template: '<div></div>',
          methods: {
            [event]: methodMock,
          },
        },
      },
    });

    wrapper.vm.$emit(event);

    expect(methodMock).toHaveBeenCalled();
  });

  describe('content', () => {
    const findTooltipText = () => document.querySelector('.tooltip-inner').textContent.trim();

    it('renders the title prop when there is no default slot', async () => {
      await createShownWrapper();

      expect(findTooltipText()).toBe('Title prop');
    });

    it('renders the default slot over the title prop', async () => {
      await createShownWrapper({ slots: { default: 'Slot content' } });

      expect(findTooltipText()).toBe('Slot content');
    });
  });

  it('respects custom default container', () => {
    setGlTooltipDefaultContainer('#custom-element');
    createWrapper();
    expect(findBVTooltip().props('container')).toBe('#custom-element');
  });
});
