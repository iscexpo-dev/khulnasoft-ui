// url=https://www.figma.com/design/h4YjjttHL5YI0mXZfQ4uuU/KhulnaSoft-Product-Icons?node-id=4911-441
import figma from 'figma';

// The `close` icon is a Figma component SET with a Size variant. Each size maps
// to a distinct, size-optimised glyph that has its own name in @gitlab/svgs.
// The 12px variant renders at :size="12"; the 16px variants use the default.
//   Size=16    -> <gl-icon name="close" />
//   Size=16 sm -> <gl-icon name="close-sm" />
//   Size=12 xs -> <gl-icon name="close-xs" :size="12" />
const instance = figma.selectedInstance;
const name = instance.getEnum('Size', {
  '16': 'close',
  '16 sm': 'close-sm',
  '12 xs': 'close-xs',
});
const size = instance.getEnum('Size', {
  '16': '',
  '16 sm': '',
  '12 xs': ' :size="12"',
});

export default {
  id: 'icon-close',
  imports: ["import { GlIcon } from '@khulnasoft/ui'"],
  example: figma.code`<gl-icon name="${name}"${size} />`,
  metadata: {
    nestable: true,
    props: { name },
  },
};
