import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import { isGlobalVue3 } from '../../utils/vue_utils';
import { GlTooltipDirective } from './tooltip';
import { setGlTooltipDefaultContainer } from './container';

jest.unmock('./tooltip.js');

function waitForTooltipAfterClickOn($button) {
  return new Promise((resolve) => {
    const resolver = () => {
      $button.vm.$root.$off('bv::tooltip::shown', resolver);
      resolve();
    };

    $button.vm.$root.$on('bv::tooltip::shown', resolver);

    // Trigger click
    $button.trigger('click');
  });
}

// Tooltips render differently when Vue 3 is used
// With Vue 3 the tooltips are hosted inside a <div data-v-app> element,
// while with Vue 2 they are hosted inside the <body> element directly
// We should either fix this behaviour in Vue 3 or accept this behaviour fix this spec
(isGlobalVue3 ? describe.skip : describe)('tooltip directive', () => {
  let wrapper;

  const origGetBCR = Element.prototype.getBoundingClientRect;

  beforeEach(() => {
    // Mock `getBoundingClientRect()` so that the `isVisible(el)` test returns `true`
    // Needed for visibility checks of trigger element, etc.
    Element.prototype.getBoundingClientRect = jest.fn(() => ({
      width: 24,
      height: 24,
      top: 0,
      left: 0,
      bottom: 0,
      right: 0,
    }));
  });

  afterEach(() => {
    Element.prototype.getBoundingClientRect = origGetBCR;
  });

  const createComponentConfig = () => {
    return {
      directives: {
        GlTooltip: GlTooltipDirective,
      },
      template: `<button v-gl-tooltip.click title="Custom text"></button>`,
    };
  };

  const createComponent = (component = createComponentConfig()) => {
    wrapper = mount(component, { attachTo: document.body });
  };

  const findTooltip = () => {
    const id = wrapper.find('button').attributes('aria-describedby');
    return document.getElementById(id);
  };

  beforeEach(() => {
    setGlTooltipDefaultContainer(undefined);
    document.body.innerHTML = '';
  });

  describe('container', () => {
    it('mounts to body by default', async () => {
      createComponent();
      await nextTick();
      await waitForTooltipAfterClickOn(wrapper);
      expect(findTooltip().parentElement).toStrictEqual(document.body);
    });

    it('mounts to custom container', async () => {
      const container = document.createElement('div');
      container.id = 'container';
      document.body.appendChild(container);
      const component = createComponentConfig();
      component.template = `<button v-gl-tooltip:container.click title="Custom text"></button>`;
      createComponent(component);
      await nextTick();
      await waitForTooltipAfterClickOn(wrapper);
      expect(findTooltip().parentElement).toStrictEqual(container);
    });

    it('mounts to custom default container', async () => {
      const container = document.createElement('div');
      container.id = 'container';
      document.body.appendChild(container);
      setGlTooltipDefaultContainer('container');
      createComponent();
      await nextTick();
      await waitForTooltipAfterClickOn(wrapper);
      expect(findTooltip().parentElement).toStrictEqual(container);
    });
  });
});
