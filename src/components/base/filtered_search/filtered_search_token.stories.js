import PortalVue from 'portal-vue';
import Vue from 'vue';
import { triggerBlurEvent } from '../../../utils/play_utils';
import { getA11yParameters } from '../../../utils/stories_utils';
import GlIcon from '../icon/icon.vue';
import GlDatepicker from '../datepicker/datepicker.vue';
import { provide } from './common_story_options';
import GlFilteredSearchSuggestion from './filtered_search_suggestion.vue';
import GlFilteredSearchToken from './filtered_search_token.vue';

Vue.use(PortalVue);

const generateProps = ({ active = true } = {}) => ({
  active,
});

// eslint-disable-next-line no-unused-vars
export const Default = (args, { argTypes }) => ({
  components: {
    GlFilteredSearchToken,
    GlFilteredSearchSuggestion,
    GlIcon,
  },
  provide,
  props: ['active'],
  data() {
    return {
      value: { operator: '=', data: 'Yes' },
      config: {
        title: 'Confidential',
      },
    };
  },
  template: `
    <div>
      <div> {{ value }} </div>
      <div class="gl-border">
        <gl-filtered-search-token
          v-model="value"
          class="gl-h-full"
          :config="config"
          :active="active"
        >
          <template #suggestions>
            <gl-filtered-search-suggestion value="Yes"><gl-icon name="eye-slash" :size="16"/> Yes</gl-filtered-search-suggestion>
            <gl-filtered-search-suggestion value="No"><gl-icon name="eye" :size="16"/> No</gl-filtered-search-suggestion>
          </template>
        </gl-filtered-search-token>
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
export const WithCustomOperatorsOptions = (args, { argTypes }) => ({
  components: {
    GlFilteredSearchToken,
    GlFilteredSearchSuggestion,
    GlIcon,
  },
  provide,
  props: ['active'],
  data() {
    return {
      value: { operator: '!', data: 'Yes' },
      config: {
        title: 'Confidential',
        operators: [
          { value: '^', description: 'or' },
          { value: '!', description: 'is not', default: 'true' },
        ],
      },
    };
  },
  template: `
    <div>
      <div> {{ value }} </div>
      <div class="gl-border">
        <gl-filtered-search-token
          v-model="value"
          class="gl-h-full"
          :config="config"
          :active="active"
        >
          <template #suggestions>
            <gl-filtered-search-suggestion value="Yes"><gl-icon name="eye-slash" :size="16"/> Yes</gl-filtered-search-suggestion>
            <gl-filtered-search-suggestion value="No"><gl-icon name="eye" :size="16"/> No</gl-filtered-search-suggestion>
          </template>
        </gl-filtered-search-token>
      </div>
      <div>
        <portal-target name="portal" class="gl-relative" />
      </div>
    </div>
  `,
});
WithCustomOperatorsOptions.args = generateProps();
WithCustomOperatorsOptions.play = triggerBlurEvent;

// eslint-disable-next-line no-unused-vars
export const WithStaticOptions = (args, { argTypes }) => ({
  components: {
    GlFilteredSearchToken,
    GlFilteredSearchSuggestion,
  },
  provide,
  props: ['active'],
  data() {
    return {
      value: { operator: '=', data: 'first' },
      config: {
        title: 'Confidential',
        options: [
          { icon: 'hourglass', title: 'first', value: 'one' },
          { title: 'second-without-icon', value: 'two' },
          { icon: 'issues', title: 'third', value: 'three' },
        ],
      },
    };
  },
  template: `
    <div>
      <div> {{ value }} </div>
      <div class="gl-border">
        <gl-filtered-search-token
          v-model="value"
          class="gl-h-full"
          :config="config"
          :active="active"
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

// eslint-disable-next-line no-unused-vars
export const WithDataSegmentInputAttributes = (args, { argTypes }) => ({
  components: {
    GlFilteredSearchToken,
    GlDatepicker,
  },
  provide,
  props: ['active'],
  data() {
    return {
      value: { operator: '<', data: null },
      config: {
        title: 'Date',
        operators: [
          { value: '<', description: 'before' },
          { value: '>', description: 'after' },
        ],
      },
      dataSegmentInputAttributes: {
        placeholder: 'YYYY-MM-DD',
        id: 'this-id',
      },
    };
  },
  template: `
    <div>
      <div> {{ value }} </div>
      <div class="gl-border">
        <gl-filtered-search-token
          v-model="value"
          class="gl-h-full"
          :config="config"
          :active="active"
          :data-segment-input-attributes="dataSegmentInputAttributes"
        />
        <gl-datepicker target='#this-id' />
      </div>
    </div>
  `,
});
WithDataSegmentInputAttributes.args = generateProps();
WithDataSegmentInputAttributes.play = triggerBlurEvent;

export default {
  title: 'base/filtered-search/token',
  component: GlFilteredSearchToken,
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
