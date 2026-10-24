import figma from 'figma';

// Shared Code Connect template for every icon in the KhulnaSoft Product Icons
// library. One entry per icon is supplied by icon.figma.batch.json; the icon's
// name is exposed via figma.batch.name.
//
// Some icons are framed at a non-default size in Figma (e.g. the 12px trend,
// severity, and status icons). Those entries carry a `size` field in the batch
// JSON, which is rendered as `:size="12"`. Icons without a `size` field use the
// GlIcon default (16) and render no size attribute.
//
// `metadata.props.name` lets consuming components (badge, button, etc.) read
// the chosen icon's name through
// `instance.getInstanceSwap(prop).executeTemplate().metadata.props.name`,
// which is how we eventually replace the icon="REPLACE" placeholders.
const sizeAttr = figma.batch.size ? ` :size="${figma.batch.size}"` : '';

export default {
  id: figma.batch.id,
  imports: ["import { GlIcon } from '@khulnasoft/ui'"],
  example: figma.code`<gl-icon name="${figma.batch.name}"${sizeAttr} />`,
  metadata: {
    nestable: true,
    props: { name: figma.batch.name },
  },
};
