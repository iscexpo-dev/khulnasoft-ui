import { shallowMount } from '@vue/test-utils';
import { toggleLabelPosition } from '../../../utils/constants';
import Icon from '../icon/icon.vue';
import LoadingIcon from '../loading_icon/loading_icon.vue';
import { glToggleConfig } from '../../../config';
import Toggle from './toggle.vue';

describe('toggle', () => {
  let wrapper;

  const label = 'toggle label';
  const descriptionText = 'description text';
  const helpText = 'help text';

  const createWrapper = (props = {}, options = {}) => {
    wrapper = shallowMount(Toggle, {
      propsData: {
        label,
        ...props,
      },
      ...options,
    });
  };

  const findButton = () => wrapper.find('button');
  const findDescriptionElement = () => wrapper.find('[data-testid="toggle-description"]');
  const findHelpElement = () => wrapper.find('[data-testid="toggle-help"]');

  it('has role=switch', () => {
    createWrapper();

    expect(findButton().attributes('role')).toBe('switch');
  });

  describe.each`
    state    | value    | ariaCheckedExpected | checkedClassExpected
    ${'on'}  | ${true}  | ${'true'}           | ${true}
    ${'off'} | ${false} | ${'false'}          | ${false}
  `('when $state', ({ value, ariaCheckedExpected, checkedClassExpected }) => {
    beforeEach(() => {
      createWrapper({ value });
    });

    it(`${value ? 'has' : 'does not have'} aria-checked`, () => {
      expect(findButton().attributes('aria-checked')).toBe(ariaCheckedExpected);
    });

    it(`${value ? 'has' : 'does not have'} checked class`, () => {
      expect(findButton().classes('is-checked')).toBe(checkedClassExpected);
    });
  });

  describe.each`
    state         | disabled | disabledClassExpected | changeEventPayload | ariaDisabledValue
    ${'enabled'}  | ${false} | ${false}              | ${[[true]]}        | ${undefined}
    ${'disabled'} | ${true}  | ${true}               | ${undefined}       | ${'true'}
  `('when $state', ({ disabled, disabledClassExpected, changeEventPayload, ariaDisabledValue }) => {
    beforeEach(() => {
      createWrapper({ disabled });
    });

    it(`${disabled ? 'has' : 'does not have'} disabled class`, () => {
      expect(findButton().classes('is-disabled')).toBe(disabledClassExpected);
    });

    it(`${disabled ? 'does not emit' : 'emits'} change event when clicked`, () => {
      findButton().trigger('click');

      expect(wrapper.emitted('change')).toEqual(changeEventPayload);
    });

    it(`sets aria-disabled attribute to ${ariaDisabledValue}`, () => {
      expect(findButton().attributes('aria-disabled')).toBe(ariaDisabledValue);
    });
  });

  describe('when disabled and accessibleDisabled', () => {
    beforeEach(() => {
      createWrapper({ disabled: true, accessibleDisabled: true });
    });

    it('keeps the button focusable', () => {
      expect(findButton().attributes('disabled')).toBeUndefined();
    });

    it('sets aria-disabled attribute to true', () => {
      expect(findButton().attributes('aria-disabled')).toBe('true');
    });

    it('does not emit change event when clicked', () => {
      findButton().trigger('click');

      expect(wrapper.emitted('change')).toBeUndefined();
    });
  });

  describe('with the accessibleDisabledToggle config option', () => {
    beforeEach(() => {
      glToggleConfig.accessibleDisabledToggle = true;
      createWrapper({ disabled: true });
    });

    afterEach(() => {
      glToggleConfig.accessibleDisabledToggle = false;
    });

    it('keeps a disabled toggle focusable by default', () => {
      expect(findButton().attributes('disabled')).toBeUndefined();
      expect(findButton().attributes('aria-disabled')).toBe('true');
    });
  });

  describe('with ariaDescribedby', () => {
    it('describes the toggle button with the given ids', () => {
      createWrapper({ ariaDescribedby: 'reason-1 reason-2' });

      expect(findButton().attributes('aria-describedby')).toBe('reason-1 reason-2');
    });

    it('appends the given ids to the help text id', () => {
      createWrapper({ help: helpText, ariaDescribedby: 'reason-1' });

      expect(findButton().attributes('aria-describedby')).toBe(
        `${findHelpElement().attributes('id')} reason-1`,
      );
    });
  });

  describe.each`
    state            | isLoading
    ${'loading'}     | ${true}
    ${'not loading'} | ${false}
  `('when $state', ({ isLoading }) => {
    beforeEach(() => {
      createWrapper({ isLoading });
    });

    it(`${isLoading ? 'shows' : 'does not show'} loading spinner`, () => {
      expect(wrapper.findComponent(LoadingIcon).exists()).toBe(isLoading);
    });

    it(`${isLoading ? 'does not show' : 'shows'} toggle icon`, () => {
      expect(wrapper.findComponent(Icon).exists()).toBe(!isLoading);
    });
  });

  describe.each`
    state                                        | description        | props                                                                       | options
    ${'with description'}                        | ${descriptionText} | ${{ description: descriptionText }}                                         | ${undefined}
    ${'with description in slot'}                | ${descriptionText} | ${undefined}                                                                | ${{ slots: { description: descriptionText } }}
    ${'without description'}                     | ${undefined}       | ${undefined}                                                                | ${undefined}
    ${'with description and labelPosition left'} | ${undefined}       | ${{ desciption: descriptionText, labelPosition: toggleLabelPosition.left }} | ${undefined}
  `('$state', ({ description, props, options }) => {
    beforeEach(() => {
      createWrapper(props, options);
    });

    if (description) {
      it('shows description', () => {
        expect(findDescriptionElement().text()).toBe(description);
      });
    } else {
      it('does not show description', () => {
        expect(findDescriptionElement().exists()).toBe(false);
      });
    }
  });

  describe.each`
    state                                 | help         | props                                                          | options                          | getAriaDescribedBy
    ${'with help'}                        | ${helpText}  | ${{ help: helpText }}                                          | ${undefined}                     | ${() => findHelpElement().attributes('id')}
    ${'with help in slot'}                | ${helpText}  | ${undefined}                                                   | ${{ slots: { help: helpText } }} | ${() => findHelpElement().attributes('id')}
    ${'without help'}                     | ${undefined} | ${undefined}                                                   | ${undefined}                     | ${() => undefined}
    ${'with help and labelPosition left'} | ${undefined} | ${{ help: helpText, labelPosition: toggleLabelPosition.left }} | ${undefined}                     | ${() => undefined}
  `('$state', ({ help, props, options, getAriaDescribedBy }) => {
    beforeEach(() => {
      createWrapper(props, options);
    });

    it(`${help ? 'shows' : 'does not show'} help`, () => {
      expect(findHelpElement().exists()).toBe(Boolean(help));
      if (help) {
        expect(findHelpElement().text()).toBe(help);
      }
    });

    it(`${help ? 'describes' : 'does not describe'} the toggle button`, () => {
      expect(findButton().attributes('aria-describedby')).toBe(getAriaDescribedBy());
    });
  });

  describe('label position', () => {
    describe.each`
      state       | labelPosition                 | hasGlSrOnlyClass | flexDirection
      ${'top'}    | ${toggleLabelPosition.top}    | ${false}         | ${'gl-flex-col'}
      ${'left'}   | ${toggleLabelPosition.left}   | ${false}         | ${'gl-toggle-label-inline'}
      ${'hidden'} | ${toggleLabelPosition.hidden} | ${true}          | ${'gl-flex-col'}
    `('when $state', ({ labelPosition, hasGlSrOnlyClass, flexDirection }) => {
      beforeEach(() => {
        createWrapper({ labelPosition });
      });

      it(`${flexDirection} class is added to the label`, () => {
        const cssClasses = wrapper.find('[data-testid="toggle-wrapper"]').classes();

        return expect(cssClasses).toContain(flexDirection);
      });

      it(`${hasGlSrOnlyClass ? 'adds' : 'does not add'} 'gl-sr-only' class to the label`, () => {
        const cssClasses = wrapper.find('[data-testid="toggle-label"]').classes();
        return hasGlSrOnlyClass
          ? expect(cssClasses).toContain('gl-sr-only')
          : expect(cssClasses).not.toContain('gl-sr-only');
      });

      it('has accessible name for the button', () => {
        expect(findButton().attributes('aria-labelledby')).toBeDefined();
      });
    });
  });
});
