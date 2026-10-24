describe('GlChartLegend', () => {
  beforeEach(() => {
    cy.visitStory('charts/chart-legend');

    cy.get('[data-testid="gl-chart-legend"]').as('legend');
    cy.get('@legend').find('button').as('legendItems');
  });

  it('should prevent all legends from being toggled off', () => {
    cy.get('@legendItems').each(($legend) => $legend.click());

    cy.get('@legendItems').filter('[aria-disabled="true"]').should('have.length', 1);
  });
});
