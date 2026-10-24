// url=https://www.figma.com/design/h4YjjttHL5YI0mXZfQ4uuU/KhulnaSoft-Product-Icons?node-id=2187-417
import figma from 'figma';

// The `check` icon is a Figma component SET with a Size variant. Each size maps
// to a distinct, size-optimised glyph that has its own name in @gitlab/svgs.
// The 12px variants render at :size="12"; the 16px variant uses the default.
//   Size=16    -> <gl-icon name="check" />
//   Size=12    -> <gl-icon name="check-sm" :size="12" />
//   Size=12 xs -> <gl-icon name="check-xs" :size="12" />
const instance = figma.selectedInstance;
const name = instance.getEnum('Size', {
  '16': 'check',
  '12': 'check-sm',
  '12 xs': 'check-xs',
});
const size = instance.getEnum('Size', {
  '16': '',
  '12': ' :size="12"',
  '12 xs': ' :size="12"',
});

export default {
  id: 'icon-check',
  imports: ["import { GlIcon } from '@khulnasoft/ui'"],
  example: figma.code`<gl-icon name="${name}"${size} />`,
  metadata: {
    nestable: true,
    props: { name },
  },
};
