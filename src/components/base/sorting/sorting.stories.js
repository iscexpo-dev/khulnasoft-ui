import { userEvent, within, waitFor, expect } from '@storybook/test';
import { propDefaultFactory } from '../../../utils/stories_utils';
import { makeContainer } from '../../../utils/story_decorators/container';
import GlSorting from './sorting.vue';

const components = {
  GlSorting,
};

const propDefault = propDefaultFactory(GlSorting);

const generateProps = ({
  text = 'Sorting options',
  sortOptions = propDefault('sortOptions'),
  sortBy = propDefault('sortBy'),
  isAscending = propDefault('isAscending'),
  sortDirectionToolTip = propDefault('sortDirectionToolTip'),
  dropdownClass = propDefault('dropdownClass'),
  dropdownToggleClass = propDefault('dropdownToggleClass'),
  sortDirectionToggleClass = propDefault('sortDirectionToggleClass'),
  disabled = propDefault('disabled'),
} = {}) => ({
  text,
  sortOptions,
  sortBy,
  isAscending,
  sortDirectionToolTip,
  dropdownClass,
  dropdownToggleClass,
  sortDirectionToggleClass,
  disabled,
});

const template = `
  <gl-sorting
    :text="text"
    :sort-options="sortOptions"
    :sort-by="localSortBy"
    :is-ascending="localIsAscending"
    :sort-direction-tool-tip="sortDirectionToolTip"
    :dropdown-class="dropdownClass"
    :dropdown-toggle-class="dropdownToggleClass"
    :sort-direction-toggle-class="sortDirectionToggleClass"
    :disabled="disabled"
    @sort-by-change="localSortBy = $event"
    @sort-direction-change="localIsAscending = $event"
  />
`;

const makeStory = (args) => ({
  components,
  props: Object.keys(args),
  data() {
    return {
      localSortBy: this.sortBy,
      localIsAscending: this.isAscending,
    };
  },
  watch: {
    sortBy(value) {
      this.localSortBy = value;
    },
    isAscending(value) {
      this.localIsAscending = value;
    },
  },
  template,
});

export const Default = (args) => makeStory(args);
Default.args = generateProps({
  text: '',
  sortOptions: [
    {
      value: 'first',
      text: 'First item',
    },
    {
      value: 'second',
      text: 'Second item',
    },
    {
      value: 'third',
      text: 'Third item',
    },
  ],
  sortBy: 'first',
});
Default.play = async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  const button = canvas.getByTestId('base-dropdown-toggle');
  await userEvent.click(button);
  await waitFor(() => expect(canvas.getByRole('listbox')).toBeVisible());
};

export const DisabledDirectionToggle = (args) => makeStory(args);
DisabledDirectionToggle.args = generateProps({
  text: '',
  sortOptions: [
    {
      value: 'relevant',
      text: 'Most relevant',
      directionToggleDisabled: true,
    },
    {
      value: 'created',
      text: 'Created date',
    },
  ],
  sortBy: 'relevant',
});

export const DisabledSorting = (args) => makeStory(args);
DisabledSorting.args = generateProps({
  text: '',
  sortOptions: [
    {
      value: 'manual',
      text: 'Manual',
    },
  ],
  sortBy: 'manual',
  disabled: true,
});

export default {
  title: 'base/sorting',
  component: GlSorting,
  parameters: {
    docs: {
      description: {
        component:
          'See [Pajamas Design System documentation](https://design.khulnasoft.com/components/sorting) for usage and implementation details.',
      },
    },
  },
  decorators: [
    makeContainer({
      height: '150px',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'flex-start',
    }),
  ],
};
