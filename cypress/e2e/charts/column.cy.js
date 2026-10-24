describe('GlBarChart', () => {
  beforeEach(() => {
    cy.visitStory('charts/column-chart');

    if (Cypress.browser.name === 'edge') {
      // cy edge environment, mousemove do not trigger zr.mousemove event
      // use click to mock the event
      cy.get('svg').last().click();
    } else {
      cy.get('svg').last().trigger('mousemove');
    }
  });

  it('tooltip title should render', () => {
    cy.get('.popover-header').should('be.visible').contains('Mary (User)');
  });

  it('tooltip content should render', () => {
    cy.get('.popover-body').should('be.visible').contains('Pushes per day 934');
  });
});
