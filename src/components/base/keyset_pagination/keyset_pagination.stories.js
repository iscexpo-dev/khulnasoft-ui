import GlKeysetPagination from './keyset_pagination.vue';

const generateProps = ({
  hasPreviousPage = false,
  hasNextPage = true,
  startCursor = 'eyJpZCI6IjE3NTg1ODciLCJyZWxlYXNlZF9hdCI6IjIwMjAtMDgtMjAgMTQ6NDc6MDguNTQ1MjE1MDAwIFVUQyJ9',
  endCursor = 'eyJpZCI6IjEyNjcxNzkiLCJyZWxlYXNlZF9hdCI6IjIwMjAtMDItMTkgMjE6MDA6MDUuODU5NTQ2MDAwIFVUQyJ9',
  prevText,
  nextText,
  prevButtonLink = '',
  nextButtonLink = '',
  disabled = false,
} = {}) => ({
  hasPreviousPage,
  hasNextPage,
  startCursor,
  endCursor,
  prevText,
  nextText,
  prevButtonLink,
  nextButtonLink,
  disabled,
});

const Template = (args, { argTypes }) => ({
  components: { GlKeysetPagination },
  props: Object.keys(argTypes),
  template: `
      <gl-keyset-pagination v-bind="$props"/>
    `,
});

/* eslint-disable no-alert */
export const Events = (args, { argTypes }) => ({
  components: { GlKeysetPagination },
  props: Object.keys(argTypes),
  methods: {
    onPrev(startCursor) {
      alert(`"prev" event fired with start cursor: "${startCursor}"`);
    },
    onNext(endCursor) {
      alert(`"next" event fired with end cursor: "${endCursor}"`);
    },
  },
  template: `
      <gl-keyset-pagination v-bind="$props" @prev="onPrev($event)" @next="onNext($event)" />
    `,
});
Events.args = generateProps({ hasPreviousPage: true });

export const Default = Template.bind({});
Default.args = generateProps();

export default {
  title: 'base/keyset-pagination',
  component: GlKeysetPagination,
  parameters: {
    bootstrapComponent: false,
    docs: {
      description: {
        component:
          'See [Pajamas Design System documentation](https://design.khulnasoft.com/components/pagination) for usage and implementation details.',
      },
    },
  },
};
