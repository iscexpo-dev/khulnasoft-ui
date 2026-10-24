const testId = (id) => `[data-testid="${id}"]`;

describe('Disclosure dropdown', () => {
  it(
    'closes dropdown when trigger text is dynamically updated on item click',
    // Real events are not supported on firefox
    { browser: '!firefox' },
    () => {
      cy.visitStory('base/dropdown/disclosure-dropdown', {
        story: 'with-dynamic-wrapper-text',
      });

      cy.get(testId('base-dropdown-toggle')).should('have.attr', 'aria-expanded', 'true');
      cy.get(`${testId('disclosure-dropdown-item')}:first button`).realClick();
      cy.get(testId('base-dropdown-toggle')).should('have.attr', 'aria-expanded', 'false');
    },
  );
});
