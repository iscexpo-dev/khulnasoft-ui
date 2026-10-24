// url=https://www.figma.com/design/qEddyqCrI7kPSBjGmwkZzQ/%F0%9F%93%99-Component-library?node-id=81916-116888
import figma from 'figma';

// `Link / Meta link` maps to `GlLink` with `variant="meta"`. The `Size`, `Mono`,
// and `Weight` axes map to KhulnaSoft utility classes applied on the element:
//   - `Size=sm`      -> gl-text-sm
//   - `Mono=true`    -> gl-font-monospace
//   - `Weight=bold`  -> gl-font-bold
//
// The `Color` axis is handled differently. `.gl-link-meta` applies
// `gl-text-inherit` across every state, so a meta link is a single colour that
// matches its surrounding text — the colour is driven by the CONTEXT, not by a
// class on the link. We reflect that by wrapping the link in a parent carrying
// the matching text-colour utility, which cascades in via `inherit` on all
// states:
//   - `Color=blue`    -> gl-text-link
//   - `Color=neutral` -> gl-text-default
//   - `Color=muted`   -> gl-text-subtle
// `State` is design-only (handled by CSS pseudo-classes).
const instance = figma.selectedInstance;

const text = instance.getString('Text');

const classes = [
  instance.getEnum('Size', { Default: '', sm: 'gl-text-sm' }),
  instance.getEnum('Mono', { false: '', true: 'gl-font-monospace' }),
  instance.getEnum('Weight', { Default: '', bold: 'gl-font-bold' }),
]
  .filter(Boolean)
  .join(' ');
const classAttr = classes ? ` class="${classes}"` : '';

const colorClass = instance.getEnum('Color', {
  blue: 'gl-text-link',
  neutral: 'gl-text-default',
  muted: 'gl-text-subtle',
});

const link = figma.code`<gl-link href="#" variant="meta"${classAttr}>${text}</gl-link>`;

export default {
  id: 'gl-link-meta',
  imports: ["import { GlLink } from '@khulnasoft/ui'"],
  // The colour is inherited from the surrounding context, so it lives on a
  // wrapping element rather than the link itself.
  example: figma.code`<span class="${colorClass}">${link}</span>`,
  metadata: {
    nestable: true,
  },
};
