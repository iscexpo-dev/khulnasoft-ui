import { setStoryTimeout } from '../../../utils/test_utils';
import { getA11yParameters } from '../../../utils/stories_utils';
import GlLoadingIcon from '../loading_icon/loading_icon.vue';
import GlInfiniteScroll from './infinite_scroll.vue';

const ITEMS_BATCH_SIZE = 20;

const template = `
  <gl-infinite-scroll
    :total-items="totalItems"
    :fetched-items="localFetchedItems"
    :max-list-height="maxListHeight"
    @bottom-reached="onBottomReached"
    >
    <template #items>
      <ul class="list-group list-group-flushed list-unstyled">
        <li v-for="item in localFetchedItems" :key="item" class="list-group-item gl-bg-default gl-border-default">Item #{{ item }}</li>
      </ul>
    </template>

    <template v-if="localIsLoading" #default>
      <div class="gl-mt-3">
        <gl-loading-icon />
      </div>
    </template>
  </gl-infinite-scroll>
`;

const generateProps = ({
  isLoading = false,
  totalItems = null,
  fetchedItems = ITEMS_BATCH_SIZE,
  maxListHeight = 285,
} = {}) => ({
  isLoading,
  totalItems,
  fetchedItems,
  maxListHeight,
});

const Template = (args, { argTypes }) => ({
  components: {
    GlInfiniteScroll,
    GlLoadingIcon,
  },
  props: Object.keys(argTypes),
  watch: {
    fetchedItems: {
      immediate: true,
      handler(fetchedItems) {
        this.localFetchedItems = fetchedItems;
      },
    },
    isLoading: {
      immediate: true,
      handler(isLoading) {
        this.localIsLoading = isLoading;
      },
    },
  },
  data() {
    return {
      loadTimer: null,
      localFetchedItems: null,
      localIsLoading: false,
    };
  },
  methods: {
    onBottomReached() {
      clearTimeout(this.loadTimer);
      this.localIsLoading = true;
      this.loadTimer = setStoryTimeout(() => {
        this.localFetchedItems += ITEMS_BATCH_SIZE;
        this.localIsLoading = false;
      }, 500);
    },
  },
  template,
});

export const Default = Template.bind({});
Default.args = generateProps();

export default {
  title: 'base/infinite-scroll/deprecated',
  component: GlInfiniteScroll,
  parameters: {
    // Skip known axe-core failures, skipped rules should be removed when underlying violation is resolved
    a11y: getA11yParameters({ temporarySkipRules: ['scrollable-region-focusable'] }),
    docs: {
      description: {
        component:
          'See [Pajamas Design System documentation](https://design.khulnasoft.com/components/infinite-scroll) for usage and implementation details.',
      },
    },
  },
};
