describe('GlDrawer', () => {
  describe('stories', () => {
    it('emits "opened" event after opening transition', () => {
      cy.visitStory('base/drawer');

      cy.contains('Toggle Drawer').click(); // to close it
      cy.contains('Toggle Drawer').click(); // to open it
      cy.get('[data-opened-count="0"'); // transition not finished. event not fired yet.
      cy.get('[data-opened-count="1"');
    });
  });
});
