const triggerTooltip = () => {
  if (Cypress.browser.name === 'edge') {
    // cy edge environment, mousemove do not trigger zr.mousemove event
    // use click to mock the event
    cy.get('path').last().click();
  } else {
    cy.get('path').last().trigger('mousemove');
  }
};

describe('GlBarChart', () => {
  beforeEach(() => {
    cy.visitStory('charts/bar-chart');
  });

  describe('tooltip', () => {
    beforeEach(() => {
      triggerTooltip();
    });

    it('should render tooltip', () => {
      cy.get('.popover-header').should('be.visible').contains('Erin (User)');
      cy.get('.popover-body').should('be.visible').contains('Pushes per day 30');
    });
  });

  describe('with custom tooltip', () => {
    beforeEach(() => {
      cy.visitStory('charts/bar-chart', { story: 'with-custom-tooltip' });

      triggerTooltip();
    });

    it('should render tooltip with customized content', () => {
      cy.get('.popover-header').should('be.visible').contains('Character: Erin');
      cy.get('.popover-body').should('be.visible').contains('Pushes: 30');
    });
  });

  describe('with custom tooltip value', () => {
    beforeEach(() => {
      cy.visitStory('charts/bar-chart', { story: 'with-custom-tooltip-value' });

      triggerTooltip();
    });

    it('should render tooltip with customized value', () => {
      cy.get('.popover-header').should('be.visible').contains('Erin (User)');
      cy.get('.popover-body').should('be.visible').contains('Pushes per day 30.00');
    });
  });
});
