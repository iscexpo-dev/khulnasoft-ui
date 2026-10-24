import { getA11yParameters } from '../../../utils/stories_utils';
import GlFilteredSearchSuggestion from './filtered_search_suggestion.vue';

const noop = () => {};

export const Default = () => ({
  components: { GlFilteredSearchSuggestion },
  provide: {
    filteredSearchSuggestionListInstance: {
      register: noop,
      unregister: noop,
      $emit: noop,
      activeItem: null,
    },
  },
  template: `
    <ul>
      <gl-filtered-search-suggestion value="demo">Demo suggestion</gl-filtered-search-suggestion>
    </ul>
  `,
});

export default {
  title: 'base/filtered-search/suggestion',
  component: GlFilteredSearchSuggestion,
  parameters: {
    // Skip known axe-core failures, skipped rules should be removed when underlying violation is resolved
    a11y: getA11yParameters({ temporarySkipRules: ['aria-required-parent', 'list'] }),
    docs: {
      description: {
        component:
          'See [Pajamas Design System documentation](https://design.khulnasoft.com/components/filter) for usage and implementation details.',
      },
    },
  },
};
