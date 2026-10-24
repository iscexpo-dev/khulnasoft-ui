import GlFormInput from '../form/form_input/form_input.vue';
import GlSkeletonLoader from '../skeleton_loader/skeleton_loader.vue';
import BVueReadme from '../../../vendor/bootstrap-vue/src/components/table/README.md';
import { makeContainer } from '../../../utils/story_decorators/container';
import GlTable from './table.vue';

const components = { GlTable };

const tableItems = [
  {
    column_one: 'test',
    col_2: 'ABC',
    col_three: 1234,
  },
  {
    column_one: 'test2',
    col_2: 'DEF',
    col_three: 5678,
  },
  {
    column_one: 'test3',
    col_2: 'GHI',
    col_three: 9101,
  },
];

const tableFields = [
  {
    key: 'column_one',
    label: 'First column',
    sortable: true,
  },
  {
    key: 'col_2',
    label: 'Second column',
  },
  {
    key: 'col_three',
    sortable: true,
    label: 'Third column',
    thAlignRight: true,
    tdClass: 'gl-text-right',
  },
];

const generateProps = ({
  stickyHeader = false,
  items = [],
  fields = null,
  fixed = false,
  footClone = false,
  stacked = false,
  caption = 'This is the table caption',
  selectable = false,
  bordered = false,
  borderless = false,
  busy = false,
} = {}) => ({
  stickyHeader,
  items,
  fields,
  fixed,
  footClone,
  stacked,
  caption,
  selectable,
  bordered,
  borderless,
  busy,
});

export const Default = (args, { argTypes }) => ({
  components,
  props: Object.keys(argTypes),
  template: `
  <gl-table
    :sticky-header="stickyHeader"
    :items="items"
    :fields="fields"
    :fixed="fixed"
    :stacked="stacked"
    :foot-clone="footClone"
    :selectable="selectable"
    :bordered="bordered"
    :borderless="borderless"
    :busy="busy"
    sort-by="col_three"
    sort-desc
    sort-direction="desc"
    hover
    selected-variant="primary"
  >
    <template v-if="caption" #table-caption>
      {{ caption }}
    </template>
  </gl-table>
`,
});
Default.args = generateProps({
  items: tableItems,
  fields: tableFields,
});

export const Empty = (args, { argTypes }) => ({
  components,
  props: Object.keys(argTypes),
  template: `
      <gl-table show-empty />
    `,
});
Empty.parameters = { controls: { disable: true } };

export const WithFilter = (args, { argTypes }) => ({
  components: { ...components, GlFormInput },
  props: Object.keys(argTypes),
  template: `<div class="gl-leading-normal">
      <gl-form-input v-model="filter" placeholder="Type to search" />
      <br />
      <gl-table
              :sticky-header="stickyHeader"
              :items="items"
              :fields="fields"
              :fixed="fixed"
              :stacked="stacked"
              :foot-clone="footClone"
              :filter=filter
              hover
              selectable
              selected-variant="primary"
          />
      </div>`,
  data() {
    return {
      filter: null,
    };
  },
});
WithFilter.args = generateProps({
  items: tableItems,
  fields: tableFields,
});

export const WithStickyHeader = (args, { argTypes }) => ({
  components: { ...components, GlFormInput },
  props: Object.keys(argTypes),
  template: `<div class="gl-leading-normal">
      <gl-form-input v-model="filter" placeholder="Type to search" />
      <br />
      <gl-table
              :sticky-header="stickyHeader"
              :items="items"
              :fields="fields"
              :fixed="fixed"
              :stacked="stacked"
              :foot-clone="footClone"
              :filter="filter"
              hover
              selectable
              selected-variant="primary"
          />
      </div>`,
  data() {
    return {
      filter: null,
    };
  },
});
WithStickyHeader.args = generateProps({
  stickyHeader: true,
  items: [
    ...tableItems,
    ...tableItems,
    ...tableItems,
    ...tableItems,
    ...tableItems,
    ...tableItems,
    ...tableItems,
    ...tableItems,
    ...tableItems,
    ...tableItems,
  ],
  fields: tableFields,
});

export const Stacked = (args, { argTypes }) => ({
  components,
  props: Object.keys(argTypes),
  template: `<gl-table
              :sticky-header="stickyHeader"
              :items="items"
              :fields="fields"
              :fixed="fixed"
              :stacked="stacked"
              :foot-clone="footClone"
            />`,
});
Stacked.args = generateProps({
  stacked: true,
  items: [
    ...tableItems.slice(0, 2),
    {
      column_one: 'wrapping text',
      col_2: 'supercalifragilisticexpialidocious',
      col_three: 9101,
    },
  ],
  fields: tableFields,
});
Stacked.decorators = [makeContainer({ width: '300px' })];

export const isBusy = (args, { argTypes }) => ({
  components,
  props: Object.keys(argTypes),
  template: `
  <gl-table
    :items="items"
    :fields="fields"
    :busy="busy"
  />
`,
});
isBusy.args = generateProps({
  items: tableItems,
  fields: tableFields,
  busy: true,
});

export const WithBusySlot = (args, { argTypes }) => ({
  components: { ...components, GlSkeletonLoader },
  props: Object.keys(argTypes),
  template: `
  <gl-table
    :items="items"
    :fields="fields"
    :busy="busy"
  >
    <template #table-busy>
      <gl-skeleton-loader v-for="i in 10" :key="i" :width="800" :height="64">
        <rect width="160" height="20" x="0" y="5" rx="4" />
        <rect width="320" height="20" x="280" y="5" rx="4" />
        <rect width="80" height="20" x="720" y="5" rx="4" />
      </gl-skeleton-loader>
    </template>
  </gl-table>
`,
});
WithBusySlot.args = generateProps({
  items: tableItems,
  fields: tableFields,
  busy: true,
});

export default {
  title: 'base/table/table',
  component: GlTable,
  parameters: {
    bootstrapComponent: 'b-table',
    bootstrapDocs: BVueReadme,
    docs: {
      description: {
        component:
          'See [Pajamas Design System documentation](https://design.khulnasoft.com/components/table) for usage and implementation details.',
      },
    },
  },
  argTypes: {
    stacked: {
      options: ['sm', 'md', 'lg', 'xl', true, false],
      control: 'select',
    },
    stickyHeader: {
      options: [false, true],
      control: 'boolean',
    },
    busy: {
      control: 'boolean',
    },
  },
};
