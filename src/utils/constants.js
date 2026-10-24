import { POSITION } from '../components/utilities/truncate/constants';

export const COMMA = ',';

export const CONTRAST_LEVELS = [
  {
    grade: 'F',
    min: 0,
    max: 3,
  },
  {
    grade: 'AA+',
    min: 3,
    max: 4.5,
  },
  {
    grade: 'AA',
    min: 4.5,
    max: 7,
  },
  {
    grade: 'AAA',
    min: 7,
    max: 22,
  },
];

export const HEX_REGEX = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

export const LEFT_MOUSE_BUTTON = 0;

export const progressBarVariantOptions = {
  primary: 'primary',
  success: 'success',
  warning: 'warning',
  danger: 'danger',
};

export const badgeSizeOptions = {
  sm: 'sm',
  md: 'md',
  lg: 'lg',
};

export const badgeVariantOptions = {
  neutral: 'neutral',
  info: 'info',
  success: 'success',
  warning: 'warning',
  danger: 'danger',
  tier: 'tier',
};

export const badgeIconSizeOptions = {
  sm: 12,
  md: 16,
};

export const navItemIndicatorPositionOptions = {
  left: 'gl-nav-item-indicator-left',
  right: 'gl-nav-item-indicator-right',
  bottom: 'gl-nav-item-indicator-bottom',
};

export const variantCssColorMap = {
  muted: 'gl-text-gray-500',
  neutral: 'gl-text-blue-100',
  info: 'gl-text-blue-500',
  success: 'gl-text-green-500',
  warning: 'gl-text-orange-500',
  danger: 'gl-text-red-500',
};

export const targetOptions = ['_self', '_blank', '_parent', '_top', null];

export const viewModeOptions = {
  dark: 'dark',
  light: 'light',
};

export const labelColorOptions = {
  ...viewModeOptions,
};

export const avatarSizeOptions = [96, 64, 48, 32, 24, 16];

export const avatarsInlineSizeOptions = [32, 24, 16];

export const avatarShapeOptions = {
  circle: 'circle',
  rect: 'rect',
};

export const formStateOptions = {
  default: null,
  valid: true,
  invalid: false,
};

export const breadCrumbSizeOptions = {
  sm: 'sm',
  md: 'md',
};

export const buttonCategoryOptions = {
  primary: 'primary',
  secondary: 'secondary',
  tertiary: 'tertiary',
};

export const buttonVariantOptions = {
  default: 'default',
  confirm: 'confirm',
  danger: 'danger',
  link: 'link',
  /**
   * The "reset" variant can be used when customization of GlButton styles is required
   * (e.g. for the "close" button in GlLabel).
   * It should be used sparingly and only when other approaches fail.
   * Prefer supported variants where ever possible.
   */
  reset: 'gl-reset',
};

export const badgeForButtonOptions = {
  [buttonVariantOptions.default]: badgeVariantOptions.neutral,
  [buttonVariantOptions.confirm]: badgeVariantOptions.info,
  [buttonVariantOptions.danger]: badgeVariantOptions.danger,
};

export const dropdownVariantOptions = {
  default: 'default',
  confirm: 'confirm',
  info: 'info (deprecated)',
  danger: 'danger',
  link: 'link',
};

export const dropdownItemVariantOptions = {
  default: 'default',
  danger: 'danger',
};

export const dropdownPlacements = {
  'right-start': 'right-start',
  'bottom-start': 'bottom-start',
  'bottom-end': 'bottom-end',
  bottom: 'bottom',

  left: 'bottom-start', // deprecated, should be replaced with "bottom-start"
  center: 'bottom', // deprecated, should be replaced with "bottom"
  right: 'bottom-end', // deprecated, should be replaced with "bottom-end"
};

const dropdownHorizontalCornerPlacement = ['right-start', 'right-end', 'left-start', 'left-end'];
const dropdownVerticalCornerPlacement = ['bottom-start', 'top-start', 'bottom-end', 'top-end'];

export const dropdownAllowedAutoPlacements = {
  'right-start': dropdownHorizontalCornerPlacement,
  'bottom-start': dropdownVerticalCornerPlacement,
  'bottom-end': dropdownVerticalCornerPlacement,
  bottom: ['bottom', 'top'],

  left: dropdownVerticalCornerPlacement, // deprecated, should be replaced with "bottom-start"
  center: ['bottom', 'top'], // deprecated, should be replaced with "bottom"
  right: dropdownVerticalCornerPlacement, // deprecated, should be replaced with "bottom-end"
};

export const buttonSizeOptions = {
  small: 'sm',
  medium: 'md',
};

export const datepickerWidthOptionsMap = {
  sm: 'sm',
  md: 'md',
  lg: 'lg',
  xl: 'xl',
};

// size options all have corresponding styles (e.g. .s12 defined in icon.scss)
export const iconSizeOptions = [8, 12, 14, 16, 24, 32, 48, 72];

export const iconVariantOptions = {
  current: 'gl-fill-current',
  default: 'gl-fill-icon-default',
  subtle: 'gl-fill-icon-subtle',
  strong: 'gl-fill-icon-strong',
  disabled: 'gl-fill-icon-disabled',
  link: 'gl-fill-icon-link',
  info: 'gl-fill-icon-info',
  warning: 'gl-fill-icon-warning',
  danger: 'gl-fill-icon-danger',
  success: 'gl-fill-icon-success',
};

export const animatedIconVariantOptions = {
  current: 'gl-animated-icon-current',
  default: 'gl-animated-icon-default',
  subtle: 'gl-animated-icon-subtle',
  strong: 'gl-animated-icon-strong',
  disabled: 'gl-animated-icon-disabled',
  link: 'gl-animated-icon-link',
  info: 'gl-animated-icon-info',
  warning: 'gl-animated-icon-warning',
  danger: 'gl-animated-icon-danger',
  success: 'gl-animated-icon-success',
};

/**
 * Maps badge variants to their corresponding icon variants.
 * Used by GlSingleStat to ensure icons match the semantic meaning of their badge variant.
 */
export const badgeVariantToIconVariantMap = {
  neutral: 'default',
  info: 'info',
  success: 'success',
  warning: 'warning',
  danger: 'danger',
  tier: 'default',
};

export const linkVariantInline = 'inline';
export const linkVariantMeta = 'meta';
export const linkVariantMention = 'mention';
export const linkVariantMentionCurrent = 'mentionCurrent';
export const linkVariantUnstyled = 'unstyled';

export const linkVariantOptions = {
  [linkVariantInline]: 'gl-link-inline',
  [linkVariantMeta]: 'gl-link-meta',
  [linkVariantMention]: 'gl-link-mention',
  [linkVariantMentionCurrent]: 'gl-link-mention-current',
  [linkVariantUnstyled]: '',
};

export const triggerVariantOptions = {
  click: 'click',
  hover: 'hover',
  focus: 'focus',
};

export const tooltipPlacements = {
  top: 'top',
  left: 'left',
  right: 'right',
  bottom: 'bottom',
};

export const popoverPlacements = {
  top: 'top',
  right: 'right',
  bottom: 'bottom',
  left: 'left',
};

export const stackedPresentationOptions = {
  stacked: 'stacked',
  tiled: 'tiled',
};

export const alignOptions = {
  left: 'left',
  center: 'center',
  right: 'right',
  fill: 'fill',
};

export const alertVariantOptions = {
  success: 'success',
  warning: 'warning',
  danger: 'danger',
  info: 'info',
  tip: 'tip',
};

export const alertVariantIconMap = {
  success: 'check-circle',
  warning: 'warning',
  danger: 'error',
  info: 'information-o',
  tip: 'bulb',
};

export const broadcastMessageThemes = {
  indigo: 'indigo',
  'light-indigo': 'light-indigo',
  blue: 'blue',
  'light-blue': 'light-blue',
  green: 'green',
  'light-green': 'light-green',
  red: 'red',
  'light-red': 'light-red',
  dark: 'dark',
  light: 'light',
};

export const modalButtonDefaults = {
  actionPrimary: {
    variant: 'confirm',
    category: 'primary',
  },
  actionSecondary: {
    variant: 'confirm',
    category: 'secondary',
  },
  actionCancel: {
    variant: 'default',
  },
};

export const tabsButtonDefaults = {
  actionPrimary: {
    variant: 'confirm',
    category: 'primary',
  },
  actionSecondary: {
    variant: 'default',
    category: 'secondary',
  },
  actionTertiary: {
    variant: 'default',
  },
};

export const tokenVariants = ['default', 'search-type', 'search-value'];

export const resizeDebounceTime = 200;

// Datetime constants
export const defaultDateFormat = 'YYYY-MM-DD';

export const bannerVariants = ['promotion', 'introduction'];

export const maxZIndex = 10;

export const modalSizeOptions = {
  sm: 'sm',
  md: 'md',
  lg: 'lg',
};

export const focusableTags = ['INPUT', 'TEXTAREA', 'A', 'BUTTON', 'SELECT'];

export const keyboard = {
  escape: 'Escape',
  backspace: 'Backspace',
  delete: 'Delete',
  left: 'Left',
  arrowLeft: 'ArrowLeft',
  right: 'Right',
  arrowRight: 'ArrowRight',
  home: 'Home',
  end: 'End',
  tab: 'Tab',
};

export const truncateOptions = POSITION;

export const formInputWidths = {
  xs: 'xs',
  sm: 'sm',
  md: 'md',
  lg: 'lg',
  xl: 'xl',
  '(unset or null)': null,
};

export const toggleLabelPosition = {
  hidden: 'hidden',
  left: 'left',
  top: 'top',
};

export const tooltipActionEvents = ['open', 'close', 'enable', 'disable'];

export const drawerVariants = {
  default: 'default',
  sidebar: 'sidebar',
};

export const loadingIconSizes = {
  'sm (16x16)': 'sm',
  'md (24x24)': 'md',
  'lg (32x32)': 'lg',
  'xl (64x64)': 'xl',
};

export const loadingIconVariants = {
  spinner: 'spinner',
  dots: 'dots',
};

export const themes = [
  { class: null, value: 'default', title: 'Default' },
  { class: 'ui-indigo', value: 'indigo', title: 'Indigo' },
  { class: 'ui-blue', value: 'blue', title: 'Blue' },
  { class: 'ui-green', value: 'green', title: 'Green' },
  { class: 'ui-red', value: 'red', title: 'Red' },
  { class: 'ui-gray', value: 'gray', title: 'Gray' },
];
