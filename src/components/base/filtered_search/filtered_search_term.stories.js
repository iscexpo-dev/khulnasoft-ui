import PortalVue from 'portal-vue';
import Vue from 'vue';
import { triggerBlurEvent } from '../../../utils/play_utils';
import { getA11yParameters } from '../../../utils/stories_utils';
import { provide } from './common_story_options';
import GlFilteredSearchTerm from './filtered_search_term.vue';

Vue.use(PortalVue);

const defaultTokens = [
  { title: 'Demo1', type: 'demo1', icon: 'label', token: {} },
  { title: 'Demo2', type: 'demo2', icon: 'rocket', token: {} },
];

const generateProps = ({
  active = true,
  availableTokens = defaultTokens,
  placeholder = 'Search...',
  searchInputAttributes = { 'aria-label': 'search' },
  isLastToken = false,
  currentValue = [],
  cursorPosition = 'end',
  searchTextOptionLabel = 'Text',
  viewOnly = false,
  value = { data: 'demo' },
} = {}) => ({
  active,
  availableTokens,
  placeholder,
  searchInputAttributes,
  isLastToken,
  currentValue,
  cursorPosition,
  searchTextOptionLabel,
  viewOnly,
  value,
});

export const Standalone = (args, { argTypes }) => ({
  props: Object.keys(argTypes),
  components: { GlFilteredSearchTerm },
  provide,
  template: `
    <div>
      <div class="gl-border">
        <gl-filtered-search-term
          v-bind="$props"
          v-model="$props.value"
          class="gl-h-full"
        />
      </div>
      <div>
        <portal-target name="portal" class="gl-relative" />
      </div>
    </div>
  `,
});

Standalone.args = generateProps();
Standalone.play = triggerBlurEvent;

export default {
  title: 'base/filtered-search/term',
  component: GlFilteredSearchTerm,
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
  argTypes: {
    active: { control: 'boolean' },
    availableTokens: { control: 'object' },
    placeholder: { control: 'text' },
    searchInputAttributes: { control: 'object' },
    isLastToken: { control: 'boolean' },
    currentValue: { control: 'object' },
    cursorPosition: {
      control: { type: 'select' },
      options: ['start', 'end'],
    },
    searchTextOptionLabel: { control: 'text' },
    viewOnly: { control: 'boolean' },
    value: { control: 'object' },
  },
};
