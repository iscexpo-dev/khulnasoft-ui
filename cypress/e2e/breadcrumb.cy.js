describe('GlBreadcrumb', () => {
  describe('on a wide screen', () => {
    beforeEach(() => {
      cy.viewport(2000, 600);
      cy.visitStory('base/breadcrumb');
    });

    it('shows all breadcrumb items', () => {
      cy.contains('First item');
      cy.contains('Fourth item');
    });

    it('does not show the dropdown toggle', () => {
      cy.get('[data-testid="base-dropdown-toggle"]').should('not.exist');
    });
  });

  describe('on a small screen', () => {
    beforeEach(() => {
      cy.viewport(300, 600);
      cy.visitStory('base/breadcrumb', {
        story: 'collapsed-items',
      });
    });

    it('moves overflowing breadcrumbs into a dropdown', () => {
      cy.contains('Eighth item with a really long text to make it even longer').should(
        'be.visible',
      );
      cy.contains('First item').should('not.be.visible');
      cy.get('[data-testid="base-dropdown-toggle"]:first').click();
      cy.contains('First item').should('be.visible');
    });
  });

  describe('with clipboard button', () => {
    describe('on a wide screen', () => {
      beforeEach(() => {
        cy.viewport(2000, 600);
        cy.visitStory('base/breadcrumb', { story: 'with-clipboard-button' });
      });

      it('displays the clipboard button in the last breadcrumb item', () => {
        cy.get('.gl-breadcrumbs')
          .last()
          .within(() => {
            cy.get('[data-testid="copy-to-clipboard-button"]').should('be.visible');
            cy.get('[data-testid="copy-to-clipboard-button"]').should(
              'have.attr',
              'aria-label',
              'Copy path',
            );
          });
      });
    });

    describe('on a small screen', () => {
      beforeEach(() => {
        cy.viewport(300, 600);
        cy.visitStory('base/breadcrumb', { story: 'with-clipboard-button' });
      });

      it('maintains clipboard button in last item even when other items are collapsed', () => {
        cy.get('.gl-breadcrumbs')
          .last()
          .within(() => {
            cy.get('[data-testid="copy-to-clipboard-button"]').should('be.visible');
          });
      });

      it('clipboard button remains functional when breadcrumbs are collapsed', () => {
        cy.get('.gl-breadcrumbs')
          .last()
          .within(() => {
            cy.get('[data-testid="copy-to-clipboard-button"]').should('be.visible').click();
          });
      });
    });
  });
});
