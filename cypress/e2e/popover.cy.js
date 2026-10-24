describe('GlPopover', () => {
  it('popover title should be visible when using props', () => {
    cy.visitStory('base/popover');

    cy.getByTestId('popover-with-props').contains('Popover');
  });

  it('popover title should be visible when using scoped slot', () => {
    cy.visitStory('base/popover', { story: 'on-click' });

    cy.getByTestId('popover-button-click').click();

    cy.getByTestId('popover-title').should('be.visible').contains('Popover title');
  });

  it('closes popover when clicking on close button', () => {
    cy.visitStory('base/popover', { story: 'with-close-button' });

    const popoverCloseButton = 'popover-with-close-button';

    cy.getByTestId(popoverCloseButton).should('exist').should('be.visible');

    cy.getByTestId('close-button').click();

    cy.getByTestId(popoverCloseButton).should('not.exist');
  });
});
