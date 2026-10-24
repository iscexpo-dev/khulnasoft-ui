import COMPILED_TOKENS from '../build/json/tokens.dark.json';
import { createDesignTokenStory } from '../common_story_options';

export const Default = createDesignTokenStory({
  tokens: {
    white: COMPILED_TOKENS.white,
    black: COMPILED_TOKENS.black,
  },
});

export const Gray = createDesignTokenStory({ tokens: COMPILED_TOKENS.gray });

export const Blue = createDesignTokenStory({ tokens: COMPILED_TOKENS.blue });

export const Green = createDesignTokenStory({ tokens: COMPILED_TOKENS.green });

export const Orange = createDesignTokenStory({ tokens: COMPILED_TOKENS.orange });

export const Red = createDesignTokenStory({ tokens: COMPILED_TOKENS.red });

export const Purple = createDesignTokenStory({ tokens: COMPILED_TOKENS.purple });

// eslint-disable-next-line storybook/csf-component
export default {
  title: 'tokens/deprecated/base/dark',
};
