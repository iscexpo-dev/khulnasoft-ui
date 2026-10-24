import COMPILED_TOKENS from '../build/json/tokens.json';
import COMPILED_TOKENS_DARK from '../build/json/tokens.dark.json';
import { createDesignTokenStory } from '../common_story_options';

export const Default = createDesignTokenStory({
  tokens: {
    ...COMPILED_TOKENS.border.color,
  },
});

export const Dark = createDesignTokenStory({
  tokens: {
    ...COMPILED_TOKENS_DARK.border.color,
  },
});

// eslint-disable-next-line storybook/csf-component
export default {
  title: 'tokens/semantic/border',
};
