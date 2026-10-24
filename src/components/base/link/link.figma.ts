// url=https://www.figma.com/design/qEddyqCrI7kPSBjGmwkZzQ/%F0%9F%93%99-Component-library?node-id=84019-117532
import figma from 'figma';

// `Link / UI link` is the default `GlLink` variant (no `variant` prop). `GlLink`
// has no size/mono props, but the `Size` and `Mono` Figma axes map to KhulnaSoft
// utility classes applied on the element:
//   - `Size=sm`   -> gl-text-sm
//   - `Mono=true` -> gl-font-monospace
// `State` is design-only (handled by CSS pseudo-classes).
const instance = figma.selectedInstance;

const text = instance.getString('Text');

const classes = [
  instance.getEnum('Size', { Default: '', sm: 'gl-text-sm' }),
  instance.getEnum('Mono', { false: '', true: 'gl-font-monospace' }),
]
  .filter(Boolean)
  .join(' ');
const classAttr = classes ? ` class="${classes}"` : '';

export default {
  id: 'gl-link',
  imports: ["import { GlLink } from '@khulnasoft/ui'"],
  example: figma.code`<gl-link href="#"${classAttr}>${text}</gl-link>`,
  metadata: {
    nestable: true,
  },
};
