import { nextTick } from 'vue';
import { cloneDeep } from 'lodash-es';
import { mount } from '@vue/test-utils';
import GlDropdownItem from '../../dropdown/dropdown_item.vue';
import GlFormInput from '../form_input/form_input.vue';
import {
  stringTokenList,
  labelText,
  objectTokenList,
  oneTokenList,
  actionsList,
} from './constants';
import GlFormCombobox from './form_combobox.vue';

const partialToken = 'do';
const partialStringTokenMatch = ['dog', 'dodo', 'komodo dragon'];
const partialObjectTokenMatch = [
  { id: '2', title: 'dog' },
  { id: '3', title: 'dodo' },
  { id: '4', title: 'komodo dragon' },
];
const unlistedToken = 'elephant';

const doTimes = (num, fn) => {
  for (let i = 0; i < num; i += 1) {
    fn();
  }
};

describe('GlFormCombobox', () => {
  let wrapper;

  const createComponent = ({
    tokens = stringTokenList,
    matchValueToAttr = undefined,
    actionList = [],
  } = {}) => {
    wrapper = mount(
      {
        data() {
          return {
            inputVal: '',
            tokens,
            labelText,
            matchValueToAttr,
            actionList,
          };
        },
        components: { GlFormCombobox },
        template: `
        <div>
          <gl-form-combobox
            v-model="inputVal"
            :token-list="tokens"
            :label-text="labelText"
            :match-value-to-attr="matchValueToAttr"
            :action-list="actionList"
          />
        </div>
      `,
      },
      {
        attachTo: document.body,
      },
    );
  };

  // needs new selector now
  const findDropdown = () => wrapper.find('[data-testid="combobox-dropdown"]');
  const findDropdownOptions = () =>
    wrapper.findAllComponents(GlDropdownItem).wrappers.map((item) => item.text());
  const findInput = () => wrapper.findComponent(GlFormInput);
  const findInputValue = () => findInput().element.value;
  const setInput = (val) => findInput().setValue(val);
  const arrowDown = () => findDropdown().trigger('keydown.down');
  const arrowUp = () => findDropdown().trigger('keydown.up');
  const enter = () => wrapper.find('[aria-selected="true"]').trigger('keydown.enter');
  const findFirstAction = () => wrapper.find('[data-testid="combobox-action"]');

  beforeAll(() => {
    if (!HTMLElement.prototype.scrollIntoView) {
      HTMLElement.prototype.scrollIntoView = jest.fn();
    }
  });

  afterAll(() => {
    if (HTMLElement.prototype.scrollIntoView.mock) {
      delete HTMLElement.prototype.scrollIntoView;
    }
  });

  describe('accessibility', () => {
    beforeEach(() => {
      createComponent();
    });

    it('properly manages aria-activedescendant on input', async () => {
      await setInput(partialToken);
      await nextTick();
      const input = findInput().element;

      expect(input.hasAttribute('aria-activedescendant')).toBe(false);

      await arrowDown();
      await nextTick();
      const suggestionsId = wrapper.find('[role="listbox"]').attributes('id');
      expect(input.getAttribute('aria-activedescendant')).toBe(`${suggestionsId}-option-0`);
    });

    it('updates aria-expanded based on dropdown visibility', async () => {
      const input = findInput().element;
      expect(input.getAttribute('aria-expanded')).toBe('false');

      await setInput(partialToken);
      expect(input.getAttribute('aria-expanded')).toBe('true');

      await findInput().trigger('keydown.esc');
      expect(input.getAttribute('aria-expanded')).toBe('false');
    });
  });

  describe.each`
    valueType   | tokens             | matchValueToAttr | partialTokenMatch
    ${'string'} | ${stringTokenList} | ${undefined}     | ${partialStringTokenMatch}
    ${'object'} | ${objectTokenList} | ${'title'}       | ${partialObjectTokenMatch}
  `('with value as $valueType', ({ valueType, tokens, matchValueToAttr, partialTokenMatch }) => {
    describe('match and filter functionality', () => {
      beforeEach(() => {
        createComponent({ tokens, matchValueToAttr });
      });

      it('is closed when the input is empty', () => {
        expect(findInput().isVisible()).toBe(true);
        expect(findInputValue()).toBe('');
        expect(findDropdown().isVisible()).toBe(false);
      });

      it('is open when the input text matches a token', async () => {
        await setInput(partialToken);
        expect(findDropdown().isVisible()).toBe(true);
      });

      it('shows partial matches at string start and mid-string', async () => {
        await setInput(partialToken);
        expect(findDropdown().isVisible()).toBe(true);

        if (valueType === 'string') {
          expect(findDropdownOptions()).toEqual(partialTokenMatch);
        } else {
          findDropdownOptions().forEach((option, index) => {
            expect(option).toContain(partialTokenMatch[index][matchValueToAttr]);
          });
        }
      });

      it('is closed when the text does not match', async () => {
        await setInput(unlistedToken);
        expect(findDropdown().isVisible()).toBe(false);
      });
    });

    describe('keyboard navigation in dropdown', () => {
      beforeEach(() => {
        createComponent({ tokens, matchValueToAttr });
      });

      describe('on down arrow + enter', () => {
        it('selects the next item in the list and closes the dropdown', async () => {
          await setInput(partialToken);
          arrowDown();
          await nextTick();
          enter();
          await nextTick();

          if (valueType === 'string') {
            expect(findInputValue()).toBe(partialTokenMatch[0]);
          } else {
            expect(findInputValue()).toBe(partialTokenMatch[0][matchValueToAttr]);
          }
        });

        it('loops to the top when it reaches the bottom', async () => {
          await setInput(partialToken);
          doTimes(findDropdownOptions().length + 1, arrowDown);
          await nextTick();
          enter();
          await nextTick();

          if (valueType === 'string') {
            expect(findInputValue()).toBe(partialTokenMatch[0]);
          } else {
            expect(findInputValue()).toBe(partialTokenMatch[0][matchValueToAttr]);
          }
        });
      });

      describe('on up arrow + enter', () => {
        it('selects the previous item in the list and closes the dropdown', async () => {
          setInput(partialToken);

          await nextTick();
          doTimes(3, arrowDown);
          arrowUp();
          await nextTick();
          enter();
          await nextTick();

          await nextTick();

          if (valueType === 'string') {
            expect(findInputValue()).toBe(partialTokenMatch[1]);
          } else {
            expect(findInputValue()).toBe(partialTokenMatch[1][matchValueToAttr]);
          }
          expect(findDropdown().isVisible()).toBe(false);
        });

        it('loops to the bottom when it reaches the top', async () => {
          await setInput(partialToken);
          arrowDown();
          arrowUp();
          await nextTick();
          enter();
          await nextTick();

          if (valueType === 'string') {
            expect(findInputValue()).toBe(partialTokenMatch[partialTokenMatch.length - 1]);
          } else {
            expect(findInputValue()).toBe(
              partialTokenMatch[partialTokenMatch.length - 1][matchValueToAttr],
            );
          }
        });
      });

      describe('on enter with no item highlighted', () => {
        it('does nothing', async () => {
          await setInput(partialToken);
          await findInput().trigger('keydown.enter');
          expect(findInputValue()).toBe(partialToken);
          expect(findDropdown().isVisible()).toBe(true);
        });
      });

      describe('on click', () => {
        it('selects the clicked item regardless of arrow highlight', async () => {
          await setInput(partialToken);
          await wrapper.find('[data-testid="combobox-dropdown"] button').trigger('click');

          if (valueType === 'string') {
            expect(findInputValue()).toBe(partialTokenMatch[0]);
          } else {
            expect(findInputValue()).toBe(partialTokenMatch[0][matchValueToAttr]);
          }
        });
      });

      describe('on tab', () => {
        it('selects entered text, closes dropdown', async () => {
          await setInput(partialToken);
          findInput().trigger('keydown.tab');
          doTimes(2, arrowDown);

          await nextTick();
          expect(findInputValue()).toBe(partialToken);
          expect(findDropdown().isVisible()).toBe(false);
        });
      });

      describe('on esc', () => {
        describe('when dropdown is open', () => {
          it('closes dropdown and does not select anything', async () => {
            await setInput(partialToken);
            await findInput().trigger('keydown.esc');
            expect(findInputValue()).toBe(partialToken);
            expect(findDropdown().isVisible()).toBe(false);
          });
        });

        describe('when dropdown is closed', () => {
          it('clears the input field', async () => {
            await setInput(unlistedToken);
            expect(findDropdown().isVisible()).toBe(false);
            await findInput().trigger('keydown.esc');
            expect(findInputValue()).toBe('');
          });
        });
      });
    });
  });

  describe('with action items', () => {
    let actionSpy;
    const windowAlert = window.alert;

    beforeEach(() => {
      const actionList = cloneDeep(actionsList);
      actionSpy = jest.spyOn(actionList[0], 'fn');
      createComponent({ tokens: oneTokenList, actionList });
      window.alert = jest.fn();
    });

    afterEach(() => {
      window.alert = windowAlert;
    });

    it('click on action item executes its function', async () => {
      await setInput(partialToken);
      expect(findDropdown().isVisible()).toBe(true);

      await findFirstAction().trigger('click');

      expect(actionSpy).toHaveBeenCalled();
      expect(findDropdown().isVisible()).toBe(false);
    });

    it('keyboard navigation and executes function on enter', async () => {
      await setInput('dog');
      doTimes(2, arrowDown);
      await nextTick();
      enter();
      await nextTick();

      expect(actionSpy).toHaveBeenCalled();
      expect(findDropdown().isVisible()).toBe(false);
    });

    it('displays only action items when no result match input value', async () => {
      await setInput('doNotMatchAnything');
      expect(findDropdown().isVisible()).toBe(true);

      expect(findFirstAction().exists()).toBe(true);
      expect(findDropdownOptions()).toHaveLength(2);
    });
  });
});
