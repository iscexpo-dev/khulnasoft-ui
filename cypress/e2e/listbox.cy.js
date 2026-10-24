describe('GlCollapsibleListbox', () => {
  const toggleSelector = 'button[aria-haspopup="listbox"]';
  const dropdownMenuSelector = '[role="listbox"]';
  const listItemSelector = '[role="option"]';
  const searchInputSelector = '[data-testid="listbox-search-input"]';
  const topScrimSelector = '[data-testid="top-scrim"]';
  const bottomScrimSelector = '[data-testid="bottom-scrim"]';

  const toggleBtn = () => cy.get(toggleSelector);
  const dropdownMenu = () => cy.get(dropdownMenuSelector);
  const searchInput = () => cy.get(searchInputSelector);
  const getDropdownItem = (text) => cy.contains(listItemSelector, text);
  const ensureMenuIsClosed = () => cy.get('body').click(0, 0);
  const topScrim = () => cy.get(topScrimSelector);
  const bottomScrim = () => cy.get(bottomScrimSelector);

  const elementDoesNotOverflowVertically = (element, viewportHeight) => {
    const elementRect = element.getBoundingClientRect();
    expect(elementRect.bottom).to.be.lessThan(viewportHeight);
  };

  describe('flat items', () => {
    beforeEach(() => {
      cy.visitStory('base/dropdown/collapsible-listbox', {
        args: {
          startOpened: false,
        },
      });
    });

    const dropdownItemAtIndex = (i) =>
      getDropdownItem(['Product', 'People', 'Finance', 'Support'][i]);

    it('clicking on the toggle shows the menu and hides on the next click', () => {
      dropdownMenu().should('not.be.visible');
      toggleBtn().should('not.be.focused').click();
      dropdownMenu().should('be.visible');
      toggleBtn().should('not.be.focused');
      toggleBtn().click();
      dropdownMenu().should('not.be.visible');
      toggleBtn().should('be.focused');
    });

    it('navigates through enabled options, skipping disabled ones', () => {
      toggleBtn().click();
      dropdownMenu().should('be.visible');
      toggleBtn().should('not.be.focused');
      dropdownItemAtIndex(1).should('be.focused').type('{upArrow}');
      dropdownItemAtIndex(0).should('be.focused').type('{upArrow}');
      dropdownItemAtIndex(3).should('be.focused').type('{home}');
      dropdownItemAtIndex(0).should('be.focused').type('{end}');
      dropdownItemAtIndex(3).should('be.focused').type('{downArrow}');
      dropdownItemAtIndex(0).should('be.focused').type('{downArrow}');
      dropdownItemAtIndex(1).should('be.focused');
    });

    it('closes the dropdown on pressing Esc and sets focus on toggle button', () => {
      dropdownMenu().should('not.be.visible');
      toggleBtn().should('not.be.focused').click();
      dropdownItemAtIndex(1).should('be.focused').type('{esc}');
      dropdownMenu().should('not.be.visible');
      toggleBtn().should('be.focused');
    });

    it('clicking outside should move focus away from the dropdown', () => {
      toggleBtn().should('not.be.focused').click();
      dropdownItemAtIndex(1).should('be.focused');
      cy.get('body').click(0, 0);
      dropdownItemAtIndex(1).should('not.be.focused');
      toggleBtn().should('not.be.focused');
    });
  });

  describe('groups', () => {
    beforeEach(() => {
      cy.visitStory('base/dropdown/collapsible-listbox', {
        story: 'groups',
        args: {
          startOpened: false,
        },
      });
    });

    beforeEach(ensureMenuIsClosed);

    const dropdownItemAtIndex = (i) =>
      getDropdownItem(['v1.0', 'main', 'feature-123', 'v2.0', 'v2.1'][i]);

    it('navigates through the options on arrow up, arrow down, Home and End', () => {
      toggleBtn().click();
      dropdownMenu().should('be.visible');
      toggleBtn().should('not.be.focused');
      dropdownItemAtIndex(0).should('be.focused').type('{upArrow}');
      dropdownItemAtIndex(4).should('be.focused').type('{upArrow}');
      dropdownItemAtIndex(3).should('be.focused').type('{upArrow}');
      dropdownItemAtIndex(2).should('be.focused').type('{upArrow}');
      dropdownItemAtIndex(1).should('be.focused').type('{upArrow}');
      dropdownItemAtIndex(0).should('be.focused').type('{home}');
      dropdownItemAtIndex(0).should('be.focused').type('{end}');
      dropdownItemAtIndex(4).should('be.focused').type('{downArrow}');
      dropdownItemAtIndex(0).should('be.focused').type('{downArrow}');
      dropdownItemAtIndex(1).should('be.focused');
    });
  });

  describe('search', () => {
    beforeEach(() => {
      cy.visitStory('base/dropdown/collapsible-listbox', {
        story: 'searchable',
        args: {
          startOpened: false,
        },
      });
    });

    const dropdownItemAtIndex = (i) => getDropdownItem(['Product', 'People', 'Finance', 'None'][i]);

    it('should retain focus on the input & manage aria-activedescendant', () => {
      toggleBtn().click();
      dropdownMenu().should('be.visible');
      searchInput().should('be.visible').type('{downArrow}');

      // Get the ID of the first highlighted item
      return dropdownItemAtIndex(0)
        .invoke('attr', 'id')
        .then((firstItemId) => {
          // Verify search input has aria-activedescendant pointing to the first item
          searchInput().should('have.attr', 'aria-activedescendant', firstItemId);
          searchInput().should('be.focused').type('{downArrow}');

          // Get the ID of the next item
          return dropdownItemAtIndex(1)
            .invoke('attr', 'id')
            .then((secondItemId) => {
              // Verify aria-activedescendant updated to the second item
              searchInput().should('have.attr', 'aria-activedescendant', secondItemId);
              searchInput().should('be.focused').type('{upArrow}');

              // Verify aria-activedescendant updated back to the first item
              return searchInput().should('have.attr', 'aria-activedescendant', firstItemId);
            });
        });
    });
  });

  describe('enter keypress', () => {
    beforeEach(() => {
      cy.visitStory('base/dropdown/collapsible-listbox', {
        story: 'searchable',
        args: {
          startOpened: true,
        },
      });
    });

    it('should select the first filtered option when Enter is pressed', () => {
      searchInput().clear().type('pro');
      getDropdownItem('Product').should('be.visible');
      searchInput().type('{enter}');
      toggleBtn().should('contain', 'Product');
    });
  });

  describe('enter keypress multiple options', () => {
    beforeEach(() => {
      cy.visitStory('base/dropdown/collapsible-listbox', {
        story: 'searchable-multi',
        args: {
          startOpened: true,
        },
      });
    });

    it('should toggle the first filtered option when Enter is pressed', () => {
      toggleBtn().should('contain', 'Selected 3 departments');
      searchInput().clear().type('pro');
      getDropdownItem('Product').should('be.visible');
      searchInput().type('{enter}');
      toggleBtn().should('contain', 'Selected 2 departments');
      searchInput().clear().type('pro');
      getDropdownItem('Product').should('be.visible');
      searchInput().type('{enter}');
      toggleBtn().should('contain', 'Selected 3 departments');
    });
  });

  describe('highlight first filtered option on search', () => {
    beforeEach(() => {
      cy.visitStory('base/dropdown/collapsible-listbox', {
        story: 'searchable',
        args: {
          startOpened: true,
        },
      });
    });

    const dropdownItemAtIndex = (i) => getDropdownItem(['Product', 'People'][i]);

    const highlightClass = 'gl-new-dropdown-item-highlighted';

    it('should highlight the first filtered option only when the search input has a value', () => {
      searchInput().type('p');
      dropdownItemAtIndex(0).should('have.class', highlightClass);
      dropdownItemAtIndex(1).should('not.have.class', highlightClass);
      searchInput().clear();
      dropdownItemAtIndex(0).should('not.have.class', highlightClass);
      dropdownItemAtIndex(1).should('not.have.class', highlightClass);
    });

    it('should maintain highlight through keyboard navigation and menu open/close', () => {
      searchInput().type('p');
      dropdownItemAtIndex(0).should('have.class', highlightClass);
      searchInput().type('{downArrow}');
      dropdownItemAtIndex(1).should('have.class', highlightClass);
      dropdownItemAtIndex(0).should('not.have.class', highlightClass);
      searchInput().type('{upArrow}');
      dropdownItemAtIndex(0).should('have.class', highlightClass);
      dropdownItemAtIndex(1).should('not.have.class', highlightClass);
      toggleBtn().click();
      dropdownMenu().should('not.be.visible');
      toggleBtn().click();
      dropdownMenu().should('be.visible');
      dropdownItemAtIndex(0).should('have.class', highlightClass);
      dropdownItemAtIndex(1).should('not.have.class', highlightClass);
    });
  });

  describe('overflow scrim', () => {
    it('should display overflow scrim when content is overflowing', () => {
      cy.visitStory('base/dropdown/collapsible-listbox', {
        args: {
          startOpened: true,
        },
      });

      topScrim().should('have.css', 'opacity', '0');
      bottomScrim().should('have.css', 'opacity', '1');
      dropdownMenu().scrollTo('bottom');
      topScrim().should('have.css', 'opacity', '1');
      bottomScrim().should('have.css', 'opacity', '0');
      dropdownMenu().scrollTo('top');
      topScrim().should('have.css', 'opacity', '0');
      bottomScrim().should('have.css', 'opacity', '1');
    });

    it('should not display overflow scrim when content is not overflowing', () => {
      cy.visitStory('base/dropdown/collapsible-listbox', {
        story: 'custom-list-item',
        args: {
          startOpened: true,
        },
      });
      dropdownMenu().should('be.visible');
      topScrim().should('have.css', 'opacity', '0');
      bottomScrim().should('have.css', 'opacity', '0');
      dropdownMenu().scrollTo('bottom', { ensureScrollable: false });
      topScrim().should('have.css', 'opacity', '0');
      bottomScrim().should('have.css', 'opacity', '0');
      dropdownMenu().scrollTo('top', { ensureScrollable: false });
      topScrim().should('have.css', 'opacity', '0');
      bottomScrim().should('have.css', 'opacity', '0');
    });
  });

  describe(
    'content height',
    {
      viewportHeight: 400,
    },
    () => {
      before(() => {
        cy.visitStory('base/dropdown/collapsible-listbox', {
          story: 'header-and-footer',
          args: {
            startOpened: true,
          },
        });
      });

      it('sets the content height dynamically to avoid viewport overflow', () => {
        const { viewportHeight, viewportWidth } = Cypress.config();

        cy.get('[data-testid="base-dropdown-menu"]').should(($el) => {
          elementDoesNotOverflowVertically($el[0], viewportHeight);
        });

        const newHeight = 200;
        cy.viewport(viewportWidth, newHeight);

        cy.get('[data-testid="base-dropdown-menu"]').should(($el) => {
          elementDoesNotOverflowVertically($el[0], newHeight);
        });
      });
    },
  );

  describe('Collapsible dropdown in form group', () => {
    it(
      'opens dropdown when form label is clicked',
      // Real events are not supported on firefox
      { browser: '!firefox' },
      () => {
        cy.visitStory('base/dropdown/collapsible-listbox', {
          story: 'in-form-group',
          args: {
            startOpened: false,
          },
        });

        dropdownMenu().should('not.be.visible');
        cy.get('label[for="department-picker"]').realClick();
        dropdownMenu().should('be.visible');
      },
    );

    it(
      'opens searchable dropdown when form label is clicked',
      // Real events are not supported on firefox
      { browser: '!firefox' },
      () => {
        cy.visitStory('base/dropdown/collapsible-listbox', {
          story: 'in-form-group-searchable',
          args: {
            startOpened: false,
          },
        });

        dropdownMenu().should('not.be.visible');
        cy.get('label[for="department-picker"]').realClick();
        dropdownMenu().should('be.visible');
      },
    );
  });
});
