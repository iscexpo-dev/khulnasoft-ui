describe('GlModal', () => {
  it('Modal title should be visible using a scoped slot', () => {
    cy.visitStory('base/modal', { story: 'with-a-header' });

    cy.get('#test-modal-id H4').should('be.visible').contains('A custom header');
  });

  it('Modal footer should not be visible using a scoped slot', () => {
    cy.visitStory('base/modal', { story: 'without-a-footer' });

    cy.get('#test-modal-id').should('not.have.class', 'modal-footer');
  });

  it('focused first focusable element by default', () => {
    cy.visitStory('base/modal');

    cy.contains('button', 'Cancel').should('be.focused');
  });

  it('does not focus first focusable element when noFocusOnShow prop is true', () => {
    cy.visitStory('base/modal', { story: 'without-focus' });

    cy.contains('button', 'Cancel').should('not.be.focused');
  });

  describe('scrollbar compensation', () => {
    const shouldHavePaddingRight = (selector, px) =>
      cy.get(selector).should('have.css', 'padding-right', `${px}px`);

    beforeEach(() => {
      cy.visitStory('base/modal');

      // The story opens the modal on load; start from a closed modal.
      cy.contains('button', 'Cancel').click();
      cy.get('body').should('have.attr', 'data-modal-open-count', '0');

      // Make the page scroll, and add the fixed content the manager pads.
      cy.get('body').invoke('css', 'min-height', '200vh');
      cy.document().then((doc) => {
        const fixed = doc.createElement('div');
        fixed.className = 'fixed-top';
        fixed.dataset.testid = 'fixed-content';

        return doc.body.appendChild(fixed);
      });

      cy.window()
        .then((win) => win.innerWidth - win.document.documentElement.clientWidth)
        .as('scrollbarWidth');
      cy.get('body').invoke('css', 'padding-right').then(parseFloat).as('bodyPadding');
    });

    it('pads the body and fixed content by the scrollbar width while open', function padsWhileOpen() {
      cy.contains('button', 'Open modal').click();

      cy.get('body')
        .should('have.class', 'modal-open')
        .and('have.attr', 'data-modal-open-count', '1');

      shouldHavePaddingRight('body', this.bodyPadding + this.scrollbarWidth);
      shouldHavePaddingRight('[data-testid="fixed-content"]', this.scrollbarWidth);
    });

    it('restores the padding when the modal closes', function restoresOnClose() {
      cy.contains('button', 'Open modal').click();
      cy.get('body').should('have.class', 'modal-open');

      cy.contains('button', 'Cancel').click();

      cy.get('body')
        .should('not.have.class', 'modal-open')
        .and('have.attr', 'data-modal-open-count', '0');

      shouldHavePaddingRight('body', this.bodyPadding);
      shouldHavePaddingRight('[data-testid="fixed-content"]', 0);
    });
  });
});
