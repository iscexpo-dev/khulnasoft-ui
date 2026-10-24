import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import {
  computePosition,
  autoUpdate,
  offset,
  autoPlacement,
  shift,
  arrow,
  size,
} from '@floating-ui/dom';
import {
  ARROW_DOWN,
  GL_DROPDOWN_FOCUS_CONTENT,
  GL_DROPDOWN_HIDDEN,
  GL_DROPDOWN_SHOWN,
  GL_DROPDOWN_BEFORE_CLOSE,
  GL_DROPDOWN_CONTENTS_CLASS,
} from '../constants';
import { waitForAnimationFrame } from '../../../../utils/test_utils';
import { FIXED_WIDTH_CLASS } from './constants';
import GlBaseDropdown from './base_dropdown.vue';

jest.mock('@floating-ui/dom');
const mockStopAutoUpdate = jest.fn();
offset.mockImplementation((offsetOpts = {}) => ({ name: 'offset', offsetOpts }));
autoPlacement.mockImplementation((autoPlacementOpts = {}) => ({
  name: 'autoPlacement',
  autoPlacementOpts,
}));
shift.mockImplementation((shiftOpts = {}) => ({ name: 'shift', shiftOpts }));
arrow.mockImplementation((arrowOpts = {}) => ({ name: 'arrow', arrowOpts }));
size.mockImplementation((sizeOpts = {}) => ({ name: 'size', fn: sizeOpts.apply }));

const DEFAULT_BTN_TOGGLE_CLASSES = [
  'btn',
  'btn-default',
  'btn-md',
  'gl-button',
  'gl-new-dropdown-toggle',
];

const MountingPortalStub = {
  template: '<div><slot /></div>',
};

describe('base dropdown', () => {
  let wrapper;

  const buildWrapper = (
    propsData,
    { component = GlBaseDropdown, slots = {}, stubs = {}, ...options } = {},
  ) => {
    wrapper = mount(component, {
      propsData: {
        toggleId: 'dropdown-toggle-btn-1',
        ...propsData,
      },
      slots: {
        default: `<div class="${GL_DROPDOWN_CONTENTS_CLASS}"><button /></div>`,
        ...slots,
      },
      stubs: {
        MountingPortal: MountingPortalStub,
        ...stubs,
      },
      attachTo: document.body,
      ...options,
    });
  };

  beforeEach(() => {
    jest.clearAllMocks();
    autoUpdate.mockImplementation(() => {
      return mockStopAutoUpdate;
    });
    computePosition.mockImplementation(() => new Promise(() => {}));
  });

  const findDefaultDropdownToggle = () => wrapper.find('.btn.gl-new-dropdown-toggle');
  const findDefaultDropdownTextSpan = () => wrapper.find('[data-testid="base-dropdown-span"]');
  const findCustomDropdownToggle = () => wrapper.find('.gl-new-dropdown-custom-toggle');
  const findDropdownToggleText = () => findDefaultDropdownToggle().find('.gl-button-text');
  const findDropdownMenu = () => wrapper.find('.gl-new-dropdown-panel');

  const moveFocusWithinDropdown = () => findDropdownMenu().find('button').element.focus();

  describe('Floating UI instance', () => {
    it("starts Floating UI's when opening the dropdown", async () => {
      buildWrapper();
      await findDefaultDropdownToggle().trigger('click');

      expect(autoUpdate).toHaveBeenCalledTimes(1);
    });

    it('stops Floating UI when closing the dropdown', async () => {
      buildWrapper();
      await findDefaultDropdownToggle().trigger('click');
      await findDefaultDropdownToggle().trigger('click');

      expect(autoUpdate).toHaveBeenCalledTimes(1);
      expect(mockStopAutoUpdate).toHaveBeenCalledTimes(1);
    });

    it('restarts Floating UI when reopening the dropdown', async () => {
      buildWrapper();
      await findDefaultDropdownToggle().trigger('click');
      await findDefaultDropdownToggle().trigger('click');
      await findDefaultDropdownToggle().trigger('click');

      expect(autoUpdate).toHaveBeenCalledTimes(2);
      expect(mockStopAutoUpdate).toHaveBeenCalledTimes(1);
    });

    it("stops Floating UI's auto updates on destroy", async () => {
      buildWrapper();
      await findDefaultDropdownToggle().trigger('click');
      wrapper.destroy();

      expect(mockStopAutoUpdate).toHaveBeenCalled();
    });

    describe('computePosition', () => {
      beforeEach(() => {
        autoUpdate.mockImplementation(jest.requireActual('@floating-ui/dom').autoUpdate);
      });

      it('initializes Floating UI with reference and floating elements and config for left-aligned menu', async () => {
        buildWrapper();
        await findDefaultDropdownToggle().trigger('click');

        const [referenceElement, floatingElement, config] = computePosition.mock.calls[0];
        expect(referenceElement).toBe(findDefaultDropdownToggle().element);
        expect(floatingElement).toBe(findDropdownMenu().element);
        expect(config.placement).toBe('bottom-start');
        expect(config.strategy).toBe('absolute');
        expect(config.middleware).toHaveLength(5);
        expect(config.middleware[0].name).toBe('offset');
        expect(config.middleware[1].name).toBe('autoPlacement');
        expect(config.middleware[1].autoPlacementOpts.alignment).toBe('start');
        expect(config.middleware[1].autoPlacementOpts.allowedPlacements).toEqual([
          'bottom-start',
          'top-start',
          'bottom-end',
          'top-end',
        ]);
        expect(config.middleware[2].name).toBe('shift');
      });

      it('initializes Floating UI with reference and floating elements and config for center-aligned menu', async () => {
        buildWrapper({ placement: 'center' });
        await findDefaultDropdownToggle().trigger('click');

        const [referenceElement, floatingElement, config] = computePosition.mock.calls[0];
        expect(referenceElement).toBe(findDefaultDropdownToggle().element);
        expect(floatingElement).toBe(findDropdownMenu().element);
        expect(config.placement).toBe('bottom');
        expect(config.strategy).toBe('absolute');
        expect(config.middleware).toHaveLength(5);
        expect(config.middleware[0].name).toBe('offset');
        expect(config.middleware[1].name).toBe('autoPlacement');
        expect(config.middleware[1].autoPlacementOpts.alignment).toBeUndefined();
        expect(config.middleware[1].autoPlacementOpts.allowedPlacements).toEqual(['bottom', 'top']);
        expect(config.middleware[2].name).toBe('shift');
      });

      it('initializes Floating UI with reference and floating elements and config for right-aligned menu', async () => {
        buildWrapper({ placement: 'right' });
        await findDefaultDropdownToggle().trigger('click');

        const [referenceElement, floatingElement, config] = computePosition.mock.calls[0];
        expect(referenceElement).toBe(findDefaultDropdownToggle().element);
        expect(floatingElement).toBe(findDropdownMenu().element);
        expect(config.placement).toBe('bottom-end');
        expect(config.strategy).toBe('absolute');
        expect(config.middleware).toHaveLength(5);
        expect(config.middleware[0].name).toBe('offset');
        expect(config.middleware[1].name).toBe('autoPlacement');
        expect(config.middleware[1].autoPlacementOpts.alignment).toBe('end');
        expect(config.middleware[1].autoPlacementOpts.allowedPlacements).toEqual([
          'bottom-start',
          'top-start',
          'bottom-end',
          'top-end',
        ]);
        expect(config.middleware[2].name).toBe('shift');
      });

      it('initializes Floating UI with reference and floating elements and config for `right-start` aligned menu', async () => {
        buildWrapper({ placement: 'right-start' });
        await findDefaultDropdownToggle().trigger('click');

        const [referenceElement, floatingElement, config] = computePosition.mock.calls[0];
        expect(referenceElement).toBe(findDefaultDropdownToggle().element);
        expect(floatingElement).toBe(findDropdownMenu().element);
        expect(config.placement).toBe('right-start');
        expect(config.strategy).toBe('absolute');
        expect(config.middleware).toHaveLength(5);
        expect(config.middleware[0].name).toBe('offset');
        expect(config.middleware[1].name).toBe('autoPlacement');
        expect(config.middleware[1].autoPlacementOpts.alignment).toBe('start');
        expect(config.middleware[1].autoPlacementOpts.allowedPlacements).toEqual([
          'right-start',
          'right-end',
          'left-start',
          'left-end',
        ]);
        expect(config.middleware[2].name).toBe('shift');
      });

      it("passes custom offset to Floating UI's middleware", async () => {
        const customOffset = { mainAxis: 10, crossAxis: 40 };
        buildWrapper({
          placement: 'right',
          offset: customOffset,
        });
        await findDefaultDropdownToggle().trigger('click');

        const [referenceElement, floatingElement, config] = computePosition.mock.calls[0];
        expect(referenceElement).toBe(findDefaultDropdownToggle().element);
        expect(floatingElement).toBe(findDropdownMenu().element);
        expect(config.placement).toBe('bottom-end');
        expect(config.strategy).toBe('absolute');
        expect(config.middleware).toHaveLength(5);
        expect(config.middleware[0].name).toBe('offset');
        expect(config.middleware[0].offsetOpts).toEqual(customOffset);
        expect(config.middleware[1].name).toBe('autoPlacement');
        expect(config.middleware[2].name).toBe('shift');
      });

      describe('positioningStrategy', () => {
        it('uses the absolute positioning strategy by default', async () => {
          buildWrapper();

          await findDefaultDropdownToggle().trigger('click');
          await nextTick();

          expect(wrapper.findComponent(MountingPortalStub).exists()).toBe(false);
          expect(computePosition).toHaveBeenCalledWith(
            findDefaultDropdownToggle().element,
            findDropdownMenu().element,
            expect.objectContaining({
              strategy: 'absolute',
            }),
          );
          expect(findDropdownMenu().classes()).toContain('gl-absolute');
        });

        it('applies the fixed positioning strategy properly', async () => {
          buildWrapper({
            positioningStrategy: 'fixed',
          });

          await findDefaultDropdownToggle().trigger('click');
          await nextTick();

          expect(wrapper.findComponent(MountingPortalStub).exists()).toBe(true);
          expect(computePosition).toHaveBeenCalledWith(
            findDefaultDropdownToggle().element,
            findDropdownMenu().element,
            expect.objectContaining({
              strategy: 'fixed',
            }),
          );
          expect(findDropdownMenu().classes()).toContain('gl-fixed');
        });
      });
    });
  });

  describe('renders content to the default slot', () => {
    const defaultContent = 'Some content here';
    const slots = { default: defaultContent };

    it('renders the content', () => {
      buildWrapper({}, { slots });
      expect(wrapper.find('.gl-new-dropdown-inner').html()).toContain(defaultContent);
    });
  });

  describe.each`
    props                                                            | toggleClasses
    ${{}}                                                            | ${['gl-new-dropdown-caret-only', 'btn-icon']}
    ${{ toggleText: 'toggleText' }}                                  | ${[]}
    ${{ icon: 'close' }}                                             | ${['gl-new-dropdown-icon-only', 'btn-icon']}
    ${{ icon: 'close', toggleText: 'toggleText', textSrOnly: true }} | ${['gl-new-dropdown-icon-only', 'btn-icon']}
    ${{ icon: 'close', textSrOnly: true }}                           | ${['gl-new-dropdown-icon-only', 'btn-icon']}
    ${{ toggleText: 'toggleText', noCaret: true }}                   | ${['gl-new-dropdown-toggle-no-caret']}
  `('dropdown with props $props', ({ props, toggleClasses }) => {
    beforeEach(async () => {
      buildWrapper(props);

      await nextTick();
    });

    it(`sets toggle button classes to '${toggleClasses}'`, () => {
      const classes = findDefaultDropdownToggle().classes().sort();

      expect(classes).toEqual([...DEFAULT_BTN_TOGGLE_CLASSES, ...toggleClasses].sort());
    });
  });

  describe.each`
    toggleClass             | expectedClasses                                      | type
    ${'my-class'}           | ${[...DEFAULT_BTN_TOGGLE_CLASSES, 'my-class']}       | ${'string'}
    ${{ 'my-class': true }} | ${[...DEFAULT_BTN_TOGGLE_CLASSES, 'my-class']}       | ${'object'}
    ${['cls-1', 'cls-2']}   | ${[...DEFAULT_BTN_TOGGLE_CLASSES, 'cls-1', 'cls-2']} | ${'array'}
    ${null}                 | ${[...DEFAULT_BTN_TOGGLE_CLASSES]}                   | ${'null'}
  `('with toggle classes', ({ toggleClass, expectedClasses, type }) => {
    beforeEach(async () => {
      buildWrapper({ toggleClass });

      await nextTick();
    });

    it(`class is inherited from toggle class of type ${type}`, () => {
      expect(findDefaultDropdownToggle().classes().sort()).toEqual(
        expect.arrayContaining(expectedClasses.sort()),
      );
    });
  });

  describe('block prop', () => {
    it('does not apply block style if false', () => {
      buildWrapper({ block: false });

      expect(wrapper.classes()).not.toContain('gl-w-full');
      expect(findDropdownToggleText().classes()).not.toContain('gl-w-full');
    });

    it('applies block style if true', () => {
      buildWrapper({ block: true });

      expect(findDropdownToggleText().classes()).toContain('gl-w-full');
      expect(findDefaultDropdownToggle().props('block')).toBe(true);
    });
  });

  describe('default toggle', () => {
    beforeEach(() => {
      buildWrapper();
    });

    it('should open the menu on click but keep focus on toggle', async () => {
      const toggle = findDefaultDropdownToggle();
      const menu = findDropdownMenu();

      toggle.element.focus();
      // open menu clicking toggle btn
      await toggle.trigger('click');
      expect(menu.classes('!gl-block')).toBe(true);
      expect(toggle.attributes('aria-expanded')).toBe('true');
      expect(toggle.element).toHaveFocus();

      // close menu clicking toggle btn
      await toggle.trigger('click');
      expect(menu.classes('!gl-block')).toBe(false);
      expect(toggle.attributes('aria-expanded')).toBe('false');
      expect(wrapper.emitted(GL_DROPDOWN_HIDDEN)).toHaveLength(1);
      expect(toggle.element).toHaveFocus();
    });

    it('should emit `GL_DROPDOWN_FOCUS_CONTENT` event on `ARROW_DOWN`', () => {
      findDefaultDropdownToggle().trigger('keydown', { code: ARROW_DOWN });
      expect(wrapper.emitted(GL_DROPDOWN_FOCUS_CONTENT)).toHaveLength(1);
    });

    it('should close menu on Escape and focus toggle', async () => {
      const toggle = findDefaultDropdownToggle();
      const menu = findDropdownMenu();

      // open menu clicking toggle btn
      await toggle.trigger('click');
      expect(menu.classes('!gl-block')).toBe(true);
      expect(toggle.attributes('aria-expanded')).toBe('true');

      moveFocusWithinDropdown();

      // close menu by pressing ESC key
      await menu.trigger('keydown.esc');

      expect(menu.classes('!gl-block')).toBe(false);
      expect(toggle.attributes('aria-expanded')).toBe('false');
      expect(wrapper.emitted(GL_DROPDOWN_HIDDEN)).toHaveLength(1);
      expect(toggle.element).toHaveFocus();
    });

    it('should close menu on Escape when focus is on toggle', async () => {
      const toggle = findDefaultDropdownToggle();
      const menu = findDropdownMenu();

      await toggle.trigger('click');
      expect(menu.classes('!gl-block')).toBe(true);
      expect(toggle.attributes('aria-expanded')).toBe('true');

      await toggle.trigger('keydown.esc');
      expect(menu.classes('!gl-block')).toBe(false);
      expect(toggle.attributes('aria-expanded')).toBe('false');
      expect(wrapper.emitted(GL_DROPDOWN_HIDDEN)).toHaveLength(1);
    });

    it('should modify Escape event from toggle when menu is open', async () => {
      const toggle = findDefaultDropdownToggle();

      await toggle.trigger('click');

      const event = { stopPropagation: jest.fn(), preventDefault: jest.fn() };

      await toggle.trigger('keydown.esc', event);

      expect(event.stopPropagation).toHaveBeenCalled();
      expect(event.preventDefault).toHaveBeenCalled();
    });

    it('should not modify Escape event from toggle when menu is closed', async () => {
      const toggle = findDefaultDropdownToggle();

      const event = { stopPropagation: jest.fn(), preventDefault: jest.fn() };
      await toggle.trigger('keydown.esc', event);

      expect(event.stopPropagation).not.toHaveBeenCalled();
      expect(event.preventDefault).not.toHaveBeenCalled();
    });

    describe('when the consumer takes over the focus', () => {
      let consumerButton;

      beforeEach(() => {
        consumerButton = document.createElement('button');
        document.body.appendChild(consumerButton);
      });

      afterEach(() => {
        consumerButton.remove();
      });

      it('does not steal the focus back from the consumer when closing the dropdown', async () => {
        const toggle = findDefaultDropdownToggle();
        const menu = findDropdownMenu();

        // open menu clicking toggle btn
        await toggle.trigger('click');

        moveFocusWithinDropdown();

        // consumer focuses some element
        consumerButton.focus();

        // close menu by pressing ESC key
        await menu.trigger('keydown.esc');

        expect(consumerButton).toHaveFocus();
      });
    });
  });

  describe('before-close event', () => {
    let event;

    beforeEach(() => {
      event = undefined;
      buildWrapper(undefined, {
        listeners: {
          [GL_DROPDOWN_BEFORE_CLOSE]({ originalEvent, preventDefault }) {
            event = originalEvent;
            preventDefault();
          },
        },
      });
    });

    it('should prevent closing', async () => {
      const toggle = findDefaultDropdownToggle();
      const menu = findDropdownMenu();

      await toggle.trigger('click');

      moveFocusWithinDropdown();
      await menu.trigger('keydown.esc');
      expect(menu.classes('!gl-block')).toBe(true);
      expect(toggle.attributes('aria-expanded')).toBe('true');
      expect(wrapper.emitted(GL_DROPDOWN_HIDDEN)).toBeUndefined();
      expect(toggle.element).not.toHaveFocus();
    });

    it('should contain original keyboard event', async () => {
      const toggle = findDefaultDropdownToggle();
      const menu = findDropdownMenu();
      await toggle.trigger('click');
      moveFocusWithinDropdown();
      await menu.trigger('keydown.esc');
      expect(event.type).toBe('keydown');
    });

    it('should contain original toggle click event', async () => {
      const toggle = findDefaultDropdownToggle();
      await toggle.trigger('click');
      await toggle.trigger('click');
      expect(event.type).toBe('click');
    });

    it('should contain original outside click event', async () => {
      const outsideElement = document.createElement('div');
      document.body.appendChild(outsideElement);

      const toggle = findDefaultDropdownToggle();
      await toggle.trigger('click');
      const click = new MouseEvent('click', { bubbles: true });
      outsideElement.dispatchEvent(click);
      expect(event).toBe(click);
    });
  });

  describe('Custom toggle', () => {
    const customToggleTestId = 'custom-toggle';
    const toggleContent = `<button data-testid="${customToggleTestId}" aria-controls="base-dropdown-1" aria-expanded="false" role="combobox">Custom toggle</button>`;
    const findFirstToggleElement = () =>
      findCustomDropdownToggle().find(`[data-testid="${customToggleTestId}"]`);

    beforeEach(() => {
      const slots = { toggle: toggleContent };
      buildWrapper({}, { slots });
    });

    it('does not render default toggle button', () => {
      expect(findDefaultDropdownToggle().exists()).toBe(false);
    });

    it('renders the custom toggle instead', () => {
      expect(findCustomDropdownToggle().exists()).toBe(true);
    });

    it('renders provided via slot content as custom toggle', () => {
      expect(findCustomDropdownToggle().html()).toContain(toggleContent);
    });

    describe('toggle visibility', () => {
      beforeEach(() => {
        autoUpdate.mockImplementation(jest.requireActual('@floating-ui/dom').autoUpdate);
        computePosition.mockImplementation(() => Promise.resolve);
      });

      it('should toggle menu visibility on toggle click', async () => {
        const toggle = findCustomDropdownToggle();
        const menu = findDropdownMenu();
        // open menu clicking toggle btn
        await toggle.trigger('click');
        expect(menu.classes('!gl-block')).toBe(true);
        await waitForAnimationFrame();
        expect(wrapper.emitted(GL_DROPDOWN_SHOWN)).toHaveLength(1);

        // close menu clicking toggle btn again
        await toggle.trigger('click');
        expect(menu.classes('!gl-block')).toBe(false);
        expect(wrapper.emitted(GL_DROPDOWN_HIDDEN)).toHaveLength(1);
      });

      it('should close the menu when focusing on another element', async () => {
        const testid = 'btn-outside';

        buildWrapper(undefined, {
          component: {
            template: `
              <div>
                <button data-testid="${testid}">Focus on me</button>
                <GlBaseDropdown toggleId='dropdown-toggle-btn-1'>
                  <template v-slot:default>
                    <div class="${GL_DROPDOWN_CONTENTS_CLASS}">
                      <button />
                    </div>
                  </template>
                </GlBaseDropdown>
              </div>
            `,
            components: {
              GlBaseDropdown,
            },
          },
        });

        const toggle = findDefaultDropdownToggle();
        const menu = findDropdownMenu();

        // open menu clicking toggle btn
        await toggle.trigger('click');
        expect(menu.classes('!gl-block')).toBe(true);
        expect(toggle.attributes('aria-expanded')).toBe('true');

        // close menu by focusing on another element
        await wrapper.find(`[data-testid="${testid}"]`).trigger('focusin');
        expect(menu.classes('!gl-block')).toBe(false);
        expect(toggle.attributes('aria-expanded')).toBe('false');
      });

      it('should close the menu when Escape is pressed inside menu and focus first child in the toggle', async () => {
        const toggle = findCustomDropdownToggle();
        const firstToggleChild = findFirstToggleElement();
        const menu = findDropdownMenu();
        // open menu clicking toggle btn
        await toggle.trigger('click');
        expect(menu.classes('!gl-block')).toBe(true);

        // close menu pressing ESC on it
        moveFocusWithinDropdown();
        await menu.trigger('keydown.esc');
        expect(menu.classes('!gl-block')).toBe(false);
        expect(firstToggleChild.attributes('aria-expanded')).toBe('false');
        expect(wrapper.emitted(GL_DROPDOWN_HIDDEN)).toHaveLength(1);
        expect(toggle.find(`[data-testid="${customToggleTestId}"]`).element).toHaveFocus();
      });

      it('should close menu on Escape when focus is on toggle', async () => {
        const toggle = findCustomDropdownToggle();
        const menu = findDropdownMenu();

        await toggle.trigger('click');
        expect(menu.classes('!gl-block')).toBe(true);

        await toggle.trigger('keydown.esc');
        expect(menu.classes('!gl-block')).toBe(false);
        expect(wrapper.emitted(GL_DROPDOWN_HIDDEN)).toHaveLength(1);
      });
    });

    it('should emit `GL_DROPDOWN_FOCUS_CONTENT` event on `ARROW_DOWN`', () => {
      const toggle = findCustomDropdownToggle();
      toggle.trigger('keydown', { code: ARROW_DOWN });
      expect(wrapper.emitted(GL_DROPDOWN_FOCUS_CONTENT)).toHaveLength(1);
    });
  });

  describe('fluid width', () => {
    it('uses a fixed width by default', () => {
      buildWrapper();

      expect(findDropdownMenu().classes()).toContain(FIXED_WIDTH_CLASS);
    });

    it('drops the fixed width when `fluidWidth` is `true`', () => {
      buildWrapper({ fluidWidth: true });

      expect(findDropdownMenu().classes()).not.toContain(FIXED_WIDTH_CLASS);
    });
  });

  describe('panel match trigger width', () => {
    beforeEach(() => {
      autoUpdate.mockImplementation(jest.requireActual('@floating-ui/dom').autoUpdate);
      computePosition.mockImplementation((_, __, options) => {
        return Promise.resolve({
          x: 0,
          y: 0,
          placement: options.placement,
          strategy: options.strategy,
          middlewareData: {},
        });
      });
    });

    it('panel does not match trigger width by default', async () => {
      buildWrapper();
      await findDefaultDropdownToggle().trigger('click');
      await nextTick();

      const sizeMiddleware = computePosition.mock.calls[0][2].middleware.find(
        (m) => m.name === 'size',
      );
      expect(sizeMiddleware).toBeDefined();

      const mockContentsEl = document.createElement('div');
      const mockElements = {
        floating: {
          querySelector: jest.fn().mockReturnValue(mockContentsEl),
        },
      };

      // Mock the toggleElement's getBoundingClientRect
      const toggleElement = findDefaultDropdownToggle().element;
      const originalGetBoundingClientRect = toggleElement.getBoundingClientRect;
      toggleElement.getBoundingClientRect = jest.fn().mockReturnValue({ width: 200 });

      sizeMiddleware.fn({
        availableWidth: 500,
        availableHeight: 400,
        elements: mockElements,
      });

      // Restore original method
      toggleElement.getBoundingClientRect = originalGetBoundingClientRect;

      expect(mockContentsEl.style.width).toBe('');
      expect(mockContentsEl.style.minWidth).toBe('');
    });

    it('panel matches trigger width when prop is true', async () => {
      buildWrapper({ panelMatchTriggerWidth: true });
      await findDefaultDropdownToggle().trigger('click');
      await nextTick();

      const sizeMiddleware = computePosition.mock.calls[0][2].middleware.find(
        (m) => m.name === 'size',
      );
      expect(sizeMiddleware).toBeDefined();

      const mockContentsEl = document.createElement('div');
      const mockElements = {
        floating: {
          querySelector: jest.fn().mockReturnValue(mockContentsEl),
        },
      };

      // Mock the toggleElement's getBoundingClientRect
      const toggleElement = findDefaultDropdownToggle().element;
      const originalGetBoundingClientRect = toggleElement.getBoundingClientRect;
      toggleElement.getBoundingClientRect = jest.fn().mockReturnValue({ width: 200 });

      sizeMiddleware.fn({
        availableWidth: 500,
        availableHeight: 400,
        elements: mockElements,
      });

      // Restore original method
      toggleElement.getBoundingClientRect = originalGetBoundingClientRect;

      expect(mockContentsEl.style.minWidth).toBe('200px');
    });
  });

  describe('aria-labelledby', () => {
    describe('combobox toggle', () => {
      it('applies custom aria-labelledby without toggleId for combobox', () => {
        buildWrapper({
          ariaLabelledby: 'label',
          hasSearchableListbox: false,
          isDisclosure: false,
        });
        expect(findDefaultDropdownToggle().attributes('aria-labelledby')).toBe('label');
      });

      it('applies default aria-labelledby with toggleId for combobox', () => {
        buildWrapper({
          hasSearchableListbox: false,
          isDisclosure: false,
        });
        expect(findDefaultDropdownToggle().attributes('aria-labelledby')).toBe(
          'dropdown-toggle-btn-1',
        );
      });

      it('applies form group label and toggleId for combobox inside form group', () => {
        buildWrapper(
          {
            hasSearchableListbox: false,
            isDisclosure: false,
          },
          {
            provide: {
              getFormGroupInstance: () => ({ labelId: 'form-group-label-id' }),
            },
          },
        );
        expect(findDefaultDropdownToggle().attributes('aria-labelledby')).toBe(
          'form-group-label-id dropdown-toggle-btn-1',
        );
      });

      it('prefers custom aria-labelledby over form group label for combobox', () => {
        buildWrapper(
          {
            ariaLabelledby: 'custom-label',
            hasSearchableListbox: false,
            isDisclosure: false,
          },
          {
            provide: {
              formGroupLabelState: { id: 'form-group-label' },
            },
          },
        );
        expect(findDefaultDropdownToggle().attributes('aria-labelledby')).toBe('custom-label');
      });
    });

    describe('non-combobox toggle (disclosure or listbox)', () => {
      it('applies custom aria-labelledby with toggleId for disclosure', () => {
        buildWrapper({
          ariaLabelledby: 'label',
          isDisclosure: true,
        });
        expect(findDefaultDropdownToggle().attributes('aria-labelledby')).toBe(
          'label dropdown-toggle-btn-1',
        );
      });

      it('does not apply aria-labelledby for disclosure without external label', () => {
        buildWrapper({
          isDisclosure: true,
        });
        expect(findDefaultDropdownToggle().attributes('aria-labelledby')).toBeUndefined();
      });

      it('applies form group label and toggleId for disclosure inside form group', () => {
        buildWrapper(
          {
            isDisclosure: true,
          },
          {
            provide: {
              getFormGroupInstance: () => ({ labelId: 'form-group-label-id' }),
            },
          },
        );
        expect(findDefaultDropdownToggle().attributes('aria-labelledby')).toBe(
          'form-group-label-id dropdown-toggle-btn-1',
        );
      });

      it('prefers custom aria-labelledby over form group label for disclosure', () => {
        buildWrapper(
          {
            ariaLabelledby: 'custom-label',
            isDisclosure: true,
          },
          {
            provide: {
              formGroupLabelState: { id: 'form-group-label' },
            },
          },
        );
        expect(findDefaultDropdownToggle().attributes('aria-labelledby')).toBe(
          'custom-label dropdown-toggle-btn-1',
        );
      });

      it('applies custom aria-labelledby with toggleId for searchable listbox', () => {
        buildWrapper({
          ariaLabelledby: 'label',
          hasSearchableListbox: true,
        });
        expect(findDefaultDropdownToggle().attributes('aria-labelledby')).toBe(
          'label dropdown-toggle-btn-1',
        );
      });

      it('does not apply aria-labelledby for searchable listbox without external label', () => {
        buildWrapper({
          hasSearchableListbox: true,
        });
        expect(findDefaultDropdownToggle().attributes('aria-labelledby')).toBeUndefined();
      });
    });
  });

  describe('aria-label', () => {
    it('applies aria-label to the toggle button when provided', () => {
      buildWrapper({ ariaLabel: 'More actions' });
      expect(findDefaultDropdownToggle().attributes('aria-label')).toBe('More actions');
    });

    it('does not apply aria-label when not provided', () => {
      buildWrapper();
      expect(findDefaultDropdownToggle().attributes('aria-label')).toBeUndefined();
    });

    it('preserves aria-labelledby when both ariaLabel and ariaLabelledby are provided', () => {
      buildWrapper({
        ariaLabel: 'More actions',
        ariaLabelledby: 'custom-label',
        isDisclosure: true,
      });
      const toggle = findDefaultDropdownToggle();
      expect(toggle.attributes('aria-labelledby')).toBe('custom-label dropdown-toggle-btn-1');
      expect(toggle.attributes('aria-label')).toBe('More actions');
    });

    it('preserves aria-labelledby from form group even when ariaLabel is provided', () => {
      buildWrapper(
        {
          ariaLabel: 'More options',
          isDisclosure: true,
        },
        {
          provide: {
            getFormGroupInstance: () => ({ labelId: 'form-group-label-id' }),
          },
        },
      );
      const toggle = findDefaultDropdownToggle();
      expect(toggle.attributes('aria-labelledby')).toBe(
        'form-group-label-id dropdown-toggle-btn-1',
      );
      expect(toggle.attributes('aria-label')).toBe('More options');
    });

    it('applies only aria-label for disclosure without external labelling', () => {
      buildWrapper({
        ariaLabel: 'More actions',
        isDisclosure: true,
      });
      const toggle = findDefaultDropdownToggle();
      expect(toggle.attributes('aria-labelledby')).toBeUndefined();
      expect(toggle.attributes('aria-label')).toBe('More actions');
    });
  });

  describe('conditional toggle role and ARIA attributes', () => {
    it('should have role="combobox" when base_dropdown is not a disclosure and not searchable listbox', () => {
      buildWrapper({
        hasSearchableListbox: false,
      });
      const toggleButton = findDefaultDropdownToggle();
      expect(toggleButton.attributes('role')).toBe('combobox');
    });

    it('should not have role="combobox" base_dropdown is a disclosure', () => {
      buildWrapper({
        hasSearchableListbox: false,
        isDisclosure: true,
      });
      const toggleButton = findDefaultDropdownToggle();
      expect(toggleButton.attributes('role')).toBeUndefined();
    });

    it('should not have role="combobox" base_dropdown is a searchable listbox', () => {
      buildWrapper({
        hasSearchableListbox: true,
      });
      const toggleButton = findDefaultDropdownToggle();
      expect(toggleButton.attributes('role')).toBeUndefined();
    });

    it('should have an aria-expanded attribute', async () => {
      buildWrapper();
      const toggleButton = findDefaultDropdownToggle();
      expect(toggleButton.attributes('aria-expanded')).toBe('false');

      await toggleButton.trigger('click');

      expect(toggleButton.attributes('aria-expanded')).toBe('true');
    });

    it('should have an aria-controls attribute', () => {
      buildWrapper();
      const toggleButton = findDefaultDropdownToggle();

      expect(toggleButton.attributes('aria-controls')).toBe('base-dropdown-1');
    });

    it('should have an aria-haspopup attribute if base_dropdown is a listbox', async () => {
      buildWrapper({
        ariaHaspopup: 'listbox',
      });
      const toggleButton = findDefaultDropdownToggle();

      await toggleButton.trigger('click');

      expect(toggleButton.attributes('aria-haspopup')).toBe('listbox');
    });

    it('should have an aria-activedescendant attribute if base_dropdown is a listbox', async () => {
      buildWrapper({ activeItemId: 'item-1' });
      const toggleButton = findDefaultDropdownToggle();
      expect(toggleButton.attributes('aria-activedescendant')).toBeUndefined();

      await toggleButton.trigger('click');

      const menu = findDropdownMenu();
      expect(menu.classes('!gl-block')).toBe(true);

      moveFocusWithinDropdown();

      expect(toggleButton.attributes('aria-activedescendant')).toBeDefined();
      expect(toggleButton.attributes('aria-activedescendant')).toBe('item-1');
    });

    it('should not have an aria-activedescendant attribute if base_dropdown is a disclosure', () => {
      buildWrapper({ isDisclosure: true });
      const toggleButton = findDefaultDropdownToggle();
      expect(toggleButton.attributes('aria-activedescendant')).toBeUndefined();
    });
  });

  describe('containsElement', () => {
    it('returns `true` if the panel contains the given DOM element', () => {
      buildWrapper();
      const el = wrapper.vm.$el.querySelector(`.${GL_DROPDOWN_CONTENTS_CLASS}`);

      expect(wrapper.vm.containsElement(el)).toBe(true);
    });

    it('returns `true` if the component contains the given DOM element', () => {
      buildWrapper();
      const el = wrapper.vm.$refs.toggle.$el;

      expect(wrapper.vm.containsElement(el)).toBe(true);
    });

    it('returns `true` if the panel contains the given DOM element and the dropdown is fixed-positioned', async () => {
      buildWrapper({ positioningStrategy: 'fixed' }, { stubs: { MountingPortal: false } });
      await nextTick();
      const el = document.querySelector(`.${GL_DROPDOWN_CONTENTS_CLASS}`);

      expect(wrapper.vm.containsElement(el)).toBe(true);
    });

    it('returns `false` if the given DOM element is outside of the component', () => {
      buildWrapper();
      const el = document.createElement('div');
      document.body.appendChild(el);

      expect(wrapper.vm.containsElement(el)).toBe(false);
    });
  });

  describe('ID placements in template', () => {
    describe('internal label ID placement', () => {
      it('places toggleId on button when a disclosure', () => {
        buildWrapper({
          hasSearchableListbox: false,
          toggleId: 'my-toggle',
          isDisclosure: true,
        });
        const toggle = findDefaultDropdownToggle();
        const span = findDefaultDropdownTextSpan();

        expect(toggle.attributes('id')).toBe('my-toggle');
        expect(span.attributes('id')).toBeUndefined();
      });

      it('places toggleId on button when a searchable combobox', () => {
        buildWrapper({
          hasSearchableListbox: true,
          toggleId: 'my-toggle',
        });
        const toggle = findDefaultDropdownToggle();
        const span = findDefaultDropdownTextSpan();

        expect(toggle.attributes('id')).toBe('my-toggle');
        expect(span.attributes('id')).toBeUndefined();
      });

      it('places toggleId on span when a non-searchable combobox', () => {
        buildWrapper({
          hasSearchableListbox: false,
          toggleId: 'my-toggle',
        });
        const toggle = findDefaultDropdownToggle();
        const span = findDefaultDropdownTextSpan();

        expect(toggle.attributes('id')).toBeUndefined();
        expect(span.attributes('id')).toBe('my-toggle');
      });
    });

    describe('external label ID placement', () => {
      it('places toggleId on button when a disclosure', () => {
        buildWrapper({
          hasExternalLabel: true,
          toggleId: 'my-toggle',
          isDisclosure: true,
        });
        const toggle = findDefaultDropdownToggle();
        const span = findDefaultDropdownTextSpan();

        expect(toggle.attributes('id')).toBe('my-toggle');
        expect(span.attributes('id')).toBeUndefined();
      });

      it('places toggleId on button when a searchable combobox', () => {
        buildWrapper({
          hasSearchableListbox: true,
          hasExternalLabel: true,
          toggleId: 'my-toggle',
        });
        const toggle = findDefaultDropdownToggle();
        const span = findDefaultDropdownTextSpan();

        expect(toggle.attributes('id')).toBe('my-toggle');
        expect(span.attributes('id')).toBeUndefined();
      });

      it('places toggleId and listboxId when a non-searchable combobox', () => {
        buildWrapper({
          hasExternalLabel: true,
          toggleId: 'my-toggle',
          listboxId: 'my-toggle-span',
          isSearchable: false,
        });
        const toggle = findDefaultDropdownToggle();
        const span = findDefaultDropdownTextSpan();

        expect(toggle.attributes('id')).toBe('my-toggle');
        expect(span.attributes('id')).toBe('my-toggle-span');
      });
    });
  });

  describe('validation', () => {
    it('does not have is-valid or is-invalid classes when state is default', () => {
      buildWrapper();

      const toggleButton = findDefaultDropdownToggle();
      expect(toggleButton.classes()).not.toContain('is-valid');
      expect(toggleButton.classes()).not.toContain('is-invalid');
    });

    it('has class is-valid when state=true', () => {
      buildWrapper({ state: true });

      const toggleButton = findDefaultDropdownToggle();
      expect(toggleButton.classes()).toContain('is-valid');
      expect(toggleButton.classes()).not.toContain('is-invalid');
    });

    it('has class is-invalid when state=false', () => {
      buildWrapper({ state: false });

      const toggleButton = findDefaultDropdownToggle();
      expect(toggleButton.classes()).toContain('is-invalid');
      expect(toggleButton.classes()).not.toContain('is-valid');
    });
  });
});
