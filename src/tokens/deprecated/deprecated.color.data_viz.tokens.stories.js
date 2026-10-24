import COMPILED_TOKENS from '../build/json/tokens.json';
import { createDesignTokenStory } from '../common_story_options';

export const DataVizGreen = createDesignTokenStory({ tokens: COMPILED_TOKENS['data-viz'].green });

export const DataVizAqua = createDesignTokenStory({ tokens: COMPILED_TOKENS['data-viz'].aqua });

export const DataVizBlue = createDesignTokenStory({ tokens: COMPILED_TOKENS['data-viz'].blue });

export const DataVizMagenta = createDesignTokenStory({
  tokens: COMPILED_TOKENS['data-viz'].magenta,
});

export const DataVizOrange = createDesignTokenStory({ tokens: COMPILED_TOKENS['data-viz'].orange });

// eslint-disable-next-line storybook/csf-component
export default {
  title: 'tokens/deprecated/data-viz/light',
};
