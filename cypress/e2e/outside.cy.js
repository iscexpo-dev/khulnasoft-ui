describe('OutsideDirective', () => {
  beforeEach(() => {
    cy.visitStory('directives/outside-directive');
  });

  it('increments clicks count when clicking outside the button', () => {
    cy.contains('Clicks outside me: 0');

    cy.get('body').click(0, 0);

    cy.contains('Clicks outside me: 1');
  });

  it('does not increment clicks count when clicking the button', () => {
    cy.contains('Clicks outside me: 0');

    cy.contains('Clicks outside me: 0').click();

    cy.contains('Clicks outside me: 0');
  });
});
