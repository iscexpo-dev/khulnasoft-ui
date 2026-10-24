const noop = () => {};

/**
 * A mocked provide option for components that expect to be descendants of
 * GlFilteredSearch, to be used in their stories.
 */
export const provide = () => ({
  portalName: 'portal',
  alignSuggestions: noop,
  suggestionsListClass: noop,
  termsAsTokens: () => false,
});
