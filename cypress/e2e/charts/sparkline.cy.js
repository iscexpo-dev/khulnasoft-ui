describe('GlSparklineChart', () => {
  beforeEach(() => {
    cy.visitStory('charts/sparkline-chart');

    if (Cypress.browser.name === 'edge') {
      // cy edge environment, mousemove do not trigger zr.mousemove event
      // use click to mock the event
      cy.get('svg').last().click();
    } else {
      cy.get('svg').last().trigger('mousemove');
    }
  });

  it('tooltip title should render', () => {
    cy.get('.popover-header').should('be.visible').contains('Thu');
  });

  it('tooltip content should render', () => {
    cy.get('.popover-body').should('be.visible').contains('tooltipLabel 22');
  });
});
