// url=https://www.figma.com/design/qEddyqCrI7kPSBjGmwkZzQ/%F0%9F%93%99-Component-library?node-id=57879-91946
import figma from 'figma';

const instance = figma.selectedInstance;

const placement = instance.getEnum('Popover position', {
  top: '',
  right: ' placement="right"',
  bottom: ' placement="bottom"',
  left: ' placement="left"',
});

const hasHeader = instance.getBoolean('Has header');
const hasClose = instance.getBoolean('↳ Has close');
const title = instance.getString('↳ Title');
const body = instance.getString('Body');

const titleAttr = hasHeader && title ? ` title="${title}"` : '';
const closeAttr = hasHeader && hasClose ? ' show-close-button' : '';

export default {
  id: 'gl-popover',
  imports: ["import { GlPopover } from '@khulnasoft/ui'"],
  example: figma.code`<gl-popover target="your-target"${placement}${titleAttr}${closeAttr}>
  ${body}
</gl-popover>`,
  metadata: { nestable: true },
};
