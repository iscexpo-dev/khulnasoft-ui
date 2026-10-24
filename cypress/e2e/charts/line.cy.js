const triggerTooltip = () => {
  if (Cypress.browser.name === 'edge') {
    // cy edge environment, mousemove do not trigger zr.mousemove event
    // use click to mock the event
    cy.get('svg').first().click();
  } else {
    cy.get('svg').first().trigger('mousemove', 'center');
  }
};

describe('GlLineChart', () => {
  describe('default tooltip', () => {
    beforeEach(() => {
      cy.visitStory('charts/line-chart');

      triggerTooltip();
    });

    it('tooltip title should render', () => {
      cy.get('.popover-header').should('be.visible').contains('Thu (Time)');
    });

    it('tooltip content should render', () => {
      cy.get('.popover-body').should('be.visible');
      cy.get('.popover-body').contains('Requested 1226');
      cy.get('.popover-body').contains('Actual 1287');
      cy.get('.popover-body').contains('Predicted 1503');
    });
  });

  describe('custom tooltip', () => {
    beforeEach(() => {
      cy.visitStory('charts/line-chart', { story: 'with-custom-tooltip' });

      triggerTooltip();
    });

    it('tooltip title should render', () => {
      cy.get('.popover-header').should('be.visible').contains('Thu');
    });

    it('tooltip content should render', () => {
      cy.get('.popover-body').should('be.visible');
      cy.get('.popover-body').contains('Requested: 1226');
      cy.get('.popover-body').contains('Actual: 1287');
      cy.get('.popover-body').contains('Predicted: 1503');
    });
  });
});
