// url=https://www.figma.com/design/qEddyqCrI7kPSBjGmwkZzQ/%F0%9F%93%99-Component-library?node-id=29627-56
import figma from 'figma';

// `Link / Mention` maps to `GlLink` with the mention variants. The `Current user`
// axis selects between `variant="mention"` and `variant="mentionCurrent"`.
// `Current user` is a VARIANT axis whose values are the strings "true"/"false",
// so it is read with getEnum, mapping each value straight to its variant name
// (see the Code Connect template skill). The `State` and `Inline` axes are
// design-only.
const instance = figma.selectedInstance;

const text = instance.getString('Text');
const variant = instance.getEnum('Current user', { true: 'mentionCurrent', false: 'mention' });

export default {
  id: 'gl-link-mention',
  imports: ["import { GlLink } from '@khulnasoft/ui'"],
  example: figma.code`<gl-link href="#" variant="${variant}">${text}</gl-link>`,
  metadata: {
    nestable: true,
  },
};
