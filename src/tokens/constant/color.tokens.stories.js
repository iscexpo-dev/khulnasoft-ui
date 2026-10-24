import COMPILED_TOKENS from '../build/json/tokens.json';
import { createDesignTokenStory } from '../common_story_options';

export const Neutral = createDesignTokenStory({ tokens: COMPILED_TOKENS.color.neutral });

export const Blue = createDesignTokenStory({ tokens: COMPILED_TOKENS.color.blue });

export const Green = createDesignTokenStory({ tokens: COMPILED_TOKENS.color.green });

export const Orange = createDesignTokenStory({ tokens: COMPILED_TOKENS.color.orange });

export const Red = createDesignTokenStory({ tokens: COMPILED_TOKENS.color.red });

export const Purple = createDesignTokenStory({ tokens: COMPILED_TOKENS.color.purple });

export const DataGreen = createDesignTokenStory({ tokens: COMPILED_TOKENS.color['data-green'] });

export const DataAqua = createDesignTokenStory({ tokens: COMPILED_TOKENS.color['data-aqua'] });

export const DataBlue = createDesignTokenStory({ tokens: COMPILED_TOKENS.color['data-blue'] });

export const DataMagenta = createDesignTokenStory({
  tokens: COMPILED_TOKENS.color['data-magenta'],
});

export const DataOrange = createDesignTokenStory({ tokens: COMPILED_TOKENS.color['data-orange'] });

export const Brand = createDesignTokenStory({
  tokens: {
    white: COMPILED_TOKENS.color['brand-white'],
    charcoal: COMPILED_TOKENS.color['brand-charcoal'],
  },
});

export const BrandOrange = createDesignTokenStory({
  tokens: COMPILED_TOKENS.color['brand-orange'],
});

export const BrandPurple = createDesignTokenStory({
  tokens: COMPILED_TOKENS.color['brand-purple'],
});

export const BrandGray = createDesignTokenStory({
  tokens: COMPILED_TOKENS.color['brand-gray'],
});

export const BrandPink = createDesignTokenStory({
  tokens: COMPILED_TOKENS.color['brand-pink'],
});

// eslint-disable-next-line storybook/csf-component
export default {
  title: 'tokens/constant',
};
