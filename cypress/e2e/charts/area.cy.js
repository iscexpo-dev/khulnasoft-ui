const triggerTooltip = () => {
  if (Cypress.browser.name === 'edge') {
    // cy edge environment, mousemove do not trigger zr.mousemove event
    // use click to mock the event
    cy.get('g').last().click();
  } else {
    cy.get('g').last().trigger('mousemove', 'center');
  }
};

describe('GlAreaChart', () => {
  describe('default tooltip', () => {
    beforeEach(() => {
      cy.visitStory('charts/area-chart');

      triggerTooltip();
    });

    it('tooltip title should render', () => {
      cy.get('.popover-header').should('be.visible').contains('Thu (Time)');
    });

    it('tooltip content should render', () => {
      cy.get('.popover-body').should('be.visible').contains('Value 934');
    });
  });

  describe('custom tooltip', () => {
    beforeEach(() => {
      cy.visitStory('charts/area-chart', { story: 'with-custom-tooltip' });

      triggerTooltip();
    });

    it('tooltip title should render', () => {
      cy.get('.popover-header').should('be.visible').contains('Thu');
    });

    it('tooltip content should render', () => {
      cy.get('.popover-body').should('be.visible').contains('First Series: 934');
    });
  });
});
