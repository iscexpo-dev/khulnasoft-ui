describe('GlDiscreteScatterChart', () => {
  beforeEach(() => {
    cy.visitStory('charts/discrete-scatter-chart');

    if (Cypress.browser.name === 'edge') {
      // cy edge environment, mousemove do not trigger zr.mousemove event
      // use click to mock the event
      cy.getByTestId('discrete-scatter-chart').find('path').last().click();
    } else {
      cy.getByTestId('discrete-scatter-chart').find('path').last().trigger('mousemove');
    }
  });

  it('tooltip title should render', () => {
    cy.get('.popover-header').should('be.visible').contains('25 May (Date)');
  });

  it('tooltip content should render', () => {
    cy.get('.popover-body').should('be.visible').contains('Pushes per day 4.26');
  });
});
