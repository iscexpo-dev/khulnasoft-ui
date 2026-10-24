describe('GlAccordion', { testIsolation: false }, () => {
  before(() => {
    cy.visitStory('base/accordion');
  });

  const accordionContentId = '[data-testid^="accordion-item-collapse-accordion-item-"]';
  const getFirstAccordionItemContent = () => cy.get(accordionContentId).first();

  it('clicking on collapsed chevron icon expands accordion item then collapses when clicked again', () => {
    getFirstAccordionItemContent().should('not.be.visible');
    cy.contains('Item 1').click();
    getFirstAccordionItemContent().should('be.visible');
  });

  it('clicking on expanded chevron icon collapses accordion item', () => {
    getFirstAccordionItemContent().should('be.visible');
    cy.contains('Item 1').click();
    getFirstAccordionItemContent().should('not.be.visible');
  });
});
