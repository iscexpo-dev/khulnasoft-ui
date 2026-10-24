import { propDefaultFactory, disableControls } from '../../../utils/stories_utils';
import GlSearchBoxByClick from './search_box_by_click.vue';

const template = `
  <gl-search-box-by-click
    :value="value"
    :disabled="disabled"
    :placeholder="placeholder"
    :history-items="currentHistoryItems"
    :clearable="clearable"
    :recent-searches-header="recentSearchesHeader"
    :clear-button-title="clearButtonTitle"
    :close-button-title="closeButtonTitle"
    :clear-recent-searches-text="clearRecentSearchesText"
    :no-recent-searches-text="noRecentSearchesText"
    :search-button-attributes="searchButtonAttributes"
    :show-search-button="showSearchButton"
    @clear-history="clearCurrentHistory"
  />
`;

const defaultValue = propDefaultFactory(GlSearchBoxByClick);

const generateProps = ({
  disabled = defaultValue('disabled'),
  value = defaultValue('value'),
  placeholder = defaultValue('placeholder'),
  historyItems = defaultValue('historyItems'),
  clearable = defaultValue('clearable'),
  recentSearchesHeader = defaultValue('recentSearchesHeader'),
  clearButtonTitle = defaultValue('clearButtonTitle'),
  closeButtonTitle = defaultValue('closeButtonTitle'),
  clearRecentSearchesText = defaultValue('clearRecentSearchesText'),
  noRecentSearchesText = defaultValue('noRecentSearchesText'),
  searchButtonAttributes = defaultValue('searchButtonAttributes'),
  showSearchButton = defaultValue('showSearchButton'),
} = {}) => ({
  disabled,
  value,
  placeholder,
  historyItems,
  clearable,
  recentSearchesHeader,
  clearButtonTitle,
  closeButtonTitle,
  clearRecentSearchesText,
  noRecentSearchesText,
  searchButtonAttributes,
  showSearchButton,
});

const Template = (args, { argTypes }) => ({
  components: {
    GlSearchBoxByClick,
  },
  props: Object.keys(argTypes),
  template,
  data() {
    return {
      currentHistoryItems: this.historyItems,
    };
  },
  watch: {
    historyItems(historyItems) {
      this.currentHistoryItems = historyItems;
    },
  },
  methods: {
    clearCurrentHistory() {
      this.currentHistoryItems = [];
    },
  },
});

export const Default = Template.bind({});
Default.args = generateProps();

export const History = Template.bind({});
History.args = generateProps({
  historyItems: ['author:@admin', 'assignee:@admin milestone:%12.5', 'label:~test'],
});

export default {
  title: 'base/search-box-by-click',
  component: GlSearchBoxByClick,
  parameters: {
    docs: {
      description: {
        component:
          'See [Pajamas Design System documentation](https://design.khulnasoft.com/components/search) for usage and implementation details.',
      },
    },
  },
  argTypes: {
    ...disableControls(['tooltipContainer']),
    historyItems: {
      control: 'object',
    },
  },
};
