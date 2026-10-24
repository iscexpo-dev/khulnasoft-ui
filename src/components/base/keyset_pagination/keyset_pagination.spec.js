import { mount } from '@vue/test-utils';
import GlKeysetPagination from './keyset_pagination.vue';

describe('GlKeysetPagination', () => {
  let wrapper;

  const startCursor = 'TEST_START_CURSOR';
  const endCursor = 'TEST_END_CURSOR';

  const buttonTagName = 'BUTTON';
  const linkTagName = 'A';

  const createComponent = (props = {}, scopedSlots = {}) => {
    wrapper = mount(GlKeysetPagination, {
      propsData: {
        hasPreviousPage: true,
        hasNextPage: true,
        ...props,
      },
      scopedSlots,
    });
  };

  const findPrevButton = () => wrapper.find('[data-testid="prevButton"]');
  const findNextButton = () => wrapper.find('[data-testid="nextButton"]');

  const expectPrevButtonToBeDisabled = () => {
    expect(findPrevButton().attributes('disabled')).toBe('disabled');
    expect(findPrevButton().classes('disabled')).toBe(true);
  };

  const expectNextButtonToBeDisabled = () => {
    expect(findNextButton().attributes('disabled')).toBe('disabled');
    expect(findNextButton().classes('disabled')).toBe(true);
  };

  const expectPrevButtonToBeEnabled = () => {
    expect(findPrevButton().attributes('disabled')).toBeUndefined();
    expect(findPrevButton().classes('disabled')).toBe(false);
  };

  const expectNextButtonToBeEnabled = () => {
    expect(findNextButton().attributes('disabled')).toBeUndefined();
    expect(findNextButton().classes('disabled')).toBe(false);
  };

  describe('template', () => {
    describe('icons', () => {
      beforeEach(() => {
        createComponent();
      });

      it('renders a left chevron icon in the "Prev" button', () => {
        expect(findPrevButton().find('[data-testid="chevron-lg-left-icon"]').exists()).toBe(true);
      });

      it('renders a right chevron icon in the "Next" button', () => {
        expect(findNextButton().find('[data-testid="chevron-lg-right-icon"]').exists()).toBe(true);
      });
    });
  });

  describe('when both hasNextPage & hasPreviousPage is false', () => {
    beforeEach(() => {
      createComponent({ hasNextPage: false, hasPreviousPage: false });
    });

    it('does not render pagination', () => {
      expect(findPrevButton().exists()).toBe(false);
      expect(findNextButton().exists()).toBe(false);
    });
  });

  describe('hasPreviousPage', () => {
    describe('when hasPreviousPage is false', () => {
      beforeEach(() => {
        createComponent({ hasPreviousPage: false });
      });

      it('renders the "Prev" button as disabled', () => {
        expectPrevButtonToBeDisabled();
      });
    });

    describe('when hasPreviousPage is true', () => {
      beforeEach(() => {
        createComponent({ hasPreviousPage: true });
      });

      it('renders the "Prev" button as enabled', () => {
        expectPrevButtonToBeEnabled();
      });
    });
  });

  describe('hasNextPage', () => {
    describe('when hasNextPage is false', () => {
      beforeEach(() => {
        createComponent({ hasNextPage: false });
      });

      it('renders the "Next" button as disabled', () => {
        expectNextButtonToBeDisabled();
      });
    });

    describe('when hasNextPage is true', () => {
      beforeEach(() => {
        createComponent({ hasNextPage: true });
      });

      it('renders the "Next" button as enabled', () => {
        expectNextButtonToBeEnabled();
      });
    });
  });

  describe('events', () => {
    describe('when the "Prev" button is clicked', () => {
      beforeEach(() => {
        createComponent({ hasPreviousPage: true, startCursor });

        findPrevButton().vm.$emit('click');
      });

      it('emits a "prev" event with the startCursor as a parameter', () => {
        expect(wrapper.emitted()).toEqual({
          prev: [[startCursor]],
        });
      });
    });

    describe('when the "Next" button is clicked', () => {
      beforeEach(() => {
        createComponent({ hasNextPage: true, endCursor });

        findNextButton().vm.$emit('click');
      });

      it('emits a "next" event with the endCursor as a parameter', () => {
        expect(wrapper.emitted()).toEqual({
          next: [[endCursor]],
        });
      });
    });
  });

  describe('prevText', () => {
    describe('when no value is provided', () => {
      beforeEach(() => {
        createComponent();
      });

      it('renders the default text: "Previous"', () => {
        expect(findPrevButton().text()).toBe('Previous');
      });
    });

    describe('when a custom string is provided', () => {
      const prevText = 'Previous Page';

      beforeEach(() => {
        createComponent({ prevText });
      });

      it('renders the custom text inside the button', () => {
        expect(findPrevButton().text()).toBe(prevText);
      });
    });
  });

  describe('nextText', () => {
    describe('when no value is provided', () => {
      beforeEach(() => {
        createComponent();
      });

      it('renders the default text: "Next"', () => {
        expect(findNextButton().text()).toBe('Next');
      });
    });

    describe('when a custom string is provided', () => {
      const nextText = 'Next Page';

      beforeEach(() => {
        createComponent({ nextText });
      });

      it('renders the custom text inside the button', () => {
        expect(findNextButton().text()).toBe(nextText);
      });
    });
  });

  describe('prevButtonLink', () => {
    describe('when no value is provided', () => {
      beforeEach(() => {
        createComponent();
      });

      it('renders the button as a regular button (not a link)', () => {
        expect(findPrevButton().element.tagName).toBe(buttonTagName);
      });
    });

    describe('when a link is provided', () => {
      const prevButtonLink = 'https://example.com/prev';

      beforeEach(() => {
        createComponent({ prevButtonLink });
      });

      it('renders the button as a link', () => {
        expect(findPrevButton().element.tagName).toBe(linkTagName);
      });

      it('render the link with the correct href', () => {
        expect(findPrevButton().attributes('href')).toBe(prevButtonLink);
      });
    });
  });

  describe('nextButtonLink', () => {
    describe('when no value is provided', () => {
      beforeEach(() => {
        createComponent();
      });

      it('renders the button as a regular button (not a link)', () => {
        expect(findNextButton().element.tagName).toBe(buttonTagName);
      });
    });

    describe('when a link is provided', () => {
      const nextButtonLink = 'https://example.com/next';

      beforeEach(() => {
        createComponent({ nextButtonLink });
      });

      it('renders the button as a link', () => {
        expect(findNextButton().element.tagName).toBe(linkTagName);
      });

      it('render the link with the correct href', () => {
        expect(findNextButton().attributes('href')).toBe(nextButtonLink);
      });
    });
  });

  describe('disabled', () => {
    describe('when hasNextPage and hasPreviousPage are true, and disabled is false', () => {
      beforeEach(() => {
        createComponent({
          hasNextPage: true,
          hasPreviousPage: true,
          disabled: false,
        });
      });

      it('renders both buttons as enabled', () => {
        expectPrevButtonToBeEnabled();
        expectNextButtonToBeEnabled();
      });
    });
  });

  describe('when hasNextPage, hasPreviousPage, and disabled are true', () => {
    beforeEach(() => {
      createComponent({
        hasNextPage: true,
        hasPreviousPage: true,
        disabled: true,
      });
    });

    it('renders both buttons as disabled', () => {
      expectPrevButtonToBeDisabled();
      expectNextButtonToBeDisabled();
    });
  });

  describe('slots', () => {
    describe('when the previous-button-content slot is provided', () => {
      const previousButtonContent = '<span data-testid="custom-content">GO BACK!!</span>';

      beforeEach(() => {
        createComponent(undefined, {
          'previous-button-content': previousButtonContent,
        });
      });

      it('renders the provided content inside the "Prev" button', () => {
        expect(findPrevButton().find('[data-testid="custom-content"]').exists()).toBe(true);
      });
    });
  });

  describe('when the next-button-content slot is provided', () => {
    const nextButtonContent = '<span data-testid="custom-content">GO FORWARD!!</span>';

    beforeEach(() => {
      createComponent(undefined, {
        'next-button-content': nextButtonContent,
      });
    });

    it('renders the provided content inside the "Next" button', () => {
      expect(findNextButton().find('[data-testid="custom-content"]').exists()).toBe(true);
    });
  });
});
