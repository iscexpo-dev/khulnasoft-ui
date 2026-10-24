const triggerTooltip = () => {
  if (Cypress.browser.name === 'edge') {
    // cy edge environment, mousemove do not trigger zr.mousemove event
    // use click to mock the event
    cy.get('path[fill^="rgb"]').last().click();
  } else {
    cy.get('path[fill^="rgb"]').last().trigger('mousemove');
  }
};

describe('GlStackedColumnChart', () => {
  describe('default', () => {
    beforeEach(() => {
      cy.visitStory('charts/stacked-column-chart');
    });

    describe('tooltip', () => {
      beforeEach(() => {
        triggerTooltip();
      });

      it('tooltip should render', () => {
        cy.get('.popover-header').should('be.visible').contains('Dec (January - December 2018)');

        cy.get('.popover-body').should('be.visible');
        cy.get('.popover-body').contains('Fun 4 46');
        cy.get('.popover-body').contains('Fun 3 28');
        cy.get('.popover-body').contains('Fun 2 32');
        cy.get('.popover-body').contains('Fun 1 31');
      });
    });

    describe('legend', () => {
      beforeEach(() => {
        cy.get('[data-testid="gl-chart-legend"]')
          .find('.gl-series-label-container')
          .siblings('span')
          .as('chartLegendValues');
      });

      it('should render legend values', () => {
        cy.get('@chartLegendValues').should('have.length', 4);
        cy.get('@chartLegendValues').eq(0).contains('Avg: 41.9 · Max: 68');
        cy.get('@chartLegendValues').eq(1).contains('Avg: 15.7 · Max: 34');
        cy.get('@chartLegendValues').eq(2).contains('Avg: 42.1 · Max: 67');
        cy.get('@chartLegendValues').eq(3).contains('Avg: 29 · Max: 59');
      });
    });
  });

  describe('with custom tooltip', () => {
    beforeEach(() => {
      cy.visitStory('charts/stacked-column-chart', { story: 'with-custom-tooltip' });

      triggerTooltip();
    });

    it('tooltip content should render', () => {
      cy.get('.popover-header').should('be.visible').contains('Month: Dec');

      cy.get('.popover-body').should('be.visible');
      cy.get('.popover-body').contains('Fun 1: 31');
      cy.get('.popover-body').contains('Fun 2: 32');
      cy.get('.popover-body').contains('Fun 3: 28');
      cy.get('.popover-body').contains('Fun 4: 46');
    });
  });

  describe('with custom tooltip', () => {
    beforeEach(() => {
      cy.visitStory('charts/stacked-column-chart', { story: 'with-custom-tooltip-value' });

      triggerTooltip();
    });

    it('tooltip content should render', () => {
      cy.get('.popover-header').should('be.visible').contains('Dec (January - December 2018)');

      cy.get('.popover-body').should('be.visible');
      cy.get('.popover-body').contains('Fun 4 46.00 commits');
      cy.get('.popover-body').contains('Fun 3 28.00 commits');
      cy.get('.popover-body').contains('Fun 2 32.00 commits');
      cy.get('.popover-body').contains('Fun 1 31.00 commits');
    });
  });

  describe('without legend values', () => {
    beforeEach(() => {
      cy.visitStory('charts/stacked-column-chart', { story: 'without-legend-values' });
    });

    it('should not render legend values', () => {
      cy.get('[data-testid="gl-chart-legend"]')
        .find('.gl-series-label-container')
        .siblings('span')
        .should('have.length', 0);
    });
  });
});
