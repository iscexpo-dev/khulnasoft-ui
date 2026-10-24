describe('GlDiscreteScatterChart', () => {
  beforeEach(() => {
    cy.visitStory('charts/heatmap');

    if (Cypress.browser.name === 'edge') {
      // cy edge environment, mousemove do not trigger zr.mousemove event
      // use click to mock the event
      cy.get('g').find('path').eq(1).click();
    } else {
      cy.get('g').find('path').eq(1).trigger('mousemove');
    }
  });

  it('tooltip title should render', () => {
    cy.get('.popover-header').should('be.visible').contains('0 (Hour)');
  });

  it('tooltip content should render', () => {
    cy.get('.popover-body').should('be.visible').contains('Day 5');
  });
});
