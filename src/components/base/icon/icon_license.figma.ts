// url=https://www.figma.com/design/h4YjjttHL5YI0mXZfQ4uuU/KhulnaSoft-Product-Icons?node-id=2187-397
import figma from 'figma';

// The `license` icon is a Figma component SET with a Size variant. Each size
// maps to a distinct, size-optimised glyph that has its own name in
// @gitlab/svgs. The 12px variant renders at :size="12"; the 16px variant uses
// the default.
//   Size=16 -> <gl-icon name="license" />
//   Size=12 -> <gl-icon name="license-sm" :size="12" />
const instance = figma.selectedInstance;
const name = instance.getEnum('Size', {
  '16': 'license',
  '12': 'license-sm',
});
const size = instance.getEnum('Size', {
  '16': '',
  '12': ' :size="12"',
});

export default {
  id: 'icon-license',
  imports: ["import { GlIcon } from '@khulnasoft/ui'"],
  example: figma.code`<gl-icon name="${name}"${size} />`,
  metadata: {
    nestable: true,
    props: { name },
  },
};
