import PortalVue from 'portal-vue';
import Vue from 'vue';
import { triggerBlurEvent } from '../../../utils/play_utils';
import { getA11yParameters } from '../../../utils/stories_utils';
import GlFilteredSearchSuggestion from './filtered_search_suggestion.vue';
import { provide } from './common_story_options';
import GlFilteredSearchTokenSegment from './filtered_search_token_segment.vue';

Vue.use(PortalVue);

const staticOptions = [
  { icon: 'eye-slash', value: true, title: 'Yes' },
  { icon: 'eye', value: false, title: 'No' },
  {
    icon: 'pencil',
    value: 'custom',
    title: 'Custom',
    component: {
      props: ['option'],
      template: '<span>{{ option.title }} <b class="gl-text-red-500">component</b></span>',
    },
  },
];

const generateProps = ({ active = true } = {}) => ({
  active,
});

// eslint-disable-next-line no-unused-vars
export const Default = (args, { argTypes }) => ({
  components: {
    GlFilteredSearchTokenSegment,
    GlFilteredSearchSuggestion,
  },
  provide,
  props: ['active'],
  data() {
    return {
      value: 'demo1',
    };
  },
  template: `
    <div>
      <div>v-model value: {{ value }} </div>
      <div class="gl-border">
        <gl-filtered-search-token-segment
          v-model="value"
          class="gl-h-full"
          :active="active"
        >
          <template #suggestions>
            <gl-filtered-search-suggestion value="demo1">Static suggestion 1</gl-filtered-search-suggestion>
            <gl-filtered-search-suggestion value="demo2">Static suggestion 2</gl-filtered-search-suggestion>
          </template>
        </gl-filtered-search-token-segment>
      </div>
      <div>
        <portal-target name="portal" class="gl-relative" />
      </div>
    </div>
  `,
});
Default.args = generateProps();
Default.play = triggerBlurEvent;

// eslint-disable-next-line no-unused-vars
export const WithStaticOptions = (args, { argTypes }) => ({
  components: {
    GlFilteredSearchTokenSegment,
  },
  provide,
  props: ['active'],
  data() {
    return {
      value: true,
      staticOptions,
    };
  },
  template: `
    <div>
      <div>v-model value: {{ value }} </div>
      <div class="gl-border">
        <gl-filtered-search-token-segment
          v-model="value"
          class="gl-h-full"
          :active="active"
          :options="staticOptions"
          option-text-field="title"
        />
      </div>
      <div>
        <portal-target name="portal" class="gl-relative" />
      </div>
    </div>
  `,
});
WithStaticOptions.args = generateProps();
WithStaticOptions.play = triggerBlurEvent;

export default {
  title: 'base/filtered-search/token-segment',
  component: GlFilteredSearchTokenSegment,
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
