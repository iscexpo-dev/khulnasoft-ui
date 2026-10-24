// url=https://www.figma.com/design/qEddyqCrI7kPSBjGmwkZzQ/%F0%9F%93%99-Component-library?node-id=120776-3617
import figma from 'figma';

const instance = figma.selectedInstance;

const scoped = instance.getEnum('Is scoped', { true: true, false: false });
const hasRemove = instance.getEnum('Has remove', { true: true, false: false });

// `Variant` (lighter/darker) maps to text contrast derived from
// `background-color`, which the template sandbox cannot read from fills, so it
// is emitted as a REPLACE placeholder.
const title = scoped
  ? `${instance.getString('Title')}::${instance.getString('↳ Scoped title')}`
  : instance.getString('Title');

const scopedAttr = scoped ? ' scoped' : '';
const removeAttr = hasRemove ? ' show-close-button @close="REPLACE"' : '';

export default {
  id: 'gl-label',
  imports: ["import { GlLabel } from '@khulnasoft/ui'"],
  example: figma.code`<gl-label background-color="REPLACE" title="${title}"${scopedAttr}${removeAttr} />`,
  metadata: { nestable: false },
};
