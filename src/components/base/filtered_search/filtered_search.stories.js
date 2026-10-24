import { last } from 'lodash-es';
import { userEvent, within, waitFor, expect } from '@storybook/test';
import { getA11yParameters } from '../../../utils/stories_utils';
import GlLoadingIcon from '../loading_icon/loading_icon.vue';
import GlIcon from '../icon/icon.vue';
import GlToken from '../token/token.vue';
import GlAvatar from '../avatar/avatar.vue';
import GlFormDate from '../form/form_date/form_date.vue';
import GlDropdownDivider from '../dropdown/dropdown_divider.vue';
import { setStoryTimeout } from '../../../utils/test_utils';
import { makeContainer } from '../../../utils/story_decorators/container';
import GlFilteredSearchTokenSegment from './filtered_search_token_segment.vue';
import GlFilteredSearchTerm from './filtered_search_term.vue';
import GlFilteredSearchSuggestionList from './filtered_search_suggestion_list.vue';
import GlFilteredSearchSuggestion from './filtered_search_suggestion.vue';
import GlFilteredSearchToken from './filtered_search_token.vue';
import GlFilteredSearch from './filtered_search.vue';

const fakeUsers = [
  { id: 1, name: 'User Alpha', username: 'alpha' },
  { id: 2, name: 'User Beta', username: 'beta' },
  { id: 3, name: 'User Gamma', username: 'gamma' },
  { id: 4, name: 'User Delta', username: 'delta' },
  { id: 5, name: 'User Epsilon', username: 'epsilon' },
];

const fakeMilestones = [
  { id: 1, title: '12.7', name: '%12.7' },
  { id: 2, title: '12.8', name: '%12.8' },
  { id: 3, title: '12.9', name: '%12.9' },
  { id: 4, title: '12.10', name: '%12.10' },
  { id: 5, title: 'Backlog', name: 'Backlog' },
];

const fakeLabels = [
  { id: 1, title: 'Bug', color: '#D72104', text_color: '#FFFFFF' },
  { id: 2, title: 'Enhancement', color: '#F0AD4E', text_color: '#FFFFFF' },
  { id: 3, title: 'Backlog', color: '#CCCCCC', text_color: '#333333' },
  { id: 4, title: 'Feature', color: '#A8D695', text_color: '#333333' },
  { id: 5, title: 'Documentation', color: '#5CB85C', text_color: '#FFFFFF' },
];

const UserToken = {
  name: 'UserToken',
  components: { GlFilteredSearchToken, GlFilteredSearchSuggestion, GlLoadingIcon, GlAvatar },
  props: ['value', 'active'],
  inheritAttrs: false,
  data() {
    return {
      loadingView: false,
      loadingSuggestions: false,
      users: [],
      activeUser: null,
    };
  },
  methods: {
    loadView() {
      this.loadingView = true;
      setStoryTimeout(() => {
        this.loadingView = false;
        this.activeUser = fakeUsers.find((u) => u.username === this.value.data);
      }, 500);
    },
    loadSuggestions() {
      this.loadingSuggestions = true;
      setStoryTimeout(() => {
        this.loadingSuggestions = false;
        this.users = fakeUsers;
      }, 500);
    },
  },
  watch: {
    // eslint-disable-next-line func-names
    'value.data': function () {
      if (this.active) {
        this.loadSuggestions();
      }
    },
    active: {
      immediate: true,
      handler(newValue) {
        if (!newValue) {
          this.loadView();
        } else {
          this.loadSuggestions();
        }
      },
    },
  },
  template: `
    <gl-filtered-search-token
      v-bind="{ ...this.$props, ...this.$attrs }"
      v-on="$listeners"
    >
      <template #view="{ inputValue }">
        <gl-loading-icon size="sm" v-if="loadingView" />
        <gl-avatar :size="16" :entity-name="inputValue" shape="circle" v-else />
        {{ activeUser ? activeUser.name : inputValue }}
      </template>
      <template #suggestions>
        <template v-if="loadingSuggestions">
          <gl-loading-icon />
        </template>
        <template v-else>
        <gl-filtered-search-suggestion :key="user.id" v-for="user in users" :value="user.username">
          <div class="gl-flex">
            <gl-avatar :size="32" :entity-name="user.username" />
            <div>
              <p class="gl-m-0">{{ user.name }}</p>
              <p class="gl-m-0">@{{ user.username }}</p>
            </div>
          </div>
        </gl-filtered-search-suggestion>
        </template>
      </template>
    </gl-filtered-search-token>
  `,
};

const MilestoneToken = {
  name: 'MilestoneToken',
  components: {
    GlFilteredSearchToken,
    GlFilteredSearchSuggestion,
    GlLoadingIcon,
    GlDropdownDivider,
  },
  props: ['value', 'active'],
  inheritAttrs: false,
  data() {
    return {
      loadingView: false,
      loadingSuggestions: false,
      milestones: [],
    };
  },
  methods: {
    loadSuggestions() {
      this.loadingSuggestions = true;
      setStoryTimeout(() => {
        this.loadingSuggestions = false;
        this.milestones = fakeMilestones;
      }, 500);
    },
  },
  watch: {
    // eslint-disable-next-line func-names
    'value.data': function () {
      if (this.active) {
        this.loadSuggestions();
      }
    },
    active: {
      immediate: true,
      handler(newValue) {
        if (newValue) {
          this.loadSuggestions();
        }
      },
    },
  },
  template: `
    <gl-filtered-search-token
      v-bind="{ ...this.$props, ...this.$attrs }"
      v-on="$listeners"
    >
      <template #suggestions>
        <gl-filtered-search-suggestion value="None">None</gl-filtered-search-suggestion>
        <gl-filtered-search-suggestion value="Any">Any</gl-filtered-search-suggestion>
        <gl-filtered-search-suggestion value="Upcoming">Upcoming</gl-filtered-search-suggestion>
        <gl-filtered-search-suggestion value="Started">Started</gl-filtered-search-suggestion>
        <gl-dropdown-divider v-if="loadingSuggestions || milestones.length" />
        <template v-if="loadingSuggestions">
          <gl-loading-icon />
        </template>
        <template v-else>
        <gl-filtered-search-suggestion :key="milestone.id" v-for="milestone in milestones" :value="milestone.name">
        {{ milestone.title }}
        </gl-filtered-search-suggestion>
        </template>
      </template>
    </gl-filtered-search-token>
  `,
};

const LabelToken = {
  name: 'LabelToken',
  components: {
    GlFilteredSearchToken,
    GlFilteredSearchSuggestion,
    GlLoadingIcon,
    GlToken,
    GlDropdownDivider,
  },
  props: ['value', 'active', 'viewOnly'],
  inheritAttrs: false,
  data() {
    return {
      loadingView: false,
      loadingSuggestions: false,
      labels: [],
      activeLabel: null,
    };
  },
  computed: {
    currentValue() {
      return this.value.data.toLowerCase();
    },
    containerStyle() {
      if (this.activeLabel) {
        const { color, text_color } = this.activeLabel;

        // eslint-disable-next-line camelcase
        return { backgroundColor: color, color: text_color };
      }
      return {};
    },
  },
  methods: {
    loadView() {
      this.loadingView = true;
      setStoryTimeout(() => {
        this.loadingView = false;
        this.activeLabel = fakeLabels.find((l) => l.title === this.value.data);
      }, 100);
    },
    loadSuggestions() {
      this.loadingSuggestions = true;
      setStoryTimeout(() => {
        this.loadingSuggestions = false;
        this.labels = fakeLabels;
      }, 500);
    },
  },
  watch: {
    // eslint-disable-next-line func-names
    'value.data': function () {
      if (this.active) {
        this.loadSuggestions();
      }
    },
    active: {
      immediate: true,
      handler(newValue) {
        if (!newValue) {
          this.loadView();
        } else {
          this.loadSuggestions();
        }
      },
    },
  },
  template: `
    <gl-filtered-search-token
      v-bind="{ ...this.$props, ...this.$attrs }"
      v-on="$listeners"
    >
      <template #view-token="{ inputValue, cssClasses, listeners }">
        <gl-token variant="search-value" :view-only="viewOnly" :class="cssClasses" :style="containerStyle" v-on="listeners">
          {{ activeLabel ? activeLabel.title : inputValue }}
        </gl-token>
      </template>
      <template #suggestions>
        <gl-filtered-search-suggestion value="None">None</gl-filtered-search-suggestion>
        <gl-filtered-search-suggestion value="Any">Any</gl-filtered-search-suggestion>
        <gl-dropdown-divider v-if="loadingSuggestions || labels.length" />
        <template v-if="loadingSuggestions">
          <gl-loading-icon />
        </template>
        <template v-else>
        <gl-filtered-search-suggestion :key="label.id" v-for="label in labels" :value="label.title">
          <div class="gl-flex">
            <span
              :style="{ backgroundColor: label.color, height: '16px', width: '16px' }"
              class="gl-inline-block gl-mr-3"
            ></span>
            {{ label.title }}
          </div>
        </gl-filtered-search-suggestion>
        </template>
      </template>
    </gl-filtered-search-token>
  `,
};

const DateToken = {
  name: 'DateToken',
  components: {
    GlFormDate,
    GlFilteredSearchToken,
  },
  props: ['value', 'active', 'viewOnly'],
  inheritAttrs: false,
  data() {
    return {
      dataSegmentInputAttributes: {
        placeholder: 'YYYY-MM-DD',
      },
    };
  },
  methods: {
    selectValue(value, submitValue) {
      if (value) {
        submitValue(value);
      }
    },
  },
  template: `
    <div>
      <gl-filtered-search-token
        :data-segment-input-attributes="dataSegmentInputAttributes"
        v-bind="{ ...this.$props, ...this.$attrs }"
        v-on="$listeners"
      >
        <template #data-segment-input="{ submitValue }">
          <gl-form-date
            class="gl-filtered-search-token-segment-input"
            autofocus
            @change="(value) => selectValue(value, submitValue)"
          />
        </template>
      </gl-filtered-search-token>
    </div>
  `,
};

const tokens = [
  {
    type: 'author',
    icon: 'pencil',
    title: 'Author',
    dataType: 'user',
    unique: true,
    token: UserToken,
  },
  { type: 'user', icon: 'user', title: 'Assignee', dataType: 'user', token: UserToken },
  { type: 'milestone', icon: 'milestone', title: 'Milestone', unique: true, token: MilestoneToken },
  { type: 'label', icon: 'labels', title: 'Label', token: LabelToken },
  { type: 'weight', icon: 'weight', title: 'Weight', unique: true, token: GlFilteredSearchToken },
  {
    type: 'confidential',
    icon: 'eye-slash',
    title: 'Confidential',
    unique: true,
    token: GlFilteredSearchToken,
    options: [
      { icon: 'eye-slash', value: 'true', title: 'Yes' },
      { icon: 'eye', value: 'false', title: 'No' },
    ],
  },
  {
    type: 'date',
    icon: 'history',
    title: 'Created',
    token: DateToken,
    operators: [
      { value: '<', description: 'before' },
      { value: '>', description: 'after' },
    ],
  },
];

const components = {
  GlFilteredSearch,
};

export const Default = () => ({
  data() {
    return {
      tokens,
      value: [
        { type: 'author', value: { data: 'beta', operator: '=' } },
        { type: 'label', value: { data: 'Bug', operator: '=' } },
        'raw text',
      ],
    };
  },
  components,
  template: `<gl-filtered-search :available-tokens="tokens" :value="value" />`,
});

export const Empty = (args, { argTypes }) => ({
  props: Object.keys(argTypes),
  data() {
    return {
      tokens,
      value: [],
    };
  },
  components,
  template: `
    <gl-filtered-search
      :available-tokens="tokens"
      v-model="value"
      :terms-as-tokens="termsAsTokens"
    />
  `,
});
Empty.args = { termsAsTokens: false };
Empty.tags = ['skip-visual-test'];

export const WithTermsAsTokens = () => ({
  data() {
    return {
      tokens,
      value: [
        { type: 'author', value: { data: 'beta', operator: '=' } },
        { type: 'label', value: { data: 'Bug', operator: '=' } },
        'raw text',
      ],
    };
  },
  components,
  template: `
    <gl-filtered-search :available-tokens="tokens" v-model="value" terms-as-tokens />
  `,
});

export const ViewOnly = () => ({
  data() {
    return {
      tokens,
      value: [{ type: 'author', value: { data: 'epsilon', operator: '=' } }, 'raw text'],
    };
  },
  components,
  template: `<gl-filtered-search view-only :available-tokens="tokens" :value="value" />`,
});

export const WithHistoryItems = () => ({
  components,
  data() {
    return {
      tokens: [
        {
          type: 'demotoken',
          title: 'Unique',
          icon: 'document',
          token: GlFilteredSearchToken,
          operators: [{ value: '=', description: 'is', default: 'true' }],
          options: [
            { icon: 'heart', title: 'heart', value: 1 },
            { icon: 'hook', title: 'hook', value: 2 },
          ],
          unique: true,
        },
      ],
      value: [],
      historyItems: [
        [{ type: 'demotoken', value: { operator: '=', data: 1 } }, 'item 1'],
        ['item 2', { type: 'demotoken', value: { operator: '=', data: 2 } }],
      ],
    };
  },
  methods: {
    isString(val) {
      return typeof val === 'string';
    },
  },
  template: `
    <div>
      {{ value }}
      <gl-filtered-search v-model="value" :available-tokens="tokens" :history-items="historyItems">
        <template #history-item="{ historyItem }">
          <template v-for="(token, idx) in historyItem">
            <span v-if="isString(token)" :key="idx" class="gl-px-1">{{ token }}</span>
            <span v-else :key="idx" class="gl-px-1">
              <strong>{{ token.type }}</strong> {{ token.value.operator }}
              <strong>{{ token.value.data }}</strong>
            </span>
          </template>
        </template>
      </gl-filtered-search>
    </div>
  `,
});
// Skip known axe-core failures, skipped rules should be removed when underlying violation is resolved
WithHistoryItems.parameters = {
  a11y: getA11yParameters({ temporarySkipRules: ['scrollable-region-focusable'] }),
};
WithHistoryItems.play = async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  const button = canvas.getByTestId('base-dropdown-toggle');
  await userEvent.click(button);
  await waitFor(() => expect(within(document).getByTestId('base-dropdown-menu')).toBeVisible());
};

export const WithFriendlyText = () => ({
  components,
  data() {
    return {
      tokens: [
        {
          type: 'weight',
          icon: 'weight',
          title: 'Weight',
          unique: true,
          token: GlFilteredSearchToken,
        },
        {
          type: 'confidential',
          icon: 'eye-slash',
          title: 'Confidential',
          unique: true,
          token: GlFilteredSearchToken,
          options: [
            { icon: 'eye-slash', value: 'true', title: 'Yes' },
            { icon: 'eye', value: 'false', title: 'No' },
          ],
        },
      ],
      value: [
        { type: 'weight', value: { data: '3', operator: '=' } },
        { type: 'confidential', value: { data: 'Yes', operator: '!=' } },
      ],
    };
  },
  template: `
    <gl-filtered-search
      v-model="value"
      :available-tokens="tokens"
      :show-friendly-text="true"
    />
  `,
});

export const WithMultiSelect = () => {
  const MultiUserToken = {
    props: ['value', 'active', 'config'],
    components: {
      GlFilteredSearchToken,
      GlFilteredSearchSuggestion,
      GlLoadingIcon,
      GlIcon,
      GlAvatar,
    },
    inheritAttrs: false,
    data() {
      return {
        users: fakeUsers,
        selectedUsernames: this.value.data || [],
        activeUser: null,
      };
    },
    computed: {
      filteredUsers() {
        let term = this.value.data;

        if (Array.isArray(this.value.data) && this.value.data.length > 1) {
          term = last(this.value.data);
        }

        return this.users.filter((user) => user.username.includes(term));
      },
      selectedUsers() {
        return this.config.multiSelect
          ? this.users.filter((user) => this.selectedUsernames.includes(user.username))
          : this.users.filter((user) => user.username === this.activeUser);
      },
    },
    methods: {
      loadView() {
        this.activeUser = fakeUsers.find((u) => u.username === this.value.data);
      },
      loadSuggestions() {
        this.users = fakeUsers;
      },
      handleSelect(username) {
        if (!this.config.multiSelect) {
          return;
        }

        if (this.selectedUsernames.includes(username)) {
          this.selectedUsernames = this.selectedUsernames.filter((user) => user !== username);
        } else {
          this.selectedUsernames.push(username);
        }
      },
      isLastUser(index) {
        return index === this.selectedUsers.length - 1;
      },
      key(user, index) {
        return `${user.id}-${index}`;
      },
    },
    watch: {
      // eslint-disable-next-line func-names
      'value.data': function () {
        if (this.active) {
          this.loadSuggestions();
        }
      },
      active: {
        immediate: true,
        handler(newValue) {
          if (!newValue) {
            this.loadView();
          } else {
            this.loadSuggestions();
          }
        },
      },
    },
    template: `
    <gl-filtered-search-token
      v-bind="{ ...this.$props, ...this.$attrs }"
      v-on="$listeners"
      :multi-select-values="selectedUsernames"
      @select="handleSelect"
    >
    <template #view="{ inputValue }">
      <template v-for="(user, index) in selectedUsers">
        <gl-avatar :size="16" :entity-name="user.username" shape="circle" />
        {{ user.name }}
        <span v-if="!isLastUser(index)">,&nbsp;</span>
      </template>
    </template>
    <template #suggestions>
      <gl-filtered-search-suggestion :key="key(user, index)" v-for="(user, index) in filteredUsers" :value="user.username">
        <div class="gl-flex gl-items-center">
          <gl-icon
            v-if="config.multiSelect"
            name="check"
            class="gl-mr-3 gl-text-gray-700"
            :class="{ 'gl-invisible': !selectedUsernames.includes(user.username) }"
          />
          <gl-avatar :size="32" :entity-name="user.username" />
          <div>
            <p class="gl-m-0">{{ user.name }}</p>
            <p class="gl-m-0">@{{ user.username }}</p>
          </div>
        </div>
      </gl-filtered-search-suggestion>
    </template>
    </gl-filtered-search-token>
  `,
  };

  return {
    components,
    data() {
      return {
        tokens: [
          {
            type: 'assignee',
            icon: 'user',
            title: 'Assignee',
            token: MultiUserToken,
            operators: [
              { value: '=', description: 'is', default: 'true' },
              { value: '!=', description: 'is not one of' },
              { value: '||', description: 'is one of' },
            ],
            multiSelect: true,
          },
        ],
        value: [{ type: 'assignee', value: { data: ['alpha', 'beta'], operator: '=' } }],
      };
    },
    template: `
      <gl-filtered-search v-model="value" :available-tokens="tokens" />
    `,
  };
};

export const WithSectionHeaders = () => {
  const vulnerabilityMatcher = ({ query, title, defaultMatcher }) =>
    [title, 'Vulnerability count'].some((text) => defaultMatcher(text, query));

  return {
    components,
    data() {
      return {
        tokens: [
          {
            type: 'gl-filtered-search-suggestion-group-vulnerability-count',
            title: 'Vulnerability count',
            match: ({ query, title, defaultMatcher }) =>
              [title, 'severity', 'critical', 'high', 'medium', 'low', 'info', 'unknown'].some(
                (keyword) => defaultMatcher(keyword, query),
              ),
          },
          {
            type: 'severity-critical',
            title: 'Severity critical',
            segmentTitle: 'Vulnerability count critical',
            token: GlFilteredSearchToken,
            unique: true,
            operators: [{ value: '=', description: 'is' }],
            match: vulnerabilityMatcher,
          },
          {
            type: 'severity-high',
            title: 'Severity high',
            segmentTitle: 'Vulnerability count high',
            token: GlFilteredSearchToken,
            unique: true,
            operators: [{ value: '=', description: 'is' }],
            match: vulnerabilityMatcher,
          },
          {
            type: 'severity-medium',
            title: 'Severity medium',
            segmentTitle: 'Vulnerability count medium',
            token: GlFilteredSearchToken,
            unique: true,
            operators: [{ value: '=', description: 'is' }],
            match: vulnerabilityMatcher,
          },
          {
            type: 'severity-low',
            title: 'Severity low',
            segmentTitle: 'Vulnerability count low',
            token: GlFilteredSearchToken,
            unique: true,
            operators: [{ value: '=', description: 'is' }],
            match: vulnerabilityMatcher,
          },
          {
            type: 'severity-info',
            title: 'Severity info',
            segmentTitle: 'Vulnerability count info',
            token: GlFilteredSearchToken,
            unique: true,
            operators: [{ value: '=', description: 'is' }],
            match: vulnerabilityMatcher,
          },
          {
            type: 'severity-unknown',
            title: 'Severity unknown',
            segmentTitle: 'Vulnerability count unknown',
            token: GlFilteredSearchToken,
            unique: true,
            operators: [{ value: '=', description: 'is' }],
            match: vulnerabilityMatcher,
          },
          {
            type: 'gl-filtered-search-suggestion-group-tool-coverage',
            title: 'Tool coverage',
            match: ({ query, defaultMatcher }) =>
              ['DAST', 'SAST', 'IaC'].some((keyword) => defaultMatcher(keyword, query)),
          },
          {
            type: 'tool-ds',
            title: 'Dependency Scanning (DS)',
            segmentTitle: 'DS',
            token: GlFilteredSearchToken,
            unique: true,
            operators: [{ value: '=', description: 'is' }],
          },
          {
            type: 'tool-sast',
            title: 'Basic SAST (SAST)',
            segmentTitle: 'SAST',
            token: GlFilteredSearchToken,
            unique: true,
            operators: [{ value: '=', description: 'is' }],
          },
          {
            type: 'tool-dast',
            title: 'Dynamic Application Security Testing (DAST)',
            segmentTitle: 'DAST',
            token: GlFilteredSearchToken,
            unique: true,
            operators: [{ value: '=', description: 'is' }],
          },
        ],
        value: [],
      };
    },
    template: `
      <gl-filtered-search v-model="value" :available-tokens="tokens" />
    `,
  };
};
// Skip scrollable region focusable because UL has programmtic focus using tabindex="-1"
WithSectionHeaders.parameters = {
  a11y: getA11yParameters({ temporarySkipRules: ['scrollable-region-focusable'] }),
};
WithSectionHeaders.play = async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  await userEvent.tab();
  await waitFor(() => expect(canvas.getByRole('list')).toBeVisible());
};

export default {
  title: 'base/filtered-search',
  // Make room for suggestion lists
  decorators: [makeContainer({ height: '250px' })],
  component: GlFilteredSearch,
  parameters: {
    docs: {
      description: {
        component:
          'See [Pajamas Design System documentation](https://design.khulnasoft.com/components/filter) for usage and implementation details.',
      },
    },
  },
  subcomponents: {
    GlFilteredSearchSuggestion,
    GlFilteredSearchSuggestionList,
    GlFilteredSearchTerm,
    GlFilteredSearchTokenSegment,
    GlFilteredSearchToken,
  },
  argTypes: {},
};
