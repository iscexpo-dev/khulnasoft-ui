// url=https://www.figma.com/design/qEddyqCrI7kPSBjGmwkZzQ/%F0%9F%93%99-Component-library?node-id=125537-3862
import figma from 'figma';

const instance = figma.selectedInstance;

const title = instance.getString('↳ Title');
const size = instance.getEnum('Size', { sm: ' size="sm"', 'md (default)': '', lg: ' size="lg"' });
const hasFooter = instance.getBoolean('Has footer');

// The footer, when present, holds three named Buttons whose `label` text carries
// the live copy. Read each by its layer name (Primary/Secondary/Cancel button)
// so a consumer's real button text flows through, independent of document order
// or the header close button. An action whose button is hidden/absent (empty
// text) is omitted entirely rather than emitting an empty `text`.
const readButtonText = (name) => {
  const button = instance.findLayers((node) => String(node.name) === name, {
    traverseInstances: true,
  })[0];
  return button ? String(button.findText('label')?.textContent ?? '') : '';
};

const actionAttr = (attr, name) => {
  const text = readButtonText(name);
  return text
    ? figma.code`
    :${attr}="{ text: '${text}' }"`
    : figma.code``;
};

const footer = hasFooter
  ? figma.code`${actionAttr('action-primary', 'Primary button')}${actionAttr('action-secondary', 'Secondary button')}${actionAttr('action-cancel', 'Cancel button')}`
  : figma.code``;

// The modal body is arbitrary consumer content. The Content instance-swap holds
// the body component (e.g. the Basic content example), whose Paragraph layer
// carries the real copy — read it so a consumer's actual text flows through.
// Newline-separated lines each become their own <p>.
const contentSwap = instance.getInstanceSwap('Content');
const paragraphText = String(contentSwap?.findText('Paragraph')?.textContent ?? '');
const lines = paragraphText
  .split('\n')
  .map((line) => line.trim())
  .filter((line) => line.length > 0);

const content =
  lines.length > 0
    ? lines.reduce(
        (acc, line, index) =>
          index === 0
            ? figma.code`<p>${line}</p>`
            : figma.code`${acc}
  <p>${line}</p>`,
        figma.code``,
      )
    : figma.code`<!-- body content -->`;

export default {
  id: 'gl-modal',
  imports: ["import { GlModal } from '@khulnasoft/ui'"],
  example: figma.code`<gl-modal modal-id="modal-id" title="${title}"${size}${footer}>
  ${content}
</gl-modal>`,
  metadata: { nestable: true },
};
