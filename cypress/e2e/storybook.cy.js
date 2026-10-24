/**
 * This spec tests a few built-in and custom Storybook behaviors to make `@storybook/*` packages
 * upgrades smoother.
 * We have disabled this spec as we have started running E2E tests against a test build of the
 * Storybook. Such builds disable several features to speed things up, effectively breaking most of
 * the tests below.
 * If the need for these tests never arises again, we can delete this spec. Otherwise, we should
 * find a way to run it against a full Storybook build (eg review apps).
 */
describe('Storybook', { tags: '@storybook' }, () => {
  describe('location paths', () => {
    beforeEach(() => {
      cy.visit('/');

      // Loads whatever is the first docs page
      cy.url().should('include', '?path=/docs');

      cy.get('button.sidebar-item').contains('alert').click();
    });

    it('sets the correct path for a default story', () => {
      cy.get('a#base-alert--default').contains('Default').click();
      cy.url().should('include', '?path=/story/base-alert--default');
    });

    it('sets the correct path for a non-default story', () => {
      cy.get('a').contains('Variants').click();

      cy.url().should('include', '?path=/story/base-alert--variants');
    });

    it('sets the correct path for a docs page', () => {
      cy.get('a#base-alert--docs').contains('Docs').click();

      cy.url().should('include', '?path=/docs/base-alert--docs');
    });
  });

  describe('import info blocks', () => {
    beforeEach(() => {
      cy.visit('/?path=/docs/base-alert--docs');
    });

    it('shows the import info block in the docs page', () => {
      cy.getStoryPreviewIframe()
        .find('[data-testid="import-info"]')
        .invoke('text')
        .should('equal', "import { GlAlert } from '@khulnasoft/ui';");
    });
  });

  describe('"View source" links', () => {
    beforeEach(() => {
      cy.visit('/?path=/docs/base-alert--docs');
    });

    it('shows the import info block in the docs page', () => {
      cy.getStoryPreviewIframe()
        .find('[data-testid="link-to-source"]')
        .should('have.attr', 'href')
        .and('include', '/main/src/components/base/alert/alert.vue');
    });
  });

  describe('BootstrapVue component info', () => {
    beforeEach(() => {
      cy.visit('/?path=/docs/base-button--docs');
    });

    it('shows the import info block in the docs page', () => {
      cy.getStoryPreviewIframe()
        .find('[data-testid="bv-component-link"]')
        .should('have.attr', 'href')
        .and('eq', 'https://bootstrap-vue.org/docs/components/button');
    });
  });

  describe('stories code blocks', () => {
    const interactWithStoryCodeBlock = (storyId) => {
      cy.getStoryPreviewIframe().find(`#anchor--${storyId} button`).contains('Show code').click();
      cy.getStoryPreviewIframe().find(`#anchor--${storyId} button`).contains('Copy').click();
      cy.getStoryPreviewIframe().find(`#anchor--${storyId} button`).contains('Hide code').click();
    };

    beforeEach(() => {
      cy.visit('/?path=/docs/base-alert--docs');
    });

    it('toggles the code of the default story', () => {
      interactWithStoryCodeBlock('base-alert--default');
    });

    it('toggles the code of a non-default story', () => {
      interactWithStoryCodeBlock('base-alert--variants');
    });
  });
});
