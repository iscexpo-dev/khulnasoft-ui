// url=https://www.figma.com/design/qEddyqCrI7kPSBjGmwkZzQ/%F0%9F%93%99-Component-library?node-id=125508-99
import figma from 'figma';

// `GlProgressBar` is a component SET with two variant axes:
//   - `Variant` (primary (default) | success | warning | danger) -> the `variant` prop
//   - `Size`    (xs | sm | md)                                    -> the `height` prop
//
// `variant="primary"` is the component default, so the primary variant emits no
// `variant` attribute. Size maps to a pixel height (xs=4px, sm=8px, md=16px).
//
// The Figma set has no `value` property (its fill is decorative), but `value`
// drives the bar at runtime — so we emit a placeholder `:value="30"` (matching
// the story default) for the dev to replace.
const instance = figma.selectedInstance;

// Build an attribute fragment (with a leading space) from a raw value, or an
// empty string when the value is empty so the default variant stays clean.
// Defined inline because Code Connect templates may only import from 'figma'.
const attr = (name, value) => (value ? ` ${name}="${value}"` : '');

const variant = attr(
  'variant',
  instance.getEnum('Variant', {
    'primary (default)': '',
    success: 'success',
    warning: 'warning',
    danger: 'danger',
  }),
);

const height = attr(
  'height',
  instance.getEnum('Size', {
    xs: '4px',
    sm: '8px',
    md: '16px',
  }),
);

export default {
  id: 'gl-progress-bar',
  imports: ["import { GlProgressBar } from '@khulnasoft/ui'"],
  example: figma.code`<!-- :value is a placeholder -->
<gl-progress-bar :value="30"${variant}${height} />`,
  metadata: {
    nestable: true,
  },
};
