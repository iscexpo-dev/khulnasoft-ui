import COMPILED_TOKENS from '../build/json/tokens.json';
import { createDesignTokenStory } from '../common_story_options';

export const Gray = createDesignTokenStory({ tokens: COMPILED_TOKENS['t-gray-a'] });

export const White = createDesignTokenStory({
  tokens: COMPILED_TOKENS['t-white-a'],
  containerClass: 'gl-bg-gray-900 gl-text-white',
});

// eslint-disable-next-line storybook/csf-component
export default {
  title: 'tokens/deprecated/transparency',
};
