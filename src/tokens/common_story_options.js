import TokensStory from './tokens_story.vue';

export const createDesignTokenStory = ({ tokens = {}, containerClass = '' } = {}) => {
  const Story = (args, { argTypes }) => ({
    props: Object.keys(argTypes),
    components: {
      TokensStory,
    },
    provide: {
      containerClass,
    },
    template: `<tokens-story v-bind="$props" />`,
  });
  Story.args = { tokens };

  return Story;
};
