import {
  GL_COLOR_BRAND_ORANGE_01P,
  GL_COLOR_BRAND_ORANGE_02P,
  GL_COLOR_BRAND_PURPLE_01P,
  GL_COLOR_RED_500,
} from '../../tokens/build/js/tokens';

const MATRIX_COLORS = [
  GL_COLOR_BRAND_ORANGE_02P,
  GL_COLOR_BRAND_ORANGE_01P,
  GL_COLOR_RED_500,
  GL_COLOR_BRAND_PURPLE_01P,
];

export const resolveColors = (colors, element) => ({
  head: window.getComputedStyle(element).getPropertyValue('--gl-text-color-default').trim(),
  rain: colors?.length ? colors : MATRIX_COLORS,
});
